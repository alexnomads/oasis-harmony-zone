
import { supabase } from '../supabase';
import { BaseService } from './baseService';
import { UserPoints, MeditationType } from '../../types/database';

// Types for the meditation agent
export interface UserSentiment {
  mainEmotion: string; // e.g., 'stressed', 'anxious', 'tired', 'focused'
  intensity: number; // 1-10 scale
  cryptoRelated: boolean; // Is the stress related to crypto/markets?
}

export interface MeditationRecommendation {
  type: MeditationType;
  duration: number; // in seconds
  title: string;
  description: string;
}

export class MeditationAgentService extends BaseService {
  // Simple NLP to analyze user input and extract sentiment
  static analyzeSentiment(userInput: string): UserSentiment {
    const input = userInput.toLowerCase();
    
    // Default sentiment
    const sentiment: UserSentiment = {
      mainEmotion: 'neutral',
      intensity: 5,
      cryptoRelated: false
    };
    
    // Check for emotions in input
    if (input.match(/stress(ed|ful)?|anxious|anxiet|nervous|worried|overwhelm/)) {
      sentiment.mainEmotion = 'stressed';
      sentiment.intensity = 7;
    } else if (input.match(/tired|exhaust|fatigue|sleep|insomnia/)) {
      sentiment.mainEmotion = 'tired';
      sentiment.intensity = 6;
    } else if (input.match(/sad|depress|down|unhapp|blue/)) {
      sentiment.mainEmotion = 'sad';
      sentiment.intensity = 7;
    } else if (input.match(/anger|angry|frustrat|mad|annoy/)) {
      sentiment.mainEmotion = 'angry';
      sentiment.intensity = 8;
    } else if (input.match(/happy|joy|excit|great|good/)) {
      sentiment.mainEmotion = 'happy';
      sentiment.intensity = 4;
    } else if (input.match(/focus|concentrat|distract|attention/)) {
      sentiment.mainEmotion = 'unfocused';
      sentiment.intensity = 6;
    }
    
    // Check intensity modifiers
    if (input.match(/very|extremely|incredibly|so|really/)) {
      sentiment.intensity = Math.min(10, sentiment.intensity + 2);
    } else if (input.match(/somewhat|kind of|a bit|little/)) {
      sentiment.intensity = Math.max(1, sentiment.intensity - 2);
    }
    
    // Check for crypto-related terms
    if (input.match(/crypto|bitcoin|market|trading|volatility|token|blockchain|nft|defi|web3|transaction|gas fee|wallet/)) {
      sentiment.cryptoRelated = true;
    }
    
    return sentiment;
  }
  
  // Get meditation recommendation based on user sentiment
  static getRecommendation(sentiment: UserSentiment): MeditationRecommendation {
    // Default recommendation
    const recommendation: MeditationRecommendation = {
      type: 'mindfulness',
      duration: 300, // 5 minutes in seconds
      title: 'Quick Mindfulness Meditation',
      description: 'A short meditation to bring awareness to the present moment.'
    };
    
    // Adjust recommendation based on emotion
    switch (sentiment.mainEmotion) {
      case 'stressed':
        recommendation.type = 'breathing';
        recommendation.title = 'Stress Relief Breathing';
        recommendation.description = sentiment.cryptoRelated 
          ? 'Calm your mind amidst market fluctuations with deep breathing techniques.'
          : 'Release tension and find calm with deep breathing techniques.';
        break;
      case 'tired':
        recommendation.type = 'body_scan';
        recommendation.title = 'Energizing Body Scan';
        recommendation.description = sentiment.cryptoRelated
          ? 'Recharge after long trading sessions with this revitalizing meditation.'
          : 'Reconnect with your body and find renewed energy.';
        break;
      case 'sad':
        recommendation.type = 'loving_kindness';
        recommendation.title = 'Self-Compassion Practice';
        recommendation.description = sentiment.cryptoRelated
          ? 'Navigate market downturns with self-kindness and perspective.'
          : 'Generate feelings of warmth and kindness toward yourself.';
        break;
      case 'angry':
        recommendation.type = 'breathing';
        recommendation.title = 'Cooling Breath Meditation';
        recommendation.description = sentiment.cryptoRelated
          ? 'Transform frustration from market volatility into focused energy.'
          : 'Cool your anger and find your center through mindful breathing.';
        break;
      case 'happy':
        recommendation.type = 'mindfulness';
        recommendation.title = 'Gratitude Meditation';
        recommendation.description = sentiment.cryptoRelated
          ? 'Cultivate appreciation for your crypto journey and achievements.'
          : 'Enhance your positive state by focusing on gratitude.';
        break;
      case 'unfocused':
        recommendation.type = 'mindfulness';
        recommendation.title = 'Concentration Meditation';
        recommendation.description = sentiment.cryptoRelated
          ? 'Sharpen your focus for better trading decisions and analysis.'
          : 'Develop laser-like focus and mental clarity.';
        break;
    }
    
    // Adjust duration based on intensity
    if (sentiment.intensity >= 8) {
      // For high intensity emotions, recommend longer sessions
      recommendation.duration = 600; // 10 minutes
    } else if (sentiment.intensity <= 3) {
      // For low intensity emotions, recommend shorter sessions
      recommendation.duration = 180; // 3 minutes
    }
    
    return recommendation;
  }
  
  // Get follow-up message based on user streak and session completion
  static async getFollowUpMessage(userId: string): Promise<string> {
    try {
      // Get user points to check streak
      const { data, error } = await supabase
        .from('user_points')
        .select('meditation_streak, total_points')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      const userPoints = data as UserPoints;
      
      // Generate appropriate follow-up message
      if (userPoints.meditation_streak === 0) {
        return "Great start! Come back tomorrow to begin building your meditation streak.";
      } else if (userPoints.meditation_streak === 4) {
        return "Amazing! You're on a 4-day streak. Complete tomorrow's session to earn bonus $ROJ tokens!";
      } else if (userPoints.meditation_streak % 5 === 0) {
        return `Congratulations on your ${userPoints.meditation_streak}-day streak! You've earned bonus $ROJ tokens for your consistency.`;
      } else {
        return `Well done! You're on a ${userPoints.meditation_streak}-day streak. Keep going!`;
      }
    } catch (error) {
      console.error("Error getting follow-up message:", error);
      return "Well done on completing your meditation. Come back soon for another session!";
    }
  }
}
