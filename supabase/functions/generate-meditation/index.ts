
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface MeditationRequest {
  userId: string;
  type: string;
  duration: number;
  focus: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  currentMood?: {
    emotion: string;
    intensity: number;
  };
  preferences?: {
    voiceStyle: string;
    pace: string;
    guidance: string;
  };
}

interface MeditationResponse {
  id: string;
  title: string;
  description: string;
  script: MeditationScript;
  audioInstructions: string[];
  backgroundMusic: string;
  estimatedDuration: number;
}

interface MeditationScript {
  phases: Array<{
    name: string;
    duration: number;
    instructions: string;
    guidance: string[];
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const request: MeditationRequest = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate personalized meditation
    const meditation = await generatePersonalizedMeditation(request)
    
    // Store the generated meditation
    const { data: savedMeditation, error } = await supabase
      .from('personalized_meditations')
      .insert({
        user_id: request.userId,
        title: meditation.title,
        type: request.type,
        duration: request.duration,
        focus: request.focus,
        script: meditation.script,
        audio_instructions: meditation.audioInstructions,
        background_music: meditation.backgroundMusic,
        user_level: request.userLevel,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving meditation:', error)
    }

    const response: MeditationResponse = {
      ...meditation,
      id: savedMeditation?.id || crypto.randomUUID()
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Meditation generation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function generatePersonalizedMeditation(request: MeditationRequest): Promise<Omit<MeditationResponse, 'id'>> {
  const { type, duration, focus, userLevel, currentMood } = request
  
  // Generate title and description
  const title = generateTitle(type, focus, currentMood)
  const description = generateDescription(type, focus, userLevel, currentMood)
  
  // Generate meditation script
  const script = generateMeditationScript(type, duration, focus, userLevel, currentMood)
  
  // Generate audio instructions
  const audioInstructions = generateAudioInstructions(type, userLevel)
  
  // Select background music
  const backgroundMusic = selectBackgroundMusic(type, currentMood)
  
  return {
    title,
    description,
    script,
    audioInstructions,
    backgroundMusic,
    estimatedDuration: duration
  }
}

function generateTitle(type: string, focus: string, currentMood?: any): string {
  const moodPrefix = currentMood ? `${capitalize(currentMood.emotion)} ` : ''
  const focusMap = {
    'calming breath work': 'Calming Breath',
    'energy restoration': 'Energy Restore',
    'emotional release': 'Emotional Release',
    'gentle awareness': 'Gentle Awareness',
    'grounding practice': 'Grounding',
    'gratitude meditation': 'Gratitude',
    'sustained attention': 'Focus Training',
    'deepening peace': 'Deep Peace',
    'mental clarity': 'Mental Clarity',
    'energizing breath': 'Energizing Breath',
    'general awareness': 'Mindful Awareness'
  }
  
  const focusTitle = focusMap[focus] || capitalize(focus)
  return `${moodPrefix}${focusTitle} Meditation`
}

function generateDescription(type: string, focus: string, userLevel: string, currentMood?: any): string {
  const levelDescriptions = {
    beginner: "A gentle introduction perfect for newcomers to meditation.",
    intermediate: "A balanced practice building on foundational skills.",
    advanced: "A deep practice for experienced meditators."
  }
  
  let description = `${levelDescriptions[userLevel]} `
  
  if (currentMood) {
    description += `Specially crafted for when you're feeling ${currentMood.emotion}. `
  }
  
  description += `This ${type.replace('_', ' ')} meditation focuses on ${focus}.`
  
  return description
}

function generateMeditationScript(type: string, duration: number, focus: string, userLevel: string, currentMood?: any): MeditationScript {
  const phases = []
  
  // Opening phase (10% of duration)
  const openingDuration = Math.max(30, Math.floor(duration * 0.1))
  phases.push({
    name: 'Opening',
    duration: openingDuration,
    instructions: generateOpeningInstructions(userLevel, currentMood),
    guidance: generateOpeningGuidance(userLevel)
  })
  
  // Main practice phase (70% of duration)
  const mainDuration = Math.floor(duration * 0.7)
  phases.push({
    name: 'Main Practice',
    duration: mainDuration,
    instructions: generateMainPracticeInstructions(type, focus, userLevel, currentMood),
    guidance: generateMainPracticeGuidance(type, focus, userLevel)
  })
  
  // Closing phase (20% of duration)
  const closingDuration = duration - openingDuration - mainDuration
  phases.push({
    name: 'Closing',
    duration: closingDuration,
    instructions: generateClosingInstructions(userLevel, currentMood),
    guidance: generateClosingGuidance(userLevel)
  })
  
  return { phases }
}

function generateOpeningInstructions(userLevel: string, currentMood?: any): string {
  let instructions = "Find a comfortable position, either sitting or lying down. "
  
  if (userLevel === 'beginner') {
    instructions += "It's completely normal if your mind wanders - that's part of the practice. "
  }
  
  if (currentMood && currentMood.intensity >= 7) {
    instructions += "Take a moment to acknowledge how you're feeling right now, without judgment. "
  }
  
  instructions += "Close your eyes gently and begin to notice your natural breath."
  
  return instructions
}

function generateOpeningGuidance(userLevel: string): string[] {
  const guidance = [
    "Settle into your chosen position",
    "Allow your body to relax",
    "Close your eyes gently"
  ]
  
  if (userLevel === 'beginner') {
    guidance.push("Remember, there's no perfect way to meditate")
  }
  
  guidance.push("Begin to notice your breath")
  
  return guidance
}

function generateMainPracticeInstructions(type: string, focus: string, userLevel: string, currentMood?: any): string {
  const instructions = {
    breathing: generateBreathingInstructions(focus, userLevel, currentMood),
    mindfulness: generateMindfulnessInstructions(focus, userLevel, currentMood),
    body_scan: generateBodyScanInstructions(focus, userLevel, currentMood),
    loving_kindness: generateLovingKindnessInstructions(focus, userLevel, currentMood)
  }
  
  return instructions[type] || instructions.mindfulness
}

function generateBreathingInstructions(focus: string, userLevel: string, currentMood?: any): string {
  let instructions = "Focus your attention on your breath. "
  
  if (focus.includes('calming')) {
    instructions += "Begin breathing in for 4 counts, holding for 4, and exhaling for 6. "
  } else if (focus.includes('energizing')) {
    instructions += "Take slightly deeper breaths, feeling the energy with each inhale. "
  } else {
    instructions += "Simply observe your natural breathing rhythm. "
  }
  
  if (userLevel === 'beginner') {
    instructions += "When your mind wanders, gently return to your breath. "
  } else if (userLevel === 'advanced') {
    instructions += "Notice the subtle sensations between breaths. "
  }
  
  return instructions
}

function generateMindfulnessInstructions(focus: string, userLevel: string, currentMood?: any): string {
  let instructions = "Rest your attention in the present moment. "
  
  if (focus.includes('awareness')) {
    instructions += "Notice whatever arises - thoughts, sensations, emotions - without trying to change anything. "
  } else if (focus.includes('gratitude')) {
    instructions += "Bring to mind things you're grateful for, feeling the warmth of appreciation. "
  } else if (focus.includes('grounding')) {
    instructions += "Feel the connection between your body and the ground beneath you. "
  }
  
  if (currentMood && currentMood.emotion === 'stressed') {
    instructions += "If stress arises, breathe into it with compassion. "
  }
  
  return instructions
}

function generateBodyScanInstructions(focus: string, userLevel: string, currentMood?: any): string {
  let instructions = "Begin at the top of your head and slowly move your attention down through your body. "
  
  if (focus.includes('energy')) {
    instructions += "Notice areas of tension and breathe energy into them. "
  } else if (focus.includes('clarity')) {
    instructions += "Observe each part of your body with clear, focused attention. "
  } else {
    instructions += "Simply notice sensations without trying to change them. "
  }
  
  if (userLevel === 'beginner') {
    instructions += "Take your time - there's no rush. "
  }
  
  return instructions
}

function generateLovingKindnessInstructions(focus: string, userLevel: string, currentMood?: any): string {
  let instructions = "Begin by sending loving-kindness to yourself. "
  
  if (focus.includes('emotional release')) {
    instructions += "If difficult emotions arise, wrap them in loving-kindness. "
  }
  
  instructions += "Repeat: 'May I be happy, may I be peaceful, may I be free from suffering.' "
  instructions += "Then extend these wishes to someone you love, someone neutral, and eventually to all beings. "
  
  if (currentMood && ['frustrated', 'sad'].includes(currentMood.emotion)) {
    instructions += "Be especially gentle with yourself during this practice. "
  }
  
  return instructions
}

function generateMainPracticeGuidance(type: string, focus: string, userLevel: string): string[] {
  const baseGuidance = [
    "Stay present with your practice",
    "Be patient with yourself",
    "Notice without judgment"
  ]
  
  const typeGuidance = {
    breathing: ["Focus on your breath", "Count breaths if helpful", "Feel the rhythm"],
    mindfulness: ["Observe whatever arises", "Rest in awareness", "Be present"],
    body_scan: ["Move slowly through your body", "Notice sensations", "Breathe into tension"],
    loving_kindness: ["Send love to yourself", "Extend to others", "Feel the warmth"]
  }
  
  return [...baseGuidance, ...typeGuidance[type]]
}

function generateClosingInstructions(userLevel: string, currentMood?: any): string {
  let instructions = "Begin to bring your attention back to the present moment. "
  
  if (currentMood) {
    instructions += "Notice how you're feeling now compared to when you started. "
  }
  
  instructions += "Wiggle your fingers and toes, take a deep breath, and when you're ready, gently open your eyes. "
  
  if (userLevel === 'beginner') {
    instructions += "Take a moment to appreciate yourself for taking this time to practice. "
  }
  
  return instructions
}

function generateClosingGuidance(userLevel: string): string[] {
  return [
    "Gradually return to the present",
    "Wiggle fingers and toes",
    "Take a deep breath",
    "Open your eyes gently",
    "Appreciate your practice"
  ]
}

function generateAudioInstructions(type: string, userLevel: string): string[] {
  const instructions = [
    "Speak in a calm, soothing voice",
    "Pause between instructions",
    "Use gentle, encouraging language"
  ]
  
  if (userLevel === 'beginner') {
    instructions.push("Provide more guidance and reassurance")
  } else if (userLevel === 'advanced') {
    instructions.push("Allow for longer periods of silence")
  }
  
  return instructions
}

function selectBackgroundMusic(type: string, currentMood?: any): string {
  const musicOptions = {
    breathing: "gentle_ambient",
    mindfulness: "nature_sounds",
    body_scan: "soft_piano",
    loving_kindness: "warm_strings"
  }
  
  let selectedMusic = musicOptions[type] || "gentle_ambient"
  
  if (currentMood) {
    if (currentMood.emotion === 'stressed') {
      selectedMusic = "calming_water"
    } else if (currentMood.emotion === 'tired') {
      selectedMusic = "soft_rain"
    } else if (currentMood.emotion === 'excited') {
      selectedMusic = "grounding_earth"
    }
  }
  
  return selectedMusic
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
