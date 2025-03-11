
-- Create an enum for meditation session status
CREATE TYPE meditation_status AS ENUM ('in_progress', 'completed', 'cancelled');

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status meditation_status NOT NULL DEFAULT 'in_progress',
    duration INTEGER NOT NULL DEFAULT 0, -- in seconds
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
            -- If last meditation was yesterday, increment streak
            WHEN user_points.last_meditation_date = CURRENT_DATE - INTERVAL '1 day'
            THEN user_points.meditation_streak + 1
            -- If last meditation was today, keep current streak
            WHEN user_points.last_meditation_date = CURRENT_DATE
            THEN user_points.meditation_streak
            -- Otherwise reset streak to 1
            ELSE 1
        END,
        last_meditation_date = CURRENT_DATE,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- First create the table before defining triggers
CREATE TABLE IF NOT EXISTS meditation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status meditation_status NOT NULL DEFAULT 'in_progress',
    duration INTEGER NOT NULL DEFAULT 0, -- in seconds
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Now create the trigger after the table exists and has a status column
CREATE TRIGGER update_points_on_session_complete
    AFTER UPDATE ON meditation_sessions
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status = 'in_progress')
    EXECUTE FUNCTION update_user_points();

-- Create RLS policies
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Users can only read their own sessions
CREATE POLICY "Users can read own sessions"
    ON meditation_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions"
    ON meditation_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON meditation_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can only read their own points
CREATE POLICY "Users can read own points"
    ON user_points
    FOR SELECT
    USING (auth.uid() = user_id);

-- Enable realtime for meditation_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE meditation_sessions;

-- Create a view to show the global leaderboard
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT
    up.user_id,
    up.total_points,
    up.meditation_streak,
    up.last_meditation_date,
    COUNT(ms.id) as total_sessions,
    SUM(ms.duration) as total_meditation_time,
    p.email,
    COALESCE(p.raw_user_meta_data->>'full_name', p.raw_user_meta_data->>'name', p.email) as display_name
FROM
    user_points up
JOIN
    auth.users p ON up.user_id = p.id
LEFT JOIN
    meditation_sessions ms ON up.user_id = ms.user_id AND ms.status = 'completed'
GROUP BY
    up.user_id, up.total_points, up.meditation_streak, up.last_meditation_date, p.email, p.raw_user_meta_data
ORDER BY
    up.total_points DESC;

-- Grant appropriate permissions for the view
GRANT SELECT ON global_leaderboard TO anon, authenticated, service_role;
