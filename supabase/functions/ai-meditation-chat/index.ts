import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory: ConversationMessage[];
  userId?: string;
  userContext?: {
    meditationStreak?: number;
    totalPoints?: number;
    preferredMeditationType?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationHistory, userId, userContext }: RequestBody = await req.json()

    // Get Hugging Face API key from secrets
    const hfApiKey = Deno.env.get('HUGGING_FACE_API_KEY')
    if (!hfApiKey) {
      throw new Error('HUGGING_FACE_API_KEY not found in environment variables')
    }

    // Create system prompt with user context
    const systemPrompt = `You are Rose of Jericho, an AI wellness agent specializing in meditation and mindfulness, particularly for crypto traders and people dealing with financial stress. You are compassionate, wise, and conversational.

Key traits:
- Speak naturally and warmly, like a caring friend
- Keep responses concise but meaningful (1-3 sentences)
- Focus on practical meditation advice and emotional support
- Remember the conversation context
- Be encouraging about meditation practice

${userContext ? `User context:
- Meditation streak: ${userContext.meditationStreak || 0} days
- Total meditation points: ${userContext.totalPoints || 0}
- Preferred meditation type: ${userContext.preferredMeditationType || 'mindfulness'}` : ''}

Respond naturally to the user's message while staying in character as Rose of Jericho.`

    // Prepare conversation for the model
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ]

    // Format for Hugging Face Chat API
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'Human' : msg.role === 'assistant' ? 'Assistant' : 'System'}: ${msg.content}`)
      .join('\n') + '\nAssistant:'

    // Call Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: conversationText,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
          do_sample: true
        }
      })
    })

    if (!response.ok) {
      // Fallback to simple responses if API fails
      const fallbackResponses = [
        "I understand how you're feeling. Let's take a moment to breathe together. Would you like to try a short mindfulness exercise?",
        "That sounds challenging. Remember, meditation is a practice of self-compassion. What type of meditation usually helps you feel more centered?",
        "I hear you. Sometimes when we're stressed, a few minutes of focused breathing can make a real difference. Shall we explore what's on your mind?",
        "Your feelings are valid. In my experience, even a 30-second pause to center yourself can shift your perspective. What would feel most supportive right now?"
      ]
      
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      
      return new Response(
        JSON.stringify({ 
          response: fallbackResponse,
          isFallback: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    let aiResponse = ''

    if (Array.isArray(result) && result[0]?.generated_text) {
      // Extract only the new generated part
      const fullText = result[0].generated_text
      const lastAssistantIndex = fullText.lastIndexOf('Assistant:')
      if (lastAssistantIndex !== -1) {
        aiResponse = fullText.substring(lastAssistantIndex + 10).trim()
      } else {
        aiResponse = fullText.trim()
      }
    } else {
      // Fallback response
      aiResponse = "I'm here to support your meditation journey. What's on your mind today?"
    }

    // Clean up the response
    aiResponse = aiResponse
      .replace(/Human:|Assistant:|System:/g, '')
      .replace(/\n+/g, ' ')
      .trim()

    // Ensure response isn't too long
    if (aiResponse.length > 300) {
      const sentences = aiResponse.split('. ')
      aiResponse = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')
    }

    // If response is empty or too short, use fallback
    if (!aiResponse || aiResponse.length < 10) {
      aiResponse = "I'm here to help with your meditation practice. What would you like to explore today?"
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        isFallback: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in ai-meditation-chat function:', error)
    
    // Graceful fallback
    const fallbackResponse = "I'm experiencing some technical difficulties, but I'm still here for you. How can I support your meditation practice today?"
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        isFallback: true,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to avoid breaking the chat
      }
    )
  }
})