
import { SessionService } from './services/sessionService';
import { UserService } from './services/userService';
import type { MeditationType } from '../types/database';

export class MeditationService {
  static async startSession(userId: string, type: MeditationType) {
    return SessionService.startSession(userId, type);
  }

  static async completeSession(sessionId: string, duration: number) {
    return SessionService.completeSession(sessionId, duration);
  }
  
  static async getUserHistory(userId: string) {
    return UserService.getUserHistory(userId);
  }
}
