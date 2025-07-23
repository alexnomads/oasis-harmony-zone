
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface InsightsRequest {
  userId: string;
  timeframe: 'week' | 'month' | 'quarter';
  includeRecommendations: boolean;
}

interface InsightsResponse {
  summary: {
    totalSessions: number;
    totalMinutes: number;
    averageSession: number;
    streak: number;
    consistency: number;
  };
  patterns: {
    preferredTimes: string[];
    favoriteTypes: string[];
    moodTrends: Array<{
      emotion: string;
      frequency: number;
      improvement: number;
    }>;
  };
  achievements: Array<{
    type: string;
    title: string;
    description: string;
    unlockedAt: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    reason: string;
    priority: number;
  }>;
  insights: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, timeframe, includeRecommendations }: InsightsRequest = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
    }

    // Get meditation sessions
    const { data: sessions } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    // Get mood data
    const { data: moods } = await supabase
      .from('user_moods')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    // Get user points for streak
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('meditation_streak')
      .eq('user_id', userId)
      .single()

    // Generate insights
    const insights = await generateInsights(sessions || [], moods || [], userPoints?.meditation_streak || 0, timeframe)
    
    if (includeRecommendations) {
      insights.recommendations = await generateRecommendations(sessions || [], moods || [], userId, supabase)
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Insights generation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function generateInsights(sessions: any[], moods: any[], streak: number, timeframe: string): Promise<InsightsResponse> {
  // Calculate summary statistics
  const totalSessions = sessions.length
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  const averageSession = totalSessions > 0 ? totalMinutes / totalSessions : 0
  
  // Calculate consistency (sessions per expected days)
  const expectedDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90
  const consistency = Math.min(100, (totalSessions / expectedDays) * 100)
  
  // Analyze patterns
  const patterns = analyzePatterns(sessions, moods)
  
  // Generate achievements
  const achievements = generateAchievements(sessions, moods, streak)
  
  // Generate insights
  const insightTexts = generateInsightTexts(sessions, moods, streak, timeframe)
  
  return {
    summary: {
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      averageSession: Math.round(averageSession),
      streak,
      consistency: Math.round(consistency)
    },
    patterns,
    achievements,
    recommendations: [], // Will be filled if requested
    insights: insightTexts
  }
}

function analyzePatterns(sessions: any[], moods: any[]) {
  // Analyze preferred times
  const hourCounts = {}
  sessions.forEach(session => {
    const hour = new Date(session.created_at).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  const preferredTimes = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => {
      const h = parseInt(hour)
      if (h < 6) return 'Early Morning'
      if (h < 12) return 'Morning'
      if (h < 17) return 'Afternoon'
      if (h < 21) return 'Evening'
      return 'Night'
    })
  
  // Analyze favorite types
  const typeCounts = {}
  sessions.forEach(session => {
    typeCounts[session.type] = (typeCounts[session.type] || 0) + 1
  })
  
  const favoriteTypes = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type)
  
  // Analyze mood trends
  const emotionCounts = {}
  const emotionIntensities = {}
  
  moods.forEach(mood => {
    emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1
    if (!emotionIntensities[mood.emotion]) {
      emotionIntensities[mood.emotion] = []
    }
    emotionIntensities[mood.emotion].push(mood.intensity)
  })
  
  const moodTrends = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([emotion, frequency]) => {
      const intensities = emotionIntensities[emotion] || []
      const avgIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length
      
      // Calculate improvement (simplified)
      const recent = intensities.slice(-3)
      const older = intensities.slice(0, -3)
      const recentAvg = recent.reduce((sum, i) => sum + i, 0) / recent.length
      const olderAvg = older.reduce((sum, i) => sum + i, 0) / older.length
      
      const improvement = older.length > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0
      
      return {
        emotion,
        frequency,
        improvement: Math.round(improvement)
      }
    })
  
  return {
    preferredTimes,
    favoriteTypes,
    moodTrends
  }
}

