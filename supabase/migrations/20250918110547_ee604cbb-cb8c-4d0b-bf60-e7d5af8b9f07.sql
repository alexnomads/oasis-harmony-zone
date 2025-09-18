-- Drop the security definer function and view
DROP VIEW IF EXISTS public.global_leaderboard;
DROP FUNCTION IF EXISTS public.get_global_leaderboard();

-- Create a simple view using only existing user_points data plus auth.users for all users
CREATE VIEW public.global_leaderboard AS
WITH all_user_stats AS (
    SELECT 
        au.id as user_id,
        COALESCE(up.total_points, 0) as total_points,
        COALESCE(up.meditation_streak, 0) as meditation_streak,
        up.last_meditation_date,
        COALESCE(up.fitness_streak, 0) as fitness_streak,
        up.last_fitness_date,
        COALESCE(GREATEST(COALESCE(up.meditation_streak, 0), COALESCE(up.fitness_streak, 0)), 0) as active_streak
    FROM auth.users au
    LEFT JOIN public.user_points up ON au.id = up.user_id
),
meditation_stats AS (
    SELECT 
        user_id,
        COUNT(*) as total_sessions,
        SUM(duration) as total_meditation_time
    FROM public.meditation_sessions 
    WHERE status = 'completed'
    GROUP BY user_id
),
fitness_stats AS (
    SELECT 
        user_id,
        COUNT(*) as total_fitness_sessions,
        SUM(duration) as total_fitness_time
    FROM public.fitness_sessions
    GROUP BY user_id
)
SELECT 
    aus.user_id,
    aus.total_points,
    aus.meditation_streak,
    aus.last_meditation_date,
    aus.fitness_streak,
    aus.last_fitness_date,
    aus.active_streak,
    COALESCE(ms.total_sessions, 0) as total_sessions,
    COALESCE(ms.total_meditation_time, 0) as total_meditation_time,
    COALESCE(fs.total_fitness_sessions, 0) as total_fitness_sessions,
    COALESCE(fs.total_fitness_time, 0) as total_fitness_time,
    public.safe_username_from_auth(aus.user_id) as display_name
FROM all_user_stats aus
LEFT JOIN meditation_stats ms ON aus.user_id = ms.user_id
LEFT JOIN fitness_stats fs ON aus.user_id = fs.user_id
ORDER BY aus.total_points DESC;

-- Enable RLS on the view (this will inherit from underlying tables)
ALTER VIEW public.global_leaderboard OWNER TO postgres;

-- Grant public read access to the leaderboard view for everyone
GRANT SELECT ON public.global_leaderboard TO anon, authenticated;