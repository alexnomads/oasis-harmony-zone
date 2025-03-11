
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { MeditationSession, MeditationType, MeditationStatus } from '../../types/database';

export class SessionService extends BaseService {
  // Start a new meditation session
  static async startSession(userId: string, type: MeditationType): Promise<MeditationSession> {
    try {
      console.log('Starting meditation session for user:', userId, 'type:', type);
      
      return await this.executeQuery<MeditationSession>(() => 
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
          .single()
      );
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
      const session = await this.executeQuery<MeditationSession>(() => 
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
          .single()
      );
      
      console.log('Session updated successfully:', session);

      // Get updated user points
      const userPoints = await this.executeQuery(() => 
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', session.user_id)
          .single()
      );
      
      console.log('User points retrieved:', userPoints);

      return { session, userPoints };
    } catch (error) {
      console.error('Error completing meditation session:', error);
      throw error;
    }
  }
}
