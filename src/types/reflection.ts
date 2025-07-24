export interface SessionReflection {
  id: string;
  session_id: string;
  user_id: string;
  emoji?: string;
  notes?: string;
  notes_public: boolean;
  created_at: string;
  updated_at: string;
}