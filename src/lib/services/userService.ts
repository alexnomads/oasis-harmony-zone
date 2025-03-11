
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { MeditationSession, UserPoints } from '../../types/database';

export class UserService extends BaseService {
  // Get user's meditation history and points
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
      
      // Get user's points
      try {
        const pointsResult = await supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        const points = await this.executeQuery<UserPoints>(() => Promise.resolve(pointsResult));
        
        return { sessions, points };
      } catch (error) {
        // If user has no points record yet, return default values
        if (error instanceof Error && error.message.includes('No data returned')) {
          return {
            sessions,
            points: {
              user_id: userId,
              total_points: 0,
              meditation_streak: 0,
              last_meditation_date: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as UserPoints
          };
        }
        throw error;
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  }
  
  // Check and update user's meditation streak
  static async checkAndUpdateStreak(userId: string) {
    // Implementation would go here if needed
    // This is just a stub since it's not being called in the current code
    return { updated: false };
  }
}
