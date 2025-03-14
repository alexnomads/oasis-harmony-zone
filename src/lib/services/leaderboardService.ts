
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
      
      console.log(`Leaderboard data retrieved, entries: ${data?.length || 0}`);
      return data || [];
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
}
