
-- Migration to sync ROJ points with meditation points as unified system
-- This makes ROJ points the user-facing currency name while maintaining sync with main points

-- Step 1: Sync existing ROJ points with user points (ROJ becomes the display name)
-- Force sync all existing ROJ records with user_points
UPDATE roj_currency 
SET roj_points = COALESCE((
  SELECT total_points 
  FROM user_points 
  WHERE user_points.user_id = roj_currency.user_id
), roj_points),
updated_at = NOW();

-- Step 2: Initialize ROJ currency for users who have points but no ROJ record
INSERT INTO roj_currency (user_id, roj_points, stars, created_at, updated_at)
SELECT 
  up.user_id, 
  up.total_points, 
  0, 
  NOW(), 
  NOW()
FROM user_points up
WHERE NOT EXISTS (
  SELECT 1 FROM roj_currency rc WHERE rc.user_id = up.user_id
);

-- Step 3: Create function to sync points automatically
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

-- Step 4: Create trigger to automatically sync ROJ points when meditation points change
DROP TRIGGER IF EXISTS sync_roj_points_trigger ON user_points;
CREATE TRIGGER sync_roj_points_trigger
  AFTER INSERT OR UPDATE OF total_points ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION sync_roj_with_meditation_points();

-- Step 5: Create function to update both systems when ROJ points are awarded directly
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

-- Step 6: Force sync all existing data immediately
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Update all existing roj_currency records to match user_points
    FOR rec IN SELECT up.user_id, up.total_points 
               FROM user_points up 
               JOIN roj_currency rc ON rc.user_id = up.user_id
    LOOP
        UPDATE roj_currency 
        SET roj_points = rec.total_points, updated_at = NOW()
        WHERE user_id = rec.user_id;
    END LOOP;
    
    RAISE NOTICE 'ROJ points synchronized with total points for all users';
END $$;
