-- Drop the insecure view
DROP VIEW IF EXISTS public.global_leaderboard;

-- First, ensure ALL auth users have user_points records
-- This function will create user_points for any auth user who doesn't have them
INSERT INTO public.user_points (user_id, total_points, meditation_streak, fitness_streak)
SELECT 
    au.id,
    0,
    0,
    0
FROM auth.users au
LEFT JOIN public.user_points up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Create a secure view that uses only public schema tables
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
    public.safe_username_from_auth(up.user_id) as display_name
FROM public.user_points up
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