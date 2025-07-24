import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { SessionReflection } from '../../types/reflection';

export class ReflectionService extends BaseService {
  // Create or update a reflection for a session (UPSERT)
  static async createOrUpdateReflection(
    sessionId: string, 
    userId: string, 
    reflectionData: { emoji?: string; notes?: string; notes_public?: boolean }
  ): Promise<SessionReflection> {
    try {
      // Validate required fields
      if (!sessionId || !userId) {
        throw new Error('Session ID and User ID are required');
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(sessionId) || !uuidRegex.test(userId)) {
        throw new Error('Invalid session ID or user ID format');
      }

      console.log('Creating/updating reflection for session:', sessionId, 'user:', userId, 'data:', reflectionData);
      
      const upsertData = {
        session_id: sessionId,
        user_id: userId,
        emoji: reflectionData.emoji || null,
        notes: reflectionData.notes || null,
        notes_public: reflectionData.notes_public || false,
        updated_at: new Date().toISOString()
      };
      
      console.log('UPSERT data being sent to Supabase:', upsertData);
      
      const { data, error } = await supabase
        .from('session_reflections')
        .upsert(upsertData, { 
          onConflict: 'session_id,user_id',
          ignoreDuplicates: false 
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Supabase error creating/updating reflection:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        const errorMessage = error.message || 'Unknown database error occurred';
        if (error.code === '23505') {
          throw new Error('A reflection for this session already exists');
        } else if (error.code === '23503') {
          throw new Error('Session or user not found');
        } else {
          throw new Error(`Could not save reflection: ${errorMessage}`);
        }
      }
      
      if (!data) {
        throw new Error('No data returned after saving reflection');
      }
      
      console.log('Successfully created/updated reflection:', data);
      return data;
    } catch (error) {
      console.error('Error creating/updating reflection:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Could not save reflection. Please try again.');
      }
    }
  }

  // Get reflection for a specific session
  static async getReflection(sessionId: string, userId: string): Promise<SessionReflection | null> {
    try {
      const result = await supabase
        .from('session_reflections')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (result.error) {
        console.error('Error fetching reflection:', result.error);
        return null;
      }
      
      return result.data;
    } catch (error) {
      console.error('Error getting reflection:', error);
      return null;
    }
  }

  // Delete a reflection
  static async deleteReflection(sessionId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('session_reflections')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Supabase error deleting reflection:', error);
        throw new Error(`Could not delete reflection: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting reflection:', error);
      throw error instanceof Error ? error : new Error('Could not delete reflection. Please try again.');
    }
  }
}