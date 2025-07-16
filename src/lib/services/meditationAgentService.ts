import { supabase } from '../supabase';
import { BaseService } from './baseService';
import { UserPoints, MeditationType } from '../../types/database';
import { MessageType } from '@/components/meditation/ChatMessage';

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

interface AIResponse {
  message: string;
  showMeditationOption: boolean;
  recommendation?: MeditationRecommendation;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class MeditationAgentService extends BaseService {
  // Main method to handle AI responses using multiple providers
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

      // Try multiple AI providers in order of preference
      let aiResponse: string | null = null;
      
      // 1. Try Hugging Face first
      try {
        aiResponse = await this.getHuggingFaceResponse(userMessage, conversationHistory, userContext);
      } catch (error) {
        console.log('Hugging Face failed, trying OpenAI...');
      }

      // 2. Try OpenAI as fallback
      if (!aiResponse) {
        try {
          aiResponse = await this.getOpenAIResponse(userMessage, conversationHistory, userContext);
        } catch (error) {
          console.log('OpenAI failed, using intelligent fallback...');
        }
      }

      // 3. Intelligent fallback if all APIs fail
      if (!aiResponse) {
        aiResponse = this.getIntelligentFallbackResponse(userMessage);
      }

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
      return this.getFallbackResponse(userMessage);
    }
  }

  // Hugging Face API call
  private static async getHuggingFaceResponse(
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

    if (error || !data?.response) {
      throw new Error('Hugging Face API failed');
    }

    return data.response;
  }

  // OpenAI API call (requires API key in Supabase secrets)
  private static async getOpenAIResponse(
    userMessage: string, 
    conversationHistory: ConversationMessage[], 
    userContext: any
  ): Promise<string> {
    const systemPrompt = `You are Rose of Jericho, an AI wellness agent specializing in meditation and mindfulness. You are warm, compassionate, and naturally conversational. Keep responses concise (1-2 sentences) and always offer practical meditation guidance.

${userContext ? `User context: ${userContext.meditationStreak || 0}-day streak, ${userContext.totalPoints || 0} points` : ''}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-4),
      { role: 'user', content: userMessage }
    ];

    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: { messages }
    });

    if (error || !data?.response) {
      throw new Error('OpenAI API failed');
    }

    return data.response;
  }

  // Intelligent fallback with variety
  private static getIntelligentFallbackResponse(userMessage: string): string {
    const sentiment = this.analyzeSentiment(userMessage);
    const input = userMessage.toLowerCase();
    
    // Stress-related responses
    if (sentiment.mainEmotion === 'stressed' || input.includes('stress')) {
      const stressResponses = [
        "I can sense the tension you're carrying. Let's work together to find some calm - a few minutes of breathing meditation can make a real difference.",
        "Stress has a way of building up, doesn't it? I find that even a short meditation can help us step back and gain perspective.",
        "When stress feels overwhelming, returning to our breath can be incredibly grounding. Would you like to try a brief session together?",
        "I hear that stress in your words. Sometimes the kindest thing we can do for ourselves is pause and breathe mindfully."
      ];
      return stressResponses[Math.floor(Math.random() * stressResponses.length)];
    }

    // Crypto/trading related
    if (sentiment.cryptoRelated) {
      const cryptoResponses = [
        "The crypto markets can feel like an emotional rollercoaster. Meditation helps us make clearer decisions when we're centered rather than reactive.",
        "I understand how intense trading can be. Many successful traders use meditation to maintain emotional balance during volatile times.",
        "Market movements can trigger so much anxiety. A quick mindfulness session might help you approach your trading with more clarity.",
        "The crypto world never sleeps, but we need moments of stillness. Let's find some balance together through meditation."
      ];
      return cryptoResponses[Math.floor(Math.random() * cryptoResponses.length)];
    }

    // Tired/exhausted responses
    if (sentiment.mainEmotion === 'tired') {
      const tiredResponses = [
        "Exhaustion is your body and mind asking for care. A gentle meditation might be exactly what you need to recharge.",
        "When we're running on empty, meditation can be surprisingly restorative. Even just a few minutes can help you feel renewed.",
        "Feeling drained is so common these days. Let's try a brief session to help you reconnect with your inner energy.",
        "Sometimes when we're tired, our minds are actually overactive. Meditation can help quiet that mental chatter."
      ];
      return tiredResponses[Math.floor(Math.random() * tiredResponses.length)];
    }

    // Positive/good mood responses
    if (sentiment.mainEmotion === 'happy' || input.includes('good') || input.includes('great')) {
      const positiveResponses = [
        "It's wonderful to hear you're feeling good! Meditation during positive moments helps us appreciate and anchor these feelings.",
        "I love that positive energy! A quick session now could help you carry this good feeling with you throughout the day.",
        "When we're feeling good, meditation can help us cultivate gratitude and spread that positivity even further.",
        "Your positive energy is beautiful. Let's use meditation to deepen that sense of wellbeing."
      ];
      return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    }

    // General responses
    const generalResponses = [
      "Thank you for sharing with me. I'm here to support your meditation journey in whatever way feels right for you today.",
      "I appreciate you opening up. Sometimes just expressing how we feel can be the first step toward finding balance.",
      "Every moment is a new opportunity to connect with ourselves through mindfulness. What feels most needed for you right now?",
      "I'm grateful you're here. Whether you're seeking calm, clarity, or just a moment of peace, meditation can offer that space.",
      "Your willingness to explore meditation shows real self-care. What kind of practice would serve you best today?",
      "I hear you, and I'm here to help however feels right. Sometimes a few mindful breaths can shift our entire perspective."
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
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

  // Fallback response when all services fail
  private static getFallbackResponse(userMessage: string): AIResponse {
    const sentiment = this.analyzeSentiment(userMessage);
    const recommendation = this.getRecommendation(sentiment);
    
    return {
      message: "I'm experiencing some technical difficulties, but I'm still here to support your meditation journey. How are you feeling right now?",
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
  
  private static getFollowUpMessage(sentiment: UserSentiment): string {
    if (sentiment.mainEmotion === 'stressed') {
      return "I sense you're feeling stressed. Would you like a longer meditation session to help you relax?";
    } else if (sentiment.mainEmotion === 'tired') {
      return "You seem tired. A short body scan meditation might help. Shall we try it?";
    } else {
      return "How are you feeling now? Is there anything specific you'd like to focus on in our next session?";
    }
  }
}
