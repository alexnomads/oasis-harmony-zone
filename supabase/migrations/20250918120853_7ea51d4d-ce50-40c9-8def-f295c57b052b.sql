-- Update the global_leaderboard view to use user profiles for display names
DROP VIEW IF EXISTS public.global_leaderboard;

CREATE VIEW public.global_leaderboard AS
SELECT 
    up.user_id,
    up.total_points,
    up.meditation_streak,
    up.last_meditation_date,
    COALESCE(up.fitness_streak, 0) as fitness_streak,
    up.last_fitness_date,
    COALESCE(GREATEST(up.meditation_streak, COALESCE(up.fitness_streak, 0)), 0) as active_streak,
    COALESCE(ms.total_sessions, 0) as total_sessions,
    COALESCE(ms.total_meditation_time, 0) as total_meditation_time,
    COALESCE(fs.total_fitness_sessions, 0) as total_fitness_sessions,
    COALESCE(fs.total_fitness_time, 0) as total_fitness_time,
    COALESCE(prof.nickname, 'user_' || substring(up.user_id::text from 1 for 8)) as display_name
FROM public.user_points up
LEFT JOIN public.user_profiles prof ON up.user_id = prof.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_sessions,
        SUM(duration) as total_meditation_time
    FROM public.meditation_sessions 
    WHERE status = 'completed'
    GROUP BY user_id
) ms ON up.user_id = ms.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_fitness_sessions,
        SUM(duration) as total_fitness_time
    FROM public.fitness_sessions
    GROUP BY user_id
) fs ON up.user_id = fs.user_id
ORDER BY up.total_points DESC, up.created_at DESC;

-- Grant public read access to the leaderboard view
GRANT SELECT ON public.global_leaderboard TO anon, authenticated;