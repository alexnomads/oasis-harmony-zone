
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface MoodAnalysisRequest {
  message: string;
  userId: string;
  previousMoods?: Array<{
    emotion: string;
    intensity: number;
    timestamp: string;
  }>;
}

interface MoodAnalysisResponse {
  emotion: string;
  intensity: number;
  keywords: string[];
  recommendation: {
    type: string;
    duration: number;
    focus: string;
  };
  insights: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId, previousMoods = [] }: MoodAnalysisRequest = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Analyze mood from message
    const moodAnalysis = analyzeMoodFromText(message)
    
    // Get historical context
    const moodTrend = analyzeMoodTrend(previousMoods, moodAnalysis)
    
    // Generate personalized recommendation
    const recommendation = generateMoodBasedRecommendation(moodAnalysis, moodTrend)
    
    // Generate insights
    const insights = generateMoodInsights(moodAnalysis, moodTrend)
    
    // Store mood data
    await supabase.from('user_moods').insert({
      user_id: userId,
      emotion: moodAnalysis.emotion,
      intensity: moodAnalysis.intensity,
      keywords: moodAnalysis.keywords,
      message_context: message.substring(0, 500),
      created_at: new Date().toISOString()
    })

    const response: MoodAnalysisResponse = {
      emotion: moodAnalysis.emotion,
      intensity: moodAnalysis.intensity,
      keywords: moodAnalysis.keywords,
      recommendation,
      insights
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Mood analysis error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function analyzeMoodFromText(text: string) {
  const lowerText = text.toLowerCase()
  
  // Emotion keywords mapping
  const emotionKeywords = {
    stressed: ['stress', 'anxious', 'overwhelmed', 'pressure', 'worried', 'tense'],
    tired: ['tired', 'exhausted', 'drained', 'weary', 'fatigue', 'sleepy'],
    frustrated: ['frustrated', 'angry', 'annoyed', 'irritated', 'upset'],
    sad: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'lonely'],
    excited: ['excited', 'thrilled', 'energized', 'pumped', 'enthusiastic'],
    happy: ['happy', 'joyful', 'content', 'pleased', 'good', 'great'],
    focused: ['focused', 'concentrated', 'clear', 'sharp', 'alert'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil'],
    confused: ['confused', 'lost', 'uncertain', 'unclear', 'mixed up'],
    motivated: ['motivated', 'driven', 'determined', 'inspired', 'ready']
  }
  
  let detectedEmotion = 'neutral'
  let maxScore = 0
  let foundKeywords: string[] = []
  
  // Find dominant emotion
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matchedKeywords = keywords.filter(keyword => lowerText.includes(keyword))
    if (matchedKeywords.length > maxScore) {
      maxScore = matchedKeywords.length
      detectedEmotion = emotion
      foundKeywords = matchedKeywords
    }
  }
  
  // Calculate intensity based on context
  let intensity = 5 // neutral baseline
  
  // Intensity modifiers
  const intensityModifiers = {
    high: ['very', 'extremely', 'incredibly', 'really', 'so', 'totally'],
    medium: ['quite', 'pretty', 'fairly', 'somewhat', 'rather'],
    low: ['a little', 'slightly', 'kind of', 'sort of', 'bit']
  }
  
  for (const [level, modifiers] of Object.entries(intensityModifiers)) {
    if (modifiers.some(mod => lowerText.includes(mod))) {
      switch (level) {
        case 'high': intensity = Math.min(10, intensity + 3); break
        case 'medium': intensity = Math.min(10, intensity + 1); break
        case 'low': intensity = Math.max(1, intensity - 1); break
      }
    }
  }
  
  // Adjust intensity based on emotion type
  if (['stressed', 'frustrated', 'sad'].includes(detectedEmotion)) {
    intensity = Math.min(10, intensity + 2)
  }
  
  return {
    emotion: detectedEmotion,
    intensity,
    keywords: foundKeywords
  }
}

function analyzeMoodTrend(previousMoods: any[], currentMood: any) {
  if (previousMoods.length === 0) return { trend: 'stable', change: 0 }
  
  const recentMoods = previousMoods.slice(-5) // Last 5 moods
  const avgIntensity = recentMoods.reduce((sum, mood) => sum + mood.intensity, 0) / recentMoods.length
  
  const change = currentMood.intensity - avgIntensity
  let trend = 'stable'
  
  if (change > 1.5) trend = 'improving'
  else if (change < -1.5) trend = 'declining'
  
  return { trend, change: Math.round(change * 10) / 10 }
}

function generateMoodBasedRecommendation(moodAnalysis: any, moodTrend: any) {
  const { emotion, intensity } = moodAnalysis
  
  // Base recommendations by emotion
  const recommendations = {
    stressed: { type: 'breathing', duration: 600, focus: 'calming breath work' },
    tired: { type: 'body_scan', duration: 300, focus: 'energy restoration' },
    frustrated: { type: 'loving_kindness', duration: 480, focus: 'emotional release' },
    sad: { type: 'mindfulness', duration: 720, focus: 'gentle awareness' },
    excited: { type: 'mindfulness', duration: 300, focus: 'grounding practice' },
    happy: { type: 'mindfulness', duration: 360, focus: 'gratitude meditation' },
    focused: { type: 'mindfulness', duration: 480, focus: 'sustained attention' },
    calm: { type: 'mindfulness', duration: 420, focus: 'deepening peace' },
    confused: { type: 'body_scan', duration: 540, focus: 'mental clarity' },
    motivated: { type: 'breathing', duration: 300, focus: 'energizing breath' },
    neutral: { type: 'mindfulness', duration: 300, focus: 'general awareness' }
  }
  
  let recommendation = recommendations[emotion] || recommendations.neutral
  
  // Adjust duration based on intensity
  if (intensity >= 8) {
    recommendation.duration = Math.min(900, recommendation.duration + 180) // Add 3 minutes for high intensity
  } else if (intensity <= 3) {
    recommendation.duration = Math.max(180, recommendation.duration - 120) // Reduce 2 minutes for low intensity
  }
  
  // Adjust for mood trend
  if (moodTrend.trend === 'declining') {
    recommendation.duration = Math.min(900, recommendation.duration + 120)
  }
  
  return recommendation
}

function generateMoodInsights(moodAnalysis: any, moodTrend: any) {
  const { emotion, intensity } = moodAnalysis
  const { trend } = moodTrend
  
  let insight = `You're feeling ${emotion} with an intensity of ${intensity}/10. `
  
  if (trend === 'improving') {
    insight += "Your mood seems to be improving - that's wonderful! "
  } else if (trend === 'declining') {
    insight += "I notice your mood has been shifting lately. "
  }
  
  // Add emotion-specific insights
  const emotionInsights = {
    stressed: "Stress is natural, but regular meditation can help you build resilience.",
    tired: "Your body and mind are asking for rest. A gentle practice can help restore energy.",
    frustrated: "These feelings are temporary. Loving-kindness meditation can help process them.",
    sad: "It's okay to feel sad. Mindful awareness can help you sit with these emotions gently.",
    excited: "Your energy is high! A grounding practice can help you channel it effectively.",
    happy: "Wonderful! This is a great time to deepen your practice with gratitude.",
    focused: "Your clarity is a gift. Use this state to develop stronger concentration.",
    calm: "You're in a beautiful state. This is perfect for deepening your meditation.",
    confused: "Uncertainty is part of life. A body scan can help bring mental clarity.",
    motivated: "Channel this motivation into your practice for lasting benefits."
  }
  
  insight += emotionInsights[emotion] || "Every emotion is a teacher. Let's explore this together."
  
  return insight
}
