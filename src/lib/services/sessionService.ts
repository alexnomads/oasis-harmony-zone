
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { MeditationSession, MeditationType, MeditationStatus } from '../../types/database';

export class SessionService extends BaseService {
  // Ensure schema is up to date before any operation
  private static async ensureSchema() {
    try {
      // First check if the shared column exists
      const { data: columns } = await supabase
        .from('meditation_sessions')
        .select('shared')
        .limit(1);
      
      // If we got here without error, column exists
      console.log('Shared column exists:', columns);
      
      // Reload types to refresh schema cache
      await supabase.rpc('reload_types');
      console.log('Schema cache refreshed');
    } catch (error) {
      console.error('Error checking schema, attempting to fix:', error);
      
      // Try to alter the table to add the shared column if it doesn't exist
      try {
        // This is done via RPC because direct SQL is restricted in JS clients
        await supabase.rpc('add_shared_column_if_not_exists');
        console.log('Added shared column if needed');
        
        // Reload types again
        await supabase.rpc('reload_types');
        console.log('Schema cache refreshed after fix');
      } catch (fixError) {
        console.error('Failed to fix schema:', fixError);
        throw new Error('Failed to ensure schema consistency. Please contact support.');
      }
    }
  }

  // Start a new meditation session
  static async startSession(userId: string, type: MeditationType): Promise<MeditationSession> {
    try {
      console.log('Starting meditation session for user:', userId, 'type:', type);
      
      // Ensure schema is up to date before operations
      await this.ensureSchema();
      
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
      
      // Ensure schema is up to date
      await this.ensureSchema();
      
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
      
      // Ensure schema is up to date
      await this.ensureSchema();
      
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
      throw error;
    }
  }
}
