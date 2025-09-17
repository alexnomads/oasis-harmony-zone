-- Drop the existing global_leaderboard view
DROP VIEW IF EXISTS public.global_leaderboard;

-- Create new global_leaderboard view that shows ALL registered users
CREATE VIEW public.global_leaderboard AS
SELECT 
    au.id as user_id,
    COALESCE(up.total_points, 0) as total_points,
    COALESCE(up.meditation_streak, 0) as meditation_streak,
    up.last_meditation_date,
    COALESCE(up.fitness_streak, 0) as fitness_streak,
    up.last_fitness_date,
    COALESCE(GREATEST(up.meditation_streak, up.fitness_streak), 0) as active_streak,
    COALESCE(ms.total_sessions, 0) as total_sessions,
    COALESCE(ms.total_meditation_time, 0) as total_meditation_time,
    COALESCE(fs.total_fitness_sessions, 0) as total_fitness_sessions,
    COALESCE(fs.total_fitness_time, 0) as total_fitness_time,
    COALESCE(
        up_profiles.display_name,
        public.safe_username_from_auth(au.id)
    ) as display_name
FROM auth.users au
LEFT JOIN public.user_points up ON au.id = up.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_sessions,
        SUM(duration) as total_meditation_time
    FROM public.meditation_sessions 
    WHERE status = 'completed'
    GROUP BY user_id
) ms ON au.id = ms.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_fitness_sessions,
        SUM(duration) as total_fitness_time
    FROM public.fitness_sessions
    GROUP BY user_id
) fs ON au.id = fs.user_id
LEFT JOIN (
    SELECT 
        user_id,
        nickname as display_name
    FROM public.user_profiles
    WHERE nickname IS NOT NULL AND nickname != ''
) up_profiles ON au.id = up_profiles.user_id
ORDER BY COALESCE(up.total_points, 0) DESC, au.created_at DESC;