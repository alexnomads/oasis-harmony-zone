import { supabase } from './supabase';
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import type { MeditationSession, UserPoints, MeditationType, MeditationStatus } from '../types/database';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const retryOperation = async <T,>(operation: () => T, retries = MAX_RETRIES): Promise<T> => {
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
          .select()
          .single()
      );

      if (error) throw new Error(`Failed to start meditation session: ${error.message}`);
      if (!data) throw new Error('No data returned from session creation');
      return data as MeditationSession;
    } catch (error) {
      console.error('Error starting meditation session:', error);
      throw error;
    }
  }

  // Complete a meditation session and award points
  static async completeSession(sessionId: string, duration: number) {
    try {
      // Calculate points (1 point per minute, minimum 1 point for completing any session)
      const points = Math.max(1, Math.floor(duration / 60));

      // Update session
      const { data: session, error: sessionError } = await retryOperation(() =>
        supabase
          .from('meditation_sessions')
          .update({
            status: 'completed' as MeditationStatus,
            duration,
            points_earned: points,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select()
          .single()
      );

      if (sessionError) throw new Error(`Failed to complete meditation session: ${sessionError.message}`);

      // Get updated user points
      const { data: userPoints, error: pointsError } = await retryOperation(() =>
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', session.user_id)
          .single()
      );

      if (pointsError) throw new Error(`Failed to fetch user points: ${pointsError.message}`);

      return { session, userPoints };
    } catch (error) {
      console.error('Error completing meditation session:', error);
      throw error;
    }
  }

  // Get user's meditation history
  static async getUserHistory(userId: string) {
    try {
      const [{ data: sessions, error: sessionsError }, { data: points, error: pointsError }] = await Promise.all([
        retryOperation(() =>
          supabase
            .from('meditation_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
        ),
        retryOperation(() =>
          supabase
            .from('user_points')
            .select('*')
            .eq('user_id', userId)
            .single()
        )
      ]);

      if (sessionsError) throw new Error(`Failed to fetch meditation history: ${sessionsError.message}`);
      if (pointsError) throw new Error(`Failed to fetch user points: ${pointsError.message}`);

      return {
        sessions: sessions || [],
        points: points || { user_id: userId, total_points: 0, meditation_streak: 0 }
      };
    } catch (error) {
      console.error('Error fetching user history:', error);
      return { 
        sessions: [], 
        points: {
          user_id: userId,
          total_points: 0,
          meditation_streak: 0,
          last_meditation: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  }

  // Reset meditation streak if user hasn't meditated in 24 hours
  static async checkAndUpdateStreak(userId: string) {
    try {
      const { data: points, error } = await retryOperation(() =>
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
          .single()
      );

      if (error || !points) return;

      if (points.last_meditation_date) {
        const lastMeditation = new Date(points.last_meditation_date);
        const now = new Date();
        const hoursSinceLastMeditation = (now.getTime() - lastMeditation.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastMeditation > 24) {
          await retryOperation(() =>
            supabase
              .from('user_points')
              .update({
                meditation_streak: 0,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId)
          );
        }
      }
    } catch (error) {
      console.error('Error checking meditation streak:', error);
      throw error;
    }
  }
}
