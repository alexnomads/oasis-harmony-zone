-- Create meditation_sessions table
CREATE TABLE meditation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    type TEXT NOT NULL,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_points table
CREATE TABLE user_points (
    user_id UUID REFERENCES auth.users PRIMARY KEY,
    total_points INTEGER DEFAULT 0,
    meditation_streak INTEGER DEFAULT 0,
    last_meditation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Create policies for meditation_sessions
CREATE POLICY "Users can view own meditation sessions"
    ON meditation_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meditation sessions"
    ON meditation_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meditation sessions"
    ON meditation_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for user_points
CREATE POLICY "Users can view own points"
    ON user_points
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
    ON user_points
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to initialize user_points on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_points (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END
$$;
