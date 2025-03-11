
import { supabase } from '../supabase';
import { retryOperation } from '../utils/apiUtils';
import { BaseService } from './baseService';

export class LeaderboardService extends BaseService {
  // Get global leaderboard data
  static async getLeaderboard(limit = 10) {
    try {
      console.log('Fetching global leaderboard, limit:', limit);
      
      const { data, error } = await retryOperation(async () =>
        supabase
          .from('global_leaderboard')
          .select('*')
          .order('total_points', { ascending: false })
          .limit(limit)
      );
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
      }
      
      console.log('Leaderboard data retrieved, entries:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}
