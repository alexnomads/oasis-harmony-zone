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

  // Complete a meditation session and award points
  static async completeSession(sessionId: string, duration: number, distractions: { 
    mouseMovements: number,
    focusLost: number,
    windowBlurs: number
  }, sessionData?: { emoji?: string; notes?: string; notes_public?: boolean }) {
    try {
      console.log('Completing session:', sessionId, 'duration:', duration, 'distractions:', distractions);
      
      // Calculate base points based on duration
      let basePoints;
      if (duration <= 30) {
        basePoints = 1; // 30 seconds
      } else if (duration <= 60) {
        basePoints = 2; // 1 minute
      } else if (duration <= 300) {
        basePoints = 5; // 5 minutes
      } else if (duration <= 600) {
        basePoints = 15; // 10 minutes
      } else if (duration <= 900) {
        basePoints = 25; // 15 minutes
      } else {
        basePoints = 50; // 30+ minutes
      }

      // Calculate penalties
      const mousePenalty = distractions.mouseMovements * 0.15;
      const focusPenalty = distractions.focusLost * 0.5;
      const windowPenalty = distractions.windowBlurs * 0.5;
      
      // Calculate final points (minimum 0)
      const points = Math.max(0, basePoints - mousePenalty - focusPenalty - windowPenalty);
      
      console.log('Points calculated:', {
        basePoints,
        mousePenalty,
        focusPenalty,
        windowPenalty,
        finalPoints: points
      });

      const updateData = {
        status: 'completed' as MeditationStatus,
        duration,
        points_earned: Math.round(points * 10) / 10, // Round to 1 decimal place
        completed_at: new Date().toISOString(),
        ...(sessionData?.emoji && { emoji: sessionData.emoji }),
        ...(sessionData?.notes && { notes: sessionData.notes }),
        ...(sessionData?.notes_public !== undefined && { notes_public: sessionData.notes_public })
      };
      
      const sessionResult = await supabase
        .from('meditation_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select('*')
        .single();
      
      const session = await this.executeQuery<MeditationSession>(() => Promise.resolve(sessionResult));
      
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
      
      console.log('Session updated successfully:', session);
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
          points_earned: Math.round((session.points_earned + 1) * 10) / 10 // Add 1 point, round to 1 decimal
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

  // Update reflection data for an existing completed session
  static async updateSessionReflection(sessionId: string, reflectionData: { 
    emoji?: string; 
    notes?: string; 
    notes_public?: boolean 
  }) {
    try {
      console.log('Updating session reflection for:', sessionId, reflectionData);
      
      const updateData = {
        ...(reflectionData.emoji !== undefined && { emoji: reflectionData.emoji }),
        ...(reflectionData.notes !== undefined && { notes: reflectionData.notes }),
        ...(reflectionData.notes_public !== undefined && { notes_public: reflectionData.notes_public })
      };
      
      console.log('Update data being sent to database:', updateData);
      
      const sessionResult = await supabase
        .from('meditation_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select('*')
        .single();
      
      const updatedSession = await this.executeQuery<MeditationSession>(() => Promise.resolve(sessionResult));
      console.log('Session reflection updated successfully:', updatedSession);
      
      return updatedSession;
    } catch (error) {
      console.error('Error updating session reflection:', error);
      throw new Error('Could not update session reflection. Please try again.');
    }
  }
}
