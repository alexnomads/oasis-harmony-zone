
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { MeditationSession, MeditationType, MeditationStatus } from '../../types/database';

export class SessionService extends BaseService {
  // Start a new meditation session
  static async startSession(userId: string, type: MeditationType): Promise<MeditationSession> {
    try {
      console.log('Starting meditation session for user:', userId, 'type:', type);
      
      const result = await supabase
        .from('meditation_sessions')
        .insert([{
          user_id: userId,
          type,
          status: 'in_progress' as MeditationStatus,
          duration: 0,
          points_earned: 0,
          shared: false
        }])
        .select('*')
        .single();
        
      return this.executeQuery<MeditationSession>(() => Promise.resolve(result));
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
      const sessionResult = await supabase
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
      
      const session = await this.executeQuery<MeditationSession>(() => Promise.resolve(sessionResult));
      
      console.log('Session updated successfully:', session);

      // Get updated user points
      const userPointsResult = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', session.user_id)
        .single();
      
      const userPoints = await this.executeQuery<{ 
        user_id: string;
        total_points: number;
        meditation_streak: number;
        last_meditation_date: string | null;
      }>(() => Promise.resolve(userPointsResult));
      
      console.log('User points retrieved:', userPoints);

      return { session, userPoints };
    } catch (error) {
      console.error('Error completing meditation session:', error);
      throw error;
    }
  }

  // Award an additional point for sharing a meditation session
  static async awardSharingPoint(sessionId: string) {
    try {
      console.log('Awarding sharing point for session:', sessionId);
      
      // Get the session to check if it's valid and to get the user ID
      const sessionResult = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      const session = await this.executeQuery<MeditationSession>(() => Promise.resolve(sessionResult));
      
      if (session.status !== 'completed') {
        throw new Error('Cannot award sharing points for incomplete sessions');
      }
      
      // Update session with additional point for sharing
      const updatedSessionResult = await supabase
        .from('meditation_sessions')
        .update({
          points_earned: session.points_earned + 1,
          shared: true
        })
        .eq('id', sessionId)
        .select('*')
        .single();
      
      const updatedSession = await this.executeQuery<MeditationSession>(() => Promise.resolve(updatedSessionResult));
      console.log('Session updated with sharing point:', updatedSession);
      
      // Get updated user points
      const userPointsResult = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', session.user_id)
        .single();
      
      const userPoints = await this.executeQuery<{ 
        user_id: string;
        total_points: number;
        meditation_streak: number;
        last_meditation_date: string | null;
      }>(() => Promise.resolve(userPointsResult));
      
      console.log('User points after sharing:', userPoints);
      
      return { session: updatedSession, userPoints };
    } catch (error) {
      console.error('Error awarding sharing point:', error);
      throw error;
    }
  }
}
