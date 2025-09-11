
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
  console.log('Crypto-Stress Bot v2 - Protocol Activated');
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, userContext } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Processing crypto-stress command:', {
      message: message.toLowerCase().trim(),
      hasUserContext: !!userContext
    });

    // Use crypto-stress response protocol directly
    const response = await getCryptoStressResponse(message.toLowerCase().trim());

    console.log('Crypto-stress response generated:', response.substring(0, 50) + '...');

    return new Response(
      JSON.stringify({ 
        response,
        protocol: 'crypto-stress-v2'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in crypto-stress bot:', error);
    
    return new Response(
      JSON.stringify({ 
        response: "System error. Use: !stress, !focus, or !tired for guidance.",
        error: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

// Crypto-stress response protocol with live market data
async function getCryptoStressResponse(command: string): Promise<string> {
  // Get live market condition from CoinMarketCap
  const marketCondition = await getMarketCondition();
  
  const responses = {
    '!stress': {
      volatile: "Volatility spike. ACTION: Close tabs → Deep breath → Risk check only. Circuit breaker time. Type 'done' +7 $ROJ for reset.",
      up: "Bull run stress. ACTION: Step back → Breathe → Cap position size. Greed guard activated. Type 'done' +6 $ROJ for clarity.",
      down: "Bear market strain. ACTION: Charts off → Breath work → Focus fundamentals. This builds character. Type 'done' +8 $ROJ for resilience.",
      stable: "Stress detected. ACTION: Phone down → 3 breaths → Check your why. Reset your perspective. Type 'done' +5 $ROJ for center."
    },
    '!focus': {
      volatile: "Chaos mode. ACTION: One chart only → Laser focus → Single setup. Precision over noise. Type 'done' +6 $ROJ for clarity.",
      up: "FOMO fog. ACTION: Strategy review → Breathe → Stick to plan. Discipline wins long-term. Type 'done' +5 $ROJ for discipline.",
      down: "Bear focus needed. ACTION: Zoom out → Breathe → Accumulation mindset. Think years not days. Type 'done' +7 $ROJ for vision.",
      stable: "Focus reset. ACTION: Clear workspace → Deep breath → Primary goal only. Laser beam mindset. Type 'done' +4 $ROJ for focus."
    },
    '!tired': {
      volatile: "Market fatigue. ACTION: Step away → Power nap → No trades tired. Rest protects capital. Type 'done' +8 $ROJ for wisdom.",
      up: "Bull exhaustion. ACTION: Secure profits → Rest → Let winners run. Fatigue kills gains. Type 'done' +6 $ROJ for energy.",
      down: "Bear drain. ACTION: Close apps → Rest → Tomorrow's opportunity. Recharge your batteries. Type 'done' +7 $ROJ for recovery.",
      stable: "Energy low. ACTION: 15min break → Breathe → Hydrate well. Your mind needs fuel. Type 'done' +5 $ROJ for vitality."
    }
  };

  const response = responses[command]?.[marketCondition];
  return response || "I respond only to: !stress, !focus, !tired. These commands provide targeted crypto trading psychology support.";
}

// CoinMarketCap integration with caching
let marketCache = { condition: 'stable' as 'up' | 'down' | 'stable' | 'volatile', lastUpdate: 0 };

async function getMarketCondition(): Promise<'up' | 'down' | 'stable' | 'volatile'> {
  // Rate limiting: only update every 5 minutes
  if (Date.now() - marketCache.lastUpdate < 300000) {
    return marketCache.condition;
  }
  
  try {
    console.log('Fetching market data from CoinMarketCap...');
    
    const response = await fetch('https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=10&convert=USD', {
      headers: {
        'X-CMC_PRO_API_KEY': 'f781be7e-9c4c-44f5-8d0e-669bb1593323',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const btc = data.data[0]; // Bitcoin as market indicator
      const changePercent = btc.quote.USD.percent_change_24h;
      
      let condition: 'up' | 'down' | 'stable' | 'volatile' = 'stable';
      
      if (Math.abs(changePercent) > 5) {
        condition = 'volatile';
      } else if (changePercent > 2) {
        condition = 'up';
      } else if (changePercent < -2) {
        condition = 'down';
      } else {
        condition = 'stable';
      }
      
      marketCache = { condition, lastUpdate: Date.now() };
      console.log(`Market condition updated: ${condition} (BTC: ${changePercent.toFixed(2)}%)`);
      
      return condition;
    }
  } catch (error) {
    console.log('Market data unavailable, using cached/stable condition:', error);
  }
  
  return marketCache.condition;
}

