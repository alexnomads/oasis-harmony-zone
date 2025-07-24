
import { SessionService } from './services/sessionService';
import { UserService } from './services/userService';
import type { MeditationType } from '../types/database';

export class MeditationService {
  static async startSession(userId: string, type: MeditationType) {
    return SessionService.startSession(userId, type);
  }

  static async completeSession(sessionId: string, duration: number, distractions: {
    mouseMovements: number,
    focusLost: number,
    windowBlurs: number
  }, sessionData?: { emoji?: string; notes?: string; notes_public?: boolean }) {
    return SessionService.completeSession(sessionId, duration, distractions, sessionData);
  }
  
  static async getUserHistory(userId: string) {
    return UserService.getUserHistory(userId);
  }
}
