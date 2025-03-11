
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

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_filtered_completed_sessions(TIMESTAMP WITH TIME ZONE) TO anon, authenticated, service_role;
