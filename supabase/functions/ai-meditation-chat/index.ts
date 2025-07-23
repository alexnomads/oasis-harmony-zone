
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

    // Prepare conversation for the model with proper chat format
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ]

    // Try primary model: Mistral-7B-Instruct-v0.3
    let aiResponse = await tryMistralModel(hfApiKey, messages)
    
    // Fallback to Falcon-7B-Instruct if Mistral fails
    if (!aiResponse) {
      console.log('Mistral failed, trying Falcon-7B-Instruct...')
      aiResponse = await tryFalconModel(hfApiKey, messages)
    }

    // Final fallback to intelligent responses
    if (!aiResponse) {
      console.log('All models failed, using intelligent fallback...')
      aiResponse = getIntelligentFallback(message)
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
        status: 200
      }
    )
  }
})

async function tryMistralModel(apiKey: string, messages: ConversationMessage[]): Promise<string | null> {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: formatMessagesForMistral(messages),
        parameters: {
          temperature: 0.7,
          max_new_tokens: 200,
          top_p: 0.9,
          repetition_penalty: 1.1,
          do_sample: true,
          return_full_text: false
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`)
    }

    const result = await response.json()
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      return cleanResponse(result[0].generated_text)
    }
    
    return null
  } catch (error) {
    console.error('Mistral model error:', error)
    return null
  }
}

async function tryFalconModel(apiKey: string, messages: ConversationMessage[]): Promise<string | null> {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: formatMessagesForFalcon(messages),
        parameters: {
          temperature: 0.7,
          max_new_tokens: 200,
          top_p: 0.9,
          repetition_penalty: 1.1,
          do_sample: true,
          return_full_text: false
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Falcon API error: ${response.status}`)
    }

    const result = await response.json()
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      return cleanResponse(result[0].generated_text)
    }
    
    return null
  } catch (error) {
    console.error('Falcon model error:', error)
    return null
  }
}

function formatMessagesForMistral(messages: ConversationMessage[]): string {
  // Mistral-7B-Instruct uses a specific chat format
  let formatted = ""
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      formatted += `<s>[INST] ${msg.content} [/INST]`
    } else if (msg.role === 'user') {
      formatted += `[INST] ${msg.content} [/INST]`
    } else if (msg.role === 'assistant') {
      formatted += ` ${msg.content}</s>`
    }
  }
  
  return formatted
}

function formatMessagesForFalcon(messages: ConversationMessage[]): string {
  // Falcon-7B-Instruct uses a different format
  let formatted = ""
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      formatted += `System: ${msg.content}\n`
    } else if (msg.role === 'user') {
      formatted += `User: ${msg.content}\n`
    } else if (msg.role === 'assistant') {
      formatted += `Assistant: ${msg.content}\n`
    }
  }
  
  formatted += "Assistant:"
  return formatted
}

function cleanResponse(response: string): string {
  // Clean up the response
  let cleaned = response
    .replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '')
    .replace(/^(System:|User:|Assistant:)/gm, '')
    .trim()

  // Ensure response isn't too long
  if (cleaned.length > 300) {
    const sentences = cleaned.split('. ')
    cleaned = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')
  }

  // If response is empty or too short, return null for fallback
  if (!cleaned || cleaned.length < 10) {
    return null
  }

  return cleaned
}

function getIntelligentFallback(userMessage: string): string {
  const input = userMessage.toLowerCase()
  
  // Stress-related responses
  if (input.includes('stress') || input.includes('anxious') || input.includes('overwhelmed')) {
    const stressResponses = [
      "I can sense the tension you're carrying. Let's work together to find some calm - a few minutes of breathing meditation can make a real difference.",
      "Stress has a way of building up, doesn't it? I find that even a short meditation can help us step back and gain perspective.",
      "When stress feels overwhelming, returning to our breath can be incredibly grounding. Would you like to try a brief session together?"
    ]
    return stressResponses[Math.floor(Math.random() * stressResponses.length)]
  }

  // Crypto/trading related
  if (input.includes('crypto') || input.includes('market') || input.includes('trading')) {
    const cryptoResponses = [
      "The crypto markets can feel like an emotional rollercoaster. Meditation helps us make clearer decisions when we're centered rather than reactive.",
      "I understand how intense trading can be. Many successful traders use meditation to maintain emotional balance during volatile times.",
      "Market movements can trigger so much anxiety. A quick mindfulness session might help you approach your trading with more clarity."
    ]
    return cryptoResponses[Math.floor(Math.random() * cryptoResponses.length)]
  }

  // General responses
  const generalResponses = [
    "Thank you for sharing with me. I'm here to support your meditation journey in whatever way feels right for you today.",
    "I appreciate you opening up. Sometimes just expressing how we feel can be the first step toward finding balance.",
    "Every moment is a new opportunity to connect with ourselves through mindfulness. What feels most needed for you right now?"
  ]
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)]
}
