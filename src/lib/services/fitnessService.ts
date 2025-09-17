import { supabase } from '@/integrations/supabase/client';
import type { FitnessSession, WorkoutType } from '../../types/database';

export interface FitnessStats {
  totalWorkouts: number;
  totalReps: number;
  fitnessPoints: number;
  weekStreak: number;
}

export class FitnessService {
  // Start a new fitness session
  static async startSession(
    userId: string,
    workoutType: WorkoutType,
    repsCompleted: number,
    duration: number
  ): Promise<FitnessSession> {
    try {
      console.log('Starting fitness session for user:', userId, 'type:', workoutType);
      
      // Calculate points based on duration (similar to meditation system)
      let basePoints;
      if (duration <= 60) {
        basePoints = 2; // 1 minute
      } else if (duration <= 120) {
        basePoints = 4; // 2 minutes
      } else if (duration <= 300) {
        basePoints = 8; // 5 minutes
      } else if (duration <= 600) {
        basePoints = 18; // 10 minutes
      } else if (duration <= 900) {
        basePoints = 28; // 15 minutes
      } else {
        basePoints = 40; // 30+ minutes
      }
      
      // Rep bonus: smaller bonus to encourage longer sessions
      const repBonus = Math.floor(repsCompleted / 20) * 2; // +2 points per 20 reps
      
      // Consistency bonus for longer sessions
      const consistencyBonus = duration >= 300 ? 2 : 0; // +2 points for 5+ minute sessions
      
      const totalPoints = basePoints + repBonus + consistencyBonus;
      
      const sessionData = {
        user_id: userId,
        workout_type: workoutType,
        reps_completed: repsCompleted,
        duration,
        points_earned: totalPoints,
        verified: true // Auto-verify sessions for immediate points and leaderboard display
      };
      
      const { data, error } = await supabase
        .from('fitness_sessions')
        .insert([sessionData])
        .select('*')
        .single();
        
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create session: ${error.message}`);
      }
      
      return data as FitnessSession;
    } catch (error) {
      console.error('Error starting fitness session:', error);
      throw new Error('Could not start fitness session. Please try again.');
    }
  }

  // Submit proof for verification
  static async submitProof(sessionId: string, proofUrl: string): Promise<FitnessSession> {
    try {
      console.log('Submitting proof for session:', sessionId);
      
      const updateData = {
        proof_url: proofUrl,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('fitness_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to submit proof: ${error.message}`);
      }
      
      return data as FitnessSession;
    } catch (error) {
      console.error('Error submitting proof:', error);
      throw new Error('Could not submit proof. Please try again.');
    }
  }

  // Get user fitness statistics
  static async getUserStats(userId: string): Promise<FitnessStats> {
    try {
      console.log('Fetching fitness stats for user:', userId);
      
      // Get all fitness sessions for the user
      const { data: sessions, error } = await supabase
        .from('fitness_sessions')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch sessions: ${error.message}`);
      }
      
      const fitnessData = sessions as FitnessSession[];
      
      // Calculate total workouts
      const totalWorkouts = fitnessData.length;
      
      // Calculate total reps
      const totalReps = fitnessData.reduce((sum, session) => sum + session.reps_completed, 0);
      
      // Calculate fitness points (only verified sessions count towards points)
      const fitnessPoints = fitnessData
        .filter(session => session.verified)
        .reduce((sum, session) => sum + session.points_earned, 0);
      
      // Calculate week streak (consecutive days with workouts in the last 7 days)
      const weekStreak = this.calculateWeekStreak(fitnessData);
      
      return {
        totalWorkouts,
        totalReps,
        fitnessPoints,
        weekStreak
      };
    } catch (error) {
      console.error('Error fetching fitness stats:', error);
      throw new Error('Could not fetch fitness statistics.');
    }
  }

  // Calculate consecutive workout days in the last week
  private static calculateWeekStreak(sessions: FitnessSession[]): number {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get unique workout dates in the last 7 days
    const workoutDates = sessions
      .filter(session => new Date(session.created_at) >= sevenDaysAgo)
      .map(session => new Date(session.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Most recent first
    
    // Count consecutive days from today
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toDateString();
      if (workoutDates.includes(dateStr)) {
        streak++;
      } else if (streak > 0) {
        // Break streak if we find a day without workout after starting the count
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  }

  // Get all fitness sessions for a user (for detailed view)
  static async getUserSessions(userId: string): Promise<FitnessSession[]> {
    try {
      const { data, error } = await supabase
        .from('fitness_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch sessions: ${error.message}`);
      }
      
      return data as FitnessSession[];
    } catch (error) {
      console.error('Error fetching user fitness sessions:', error);
      throw new Error('Could not fetch fitness sessions.');
    }
  }
}