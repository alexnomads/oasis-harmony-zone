
-- Migration to sync ROJ points with meditation points as unified system
-- This makes ROJ points the user-facing currency name while maintaining sync with main points

-- Step 1: Create manual sync function first (before any data operations)
CREATE OR REPLACE FUNCTION manual_sync_all_roj_points()
RETURNS TABLE(user_id UUID, old_roj_points NUMERIC, new_roj_points NUMERIC, total_points NUMERIC) AS $$
BEGIN
  RETURN QUERY
  UPDATE roj_currency 
  SET roj_points = COALESCE((
    SELECT up.total_points 
    FROM user_points up 
    WHERE up.user_id = roj_currency.user_id
  ), 0),
  updated_at = NOW()
  RETURNING 
    roj_currency.user_id,
    roj_currency.roj_points AS old_roj_points,
    COALESCE((
      SELECT up.total_points 
      FROM user_points up 
      WHERE up.user_id = roj_currency.user_id
    ), 0) AS new_roj_points,
    COALESCE((
      SELECT up.total_points 
      FROM user_points up 
      WHERE up.user_id = roj_currency.user_id
    ), 0) AS total_points;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Force immediate sync of ALL existing ROJ records
DO $$
DECLARE
    sync_results RECORD;
    total_synced INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting forced ROJ points synchronization...';
    
    -- Direct update approach - force sync every roj_currency record
    UPDATE roj_currency 
    SET roj_points = COALESCE((
      SELECT total_points 
      FROM user_points 
      WHERE user_points.user_id = roj_currency.user_id
    ), 0),
    updated_at = NOW();
    
    GET DIAGNOSTICS total_synced = ROW_COUNT;
    RAISE NOTICE 'Synchronized % ROJ currency records', total_synced;
    
    -- Verify sync results
    FOR sync_results IN 
      SELECT rc.user_id, rc.roj_points, up.total_points 
      FROM roj_currency rc 
      LEFT JOIN user_points up ON rc.user_id = up.user_id
      WHERE rc.roj_points != COALESCE(up.total_points, 0)
    LOOP
      RAISE NOTICE 'SYNC MISMATCH: User % has ROJ points % but total points %', 
        sync_results.user_id, sync_results.roj_points, sync_results.total_points;
    END LOOP;
    
    RAISE NOTICE 'ROJ points force sync completed successfully';
END $$;

-- Step 3: Initialize ROJ currency for users who have points but no ROJ record
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

-- Step 4: Create function to sync points automatically
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

-- Step 5: Create trigger to automatically sync ROJ points when meditation points change
DROP TRIGGER IF EXISTS sync_roj_points_trigger ON user_points;
CREATE TRIGGER sync_roj_points_trigger
  AFTER INSERT OR UPDATE OF total_points ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION sync_roj_with_meditation_points();

-- Step 6: Create function to update both systems when ROJ points are awarded directly
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

-- Step 7: Final verification and cleanup
DO $$
DECLARE
    verification_count INTEGER;
BEGIN
    -- Count any remaining mismatches
    SELECT COUNT(*) INTO verification_count
    FROM roj_currency rc 
    LEFT JOIN user_points up ON rc.user_id = up.user_id
    WHERE rc.roj_points != COALESCE(up.total_points, 0);
    
    IF verification_count > 0 THEN
        RAISE NOTICE 'WARNING: % records still have mismatched points after sync', verification_count;
    ELSE
        RAISE NOTICE 'SUCCESS: All ROJ points are now synchronized with total points';
    END IF;
END $$;
