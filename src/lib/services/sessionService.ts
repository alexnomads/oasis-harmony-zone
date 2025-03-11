
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { MeditationSession, MeditationType, MeditationStatus } from '../../types/database';

export class SessionService extends BaseService {
  // Start a new meditation session
  static async startSession(userId: string, type: MeditationType): Promise<MeditationSession> {
    try {
      console.log('Starting meditation session for user:', userId, 'type:', type);
      
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert([{
          user_id: userId,
          type,
          status: 'in_progress' as MeditationStatus,
          duration: 0,
          points_earned: 0
        }])
        .select('*')
        .single();
        
      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Query failed: ${error.message}`);
      }
      
      if (!data) {
        console.error('No data returned from session creation');
        throw new Error('No data returned from session creation');
      }
      
      console.log('Session created successfully:', data);
      return data as MeditationSession;
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
      const { data: session, error: sessionError } = await supabase
        .from('meditation_sessions')
        .update({
          status: 'completed' as MeditationStatus,
          duration,
          points_earned: points,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select('*')
        .single();
      
      if (sessionError) {
        console.error('Error updating session:', sessionError);
        throw new Error(`Query failed: ${sessionError.message}`);
      }

      if (!session) {
        console.error('No session data returned after update');
        throw new Error('No session data returned after update');
      }
      
      console.log('Session updated successfully:', session);

      // Get updated user points
      const { data: userPoints, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', session.user_id)
        .single();

      if (pointsError) {
        console.error('Error fetching user points:', pointsError);
        throw new Error(`Query failed: ${pointsError.message}`);
      }

      if (!userPoints) {
        console.error('No user points returned');
        throw new Error('No user points returned');
      }
      
      console.log('User points retrieved:', userPoints);

      return { session, userPoints };
    } catch (error) {
      console.error('Error completing meditation session:', error);
      throw error;
    }
  }
}
