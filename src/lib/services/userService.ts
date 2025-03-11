
import { supabase } from '../supabase';
import { retryOperation } from '../utils/apiUtils';
import { BaseService } from './baseService';
import type { MeditationSession, UserPoints } from '../../types/database';

export class UserService extends BaseService {
  // Get user's meditation history
  static async getUserHistory(userId: string) {
    try {
      console.log('Fetching meditation history for user:', userId);
      
      const sessionsPromise = retryOperation(async () =>
        supabase
          .from('meditation_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
      );
      
      const pointsPromise = retryOperation(async () =>
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
      );
      
      const [sessionsResult, pointsResult] = await Promise.all([sessionsPromise, pointsPromise]);
      
      const { data: sessions, error: sessionsError } = sessionsResult;
      const { data: points, error: pointsError } = pointsResult;
      
      if (sessionsError) {
        console.error('Error fetching meditation sessions:', sessionsError);
        throw new Error(`Failed to fetch meditation history: ${sessionsError.message}`);
      }
      
      if (pointsError) {
        console.error('Error fetching user points:', pointsError);
        throw new Error(`Failed to fetch user points: ${pointsError.message}`);
      }
      
      console.log('Sessions retrieved:', sessions?.length || 0);
      console.log('Points retrieved:', points?.[0] || 'none');

      // Create default points object if none exists
      const userPoints = points && points.length > 0 
        ? points[0]
        : {
            user_id: userId,
            total_points: 0,
            meditation_streak: 0,
            last_meditation_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
      
      return {
        sessions: sessions || [],
        points: userPoints
      };
    } catch (error) {
      console.error('Error fetching user history:', error);
      return { 
        sessions: [], 
        points: {
          user_id: userId,
          total_points: 0,
          meditation_streak: 0,
          last_meditation_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  }

  // Reset meditation streak if user hasn't meditated in 24 hours
  static async checkAndUpdateStreak(userId: string) {
    try {
      console.log('Checking and updating streak for user:', userId);
      
      const { data: points, error } = await retryOperation(async () =>
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
      );

      if (error) {
        console.error('Error fetching user points for streak check:', error);
        return;
      }
      
      if (!points || points.length === 0) {
        console.log('No points record found for streak check, nothing to update');
        return;
      }
      
      const userPoints = points[0];
      console.log('User points for streak check:', userPoints);

      if (userPoints.last_meditation_date) {
        const lastMeditation = new Date(userPoints.last_meditation_date);
        const now = new Date();
        const hoursSinceLastMeditation = (now.getTime() - lastMeditation.getTime()) / (1000 * 60 * 60);
        
        console.log('Hours since last meditation:', hoursSinceLastMeditation);

        if (hoursSinceLastMeditation > 24) {
          console.log('Resetting streak due to inactivity');
          
          const { error: updateError } = await retryOperation(async () =>
            supabase
              .from('user_points')
              .update({
                meditation_streak: 0,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId)
          );
          
          if (updateError) {
            console.error('Error resetting streak:', updateError);
          } else {
            console.log('Streak reset successfully');
          }
        }
      }
    } catch (error) {
      console.error('Error checking meditation streak:', error);
      throw error;
    }
  }
}
