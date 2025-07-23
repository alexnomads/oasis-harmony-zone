
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
    
    console.log('Environment check:', {
      hasApiKey: !!hfApiKey,
      keyLength: hfApiKey?.length || 0,
      userId: userId || 'anonymous',
      messageLength: message.length,
      historyLength: conversationHistory.length
    })

    if (!hfApiKey) {
      console.error('HUGGING_FACE_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ 
          response: "I need to be configured with an API key to provide personalized responses. Please add your Hugging Face API key to get started.",
          isFallback: true,
          error: "Missing API key configuration"
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
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

    console.log('Prepared messages for AI:', {
      messageCount: messages.length,
      systemPromptLength: systemPrompt.length,
      lastUserMessage: message.substring(0, 50) + '...'
    })

    // Try primary model: Mistral-7B-Instruct-v0.3 with retry logic
    let aiResponse = await tryModelWithRetry(() => tryMistralModel(hfApiKey, messages), 'Mistral')
    
    // Fallback to Falcon-7B-Instruct if Mistral fails
    if (!aiResponse) {
      console.log('Mistral failed, trying Falcon-7B-Instruct...')
      aiResponse = await tryModelWithRetry(() => tryFalconModel(hfApiKey, messages), 'Falcon')
    }

    // Final fallback to intelligent responses
    if (!aiResponse) {
      console.log('All models failed, using intelligent fallback...')
      aiResponse = getIntelligentFallback(message)
    }

    console.log('Final response:', {
      responseLength: aiResponse.length,
      isFallback: !aiResponse || aiResponse.includes('technical difficulties'),
      preview: aiResponse.substring(0, 100) + '...'
    })

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

async function tryModelWithRetry(modelFunc: () => Promise<string | null>, modelName: string, maxRetries = 2): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Trying ${modelName} (attempt ${attempt}/${maxRetries})`)
      const result = await modelFunc()
      if (result) {
        console.log(`${modelName} succeeded on attempt ${attempt}`)
        return result
      }
    } catch (error) {
      console.error(`${modelName} attempt ${attempt} failed:`, error)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
      }
    }
  }
  return null
}

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

    console.log('Mistral API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mistral API error:', response.status, errorText)
      throw new Error(`Mistral API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('Mistral raw response:', result)
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      const cleaned = cleanResponse(result[0].generated_text)
      console.log('Mistral cleaned response:', cleaned)
      return cleaned
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

    console.log('Falcon API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Falcon API error:', response.status, errorText)
      throw new Error(`Falcon API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('Falcon raw response:', result)
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      const cleaned = cleanResponse(result[0].generated_text)
      console.log('Falcon cleaned response:', cleaned)
      return cleaned
    }
    
    return null
  } catch (error) {
    console.error('Falcon model error:', error)
    return null
  }
}

function formatMessagesForMistral(messages: ConversationMessage[]): string {
  // Improved Mistral-7B-Instruct format
  let formatted = ""
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.role === 'system') {
      formatted += `<s>[INST] ${msg.content}\n\n`
    } else if (msg.role === 'user') {
      if (i === 0) {
        formatted += `${msg.content} [/INST]`
      } else {
        formatted += `<s>[INST] ${msg.content} [/INST]`
      }
    } else if (msg.role === 'assistant') {
      formatted += ` ${msg.content}</s>`
    }
  }
  
  // If the last message is from user, we need to close the instruction
  if (messages[messages.length - 1].role === 'user') {
    formatted += ""
  }
  
  console.log('Mistral formatted input:', formatted.substring(0, 200) + '...')
  return formatted
}

function formatMessagesForFalcon(messages: ConversationMessage[]): string {
  // Improved Falcon-7B-Instruct format
  let formatted = ""
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      formatted += `System: ${msg.content}\n\n`
    } else if (msg.role === 'user') {
      formatted += `User: ${msg.content}\n`
    } else if (msg.role === 'assistant') {
      formatted += `Assistant: ${msg.content}\n`
    }
  }
  
  formatted += "Assistant:"
  console.log('Falcon formatted input:', formatted.substring(0, 200) + '...')
  return formatted
}

function cleanResponse(response: string): string {
  // Enhanced response cleaning
  let cleaned = response
    .replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '')
    .replace(/^(System:|User:|Assistant:)/gm, '')
    .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
    .trim()

  // Remove any remaining formatting artifacts
  cleaned = cleaned.replace(/^[:\-\s]+/, '').trim()

  // Ensure response isn't too long
  if (cleaned.length > 300) {
    const sentences = cleaned.split(/[.!?]+/)
    cleaned = sentences.slice(0, 2).join('. ')
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.'
    }
  }

  // If response is empty, too short, or contains repetitive patterns, return null for fallback
  if (!cleaned || cleaned.length < 10 || isRepetitive(cleaned)) {
    console.log('Response rejected:', { cleaned, length: cleaned.length, repetitive: isRepetitive(cleaned) })
    return null
  }

  return cleaned
}

function isRepetitive(text: string): boolean {
  // Check for repetitive patterns
  const words = text.toLowerCase().split(/\s+/)
  const wordCount = {}
  
  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1
  }
  
  // If any word appears more than 3 times in a short response, it's likely repetitive
  return Object.values(wordCount).some(count => count > 3)
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
