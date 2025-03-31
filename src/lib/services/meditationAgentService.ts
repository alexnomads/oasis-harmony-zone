
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
  // Enhanced NLP to analyze user input and extract sentiment
  static analyzeSentiment(userInput: string): UserSentiment {
    const input = userInput.toLowerCase();
    
    // Default sentiment
    const sentiment: UserSentiment = {
      mainEmotion: 'neutral',
      intensity: 5,
      cryptoRelated: false
    };
    
    // Check for emotions in input with expanded crypto vocabulary
    if (input.match(/stress(ed|ful)?|anxious|anxiet|nervous|worried|overwhelm|panic|fear/)) {
      sentiment.mainEmotion = 'stressed';
      sentiment.intensity = 7;
    } else if (input.match(/tired|exhaust|fatigue|sleep|insomnia|burnout|drain/)) {
      sentiment.mainEmotion = 'tired';
      sentiment.intensity = 6;
    } else if (input.match(/sad|depress|down|unhapp|blue|disappoint|lose|lost|losing/)) {
      sentiment.mainEmotion = 'sad';
      sentiment.intensity = 7;
    } else if (input.match(/anger|angry|frustrat|mad|annoy|irritat|rage|upset/)) {
      sentiment.mainEmotion = 'angry';
      sentiment.intensity = 8;
    } else if (input.match(/happy|joy|excit|great|good|profit|win|gain|pump|moon|success/)) {
      sentiment.mainEmotion = 'happy';
      sentiment.intensity = 4;
    } else if (input.match(/focus|concentrat|distract|attention|clarity|confuse|uncertain|doubt/)) {
      sentiment.mainEmotion = 'unfocused';
      sentiment.intensity = 6;
    }
    
    // Check intensity modifiers
    if (input.match(/very|extremely|incredibly|so|really|all time|ath|worst|best|ever/)) {
      sentiment.intensity = Math.min(10, sentiment.intensity + 2);
    } else if (input.match(/somewhat|kind of|a bit|little|slight/)) {
      sentiment.intensity = Math.max(1, sentiment.intensity - 2);
    }
    
    // Expanded check for crypto-related terms
    if (input.match(/crypto|bitcoin|btc|eth|market|trading|volatil|token|blockchain|nft|defi|web3|transaction|gas|wallet|exchange|trade|alt|coin|invest|chart|candle|support|resistance|bear|bull|dip|pump|dump|hodl|buy|sell|leverage|long|short|position|liquidat|margin|yield|stake|farm|apy|apr|dao|fork|halving|mining|node/)) {
      sentiment.cryptoRelated = true;
    }
    
    return sentiment;
  }
  
  // Enhanced recommendation system based on user sentiment
  static getRecommendation(sentiment: UserSentiment): MeditationRecommendation {
    // Default recommendation
    const recommendation: MeditationRecommendation = {
      type: 'mindfulness',
      duration: 300, // 5 minutes in seconds
      title: 'Quick Mindfulness Meditation',
      description: 'A short meditation to bring awareness to the present moment.'
    };
    
    // Adjust recommendation based on emotion with crypto-specific content
    switch (sentiment.mainEmotion) {
      case 'stressed':
        recommendation.type = 'breathing';
        recommendation.title = 'Market Volatility Breathing';
        recommendation.description = sentiment.cryptoRelated 
          ? 'Calm your mind amidst market fluctuations with these deep breathing techniques specifically designed for traders.'
          : 'Release tension and find calm with deep breathing techniques for general stress relief.';
        break;
      case 'tired':
        recommendation.type = 'body_scan';
        recommendation.title = 'Trader Energy Renewal';
        recommendation.description = sentiment.cryptoRelated
          ? 'Recharge after long chart sessions and recover from screen fatigue with this revitalizing practice.'
          : 'Reconnect with your body and find renewed energy through guided awareness.';
        break;
      case 'sad':
        recommendation.type = 'loving_kindness';
        recommendation.title = 'Market Loss Resilience';
        recommendation.description = sentiment.cryptoRelated
          ? 'Navigate market downturns with self-compassion and maintain perspective through challenging price action.'
          : 'Generate feelings of warmth and kindness toward yourself during difficult times.';
        break;
      case 'angry':
        recommendation.type = 'breathing';
        recommendation.title = 'Trade Tranquility';
        recommendation.description = sentiment.cryptoRelated
          ? 'Transform frustration from trading setbacks or market manipulation into focused decision-making energy.'
          : 'Cool your anger and find your center through mindful breathing techniques.';
        break;
      case 'happy':
        recommendation.type = 'mindfulness';
        recommendation.title = 'Profit Perspective Practice';
        recommendation.description = sentiment.cryptoRelated
          ? 'Maintain emotional balance during market highs and develop gratitude for successful trades without attachment.'
          : 'Enhance your positive state by focusing on gratitude and present-moment awareness.';
        break;
      case 'unfocused':
        recommendation.type = 'mindfulness';
        recommendation.title = 'Chart Pattern Clarity';
        recommendation.description = sentiment.cryptoRelated
          ? 'Sharpen your focus for better technical analysis and overcome information overload in the crypto markets.'
          : 'Develop laser-like focus and mental clarity for any challenging task ahead.';
        break;
    }
    
    // Adjust duration based on intensity and emotion type
    if (sentiment.intensity >= 8) {
      // For high intensity emotions, recommend longer sessions
      recommendation.duration = 600; // 10 minutes
    } else if (sentiment.intensity <= 3) {
      // For low intensity emotions, recommend shorter sessions
      recommendation.duration = 180; // 3 minutes
    }
    
    return recommendation;
  }
  
  // Enhanced follow-up message based on user streak and session completion
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
      
      // Generate more personalized follow-up message
      if (userPoints.meditation_streak === 0) {
        return "Great start! Your first session is complete. Come back tomorrow to begin building your meditation streak and earn $ROJ tokens.";
      } else if (userPoints.meditation_streak === 1) {
        return "Excellent work! You've completed your first day. Return tomorrow to continue your streak and strengthen your practice.";
      } else if (userPoints.meditation_streak === 4) {
        return "Amazing! You're on a 4-day streak. Complete tomorrow's session to earn bonus $ROJ tokens and unlock the 5-day achievement!";
      } else if (userPoints.meditation_streak % 5 === 0) {
        return `Congratulations on your ${userPoints.meditation_streak}-day streak! You've earned bonus $ROJ tokens for your consistency. This kind of discipline translates to better trading decisions.`;
      } else if (userPoints.meditation_streak % 10 === 0) {
        return `Outstanding achievement! ${userPoints.meditation_streak} consecutive days of practice shows remarkable commitment. Your bonus $ROJ tokens have been awarded, and your mental clarity is undoubtedly improving.`;
      } else if (userPoints.meditation_streak >= 30) {
        return `Extraordinary dedication! Your ${userPoints.meditation_streak}-day streak puts you among our elite meditators. Your crypto journey is being transformed by this practice. Bonus $ROJ tokens added to your balance!`;
      } else {
        return `Well done! You're on a ${userPoints.meditation_streak}-day streak. Keep this momentum going for greater rewards and mental clarity!`;
      }
    } catch (error) {
      console.error("Error getting follow-up message:", error);
      return "Well done on completing your meditation. Come back soon for another session to continue building your practice!";
    }
  }
}
