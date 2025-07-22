
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { CompanionPet, MoodLog, ROJCurrency, PetAchievement, PetEvolutionStage } from '../../types/pet';

export class PetService extends BaseService {
  // Initialize pet and currency for a user if they don't exist
  static async initializeUserPetData(userId: string): Promise<{ pet: CompanionPet; currency: ROJCurrency }> {
    try {
      console.log('Initializing pet data for user:', userId);
      
      // Create companion pet if it doesn't exist
      const { data: petData, error: petError } = await supabase
        .from('companion_pets')
        .upsert({
          user_id: userId,
          pet_name: 'Rose',
          evolution_stage: 0,
          experience_points: 0,
          level: 1,
          accessories: []
        })
        .select()
        .single();
        
      if (petError) throw petError;
      
      // Create currency record if it doesn't exist
      const { data: currencyData, error: currencyError } = await supabase
        .from('roj_currency')
        .upsert({
          user_id: userId,
          roj_points: 0,
          stars: 0
        })
        .select()
        .single();
        
      if (currencyError) throw currencyError;
      
      console.log('Successfully initialized pet data:', { petData, currencyData });
      return { 
        pet: petData as CompanionPet, 
        currency: currencyData as ROJCurrency 
      };
    } catch (error) {
      console.error('Error initializing pet data:', error);
      throw error;
    }
  }

  // Get user's companion pet with auto-initialization
  static async getUserPet(userId: string): Promise<CompanionPet> {
    try {
      console.log('Fetching pet for user:', userId);
      
      const { data, error } = await supabase
        .from('companion_pets')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.message.includes('No data returned')) {
          console.log('No pet found, initializing...');
          const { pet } = await this.initializeUserPetData(userId);
          return pet;
        }
        throw error;
      }
      
      return data as CompanionPet;
    } catch (error) {
      console.error('Error fetching user pet:', error);
      throw error;
    }
  }

  // Get user's currency with auto-initialization
  static async getUserCurrency(userId: string): Promise<ROJCurrency> {
    try {
      console.log('Fetching currency for user:', userId);
      
      const { data, error } = await supabase
        .from('roj_currency')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.message.includes('No data returned')) {
          console.log('No currency found, initializing...');
          const { currency } = await this.initializeUserPetData(userId);
          return currency;
        }
        throw error;
      }
      
      return data as ROJCurrency;
    } catch (error) {
      console.error('Error fetching user currency:', error);
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
      return pet;
    } catch (error) {
      console.error('Error updating pet evolution:', error);
      throw error;
    }
  }

  // Add experience points to pet
  static async addExperience(userId: string, points: number): Promise<CompanionPet> {
    try {
      console.log('Adding experience for user:', userId, 'points:', points);
      
      // Get current pet data (will auto-initialize if needed)
      const currentPet = await this.getUserPet(userId);

      const { data, error } = await supabase
        .from('companion_pets')
        .update({
          experience_points: currentPet.experience_points + points,
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

  // Log user mood with improved error handling
  static async logMood(userId: string, moodData: {
    mood_score: number;
    energy_level: number;
    stress_level: number;
    symptoms?: string[];
  }): Promise<MoodLog> {
    try {
      console.log('Logging mood for user:', userId, moodData);
      
      // First ensure currency exists
      await this.getUserCurrency(userId);
      
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
      
      console.log('Mood logged successfully:', data);
      
      // Award points for mood logging (with error handling)
      try {
        await this.addCurrency(userId, 5, 0);
        console.log('Currency awarded successfully');
      } catch (currencyError) {
        console.error('Failed to award currency, but mood was logged:', currencyError);
        // Don't throw here - mood logging was successful
      }
      
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

  // Add currency (ROJ points and stars) with better error handling
  static async addCurrency(userId: string, rojPoints: number, stars: number): Promise<ROJCurrency> {
    try {
      console.log('Adding currency for user:', userId, 'ROJ:', rojPoints, 'Stars:', stars);
      
      // Get current currency data (will auto-initialize if needed)
      const currentCurrency = await this.getUserCurrency(userId);

      const { data, error } = await supabase
        .from('roj_currency')
        .update({
          roj_points: currentCurrency.roj_points + rojPoints,
          stars: currentCurrency.stars + stars,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) throw error;
      console.log('Currency updated successfully:', data);
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
