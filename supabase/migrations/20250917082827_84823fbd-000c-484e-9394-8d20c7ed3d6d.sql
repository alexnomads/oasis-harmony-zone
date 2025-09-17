-- Update the global_leaderboard view to show usernames from emails
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
    -- Extract username from email (part before @)
    CASE 
        WHEN au.email IS NOT NULL 
        THEN SPLIT_PART(au.email, '@', 1)
        ELSE 'User ' || SUBSTRING(up.user_id::text, 1, 8)
    END as display_name,
    au.email
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

-- Enable RLS on the view
ALTER VIEW global_leaderboard SET (security_barrier = true);