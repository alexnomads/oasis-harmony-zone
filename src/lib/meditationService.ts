
import { SessionService } from './services/sessionService';
import { UserService } from './services/userService';
import { LeaderboardService } from './services/leaderboardService';
import type { MeditationType } from '../types/database';

export class MeditationService {
  // Session methods
  static async startSession(userId: string, type: MeditationType) {
    return SessionService.startSession(userId, type);
  }

  static async completeSession(sessionId: string, duration: number) {
    return SessionService.completeSession(sessionId, duration);
  }

  // User methods
  static async getUserHistory(userId: string) {
    return UserService.getUserHistory(userId);
  }

  static async checkAndUpdateStreak(userId: string) {
    return UserService.checkAndUpdateStreak(userId);
  }
  
  // Leaderboard methods
  static async getLeaderboard(limit = 10) {
    return LeaderboardService.getLeaderboard(limit);
  }
}
