
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { MeditationSession, MeditationType, MeditationStatus } from '../../types/database';

export class SessionService extends BaseService {
  // Start a new meditation session without schema checks
  static async startSession(userId: string, type: MeditationType): Promise<MeditationSession> {
    try {
      console.log('Starting meditation session for user:', userId, 'type:', type);
      
      // Basic session data without shared field to avoid schema issues
      const sessionData = {
        user_id: userId,
        type,
        status: 'in_progress' as MeditationStatus,
        duration: 0,
        points_earned: 0
      };
      
      // Insert session with minimal required fields
      const result = await supabase
        .from('meditation_sessions')
        .insert([sessionData])
        .select('*')
        .single();
        
      return this.executeQuery<MeditationSession>(() => Promise.resolve(result));
    } catch (error) {
      console.error('Error starting meditation session:', error);
      throw new Error('Could not start meditation session. Please try again.');
    }
  }

  // Complete a meditation session and award points based on duration
  static async completeSession(sessionId: string, duration: number) {
    try {
      console.log('Completing session:', sessionId, 'duration:', duration);
      
      // Calculate points based on duration tiers
      // 30 sec = 1 point
      // 1-5 min = 5 points
      // 5-10 min = 10 points
      // 10-15 min = 15 points
      // 15+ min = 20 points
      let points = 1; // Minimum 1 point
      
      if (duration >= 900) { // 15 minutes or more
        points = 20;
      } else if (duration >= 600) { // 10 minutes or more
        points = 15;
      } else if (duration >= 300) { // 5 minutes or more
        points = 10;
      } else if (duration >= 60) { // 1 minute or more
        points = 5;
      }
      
      console.log('Points calculated:', points);

      // Update session with minimal fields to avoid schema issues
      const updateData = {
        status: 'completed' as MeditationStatus,
        duration,
        points_earned: points,
        completed_at: new Date().toISOString()
      };
      
      const sessionResult = await supabase
        .from('meditation_sessions')
        .update(updateData)
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
      throw new Error('Could not complete the meditation session. Points may not have been awarded.');
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
      
      // Just update the points, don't try to update shared field
      const updatedSessionResult = await supabase
        .from('meditation_sessions')
        .update({
          points_earned: session.points_earned + 1
        })
        .eq('id', sessionId)
        .select('*')
        .single();
      
      const updatedSession = await this.executeQuery<MeditationSession>(() => Promise.resolve(updatedSessionResult));
      console.log('Session updated with sharing point:', updatedSession);
      
      // Update user points directly
      // First get current points
      const currentPointsResult = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', session.user_id)
        .single();
      
      const currentPoints = await this.executeQuery<{ total_points: number }>(() => Promise.resolve(currentPointsResult));
      
      // Then update with new value
      const updatePointsResult = await supabase
        .from('user_points')
        .update({
          total_points: currentPoints.total_points + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user_id)
        .select('*')
        .single();
      
      const userPoints = await this.executeQuery<{ 
        user_id: string;
        total_points: number;
        meditation_streak: number;
        last_meditation_date: string | null;
      }>(() => Promise.resolve(updatePointsResult));
      
      console.log('User points after sharing:', userPoints);
      
      return { session: updatedSession, userPoints };
    } catch (error) {
      console.error('Error awarding sharing point:', error);
      throw new Error('Could not award sharing point. Please try again later.');
    }
  }
}
