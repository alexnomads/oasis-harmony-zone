
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { MeditationSession, MeditationType, MeditationStatus } from '../../types/database';

export class SessionService extends BaseService {
  // Ensure schema is up to date before any operation
  private static async ensureSchema() {
    try {
      console.log('Ensuring schema is up to date...');
      
      // Check if the shared column exists by directly querying the database schema
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'meditation_sessions')
        .eq('column_name', 'shared')
        .maybeSingle();
      
      console.log('Column check result:', columnExists, columnCheckError);
      
      // If column doesn't exist, attempt to add it
      if (!columnExists && !columnCheckError) {
        console.log('Shared column not found, adding it...');
        const { error: alterError } = await supabase.rpc('add_shared_column_if_not_exists');
        
        if (alterError) {
          console.error('Error adding shared column:', alterError);
          // Continue anyway as the column might have been added by another concurrent request
        } else {
          console.log('Added shared column successfully');
        }
      }
      
      // Skip refresh types - it can sometimes cause issues
      console.log('Schema verification complete');
      
      return true;
    } catch (error) {
      console.error('Schema verification error:', error);
      // Continue anyway - don't block the user experience for schema issues
      return true;
    }
  }

  // Start a new meditation session
  static async startSession(userId: string, type: MeditationType): Promise<MeditationSession> {
    try {
      console.log('Starting meditation session for user:', userId, 'type:', type);
      
      // Ensure schema is up to date before operations, but don't fail if it doesn't work
      await this.ensureSchema().catch(err => {
        console.warn('Schema check failed but continuing anyway:', err);
      });
      
      // Create the session with explicit fields, avoiding the shared column if there's an issue
      const sessionData = {
        user_id: userId,
        type,
        status: 'in_progress' as MeditationStatus,
        duration: 0,
        points_earned: 0
      };
      
      // First try with shared column
      try {
        const result = await supabase
          .from('meditation_sessions')
          .insert([{
            ...sessionData,
            shared: false
          }])
          .select('*')
          .single();
          
        return this.executeQuery<MeditationSession>(() => Promise.resolve(result));
      } catch (error) {
        console.warn('Insert with shared column failed, trying without:', error);
        
        // If that fails, try without the shared column
        const fallbackResult = await supabase
          .from('meditation_sessions')
          .insert([sessionData])
          .select('*')
          .single();
          
        return this.executeQuery<MeditationSession>(() => Promise.resolve(fallbackResult));
      }
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
      const updateData = {
        status: 'completed' as MeditationStatus,
        duration,
        points_earned: points,
        completed_at: new Date().toISOString()
      };
      
      // First try with shared column
      let sessionResult;
      try {
        sessionResult = await supabase
          .from('meditation_sessions')
          .update({
            ...updateData,
            shared: false // Explicitly set shared status
          })
          .eq('id', sessionId)
          .select('*')
          .single();
      } catch (error) {
        console.warn('Update with shared column failed, trying without:', error);
        
        // If that fails, try without the shared column
        sessionResult = await supabase
          .from('meditation_sessions')
          .update(updateData)
          .eq('id', sessionId)
          .select('*')
          .single();
      }
      
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
      
      // Try to update with shared field first
      let updatedSessionResult;
      try {
        updatedSessionResult = await supabase
          .from('meditation_sessions')
          .update({
            points_earned: session.points_earned + 1,
            shared: true
          })
          .eq('id', sessionId)
          .select('*')
          .single();
      } catch (error) {
        console.warn('Update with shared field failed, trying points only:', error);
        
        // If that fails, just update the points
        updatedSessionResult = await supabase
          .from('meditation_sessions')
          .update({
            points_earned: session.points_earned + 1
          })
          .eq('id', sessionId)
          .select('*')
          .single();
      }
      
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
