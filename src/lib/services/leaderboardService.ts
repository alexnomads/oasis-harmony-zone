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
      
      // The data already includes the active_streak field from the SQL view
      // No additional processing needed as the SQL view now handles streak logic
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

  // Get user profile by username
  static async getUserByUsername(username: string) {
    try {
      console.log(`Fetching user profile for username: ${username}`);
      
      // Try multiple search strategies to find the user
      let data = null;
      let error = null;
      
      // If it's a full UUID, match directly by user_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(username)) {
        const exactIdMatch = await retryOperation(async () =>
          supabase
            .from('global_leaderboard')
            .select('*')
            .eq('user_id', username)
            .maybeSingle()
        );
        if (exactIdMatch.data) {
          data = exactIdMatch.data;
        }
      }
      
      if (!data) {
        // First, try exact display name match
        const exactMatch = await retryOperation(async () =>
          supabase
            .from('global_leaderboard')
            .select('*')
            .eq('display_name', username)
            .maybeSingle()
        );
        
        if (exactMatch.data) {
          data = exactMatch.data;
        } else {
          // Try case-insensitive partial match
          const partialMatch = await retryOperation(async () =>
            supabase
              .from('global_leaderboard')
              .select('*')
              .ilike('display_name', `%${username}%`)
              .maybeSingle()
          );
          
          if (partialMatch.data) {
            data = partialMatch.data;
          } else {
            // Try searching with slug conversion (replace hyphens with spaces)
            const slugToName = username.replace(/-/g, ' ');
            const slugMatch = await retryOperation(async () =>
              supabase
                .from('global_leaderboard')
                .select('*')
                .ilike('display_name', `%${slugToName}%`)
                .maybeSingle()
            );
            
            if (slugMatch.data) {
              data = slugMatch.data;
            } else {
              // Finally, try to match against old-style usernames (user_xxxx pattern)
              const oldStyleMatch = await retryOperation(async () =>
                supabase
                  .from('global_leaderboard')
                  .select('*')
                  .like('display_name', `%${username.replace(/[^a-zA-Z0-9]/g, '')}%`)
                  .maybeSingle()
              );
              
              data = oldStyleMatch.data;
              error = oldStyleMatch.error;
            }
          }
        }
      }
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user by username:', error);
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
      
      if (data) {
        // Get user's rank in the leaderboard
        const { count: rank } = await retryOperation(async () =>
          supabase
            .from('global_leaderboard')
            .select('*', { count: 'exact', head: true })
            .gt('total_points', data.total_points)
        );
        
        return {
          ...data,
          rank: (rank || 0) + 1
        };
      }
      
      console.log(`User not found for username: ${username}`);
      return null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }
}
