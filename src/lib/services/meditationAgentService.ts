import { supabase } from '../supabase';
import { BaseService } from './baseService';
import { UserPoints, MeditationType } from '../../types/database';
import { MessageType } from '@/components/meditation/ChatMessage';

// Types for the meditation agent
export interface UserSentiment {
  mainEmotion: string;
  intensity: number;
  cryptoRelated: boolean;
}

export interface MeditationRecommendation {
  type: MeditationType;
  duration: number;
  title: string;
  description: string;
}

interface AIResponse {
  message: string;
  showMeditationOption: boolean;
  recommendation?: MeditationRecommendation;
  needsApiKey?: boolean;
  moodAnalysis?: {
    emotion: string;
    intensity: number;
    insights: string;
  };
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class MeditationAgentService extends BaseService {
  // Enhanced main method with mood analysis integration
  static async getResponse(userMessage: string, previousMessages: MessageType[]): Promise<AIResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user context
      const userContext = await this.getUserContext();
      
      // Analyze mood using new Edge Function
      let moodAnalysis = null;
      if (user) {
        try {
          const { data: moodData } = await supabase.functions.invoke('analyze-mood', {
            body: {
              message: userMessage,
              userId: user.id,
              previousMoods: await this.getRecentMoods(user.id)
            }
          });
          
          if (moodData && !moodData.error) {
            moodAnalysis = moodData;
            console.log('Mood analysis successful:', moodAnalysis);
          }
        } catch (error) {
          console.log('Mood analysis unavailable, continuing with basic analysis');
        }
      }
      
      // Prepare conversation history
      const conversationHistory: ConversationMessage[] = previousMessages
        .slice(-6)
        .map(msg => ({
          role: msg.role === 'agent' ? 'assistant' : 'user',
          content: msg.content
        }));

      // Get AI response with enhanced context
      const aiResponse = await this.getAIResponse(userMessage, conversationHistory, {
        ...userContext,
        moodAnalysis
      });

      // Use mood-based recommendation if available, otherwise fallback to basic analysis
      const recommendation = moodAnalysis?.recommendation || 
        this.getRecommendation(this.analyzeSentiment(userMessage));
      
      // Determine if meditation should be offered
      const shouldShowMeditation = this.shouldShowMeditationOption(aiResponse, moodAnalysis || this.analyzeSentiment(userMessage));

      // Log interaction for quality monitoring
      if (user) {
        this.logInteraction(user.id, userMessage, aiResponse, moodAnalysis);
      }

      return {
        message: aiResponse,
        showMeditationOption: shouldShowMeditation,
        recommendation: shouldShowMeditation ? recommendation : undefined,
        moodAnalysis: moodAnalysis ? {
          emotion: moodAnalysis.emotion,
          intensity: moodAnalysis.intensity,
          insights: moodAnalysis.insights
        } : undefined
      };
      
    } catch (error) {
      console.error('Error in AI meditation chat:', error);
      return this.getContextualResponse(userMessage);
    }
  }

  // Enhanced AI response with retry logic and mood context
  private static async getAIResponse(
    userMessage: string, 
    conversationHistory: ConversationMessage[], 
    userContext: any
  ): Promise<string> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const { data, error } = await supabase.functions.invoke('ai-meditation-chat', {
          body: {
            message: userMessage,
            conversationHistory,
            userContext
          }
        });

        clearTimeout(timeoutId);

        if (error) {
          lastError = error;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw error;
        }

        if (!data?.response) {
          throw new Error('No response from AI service');
        }

        return data.response;
      } catch (error) {
        console.error(`AI service attempt ${attempt} failed:`, error);
        lastError = error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
    }

    // All attempts failed, return intelligent contextual response
    return this.getIntelligentContextualResponse(userMessage, userContext);
  }

  // Get recent moods for context
  private static async getRecentMoods(userId: string) {
    try {
      const { data } = await supabase
        .from('user_moods')
        .select('emotion, intensity, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching recent moods:', error);
      return [];
    }
  }

  // Enhanced user context with mood history
  private static async getUserContext() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userPoints } = await supabase
        .from('user_points')
        .select('meditation_streak, total_points')
        .eq('user_id', user.id)
        .single();

      const recentMoods = await this.getRecentMoods(user.id);
      const dominantMood = recentMoods.length > 0 ? recentMoods[0].emotion : 'neutral';

      return {
        meditationStreak: userPoints?.meditation_streak || 0,
        totalPoints: userPoints?.total_points || 0,
        preferredMeditationType: 'mindfulness',
        dominantMood,
        recentMoodTrend: this.analyzeMoodTrend(recentMoods)
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  // Analyze mood trend from recent data
  private static analyzeMoodTrend(recentMoods: any[]) {
    if (recentMoods.length < 2) return 'stable';
    
    const recent = recentMoods.slice(0, 3);
    const older = recentMoods.slice(3, 6);
    
    const recentAvg = recent.reduce((sum, mood) => sum + mood.intensity, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, mood) => sum + mood.intensity, 0) / older.length : recentAvg;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  // Enhanced contextual response with mood awareness
  private static getIntelligentContextualResponse(userMessage: string, userContext: any): string {
    const message = userMessage.toLowerCase();
    
    // Use mood context if available
    if (userContext?.dominantMood) {
      const moodResponses = {
        stressed: "I can sense you're dealing with stress. Let's work together to find some calm through mindful breathing.",
        tired: "Feeling tired can be challenging. A gentle meditation might help restore your energy naturally.",
        frustrated: "Frustration is a sign that you care deeply. Let's channel that energy into a centering practice.",
        happy: "It's wonderful that you're feeling positive! This is a perfect time to deepen your practice.",
        calm: "You're in a beautiful state of calm. Let's use this as a foundation for deeper awareness."
      };
      
      if (moodResponses[userContext.dominantMood]) {
        return moodResponses[userContext.dominantMood];
      }
    }

    // Enhanced contextual responses
    if (message.includes('stress') || message.includes('anxious')) {
      return "Stress is a signal from your body and mind. A short breathing meditation can help you respond rather than react. Shall we try together?";
    }
    
    if (message.includes('sleep') || message.includes('tired')) {
      return "Sleep challenges often reflect an overactive mind. A gentle body scan meditation before bed can help quiet your thoughts. Ready to try?";
    }
    
    if (message.includes('trading') || message.includes('crypto') || message.includes('market')) {
      return "Market volatility can create emotional turbulence. Regular meditation helps you maintain clarity and make decisions from a centered place. Would you like to practice?";
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm Rose of Jericho, your AI meditation companion. I'm here to help you find peace and clarity through mindful practice. How are you feeling today?";
    }

    return "I'm here to support your journey toward inner peace. Every moment of mindfulness is valuable. Would you like to explore a meditation practice together?";
  }

  // Log interaction for quality monitoring
  private static async logInteraction(userId: string, userMessage: string, aiResponse: string, moodAnalysis: any) {
    try {
      await supabase.from('ai_interaction_logs').insert({
        user_id: userId,
        interaction_type: 'meditation_chat',
        user_message: userMessage.substring(0, 500),
        ai_response: aiResponse.substring(0, 500),
        mood_detected: moodAnalysis?.emotion || null,
        mood_intensity: moodAnalysis?.intensity || null,
        response_time: Date.now() // Simplified - would need proper timing
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  // Generate personalized meditation using new Edge Function
  static async generatePersonalizedMeditation(
    userId: string, 
    type: MeditationType, 
    duration: number, 
    currentMood?: { emotion: string; intensity: number }
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-meditation', {
        body: {
          userId,
          type,
          duration,
          focus: this.getFocusFromMood(currentMood),
          userLevel: 'intermediate', // Could be determined from user history
          currentMood,
          preferences: {
            voiceStyle: 'gentle',
            pace: 'moderate',
            guidance: 'supportive'
          }
        }
      });

      if (error) {
        console.error('Error generating personalized meditation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error calling generate-meditation function:', error);
      return null;
    }
  }

  // Get meditation insights using new Edge Function
  static async getMeditationInsights(userId: string, timeframe: 'week' | 'month' | 'quarter' = 'week') {
    try {
      const { data, error } = await supabase.functions.invoke('meditation-insights', {
        body: {
          userId,
          timeframe,
          includeRecommendations: true
        }
      });

      if (error) {
        console.error('Error getting meditation insights:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error calling meditation-insights function:', error);
      return null;
    }
  }

  // Helper method to determine focus from mood
  private static getFocusFromMood(mood?: { emotion: string; intensity: number }): string {
    if (!mood) return 'general awareness';
    
    const focusMap = {
      stressed: 'calming breath work',
      tired: 'energy restoration',
      frustrated: 'emotional release',
      sad: 'gentle awareness',
      excited: 'grounding practice',
      happy: 'gratitude meditation',
      focused: 'sustained attention',
      calm: 'deepening peace',
      confused: 'mental clarity'
    };
    
    return focusMap[mood.emotion] || 'general awareness';
  }

  // Enhanced fallback response
  private static getContextualResponse(userMessage: string): AIResponse {
    const sentiment = this.analyzeSentiment(userMessage);
    const recommendation = this.getRecommendation(sentiment);
    
    return {
      message: this.getIntelligentContextualResponse(userMessage, null),
      showMeditationOption: true,
      recommendation
    };
  }

  // Keep existing methods for backwards compatibility
  private static shouldShowMeditationOption(response: string, sentiment: any): boolean {
    const meditationKeywords = /meditat|breath|relax|calm|center|focus|mindful|session|practice|try/i;
    const questionIndicators = /would you like|shall we|how about|ready for|interested in|let's/i;
    
    return (
      meditationKeywords.test(response) ||
      questionIndicators.test(response) ||
      sentiment.intensity >= 6 ||
      response.includes('session')
    );
  }

  private static analyzeSentiment(userMessage: string): UserSentiment {
    const input = userMessage.toLowerCase();
    let mainEmotion = 'neutral';
    let intensity = 5;
    let cryptoRelated = false;
  
    if (input.includes('crypto') || input.includes('market') || input.includes('trading')) {
      cryptoRelated = true;
      intensity = 7;
      mainEmotion = 'stressed';
    } else if (input.includes('stressed') || input.includes('anxious') || input.includes('overwhelmed')) {
      mainEmotion = 'stressed';
      intensity = 8;
    } else if (input.includes('tired') || input.includes('exhausted')) {
      mainEmotion = 'tired';
      intensity = 6;
    } else if (input.includes('happy') || input.includes('good') || input.includes('great')) {
      mainEmotion = 'happy';
      intensity = 4;
    }
  
    return {
      mainEmotion,
      intensity,
      cryptoRelated
    };
  }
  
  private static getRecommendation(sentiment: UserSentiment): MeditationRecommendation {
    let type: MeditationType = 'mindfulness';
    let duration = 300;
    let title = 'Mindfulness Meditation';
    let description = 'A guided mindfulness meditation to center yourself.';
  
    if (sentiment.mainEmotion === 'stressed') {
      duration = 600;
      title = 'Stress Relief Meditation';
      description = 'Release tension and find calm with this guided meditation.';
    } else if (sentiment.mainEmotion === 'tired') {
      duration = 180;
      type = 'body_scan';
      title = 'Quick Body Scan for Energy';
      description = 'Recharge with a quick body scan meditation.';
    }
  
    return {
      type,
      duration,
      title,
      description
    };
  }
}
