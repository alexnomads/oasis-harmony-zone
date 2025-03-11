
export type MeditationType = 'mindfulness' | 'breathing' | 'body_scan' | 'loving_kindness';

export type MeditationStatus = 'in_progress' | 'completed' | 'cancelled';

export interface MeditationSession {
  id: string;
  user_id: string;
  type: MeditationType;
  status: MeditationStatus;
  duration: number;
  points_earned: number;
  created_at: string;
  completed_at?: string;
}

export interface UserPoints {
  user_id: string;
  total_points: number;
  meditation_streak: number;
  last_meditation_date: string | null;
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
