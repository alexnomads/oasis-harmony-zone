
-- Create meditation_sessions table
CREATE TABLE meditation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    duration INTEGER DEFAULT 0,
    points_earned NUMERIC(10,1) DEFAULT 0,
    shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create session_reflections table
CREATE TABLE session_reflections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES meditation_sessions(id) NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    emoji TEXT,
    notes TEXT,
    notes_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id)
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

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    nickname TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    twitter_handle TEXT,
    instagram_handle TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

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

-- Create policies for session_reflections
CREATE POLICY "Users can view own session reflections"
    ON session_reflections
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own session reflections"
    ON session_reflections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session reflections"
    ON session_reflections
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own session reflections"
    ON session_reflections
    FOR DELETE
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

-- Create policies for user_profiles
CREATE POLICY "Users can view any profile"
    ON user_profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create own profile"
    ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON user_profiles
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
