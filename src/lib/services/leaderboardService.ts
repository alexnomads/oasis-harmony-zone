import { supabase } from '../supabase';
import { retryOperation } from '../utils/apiUtils';
import { BaseService } from './baseService';

export class LeaderboardService extends BaseService {
  // Get global leaderboard data with pagination
  static async getLeaderboard(limit = 10, offset = 0) {
    try {
      console.log(`Fetching global leaderboard, limit: ${limit}, offset: ${offset}`);
      
      const { data, error } = await retryOperation(async () =>
        supabase
          .from('global_leaderboard')
          .select('*')
          .order('total_points', { ascending: false })
          .range(offset, offset + limit - 1)
      );
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
      }
      
      // Process the data to ensure streaks are properly shown
      const processedData = data?.map(entry => ({
        ...entry,
        // If active_streak is available, use it; otherwise calculate based on last meditation date
        meditation_streak: entry.active_streak !== undefined ? 
          entry.active_streak : 
          this.calculateActiveStreak(entry.last_meditation_date, entry.meditation_streak)
      })) || [];
      
      console.log(`Leaderboard data retrieved, entries: ${processedData.length || 0}`);
      return processedData;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
  
  // Get total count of users in the leaderboard
  static async getLeaderboardCount() {
    try {
      console.log('Fetching leaderboard count');
      
      const { count, error } = await retryOperation(async () =>
        supabase
          .from('global_leaderboard')
          .select('*', { count: 'exact', head: true })
      );
      
      if (error) {
        console.error('Error fetching leaderboard count:', error);
        throw new Error(`Failed to fetch leaderboard count: ${error.message}`);
      }
      
      console.log(`Total leaderboard entries: ${count || 0}`);
      return count || 0;
    } catch (error) {
      console.error('Error fetching leaderboard count:', error);
      return 0;
    }
  }
  
  // Helper method to calculate if a streak is active
  private static calculateActiveStreak(lastMeditationDate: string | null, currentStreak: number): number {
    if (!lastMeditationDate) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastMeditation = new Date(lastMeditationDate);
    lastMeditation.setHours(0, 0, 0, 0);
    
    // If the last meditation was today or yesterday, the streak is active
    if (lastMeditation.getTime() === today.getTime() || 
        lastMeditation.getTime() === yesterday.getTime()) {
      return currentStreak;
    }
    
    // Otherwise, streak is reset to 0
    return 0;
  }
}
