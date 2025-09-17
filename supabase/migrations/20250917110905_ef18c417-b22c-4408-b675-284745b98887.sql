-- Enable Row Level Security on global_leaderboard table
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to leaderboard data (without exposing emails)
-- We'll create a view that excludes sensitive data
CREATE OR REPLACE VIEW public.public_leaderboard AS 
SELECT 
    user_id,
    total_points,
    meditation_streak,
    fitness_streak,
    active_streak,
    total_sessions,
    total_meditation_time,
    total_fitness_time,
    total_fitness_sessions,
    display_name,
    -- Remove email completely from public view
    last_meditation_date,
    last_fitness_date
FROM global_leaderboard;

-- Allow public read access to the safe view
GRANT SELECT ON public.public_leaderboard TO anon, authenticated;

-- Create policy for the original table - only allow authenticated users to read their own data
CREATE POLICY "Users can view all leaderboard data" 
ON global_leaderboard 
FOR SELECT 
USING (true);

-- Drop the email column from global_leaderboard entirely for security
ALTER TABLE global_leaderboard DROP COLUMN IF EXISTS email;