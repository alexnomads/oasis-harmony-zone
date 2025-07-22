
-- Create function to sync ROJ points with main points (1:1 ratio)
CREATE OR REPLACE FUNCTION sync_points_to_roj()
RETURNS TRIGGER AS $$
BEGIN
    -- When user_points.total_points is updated, sync to roj_currency
    INSERT INTO roj_currency (user_id, roj_points, stars, created_at, updated_at)
    VALUES (NEW.user_id, NEW.total_points, 0, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        roj_points = NEW.total_points,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to sync main points with ROJ points
CREATE OR REPLACE FUNCTION sync_roj_to_points()
RETURNS TRIGGER AS $$
BEGIN
    -- When roj_currency.roj_points is updated, sync to user_points
    INSERT INTO user_points (user_id, total_points, meditation_streak, last_meditation_date, created_at, updated_at)
    VALUES (NEW.user_id, NEW.roj_points, 0, NULL, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = NEW.roj_points,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for bidirectional sync
DROP TRIGGER IF EXISTS sync_points_to_roj_trigger ON user_points;
CREATE TRIGGER sync_points_to_roj_trigger
    AFTER UPDATE OF total_points ON user_points
    FOR EACH ROW
    EXECUTE FUNCTION sync_points_to_roj();

DROP TRIGGER IF EXISTS sync_roj_to_points_trigger ON roj_currency;
CREATE TRIGGER sync_roj_to_points_trigger
    AFTER UPDATE OF roj_points ON roj_currency
    FOR EACH ROW
    EXECUTE FUNCTION sync_roj_to_points();

-- Migration function to sync existing data
CREATE OR REPLACE FUNCTION migrate_sync_existing_points()
RETURNS void AS $$
BEGIN
    -- Sync existing user_points to roj_currency (main points take precedence)
    INSERT INTO roj_currency (user_id, roj_points, stars, created_at, updated_at)
    SELECT 
        up.user_id,
        up.total_points,
        COALESCE(rc.stars, 0),
        NOW(),
        NOW()
    FROM user_points up
    LEFT JOIN roj_currency rc ON up.user_id = rc.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        roj_points = EXCLUDED.roj_points,
        updated_at = NOW();
        
    -- Also ensure any orphaned roj_currency records are synced to user_points
    INSERT INTO user_points (user_id, total_points, meditation_streak, last_meditation_date, created_at, updated_at)
    SELECT 
        rc.user_id,
        rc.roj_points,
        COALESCE(up.meditation_streak, 0),
        up.last_meditation_date,
        NOW(),
        NOW()
    FROM roj_currency rc
    LEFT JOIN user_points up ON rc.user_id = up.user_id
    WHERE up.user_id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_sync_existing_points();