function generateAchievements(sessions: any[], moods: any[], streak: number): Array<any> {
  const achievements = []
  
  // Streak achievements
  if (streak >= 7) {
    achievements.push({
      type: 'streak',
      title: 'Week Warrior',
      description: 'Maintained a 7-day meditation streak',
      unlockedAt: new Date().toISOString()
    })
  }
  
  if (streak >= 30) {
    achievements.push({
      type: 'streak',
      title: 'Month Master',
      description: 'Maintained a 30-day meditation streak',
      unlockedAt: new Date().toISOString()
    })
  }
  
  // Session achievements
  if (sessions.length >= 10) {
    achievements.push({
      type: 'volume',
      title: 'Regular Practitioner',
      description: 'Completed 10 meditation sessions',
      unlockedAt: new Date().toISOString()
    })
  }
  
  if (sessions.length >= 50) {
    achievements.push({
      type: 'volume',
      title: 'Meditation Enthusiast',
      description: 'Completed 50 meditation sessions',
      unlockedAt: new Date().toISOString()
    })
  }
  
  // Duration achievements
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  if (totalMinutes >= 60) {
    achievements.push({
      type: 'duration',
      title: 'Hour of Peace',
      description: 'Meditated for over 1 hour total',
      unlockedAt: new Date().toISOString()
    })
  }
  
  // Mood achievements
  const calmMoods = moods.filter(m => m.emotion === 'calm').length
  if (calmMoods >= 5) {
    achievements.push({
      type: 'mood',
      title: 'Serenity Seeker',
      description: 'Achieved calm state 5 times',
      unlockedAt: new Date().toISOString()
    })
  }
  
  return achievements
}

function generateInsightTexts(sessions: any[], moods: any[], streak: number, timeframe: string): string[] {
  const insights = []
  
  // Streak insights
  if (streak > 0) {
    insights.push(`You're on a ${streak}-day meditation streak! Consistency is key to building a lasting practice.`)
  }
  
  // Session insights
  if (sessions.length > 0) {
    const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length / 60
    insights.push(`Your average session length is ${Math.round(avgDuration)} minutes - perfect for building a sustainable practice.`)
  }
  
  // Mood insights
  if (moods.length > 0) {
    const stressedMoods = moods.filter(m => m.emotion === 'stressed').length
    const calmMoods = moods.filter(m => m.emotion === 'calm').length
    
    if (calmMoods > stressedMoods) {
      insights.push("You're experiencing more calm than stress - your practice is working beautifully!")
    } else if (stressedMoods > 0) {
      insights.push("I notice stress patterns. Consider increasing your meditation frequency during challenging times.")
    }
  }
  
  // Time-based insights
  if (timeframe === 'week' && sessions.length >= 5) {
    insights.push("You meditated most days this week! This consistency will compound into profound benefits.")
  } else if (timeframe === 'month' && sessions.length >= 15) {
    insights.push("Your monthly practice shows real commitment. Notice how meditation is becoming part of your identity.")
  }
  
  // Encouragement
  insights.push("Every moment of mindfulness matters. You're building a skill that will serve you for life.")
  
  return insights
}

async function generateRecommendations(sessions: any[], moods: any[], userId: string, supabase: any): Promise<Array<any>> {
  const recommendations = []
  
  // Analyze gaps and opportunities
  const lastSession = sessions[0]
  const daysSinceLastSession = lastSession ? 
    Math.floor((new Date().getTime() - new Date(lastSession.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
    999
  
  // Session frequency recommendations
  if (daysSinceLastSession > 3) {
    recommendations.push({
      type: 'frequency',
      title: 'Reconnect with Your Practice',
      reason: `It's been ${daysSinceLastSession} days since your last session`,
      priority: 9
    })
  }
  
  // Type diversity recommendations
  const typeSet = new Set(sessions.map(s => s.type))
  if (typeSet.size < 3) {
    recommendations.push({
      type: 'variety',
      title: 'Explore Different Meditation Types',
      reason: 'Variety keeps practice fresh and addresses different needs',
      priority: 6
    })
  }
  
  // Mood-based recommendations
  const recentStress = moods.filter(m => 
    m.emotion === 'stressed' && 
    new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length
  
  if (recentStress > 3) {
    recommendations.push({
      type: 'mood',
      title: 'Stress Relief Focus',
      reason: 'Recent stress patterns suggest need for calming practices',
      priority: 8
    })
  }
  
  // Duration recommendations
  const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
  if (avgDuration < 300) { // Less than 5 minutes
    recommendations.push({
      type: 'duration',
      title: 'Gradually Extend Sessions',
      reason: 'Longer sessions can deepen your practice',
      priority: 5
    })
  }
  
  // Time-based recommendations
  const hourCounts = {}
  sessions.forEach(session => {
    const hour = new Date(session.created_at).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  const morningMeditations = Object.entries(hourCounts)
    .filter(([hour]) => parseInt(hour) < 12)
    .reduce((sum, [, count]) => sum + count, 0)
  
  if (morningMeditations < sessions.length * 0.3) {
    recommendations.push({
      type: 'timing',
      title: 'Try Morning Meditation',
      reason: 'Morning practice sets a positive tone for the entire day',
      priority: 7
    })
  }
  
  return recommendations.sort((a, b) => b.priority - a.priority)
}
