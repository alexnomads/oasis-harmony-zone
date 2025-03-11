
-- Create an RPC function to get all completed meditation sessions
-- This helps bypass RLS policies for the global dashboard
CREATE OR REPLACE FUNCTION get_all_completed_sessions()
RETURNS SETOF meditation_sessions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM meditation_sessions 
  WHERE status = 'completed';
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_all_completed_sessions() TO anon, authenticated, service_role;

-- Update the global_leaderboard view to ensure it's working correctly
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT
    up.user_id,
    up.total_points,
    up.meditation_streak,
    up.last_meditation_date,
    COUNT(ms.id) as total_sessions,
    COALESCE(SUM(ms.duration), 0) as total_meditation_time,
    COALESCE(p.email, 'anonymous') as email,
    COALESCE(prof.nickname, p.raw_user_meta_data->>'full_name', p.raw_user_meta_data->>'name', p.email, 'Anonymous User') as display_name
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
