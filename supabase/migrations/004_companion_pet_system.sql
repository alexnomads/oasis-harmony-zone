
-- Create companion_pets table
CREATE TABLE companion_pets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    pet_name TEXT DEFAULT 'Rose' NOT NULL,
    evolution_stage INTEGER DEFAULT 0 NOT NULL, -- 0: bud, 1: sprout, 2: bloom, 3: mystic
    experience_points INTEGER DEFAULT 0 NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    accessories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_logs table
CREATE TABLE mood_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10) NOT NULL,
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10) NOT NULL,
    symptoms TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create roj_currency table
CREATE TABLE roj_currency (
    user_id UUID REFERENCES auth.users PRIMARY KEY,
    roj_points INTEGER DEFAULT 0 NOT NULL,
    stars INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pet_achievements table
CREATE TABLE pet_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    achievement_type TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT NOT NULL,
    UNIQUE(user_id, achievement_type)
);

-- Enable Row Level Security
ALTER TABLE companion_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roj_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for companion_pets
CREATE POLICY "Users can view own pet"
    ON companion_pets
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pet"
    ON companion_pets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pet"
    ON companion_pets
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for mood_logs
CREATE POLICY "Users can view own mood logs"
    ON mood_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mood logs"
    ON mood_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood logs"
    ON mood_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for roj_currency
CREATE POLICY "Users can view own currency"
    ON roj_currency
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own currency"
    ON roj_currency
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for pet_achievements
CREATE POLICY "Users can view own achievements"
    ON pet_achievements
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own achievements"
    ON pet_achievements
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to initialize pet and currency on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_pet()
RETURNS TRIGGER AS $$
BEGIN
    -- Create companion pet
    INSERT INTO public.companion_pets (user_id)
    VALUES (NEW.id);
    
    -- Create currency record
    INSERT INTO public.roj_currency (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing trigger to include pet initialization
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_pet();

-- Create function to update pet evolution based on streak
CREATE OR REPLACE FUNCTION update_pet_evolution(p_user_id UUID)
RETURNS void AS $$
DECLARE
    current_streak INTEGER;
    current_stage INTEGER;
    new_stage INTEGER;
BEGIN
    -- Get current meditation streak from user_points
    SELECT meditation_streak INTO current_streak
    FROM user_points
    WHERE user_id = p_user_id;
    
    -- Get current evolution stage
    SELECT evolution_stage INTO current_stage
    FROM companion_pets
    WHERE user_id = p_user_id;
    
    -- Determine new stage based on streak
    IF current_streak >= 14 THEN
        new_stage := 3; -- mystic rose
    ELSIF current_streak >= 7 THEN
        new_stage := 2; -- bloom
    ELSIF current_streak >= 3 THEN
        new_stage := 1; -- sprout
    ELSE
        new_stage := 0; -- bud
    END IF;
    
    -- Update pet if stage changed
    IF new_stage > current_stage THEN
        UPDATE companion_pets
        SET 
            evolution_stage = new_stage,
            experience_points = experience_points + (new_stage * 100),
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
