-- Create function to safely extract username from auth.users email
CREATE OR REPLACE FUNCTION public.safe_username_from_auth(uid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'auth', 'public'
AS $$
DECLARE
    user_email text;
    username text;
BEGIN
    -- Get email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = uid;
    
    -- If no email found, return fallback
    IF user_email IS NULL THEN
        RETURN 'user_' || substring(uid::text from 1 for 8);
    END IF;
    
    -- Extract local part (before @) and sanitize
    username := split_part(user_email, '@', 1);
    
    -- Remove any non-alphanumeric characters and limit length
    username := regexp_replace(username, '[^a-zA-Z0-9]', '', 'g');
    username := substring(username from 1 for 20);
    
    -- If empty after sanitization, use fallback
    IF username = '' OR username IS NULL THEN
        RETURN 'user_' || substring(uid::text from 1 for 8);
    END IF;
    
    RETURN username;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.safe_username_from_auth(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.safe_username_from_auth(uuid) TO authenticated;

-- Drop existing global_leaderboard view
DROP VIEW IF EXISTS public.global_leaderboard;

-- Recreate global_leaderboard view with proper display names
CREATE VIEW public.global_leaderboard AS
SELECT 
    up.user_id,
    up.total_points,
    up.meditation_streak,
    up.last_meditation_date,
    up.fitness_streak,
    up.last_fitness_date,
    GREATEST(
        COALESCE(up.meditation_streak, 0),
        COALESCE(up.fitness_streak, 0)
    ) as active_streak,
    COALESCE(ms.total_sessions, 0) as total_sessions,
    COALESCE(ms.total_meditation_time, 0) as total_meditation_time,
    COALESCE(fs.total_fitness_sessions, 0) as total_fitness_sessions,
    COALESCE(fs.total_fitness_time, 0) as total_fitness_time,
    public.safe_username_from_auth(up.user_id) as display_name
FROM 
    public.user_points up
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration), 0) as total_meditation_time
    FROM public.meditation_sessions
    WHERE status = 'completed'
    GROUP BY user_id
) ms ON up.user_id = ms.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_fitness_sessions,
        COALESCE(SUM(duration), 0) as total_fitness_time
    FROM public.fitness_sessions
    WHERE verified = true
    GROUP BY user_id
) fs ON up.user_id = fs.user_id
WHERE up.total_points > 0
ORDER BY up.total_points DESC;