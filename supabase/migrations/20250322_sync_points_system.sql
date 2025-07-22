-- Migration to sync ROJ points with meditation points as unified system
-- This makes ROJ points the user-facing currency name while maintaining sync with main points

-- Step 1: Sync existing ROJ points with user points (ROJ becomes the display name)
UPDATE roj_currency 
SET roj_points = COALESCE((
  SELECT total_points 
  FROM user_points 
  WHERE user_points.user_id = roj_currency.user_id
), 0),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM user_points WHERE user_points.user_id = roj_currency.user_id
);

-- Step 2: Create function to sync points automatically
CREATE OR REPLACE FUNCTION sync_roj_with_meditation_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update ROJ points to match meditation points whenever user_points changes
  INSERT INTO roj_currency (user_id, roj_points, stars, created_at, updated_at)
  VALUES (NEW.user_id, NEW.total_points, 0, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    roj_points = NEW.total_points,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to automatically sync ROJ points when meditation points change
DROP TRIGGER IF EXISTS sync_roj_points_trigger ON user_points;
CREATE TRIGGER sync_roj_points_trigger
  AFTER INSERT OR UPDATE OF total_points ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION sync_roj_with_meditation_points();

-- Step 4: Create function to update both systems when ROJ points are awarded directly
CREATE OR REPLACE FUNCTION award_roj_points(p_user_id UUID, p_points NUMERIC)
RETURNS VOID AS $$
BEGIN
  -- Update meditation points first
  INSERT INTO user_points (user_id, total_points, meditation_streak, last_meditation_date, created_at, updated_at)
  VALUES (p_user_id, p_points, 0, NULL, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + p_points,
    updated_at = NOW();
    
  -- ROJ points will be automatically updated by the trigger
END;
$$ LANGUAGE plpgsql;