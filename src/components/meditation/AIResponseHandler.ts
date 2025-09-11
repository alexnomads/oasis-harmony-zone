
// Market intelligence tracking
let marketCondition: 'up' | 'down' | 'stable' | 'volatile' = 'stable';
let lastMarketUpdate = 0;
let pendingRewards: Map<string, { points: number; benefit: string; timestamp: number }> = new Map();

// CoinMarketCap API integration
const updateMarketCondition = async () => {
  // Rate limiting: only update every 5 minutes
  if (Date.now() - lastMarketUpdate < 300000) return;
  
  try {
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
      
      if (Math.abs(changePercent) > 5) {
        marketCondition = 'volatile';
      } else if (changePercent > 2) {
        marketCondition = 'up';
      } else if (changePercent < -2) {
        marketCondition = 'down';
      } else {
        marketCondition = 'stable';
      }
      
      lastMarketUpdate = Date.now();
    }
  } catch (error) {
    console.log('Market data unavailable, using stable condition');
    marketCondition = 'stable';
  }
};

const getCryptoStressResponse = (command: string): string => {
  updateMarketCondition(); // Update market condition in background
  
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
  return response || "Command not recognized. Use: !stress, !focus, or !tired for guidance.";
};

const handleDoneVerification = (userId: string): string => {
  const pending = pendingRewards.get(userId);
  if (!pending) {
    return "No active reward pending. Use !stress, !focus, or !tired first.";
  }

  // Check if within 5-minute window
  if (Date.now() - pending.timestamp > 300000) {
    pendingRewards.delete(userId);
    return "Reward window expired. Start fresh with a new command.";
  }

  // Award the points and clear pending
  pendingRewards.delete(userId);
  
  // Award points through existing system
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('awardPoints', {
      detail: { points: pending.points, source: 'crypto_stress_bot' }
    }));
  }

  return `✅ +${pending.points} $ROJ! ${pending.benefit}`;
};

const getAIResponse = (userMessage: string, userId?: string) => {
  const message = userMessage.toLowerCase().trim();
  
  // Handle 'done' verification
  if (message === 'done' && userId) {
    return handleDoneVerification(userId);
  }
  
  // Check for valid commands (case-insensitive)
  if (message === '!stress' || message === '!focus' || message === '!tired') {
    const response = getCryptoStressResponse(message);
    
    // Extract reward info and store as pending
    if (userId && response.includes('+')) {
      const pointsMatch = response.match(/\+(\d+) \$ROJ for (\w+)/);
      if (pointsMatch) {
        const points = parseInt(pointsMatch[1]);
        const benefit = pointsMatch[2];
        const benefits = {
          reset: "Your clarity just improved your next trade.",
          clarity: "Mental sharpness leads to better decisions.",
          resilience: "Strength through adversity builds wealth.",
          center: "Balanced traders make profitable trades.",
          discipline: "Self-control is your trading edge.",
          vision: "Long-term thinking creates lasting wealth.",
          focus: "Concentrated attention finds opportunities.",
          wisdom: "Smart rest prevents costly mistakes.",
          energy: "Fresh mind spots profitable setups.",
          recovery: "Recharged traders see clearly.",
          vitality: "Peak performance requires peak condition."
        };
        
        pendingRewards.set(userId, {
          points,
          benefit: benefits[benefit] || "Your mindset upgrade improves trading performance.",
          timestamp: Date.now()
        });
      }
    }
    
    return response;
  }

  // Default response for non-commands
  return "I respond only to: !stress, !focus, !tired. These commands provide targeted crypto trading psychology support.";
};

export default getAIResponse;
