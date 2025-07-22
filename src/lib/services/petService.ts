
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { CompanionPet, MoodLog, ROJCurrency, PetAchievement, PetEvolutionStage } from '../../types/pet';

export class PetService extends BaseService {
  // Get user's companion pet
  static async getUserPet(userId: string): Promise<CompanionPet | null> {
    try {
      const { data, error } = await supabase
        .from('companion_pets')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.message.includes('No data returned')) {
          return null;
        }
        throw error;
      }
      
      return data as CompanionPet;
    } catch (error) {
      console.error('Error fetching user pet:', error);
      throw error;
    }
  }

  // Update pet evolution based on meditation streak
  static async updatePetEvolution(userId: string): Promise<CompanionPet> {
    try {
      // Call the database function to update evolution
      const { error } = await supabase.rpc('update_pet_evolution', {
        p_user_id: userId
      });
      
      if (error) throw error;
      
      // Return updated pet
      const pet = await this.getUserPet(userId);
      if (!pet) throw new Error('Pet not found after evolution update');
      
      return pet;
    } catch (error) {
      console.error('Error updating pet evolution:', error);
      throw error;
    }
  }

  // Add experience points to pet
  static async addExperience(userId: string, points: number): Promise<CompanionPet> {
    try {
      const { data, error } = await supabase
        .from('companion_pets')
        .update({
          experience_points: supabase.raw('experience_points + ?', [points]),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data as CompanionPet;
    } catch (error) {
      console.error('Error adding pet experience:', error);
      throw error;
    }
  }

  // Log user mood
  static async logMood(userId: string, moodData: {
    mood_score: number;
    energy_level: number;
    stress_level: number;
    symptoms?: string[];
  }): Promise<MoodLog> {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0], // Today's date
          ...moodData,
          symptoms: moodData.symptoms || []
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Award points for mood logging
      await this.addCurrency(userId, 5, 0);
      
      return data as MoodLog;
    } catch (error) {
      console.error('Error logging mood:', error);
      throw error;
    }
  }

  // Get user's mood history
  static async getMoodHistory(userId: string, days: number = 30): Promise<MoodLog[]> {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as MoodLog[];
    } catch (error) {
      console.error('Error fetching mood history:', error);
      throw error;
    }
  }

  // Get user's currency
  static async getUserCurrency(userId: string): Promise<ROJCurrency> {
    try {
      const { data, error } = await supabase
        .from('roj_currency')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      return data as ROJCurrency;
    } catch (error) {
      console.error('Error fetching user currency:', error);
      throw error;
    }
  }

  // Add currency (ROJ points and stars)
  static async addCurrency(userId: string, rojPoints: number, stars: number): Promise<ROJCurrency> {
    try {
      const { data, error } = await supabase
        .from('roj_currency')
        .update({
          roj_points: supabase.raw('roj_points + ?', [rojPoints]),
          stars: supabase.raw('stars + ?', [stars]),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data as ROJCurrency;
    } catch (error) {
      console.error('Error adding currency:', error);
      throw error;
    }
  }

  // Get user achievements
  static async getUserAchievements(userId: string): Promise<PetAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('pet_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
        
      if (error) throw error;
      return data as PetAchievement[];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  // Unlock achievement
  static async unlockAchievement(userId: string, achievementType: string, description: string): Promise<PetAchievement> {
    try {
      const { data, error } = await supabase
        .from('pet_achievements')
        .upsert({
          user_id: userId,
          achievement_type: achievementType,
          description: description
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as PetAchievement;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }
}
