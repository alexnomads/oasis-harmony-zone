
-- Add mood tracking table
CREATE TABLE IF NOT EXISTS user_moods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    keywords TEXT[] DEFAULT '{}',
    message_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add personalized meditations table
CREATE TABLE IF NOT EXISTS personalized_meditations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL,
    focus VARCHAR(200),
    script JSONB NOT NULL,
    audio_instructions TEXT[] DEFAULT '{}',
    background_music VARCHAR(100),
    user_level VARCHAR(20) DEFAULT 'beginner',
    usage_count INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add AI interaction logs for quality monitoring
CREATE TABLE IF NOT EXISTS ai_interaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    user_message TEXT,
    ai_response TEXT,
    response_time INTEGER, -- milliseconds
    mood_detected VARCHAR(50),
    mood_intensity INTEGER,
    session_started BOOLEAN DEFAULT false,
    user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add meditation insights cache table
CREATE TABLE IF NOT EXISTS meditation_insights_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    timeframe VARCHAR(20) NOT NULL,
    insights_data JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_moods_user_id_created_at ON user_moods(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_moods_emotion ON user_moods(emotion);
CREATE INDEX IF NOT EXISTS idx_personalized_meditations_user_id ON personalized_meditations(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_meditations_type ON personalized_meditations(type);
CREATE INDEX IF NOT EXISTS idx_ai_interaction_logs_user_id ON ai_interaction_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_insights_cache_user_id ON meditation_insights_cache(user_id, timeframe);

-- Enable RLS
ALTER TABLE user_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_insights_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own moods" ON user_moods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own personalized meditations" ON personalized_meditations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own AI interaction logs" ON ai_interaction_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own insights cache" ON meditation_insights_cache FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_moods_updated_at BEFORE UPDATE ON user_moods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalized_meditations_updated_at BEFORE UPDATE ON personalized_meditations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to clean up expired insights cache
CREATE OR REPLACE FUNCTION cleanup_expired_insights_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM meditation_insights_cache 
    WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Create a function to get user's recent mood trend
CREATE OR REPLACE FUNCTION get_user_mood_trend(user_uuid UUID, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    emotion VARCHAR(50),
    avg_intensity DECIMAL,
    frequency BIGINT,
    trend VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_moods AS (
        SELECT 
            um.emotion,
            um.intensity,
            um.created_at,
            ROW_NUMBER() OVER (PARTITION BY um.emotion ORDER BY um.created_at DESC) as rn
        FROM user_moods um
        WHERE um.user_id = user_uuid
        AND um.created_at >= NOW() - INTERVAL '1 day' * days_back
    ),
    mood_stats AS (
        SELECT 
            rm.emotion,
            AVG(rm.intensity) as avg_intensity,
            COUNT(*) as frequency,
            AVG(CASE WHEN rm.rn <= 3 THEN rm.intensity END) as recent_avg,
            AVG(CASE WHEN rm.rn > 3 THEN rm.intensity END) as older_avg
        FROM recent_moods rm
        GROUP BY rm.emotion
        HAVING COUNT(*) >= 2
    )
    SELECT 
        ms.emotion,
        ROUND(ms.avg_intensity, 1) as avg_intensity,
        ms.frequency,
        CASE 
            WHEN ms.recent_avg > ms.older_avg THEN 'improving'
            WHEN ms.recent_avg < ms.older_avg THEN 'declining'
            ELSE 'stable'
        END as trend
    FROM mood_stats ms
    ORDER BY ms.frequency DESC, ms.avg_intensity DESC;
END;
$$ language 'plpgsql';
