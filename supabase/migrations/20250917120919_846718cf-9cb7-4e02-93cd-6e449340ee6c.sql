-- Fix Security Definer View issue by recreating global_leaderboard view without SECURITY DEFINER

-- Drop the existing view
DROP VIEW IF EXISTS public.global_leaderboard;

-- Recreate the view without SECURITY DEFINER property
CREATE VIEW public.global_leaderboard AS
SELECT 
    up.user_id,
    up.total_points,
    up.meditation_streak,
    up.last_meditation_date,
    COALESCE(up.fitness_streak, 0) AS fitness_streak,
    up.last_fitness_date,
    GREATEST(
        CASE
            WHEN (up.last_meditation_date = CURRENT_DATE OR up.last_meditation_date = CURRENT_DATE - INTERVAL '1 day') 
            THEN up.meditation_streak
            ELSE 0
        END,
        CASE
            WHEN (up.last_fitness_date = CURRENT_DATE OR up.last_fitness_date = CURRENT_DATE - INTERVAL '1 day') 
            THEN COALESCE(up.fitness_streak, 0)
            ELSE 0
        END
    ) AS active_streak,
    COALESCE(ms.total_sessions, 0) AS total_sessions,
    COALESCE(ms.total_meditation_time, 0) AS total_meditation_time,
    COALESCE(fs.total_fitness_sessions, 0) AS total_fitness_sessions,
    COALESCE(fs.total_fitness_time, 0) AS total_fitness_time,
    CASE 
        WHEN up.user_id IS NOT NULL 
        THEN 'User ' || SUBSTRING(up.user_id::text, 1, 8)
        ELSE 'Anonymous'
    END AS display_name
FROM user_points up
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) AS total_sessions,
        SUM(duration) AS total_meditation_time
    FROM meditation_sessions 
    WHERE status = 'completed'
    GROUP BY user_id
) ms ON up.user_id = ms.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) AS total_fitness_sessions,
        SUM(duration) AS total_fitness_time
    FROM fitness_sessions 
    WHERE verified = true
    GROUP BY user_id
) fs ON up.user_id = fs.user_id
ORDER BY up.total_points DESC;

-- Grant SELECT permission to authenticated users (leaderboard should be publicly viewable)
GRANT SELECT ON public.global_leaderboard TO authenticated;
GRANT SELECT ON public.global_leaderboard TO anon;