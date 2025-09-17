-- Add fitness tracking columns to user_points table
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS fitness_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_fitness_date DATE,
ADD COLUMN IF NOT EXISTS fitness_streak INTEGER DEFAULT 0;

-- Create function to update fitness points
CREATE OR REPLACE FUNCTION public.update_fitness_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Only award points for verified fitness sessions
    IF NEW.verified = TRUE AND (OLD.verified IS NULL OR OLD.verified = FALSE) THEN
        -- Calculate fitness points: base 50 + rep bonus + time bonus
        DECLARE
            base_points INTEGER := 50;
            rep_bonus INTEGER := (NEW.reps_completed / 10) * 10;
            time_bonus INTEGER := CASE WHEN NEW.duration > 300 THEN 25 ELSE 0 END;
            total_fitness_points INTEGER := base_points + rep_bonus + time_bonus;
        BEGIN
            -- Insert or update user points
            INSERT INTO user_points (user_id, fitness_points, total_points, fitness_streak, last_fitness_date)
            VALUES (
                NEW.user_id,
                total_fitness_points,
                total_fitness_points,
                1,
                CURRENT_DATE
            )
            ON CONFLICT (user_id) DO UPDATE SET
                fitness_points = user_points.fitness_points + total_fitness_points,
                total_points = user_points.total_points + total_fitness_points,
                fitness_streak = CASE
                    -- If last fitness was yesterday, increment streak
                    WHEN user_points.last_fitness_date = CURRENT_DATE - INTERVAL '1 day'
                    THEN user_points.fitness_streak + 1
                    -- If last fitness was today, keep current streak
                    WHEN user_points.last_fitness_date = CURRENT_DATE
                    THEN user_points.fitness_streak
                    -- Otherwise reset streak to 1
                    ELSE 1
                END,
                last_fitness_date = CURRENT_DATE,
                updated_at = NOW();
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for fitness points updates
DROP TRIGGER IF EXISTS update_fitness_points_trigger ON fitness_sessions;
CREATE TRIGGER update_fitness_points_trigger
    AFTER UPDATE ON fitness_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_fitness_points();

-- Update the global_leaderboard view to include fitness stats
DROP VIEW IF EXISTS global_leaderboard;
CREATE VIEW global_leaderboard AS
SELECT 
    up.user_id,
    up.total_points,
    up.meditation_streak,
    up.last_meditation_date,
    COALESCE(up.fitness_streak, 0) as fitness_streak,
    up.last_fitness_date,
    -- Calculate active streak (days with either meditation or fitness)
    GREATEST(
        CASE 
            WHEN up.last_meditation_date = CURRENT_DATE OR up.last_meditation_date = CURRENT_DATE - INTERVAL '1 day'
            THEN up.meditation_streak 
            ELSE 0 
        END,
        CASE 
            WHEN up.last_fitness_date = CURRENT_DATE OR up.last_fitness_date = CURRENT_DATE - INTERVAL '1 day'
            THEN COALESCE(up.fitness_streak, 0)
            ELSE 0 
        END
    ) as active_streak,
    -- Meditation stats
    COALESCE(ms.total_sessions, 0) as total_sessions,
    COALESCE(ms.total_meditation_time, 0) as total_meditation_time,
    -- Fitness stats
    COALESCE(fs.total_fitness_sessions, 0) as total_fitness_sessions,
    COALESCE(fs.total_fitness_time, 0) as total_fitness_time,
    -- User info
    au.email,
    SPLIT_PART(au.email, '@', 1) as display_name
FROM user_points up
JOIN auth.users au ON up.user_id = au.id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_sessions,
        SUM(duration) as total_meditation_time
    FROM meditation_sessions 
    WHERE status = 'completed'
    GROUP BY user_id
) ms ON up.user_id = ms.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_fitness_sessions,
        SUM(duration) as total_fitness_time
    FROM fitness_sessions
    WHERE verified = true
    GROUP BY user_id
) fs ON up.user_id = fs.user_id
ORDER BY up.total_points DESC;