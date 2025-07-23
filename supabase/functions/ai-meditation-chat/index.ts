
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

    const hfApiKey = Deno.env.get('HUGGING_FACE_API_KEY')
    
    console.log('AI Coach request:', {
      hasApiKey: !!hfApiKey,
      keyLength: hfApiKey?.length || 0,
      userId: userId || 'anonymous',
      messagePreview: message.substring(0, 50)
    })

    if (!hfApiKey) {
      console.error('HUGGING_FACE_API_KEY not found')
      return new Response(
        JSON.stringify({ 
          response: "I need an API key to provide personalized responses. Please configure your Hugging Face API key in Supabase Edge Functions secrets.",
          isFallback: true,
          error: "Missing API key"
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Create enhanced system prompt with conversation history
    const recentContext = conversationHistory.slice(-4).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `You are Rose of Jericho, a compassionate AI wellness coach specializing in meditation and mindfulness. You help people, especially those dealing with stress from trading and financial markets.

Your personality:
- Warm and understanding
- Conversational and engaging (ask follow-up questions)
- Concise but meaningful responses (2-3 sentences max)
- Focus on practical meditation guidance
- Remember and build on previous conversation

${userContext ? `User info: ${userContext.meditationStreak || 0} day streak, ${userContext.totalPoints || 0} points, dominant mood: ${userContext.dominantMood || 'unknown'}` : ''}

Recent conversation:
${recentContext}

Current message: "${message}"

Respond naturally and personally, building on the conversation context:`

    console.log('Attempting AI response generation...')
    
    // Try reliable models in order of preference
    let aiResponse = null
    
    // 1. Try DialoGPT-medium (most reliable for conversation)
    console.log('Trying DialoGPT-medium...')
    aiResponse = await tryDialoGPTMedium(hfApiKey, message, systemPrompt)
    
    // 2. Fallback to Flan-T5-base (instruction following)
    if (!aiResponse) {
      console.log('Trying Flan-T5-base...')
      aiResponse = await tryFlanT5Base(hfApiKey, message, systemPrompt)
    }

    // 3. Fallback to DistilBERT (lightweight)
    if (!aiResponse) {
      console.log('Trying DistilBERT...')
      aiResponse = await tryDistilBERT(hfApiKey, message, systemPrompt)
    }

    // 4. Final intelligent fallback
    if (!aiResponse) {
      console.log('All models failed, using intelligent fallback')
      aiResponse = getContextualFallback(message, userContext)
    }

    console.log('Final AI response generated:', {
      responseLength: aiResponse.length,
      preview: aiResponse.substring(0, 100)
    })

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        isFallback: !aiResponse || aiResponse.includes('experiencing some technical')
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    const intelligentResponse = getContextualFallback(message || "Hello", userContext)
    
    return new Response(
      JSON.stringify({ 
        response: intelligentResponse,
        isFallback: true,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})

async function tryDialoGPTMedium(apiKey: string, message: string, systemPrompt: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Context: ${systemPrompt}\n\nUser: ${message}\nRose:`,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error('DialoGPT API error:', response.status, response.statusText)
      return null
    }

    const result = await response.json()
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      return cleanResponse(result[0].generated_text)
    }
    
    return null
  } catch (error) {
    console.error('DialoGPT error:', error)
    return null
  }
}

async function tryFlanT5Base(apiKey: string, message: string, systemPrompt: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-base', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `As a meditation coach, respond to this person: "${message}" with encouragement and guidance.`,
        parameters: {
          max_new_tokens: 80,
          temperature: 0.7,
          do_sample: true
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error('Flan-T5 API error:', response.status, response.statusText)
      return null
    }

    const result = await response.json()
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      return cleanResponse(result[0].generated_text)
    }
    
    return null
  } catch (error) {
    console.error('Flan-T5 error:', error)
    return null
  }
}

async function tryDistilBERT(apiKey: string, message: string, systemPrompt: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const response = await fetch('https://api-inference.huggingface.co/models/distilbert-base-uncased', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `meditation coach response to: ${message}`,
        parameters: {
          return_all_scores: false
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error('DistilBERT API error:', response.status, response.statusText)
      return null
    }

    // DistilBERT is a classification model, so we'll get a fallback response
    return null
  } catch (error) {
    console.error('DistilBERT error:', error)
    return null
  }
}

function cleanResponse(response: string): string {
  let cleaned = response
    .replace(/^(Context:|User:|Rose:)/gm, '')
    .replace(/^\s*[\r\n]/gm, '')
    .trim()

  // Remove any formatting artifacts
  cleaned = cleaned.replace(/^[:\-\s]+/, '').trim()

  // Ensure reasonable length
  if (cleaned.length > 300) {
    const sentences = cleaned.split(/[.!?]+/)
    cleaned = sentences.slice(0, 2).join('. ')
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.'
    }
  }

  // Only reject if empty or too short
  if (!cleaned || cleaned.length < 10) {
    return null
  }

  return cleaned
}

function getContextualFallback(userMessage: string, userContext: any): string {
  const input = userMessage.toLowerCase()
  
  // Question-based responses for better engagement
  if (input.includes('how') || input.includes('what') || input.includes('why') || input.includes('when')) {
    if (input.includes('meditat')) {
      return "Meditation is about training your attention to stay present. The key is consistency - even 5 minutes daily can make a difference. What specific aspect would you like to explore?"
    }
    if (input.includes('start') || input.includes('begin')) {
      return "Starting is simple: find a quiet spot, sit comfortably, and focus on your breath. Would you like me to guide you through your first session?"
    }
    if (input.includes('help')) {
      return "I can help you with breathing techniques, stress relief meditations, or building a daily practice. What would be most useful for you right now?"
    }
  }
  
  // Stress-related
  if (input.includes('stress') || input.includes('anxious') || input.includes('overwhelmed')) {
    return "I understand you're feeling stressed. Let's focus on your breath together - even 30 seconds of mindful breathing can help center you. Would you like to try a short session?"
  }

  // Trading/crypto related
  if (input.includes('crypto') || input.includes('trading') || input.includes('market')) {
    return "Market volatility can be emotionally challenging. Meditation helps us respond from clarity rather than react from fear. A few minutes of mindfulness can improve your trading decisions."
  }

  // Meditation related
  if (input.includes('meditat') || input.includes('practice') || input.includes('calm')) {
    return "That's wonderful that you're interested in meditation! Regular practice, even just a few minutes daily, can transform how you handle stress. Ready to start a session?"
  }

  if (input.includes('thank') || input.includes('appreciate')) {
    return "You're very welcome! It's my joy to support your wellness journey. What would be most helpful for you right now?"
  }

  // More engaging responses that ask questions
  const engagingResponses = [
    "I'm here to support your wellness journey. What's bringing you to meditation today?",
    "Every moment is an opportunity for mindfulness. What would be most helpful for you right now?", 
    "I'd love to help you find the right practice for your needs. How are you feeling today?",
    "Meditation can help with stress, sleep, focus, and emotional balance. What draws you to practice?"
  ]
  
  return engagingResponses[Math.floor(Math.random() * engagingResponses.length)]
}
