
import { supabase } from './supabase';
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import type { MeditationSession, UserPoints, MeditationType, MeditationStatus } from '../types/database';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const retryOperation = async <T,>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error instanceof Error && 
       (error.message.includes('fetch') || error.message.includes('network'))) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

export class MeditationService {
  // Start a new meditation session
  static async startSession(userId: string, type: MeditationType) {
    try {
      console.log('Starting meditation session for user:', userId, 'type:', type);
      
      const { data, error } = await retryOperation(async () =>
        supabase
          .from('meditation_sessions')
          .insert([{
            user_id: userId,
            type,
            status: 'in_progress' as MeditationStatus,
            duration: 0,
            points_earned: 0
          }])
          .select('*')
      );

      if (error) {
        console.error('Supabase error starting session:', error);
        throw new Error(`Failed to start meditation session: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from session creation');
        throw new Error('No data returned from session creation');
      }
      
      console.log('Session created successfully:', data[0]);
      return data[0] as MeditationSession;
    } catch (error) {
      console.error('Error starting meditation session:', error);
      throw error;
    }
  }

  // Complete a meditation session and award points
  static async completeSession(sessionId: string, duration: number) {
    try {
      console.log('Completing session:', sessionId, 'duration:', duration);
      
      // Calculate points (1 point per minute, minimum 1 point for completing any session)
      const points = Math.max(1, Math.floor(duration / 60));
      console.log('Points calculated:', points);

      // Update session
      const { data: session, error: sessionError } = await retryOperation(async () =>
        supabase
          .from('meditation_sessions')
          .update({
            status: 'completed' as MeditationStatus,
            duration,
            points_earned: points,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select('*')
      );

      if (sessionError) {
        console.error('Error updating session:', sessionError);
        throw new Error(`Failed to complete meditation session: ${sessionError.message}`);
      }
      
      if (!session || session.length === 0) {
        console.error('No session data returned after update');
        throw new Error('No session data returned after update');
      }
      
      console.log('Session updated successfully:', session[0]);

      // Get updated user points
      const { data: userPoints, error: pointsError } = await retryOperation(async () =>
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', session[0].user_id)
      );

      if (pointsError) {
        console.error('Error fetching user points:', pointsError);
        throw new Error(`Failed to fetch user points: ${pointsError.message}`);
      }
      
      if (!userPoints || userPoints.length === 0) {
        console.error('No user points returned');
        throw new Error('No user points returned');
      }
      
      console.log('User points retrieved:', userPoints[0]);

      return { session: session[0], userPoints: userPoints[0] };
    } catch (error) {
      console.error('Error completing meditation session:', error);
      throw error;
    }
  }

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
