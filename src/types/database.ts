
export type MeditationType = 'mindfulness' | 'breathing' | 'body_scan' | 'loving_kindness';

export type MeditationStatus = 'in_progress' | 'completed' | 'cancelled';

export type WorkoutType = 'abs' | 'pushups' | 'biceps' | 'plank' | 'abs-situps' | 'abs-crunches';

export interface MeditationSession {
  id: string;
  user_id: string;
  type: MeditationType;
  status: MeditationStatus;
  duration: number;
  points_earned: number;
  shared: boolean;
  emoji?: string;
  notes?: string;
  notes_public: boolean;
  created_at: string;
  completed_at?: string;
}

export interface FitnessSession {
  id: string;
  user_id: string;
  workout_type: WorkoutType;
  reps_completed: number;
  duration: number;
  points_earned: number;
  proof_url?: string;
  verified: boolean;
  ai_tracked: boolean;
  form_score?: number;
  ai_exercise_type?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPoints {
  user_id: string;
  total_points: number;
  meditation_streak: number;
  last_meditation_date: string | null;
  fitness_points?: number;
  fitness_streak?: number;
  last_fitness_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  created_at: string;
  updated_at: string;
}

// New interfaces for AI Coach enhancements
export interface UserMood {
  id: string;
  user_id: string;
  emotion: string;
  intensity: number;
  keywords: string[];
  message_context: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalizedMeditation {
  id: string;
  user_id: string;
  title: string;
  type: MeditationType;
  duration: number;
  focus: string;
  script: MeditationScript;
  audio_instructions: string[];
  background_music: string;
  user_level: 'beginner' | 'intermediate' | 'advanced';
  usage_count: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface MeditationScript {
  phases: Array<{
    name: string;
    duration: number;
    instructions: string;
    guidance: string[];
  }>;
}

export interface AIInteractionLog {
  id: string;
  user_id: string;
  interaction_type: string;
  user_message: string;
  ai_response: string;
  response_time: number;
  mood_detected?: string;
  mood_intensity?: number;
  session_started: boolean;
  user_satisfaction?: number;
  created_at: string;
}

export interface MeditationInsights {
  summary: {
    totalSessions: number;
    totalMinutes: number;
    averageSession: number;
    streak: number;
    consistency: number;
  };
  patterns: {
    preferredTimes: string[];
    favoriteTypes: string[];
    moodTrends: Array<{
      emotion: string;
      frequency: number;
      improvement: number;
    }>;
  };
  achievements: Array<{
    type: string;
    title: string;
    description: string;
    unlockedAt: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    reason: string;
    priority: number;
  }>;
  insights: string[];
}
