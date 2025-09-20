-- Create function to get all fitness sessions (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_all_fitness_sessions()
RETURNS SETOF fitness_sessions
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.fitness_sessions;
$$;

-- Create function to get filtered fitness sessions by date (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_filtered_fitness_sessions(start_date timestamp with time zone)
RETURNS SETOF fitness_sessions
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.fitness_sessions 
  WHERE created_at >= start_date;
$$;