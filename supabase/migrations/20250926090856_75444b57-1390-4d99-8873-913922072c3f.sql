-- Add AI tracking fields to fitness_sessions table
ALTER TABLE public.fitness_sessions 
ADD COLUMN ai_tracked BOOLEAN DEFAULT FALSE,
ADD COLUMN form_score NUMERIC(3,2) DEFAULT NULL,
ADD COLUMN ai_exercise_type TEXT DEFAULT NULL;

-- Add index for better performance on AI tracked sessions
CREATE INDEX idx_fitness_sessions_ai_tracked ON public.fitness_sessions(ai_tracked);

-- Comment to indicate the enhanced schema
COMMENT ON COLUMN public.fitness_sessions.ai_tracked IS 'Whether this session was tracked using AI camera detection';
COMMENT ON COLUMN public.fitness_sessions.form_score IS 'AI-detected form quality score (0.00-1.00)';
COMMENT ON COLUMN public.fitness_sessions.ai_exercise_type IS 'AI-detected specific exercise type';