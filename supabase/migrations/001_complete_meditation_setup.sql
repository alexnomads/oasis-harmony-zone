
-- Create an enum for meditation session status
CREATE TYPE meditation_status AS ENUM ('in_progress', 'completed', 'cancelled');

-- Create meditation_sessions table with proper status column
CREATE TABLE IF NOT EXISTS meditation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status meditation_status NOT NULL DEFAULT 'in_progress',
    duration INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    total_points INTEGER NOT NULL DEFAULT 0,
    meditation_streak INTEGER NOT NULL DEFAULT 0,
    last_meditation_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to update user points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user points
    INSERT INTO user_points (user_id, total_points, meditation_streak, last_meditation_date)
    VALUES (
        NEW.user_id,
        NEW.points_earned,
        1,
        CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_points.total_points + NEW.points_earned,
        meditation_streak = CASE
            WHEN user_points.last_meditation_date = CURRENT_DATE - INTERVAL '1 day'
            THEN user_points.meditation_streak + 1
            WHEN user_points.last_meditation_date = CURRENT_DATE
            THEN user_points.meditation_streak
            ELSE 1
        END,
        last_meditation_date = CURRENT_DATE,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update points when session is completed
CREATE OR REPLACE TRIGGER update_points_on_session_complete
    AFTER UPDATE ON meditation_sessions
    FOR EACH ROW
    WHEN (NEW.status::meditation_status = 'completed' AND OLD.status::meditation_status = 'in_progress')
    EXECUTE FUNCTION update_user_points();

-- Enable RLS
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own sessions"
    ON meditation_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
    ON meditation_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON meditation_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can read own points"
    ON user_points
    FOR SELECT
    USING (auth.uid() = user_id);

-- Add INSERT policy for user_points
CREATE POLICY "Users can insert own points"
    ON user_points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for user_points
CREATE POLICY "Users can update own points"
    ON user_points
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Enable realtime for meditation_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE meditation_sessions;

-- Create global leaderboard view
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT
    up.user_id,
    up.total_points,
    up.meditation_streak,
    CAST(up.last_meditation_date AS TEXT) as last_meditation_date,
    COUNT(CASE WHEN ms.status = 'completed' THEN 1 END) as total_sessions,
    SUM(CASE WHEN ms.status = 'completed' THEN COALESCE(ms.duration, 0) ELSE 0 END) as total_meditation_time,
    p.email,
    COALESCE(p.raw_user_meta_data->>'full_name', p.raw_user_meta_data->>'name', p.email) as display_name
FROM
    user_points up
JOIN
    auth.users p ON up.user_id = p.id
LEFT JOIN
    meditation_sessions ms ON up.user_id = ms.user_id
GROUP BY
    up.user_id, up.total_points, up.meditation_streak, up.last_meditation_date, p.email, p.raw_user_meta_data
ORDER BY
    up.total_points DESC;

-- Grant appropriate permissions for the view
GRANT SELECT ON global_leaderboard TO anon, authenticated, service_role;
