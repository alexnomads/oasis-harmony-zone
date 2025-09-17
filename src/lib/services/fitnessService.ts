import { supabase } from '../supabase';
import { BaseService } from './baseService';
import type { FitnessSession, WorkoutType } from '../../types/database';

export interface FitnessStats {
  totalWorkouts: number;
  totalReps: number;
  fitnessPoints: number;
  weekStreak: number;
}

export class FitnessService extends BaseService {
  // Start a new fitness session
  static async startSession(
    userId: string,
    workoutType: WorkoutType,
    repsCompleted: number,
    duration: number
  ): Promise<FitnessSession> {
    try {
      console.log('Starting fitness session for user:', userId, 'type:', workoutType);
      
      // Calculate points based on the system
      const basePoints = 50;
      const repBonus = Math.floor(repsCompleted / 10) * 10; // +10 points per 10 reps
      const timeBonus = duration > 300 ? 5 : 0; // +5 points if over 5 minutes
      const totalPoints = basePoints + repBonus + timeBonus;
      
      const sessionData = {
        user_id: userId,
        workout_type: workoutType,
        reps_completed: repsCompleted,
        duration,
        points_earned: totalPoints,
        verified: false // Points pending verification
      };
      
      const result = await supabase
        .from('fitness_sessions')
        .insert([sessionData])
        .select('*')
        .single();
        
      return this.executeQuery<FitnessSession>(() => Promise.resolve(result));
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
      
      const result = await supabase
        .from('fitness_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select('*')
        .single();
      
      return this.executeQuery<FitnessSession>(() => Promise.resolve(result));
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
      const sessionsResult = await supabase
        .from('fitness_sessions')
        .select('*')
        .eq('user_id', userId);
        
      const sessions = await this.executeQuery<FitnessSession[]>(() => Promise.resolve(sessionsResult));
      
      // Calculate total workouts
      const totalWorkouts = sessions.length;
      
      // Calculate total reps
      const totalReps = sessions.reduce((sum, session) => sum + session.reps_completed, 0);
      
      // Calculate fitness points (only verified sessions count towards points)
      const fitnessPoints = sessions
        .filter(session => session.verified)
        .reduce((sum, session) => sum + session.points_earned, 0);
      
      // Calculate week streak (consecutive days with workouts in the last 7 days)
      const weekStreak = this.calculateWeekStreak(sessions);
      
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
      const result = await supabase
        .from('fitness_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      return this.executeQuery<FitnessSession[]>(() => Promise.resolve(result));
    } catch (error) {
      console.error('Error fetching user fitness sessions:', error);
      throw new Error('Could not fetch fitness sessions.');
    }
  }
}