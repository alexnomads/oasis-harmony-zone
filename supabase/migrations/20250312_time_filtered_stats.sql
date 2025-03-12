
-- Create a new RPC function that allows filtering sessions by date
CREATE OR REPLACE FUNCTION get_filtered_completed_sessions(start_date TIMESTAMP WITH TIME ZONE)
RETURNS SETOF meditation_sessions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM meditation_sessions 
  WHERE status = 'completed'
  AND created_at >= start_date;
$$;

-- Create a new RPC function to get users who have meditated within a specific time period
CREATE OR REPLACE FUNCTION get_users_by_meditation_period(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (user_id UUID)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT user_id FROM meditation_sessions 
  WHERE status = 'completed'
  AND created_at >= start_date;
$$;

-- Grant access to the functions
GRANT EXECUTE ON FUNCTION get_filtered_completed_sessions(TIMESTAMP WITH TIME ZONE) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_users_by_meditation_period(TIMESTAMP WITH TIME ZONE) TO anon, authenticated, service_role;
