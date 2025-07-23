
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
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class MeditationAgentService extends BaseService {
  // Main method to handle AI responses using the upgraded LLM
  static async getResponse(userMessage: string, previousMessages: MessageType[]): Promise<AIResponse> {
    try {
      // Get user context if available
      const userContext = await this.getUserContext();
      
      // Prepare conversation history
      const conversationHistory: ConversationMessage[] = previousMessages
        .slice(-6) // Keep last 6 messages for context
        .map(msg => ({
          role: msg.role === 'agent' ? 'assistant' : 'user',
          content: msg.content
        }));

      console.log('Sending request to AI service with context:', {
        userMessage: userMessage.substring(0, 50),
        historyLength: conversationHistory.length,
        userContext
      });

      // Call the upgraded AI service
      const aiResponse = await this.getAIResponse(userMessage, conversationHistory, userContext);

      console.log('Received AI response:', {
        responseLength: aiResponse.length,
        preview: aiResponse.substring(0, 100)
      });

      // Analyze sentiment for meditation recommendations
      const sentiment = this.analyzeSentiment(userMessage);
      const recommendation = this.getRecommendation(sentiment);
      
      // Determine if we should show meditation option
      const shouldShowMeditation = this.shouldShowMeditationOption(aiResponse, sentiment);

      return {
        message: aiResponse,
        showMeditationOption: shouldShowMeditation,
        recommendation: shouldShowMeditation ? recommendation : undefined
      };
      
    } catch (error) {
      console.error('Error in AI meditation chat:', error);
      
      // Check if it's an API key configuration error
      if (error.message?.includes('API key') || error.message?.includes('configuration')) {
        return {
          message: "I need to be configured with an API key to provide personalized responses. Please set up your Hugging Face API key to get started.",
          showMeditationOption: false,
          needsApiKey: true
        };
      }
      
      return this.getFallbackResponse(userMessage);
    }
  }

  // Enhanced AI call using the new edge function
  private static async getAIResponse(
    userMessage: string, 
    conversationHistory: ConversationMessage[], 
    userContext: any
  ): Promise<string> {
    const { data, error } = await supabase.functions.invoke('ai-meditation-chat', {
      body: {
        message: userMessage,
        conversationHistory,
        userContext
      }
    });

    if (error) {
      console.error('AI service error:', error);
      throw new Error(`AI service failed: ${error.message}`);
    }

    if (!data?.response) {
      throw new Error('No response from AI service');
    }

    // Check if response indicates API key issues
    if (data.response.includes('API key') || data.isFallback) {
      console.log('AI service returned fallback response:', data);
      if (data.error?.includes('API key')) {
        throw new Error('API key configuration required');
      }
    }

    return data.response;
  }

  // Get user context for personalized responses
  private static async getUserContext() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userPoints } = await supabase
        .from('user_points')
        .select('meditation_streak, total_points')
        .eq('user_id', user.id)
        .single();

      return {
        meditationStreak: userPoints?.meditation_streak || 0,
        totalPoints: userPoints?.total_points || 0,
        preferredMeditationType: 'mindfulness'
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  // Determine if meditation option should be shown
  private static shouldShowMeditationOption(response: string, sentiment: UserSentiment): boolean {
    const meditationKeywords = /meditat|breath|relax|calm|center|focus|mindful|session|practice|try/i;
    const questionIndicators = /would you like|shall we|how about|ready for|interested in|let's/i;
    
    return (
      meditationKeywords.test(response) ||
      questionIndicators.test(response) ||
      sentiment.intensity >= 6 ||
      response.includes('session')
    );
  }

  // Enhanced fallback response when AI service fails
  private static getFallbackResponse(userMessage: string): AIResponse {
    const sentiment = this.analyzeSentiment(userMessage);
    const recommendation = this.getRecommendation(sentiment);
    
    const fallbackResponses = [
      "I'm experiencing some technical difficulties, but I'm still here to support your meditation journey. How are you feeling right now?",
      "I'm having trouble connecting to my full capabilities, but I can still help you with your meditation practice. What would you like to focus on?",
      "Technical issues are affecting my responses, but let's not let that stop us. Would you like to try a meditation session together?"
    ];
    
    return {
      message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      showMeditationOption: true,
      recommendation
    };
  }

  private static analyzeSentiment(userMessage: string): UserSentiment {
    const input = userMessage.toLowerCase();
    let mainEmotion = 'neutral';
    let intensity = 5;
    let cryptoRelated = false;
  
    // Prioritize crypto-related checks
    if (input.includes('crypto') || input.includes('market') || input.includes('trading')) {
      cryptoRelated = true;
      intensity = 7; // Assume higher intensity for crypto-related stress
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
    let duration = 300; // 5 minutes default
    let title = 'Mindfulness Meditation';
    let description = 'A guided mindfulness meditation to center yourself.';
  
    if (sentiment.mainEmotion === 'stressed') {
      duration = 600; // 10 minutes
      title = 'Stress Relief Meditation';
      description = 'Release tension and find calm with this guided meditation.';
    } else if (sentiment.mainEmotion === 'tired') {
      duration = 180; // 3 minutes
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
