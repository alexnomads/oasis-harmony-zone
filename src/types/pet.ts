
export type PetEvolutionStage = 0 | 1 | 2 | 3;

export interface CompanionPet {
  id: string;
  user_id: string;
  pet_name: string;
  evolution_stage: PetEvolutionStage;
  experience_points: number;
  level: number;
  accessories: string[];
  created_at: string;
  updated_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  date: string;
  mood_score: number; // 1-5
  energy_level: number; // 1-10
  stress_level: number; // 1-10
  symptoms: string[];
  created_at: string;
}

export interface ROJCurrency {
  user_id: string;
  roj_points: number;
  stars: number;
  created_at: string;
  updated_at: string;
}

export interface PetAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  unlocked_at: string;
  description: string;
}

export const PET_EVOLUTION_STAGES = {
  0: { name: 'Bud', description: 'A tiny rose bud, just beginning to grow' },
  1: { name: 'Sprout', description: 'A young sprout reaching toward the light' },
  2: { name: 'Bloom', description: 'A beautiful blooming rose in full glory' },
  3: { name: 'Mystic Rose', description: 'A mystical rose glowing with inner wisdom' }
} as const;

export const MOOD_EMOJIS = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊'
} as const;

export const SYMPTOMS_OPTIONS = [
  'headache',
  'fatigue',
  'anxiety',
  'stress',
  'insomnia',
  'muscle_tension',
  'digestive_issues',
  'mood_swings',
  'brain_fog',
  'restlessness'
] as const;
