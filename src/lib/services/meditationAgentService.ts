
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

  // Enhanced AI call with retry logic and better error handling
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
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const { data, error } = await supabase.functions.invoke('ai-meditation-chat', {
          body: {
            message: userMessage,
            conversationHistory,
            userContext
          }
        });

        clearTimeout(timeoutId);

        if (error) {
          console.error(`AI service error (attempt ${attempt}):`, error);
          lastError = error;
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            continue;
          }
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
      } catch (error) {
        console.error(`Error calling AI service (attempt ${attempt}):`, error);
        lastError = error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        }
      }
    }

    // All retries failed, return intelligent fallback
    console.warn('All AI service attempts failed, using local fallback');
    return this.getContextualResponse(userMessage);
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

  // Intelligent contextual response (no technical issues mentioned)
  private static getContextualResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('stress') || message.includes('anxious') || message.includes('worried')) {
      return "I can sense you're feeling stressed. A short breathing meditation might help you find some calm. Would you like to try a 5-minute mindfulness session?";
    }
    
    if (message.includes('sleep') || message.includes('tired') || message.includes('insomnia')) {
      return "Sleep concerns can be challenging. A gentle meditation before bed often helps quiet the mind. Shall we do a relaxing session together?";
    }
    
    if (message.includes('trading') || message.includes('market') || message.includes('crypto')) {
      return "Market volatility can create emotional turbulence. Regular meditation helps maintain clarity in decision-making. Ready for a centering practice?";
    }
    
    if (message.includes('meditation') || message.includes('meditate')) {
      return "Wonderful that you're interested in meditation! It's one of the most powerful tools for inner peace. Would you like to start with a beginner-friendly session?";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm Rose of Jericho, your meditation companion. I'm here to help you find moments of peace and mindfulness. How are you feeling today?";
    }
    
    if (message.includes('how') && message.includes('feel')) {
      return "I appreciate you sharing. Sometimes just acknowledging our feelings is the first step toward balance. A short meditation can help process emotions mindfully.";
    }
    
    return "I'm here to support your meditation journey. Every moment of mindfulness is valuable. Would you like to explore a meditation practice together?";
  }

  // Enhanced fallback response when AI service fails
  private static getFallbackResponse(userMessage: string): AIResponse {
    const sentiment = this.analyzeSentiment(userMessage);
    const recommendation = this.getRecommendation(sentiment);
    
    return {
      message: this.getContextualResponse(userMessage),
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
