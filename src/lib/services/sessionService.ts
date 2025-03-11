
import { supabase } from '../supabase';
import { retryOperation } from '../utils/apiUtils';
import { BaseService } from './baseService';
import type { MeditationSession, MeditationType, MeditationStatus } from '../../types/database';

export class SessionService extends BaseService {
  // Start a new meditation session
  static async startSession(userId: string, type: MeditationType) {
    try {
      console.log('Starting meditation session for user:', userId, 'type:', type);
      
      const data = await this.executeQuery<MeditationSession[]>(() =>
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
      
      if (data.length === 0) {
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
      const session = await this.executeQuery<MeditationSession[]>(() =>
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
      
      if (session.length === 0) {
        console.error('No session data returned after update');
        throw new Error('No session data returned after update');
      }
      
      console.log('Session updated successfully:', session[0]);

      // Get updated user points
      const userPoints = await this.executeQuery<any[]>(() =>
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', session[0].user_id)
      );

      if (userPoints.length === 0) {
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
}
