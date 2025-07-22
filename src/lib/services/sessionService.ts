import { supabase } from '../supabase';
import { BaseService } from './baseService';
import { PetService } from './petService';
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

  // Complete a meditation session and award points to synced system
  static async completeSession(sessionId: string, duration: number, distractions: { 
    mouseMovements: number,
    focusLost: number,
    windowBlurs: number
  }) {
    try {
      console.log('Completing session:', sessionId, 'duration:', duration, 'distractions:', distractions);
      
      // Calculate base points based on duration
      let basePoints;
      if (duration <= 30) {
        basePoints = 1; // 30 seconds
      } else if (duration <= 300) {
        basePoints = 5; // 5 minutes
      } else if (duration <= 600) {
        basePoints = 15; // 10 minutes
      } else {
        basePoints = 25; // 15+ minutes
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
        completed_at: new Date().toISOString()
      };
      
      const sessionResult = await supabase
        .from('meditation_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select('*')
        .single();
      
      const session = await this.executeQuery<MeditationSession>(() => Promise.resolve(sessionResult));
      
      // Award points using synced system - add flat 10 ROJ points for completion
      try {
        await PetService.addSyncedCurrency(session.user_id, 10, 0);
        console.log('ROJ points awarded via synced system');
      } catch (rojError) {
        console.error('Failed to award ROJ points:', rojError);
      }
      
      // Get updated user points (now synced)
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
      console.log('User points retrieved (synced):', userPoints);

      return { session, userPoints };
    } catch (error) {
      console.error('Error completing meditation session:', error);
      throw new Error('Could not complete the meditation session. Points may not have been awarded.');
    }
  }

  // Award an additional point for sharing using synced system
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
      
      // Update session points
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
      
      // Award sharing point using synced system
      await PetService.addSyncedCurrency(session.user_id, 1, 0);
      
      // Get updated synced points
      const updatePointsResult = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', session.user_id)
        .single();
      
      const userPoints = await this.executeQuery<{ 
        user_id: string;
        total_points: number;
        meditation_streak: number;
        last_meditation_date: string | null;
      }>(() => Promise.resolve(updatePointsResult));
      
      console.log('User points after sharing (synced):', userPoints);
      
      return { session: updatedSession, userPoints };
    } catch (error) {
      console.error('Error awarding sharing point:', error);
      throw new Error('Could not award sharing point. Please try again later.');
    }
  }
}
