import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { MeditationSession, UserPoints, UserProfile, FitnessSession } from '../../types/database';

export class UserService extends BaseService {
  // Get user's meditation history, fitness sessions, and points
  static async getUserHistory(userId: string) {
    try {
      console.log('Getting history for user:', userId);
      
      // Get user's meditation sessions
      const sessionsResult = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      const sessions = await this.executeQuery<MeditationSession[]>(() => Promise.resolve(sessionsResult));
      
      // Get user's fitness sessions
      const fitnessResult = await supabase
        .from('fitness_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      const fitnessSessions = await this.executeQuery<FitnessSession[]>(() => Promise.resolve(fitnessResult));
      
      // Get user's points
      const pointsResult = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      const points = pointsResult.data || {
        user_id: userId,
        total_points: 0,
        meditation_streak: 0,
        last_meditation_date: null,
        fitness_points: 0,
        fitness_streak: 0,
        last_fitness_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserPoints;
      
      return { sessions, fitnessSessions, points };
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  }
  
  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      return data as UserProfile | null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  // Create or update user profile
  static async upsertUserProfile(profile: Partial<UserProfile> & { user_id: string }): Promise<UserProfile> {
    try {
      // Check if nickname is unique (if provided)
      if (profile.nickname) {
        const { data: existingNickname, error: nicknameError } = await supabase
          .from('user_profiles')
          .select('id,user_id')
          .eq('nickname', profile.nickname)
          .neq('user_id', profile.user_id)
          .single();
          
        if (existingNickname) {
          throw new Error('Nickname is already taken');
        }
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  }
  
  // Upload profile picture
  static async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/profile-picture.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }
}
