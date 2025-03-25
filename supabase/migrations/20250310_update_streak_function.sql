
-- Create a new function to properly reset meditation streaks
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
DECLARE
    last_meditation DATE;
BEGIN
    -- Get the user's last meditation date
    SELECT last_meditation_date INTO last_meditation
    FROM user_points
    WHERE user_id = NEW.user_id;
    
    -- Insert or update user points
    INSERT INTO user_points (user_id, total_points, meditation_streak, last_meditation_date)
    VALUES (
        NEW.user_id,
        NEW.points_earned,
        1,
        CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_points.total_points + NEW.points_earned,
        meditation_streak = CASE
            -- If last meditation was yesterday, increment streak
            WHEN user_points.last_meditation_date = CURRENT_DATE - INTERVAL '1 day'
            THEN user_points.meditation_streak + 1
            -- If last meditation was today, keep current streak
            WHEN user_points.last_meditation_date = CURRENT_DATE
            THEN user_points.meditation_streak
            -- Otherwise reset streak to 1
            ELSE 1
        END,
        last_meditation_date = CURRENT_DATE,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to check and reset streaks for inactive users
CREATE OR REPLACE FUNCTION reset_inactive_streaks()
RETURNS void AS $$
BEGIN
    -- Update streaks for all users who haven't meditated in more than a day
    UPDATE user_points
    SET 
        meditation_streak = 0,
        updated_at = NOW()
    WHERE 
        last_meditation_date < CURRENT_DATE - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Create a daily scheduled job to reset streaks
DO $$
BEGIN
    -- Create a scheduled function if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_stat_statements_info
        WHERE EXISTS (
            SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
        )
    ) THEN
        -- If pg_cron extension is available, create a cron job
        -- This is commented out because we'd need to ensure pg_cron extension is enabled
        -- PERFORM cron.schedule('0 0 * * *', $$SELECT reset_inactive_streaks()$$);
        RAISE NOTICE 'To enable automatic streak reset, make sure pg_cron extension is enabled and uncomment the cron job setup';
    END IF;
END
$$;

-- Update the view for the global leaderboard to reflect accurate streak information
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT
    up.user_id,
    up.total_points,
    up.meditation_streak,
    up.last_meditation_date,
    COUNT(ms.id) as total_sessions,
    COALESCE(SUM(ms.duration), 0) as total_meditation_time,
    COALESCE(p.email, 'anonymous') as email,
    COALESCE(prof.nickname, p.raw_user_meta_data->>'full_name', p.raw_user_meta_data->>'name', p.email, 'Anonymous User') as display_name,
    -- Calculate if the streak is active (meditated today or yesterday)
    CASE 
        WHEN up.last_meditation_date >= CURRENT_DATE - INTERVAL '1 day' THEN up.meditation_streak
        ELSE 0
    END as active_streak
FROM
    user_points up
LEFT JOIN
    auth.users p ON up.user_id = p.id
LEFT JOIN
    user_profiles prof ON up.user_id = prof.user_id
LEFT JOIN
    meditation_sessions ms ON up.user_id = ms.user_id AND ms.status = 'completed'
GROUP BY
    up.user_id, up.total_points, up.meditation_streak, up.last_meditation_date, p.email, p.raw_user_meta_data, prof.nickname
ORDER BY
    up.total_points DESC;

-- Ensure the view is accessible
GRANT SELECT ON global_leaderboard TO anon, authenticated, service_role;
