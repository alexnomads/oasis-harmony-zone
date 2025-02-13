import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserProfile } from "./profile/UserProfile";
import { Timer, Play, Square, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type Message = {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  showMeditationStart: boolean;
};

type SoundOption = "silent" | "forest" | "waves" | "birds";

const getAIResponse = (userMessage: string) => {
  const message = userMessage.toLowerCase();
  const responses = {
    // Market Conditions
    "market is down": `I understand this can be a challenging time. Let's practice the 'Market Cycles Meditation':
    1. Find a quiet space (2 minutes)
    2. Visualize previous market cycles - both ups and downs
    3. Practice the 'Cycle Breath':
       - Inhale: "This too shall pass"
       - Exhale: "Markets are cyclical"
    4. Remember: Winter markets build summer fortunes
    What's your longest hold through a downturn?`,

    "bull market fomo": `FOMO can cloud judgment. Let's practice 'Grounded Growth':
    1. Step away from charts (3 minutes)
    2. Emotional temperature check:
       - Rate your FOMO 1-10
       - Breathe until it reduces
    3. Review your strategy calmly
    What's triggering your FOMO right now?`,

    "bear market depression": `Bear markets test our resilience. Try this 'Hibernation Wisdom':
    1. Gratitude for dry powder
    2. Bear market breathing:
       - Inhale: "Building position"
       - Exhale: "Patience pays"
    3. Focus on accumulation mindset
    How are you using this time to grow?`,

    // Trading Psychology
    "revenge trading": `Let's transform that energy with 'Trade Transmutation':
    1. Physical reset (stand up, shake it off)
    2. Loss acceptance breathing:
       - Inhale: "Learn"
       - Exhale: "Release"
    3. Write down the lesson
    What triggered this urge?`,

    "overleveraged": `Let's center ourselves with 'Leverage Logic':
    1. Close trading apps (5 minutes)
    2. Risk reflection:
       - Breathe in peace
       - Breathe out pressure
    3. Review position sizing rules
    How can we prevent this next time?`,

    "missed": `FOMO after big moves needs care. Practice 'Abundance Awareness':
    1. Market opportunity meditation
    2. Remind yourself:
       - "There's always another trade"
       - "My time will come"
    3. Focus on next setup
    What's your next trading plan?`,

    // Investment Strategy
    "portfolio": `Let's approach this systematically with 'Balance Breath':
    1. Portfolio peace practice
    2. Asset alignment:
       - Each breath = one asset
       - Find peace with each position
    3. Make small, mindful adjustments
    What's your ideal allocation?`,

    "dca": `Dollar-cost averaging needs conviction. Try 'DCA Dharma':
    1. Zoom out meditation
    2. Strategy strengthening:
       - Inhale: "Consistent growth"
       - Exhale: "Trust the process"
    3. Review your DCA records
    How long is your DCA horizon?`,

    "altcoin": `Altcoin choices need clear minds. Practice 'Token Tranquility':
    1. Project meditation
    2. Value verification:
       - List fundamental strengths
       - Question assumptions
    3. Check conviction level
    What attracts you to this project?`,

    // Technical Analysis
    "chart": `Let's find balance with 'Pattern Peace':
    1. Chart closure (5 minutes)
    2. Pattern perspective:
       - Breathe with price waves
       - Find calm in chaos
    3. Set pattern priorities
    What patterns speak to you most?`,

    "indicator": `Simplify with 'Indicator Insight':
    1. Clear chart meditation
    2. Essential element breath:
       - Add one indicator per breath
       - Keep only what's necessary
    3. Create clean setup
    Which indicators truly help you?`,

    "timeframe": `Center yourself with 'Timeline Tranquility':
    1. Single timeframe focus
    2. Time horizon breathing:
       - Match breath to candles
       - Find your natural rhythm
    3. Choose primary timeframe
    What's your trading timeline?`,

    // Personal Growth
    "learn": `Embrace growth with 'Learning Light':
    1. Progress perspective
    2. Knowledge nurturing:
       - Celebrate small wins
       - Accept the journey
    3. Set micro-goals
    What did you learn today?`,

    "community": `Build bonds with 'Community Coherence':
    1. Engagement energy
    2. Connection cultivation:
       - Give value first
       - Build authentic bonds
    3. Join key conversations
    Where do you want to contribute?`,

    // Lifestyle Balance
    "addiction": `Find balance with 'Life Alignment':
    1. Screen sunset ritual
    2. Balance breathing:
       - Life beyond charts
       - Joy in variety
    3. Set healthy boundaries
    What brings you joy outside crypto?`,

    "sleep": `Restore rest with 'Sleep Sanctuary':
    1. Digital sunset
    2. Rest ritual:
       - No charts after dinner
       - Calming breath practice
    3. Create sleep schedule
    How's your sleep hygiene?`,

    "stress": `Navigate uncertainty with 'Stress Serenity':
    1. Immediate pause
    2. Balanced breathing:
       - Facts not fear
       - Clarity through chaos
    3. Focus on fundamentals
    What's your stress management strategy?`,

    // Market Cycles
    "top": `Navigate peaks with 'Summit Serenity':
    1. Profit peace practice
    2. Peak perspective:
       - Nothing rises forever
       - Plan don't panic
    3. Review exit strategy
    What's your top target?`,

    "bottom": `Find bottom peace with 'Base Building':
    1. Accumulation awareness
    2. Bottom breathing:
       - Patient positions
       - Value vision
    3. Set entry ladders
    How do you spot bottoms?`,

    "sideways": `Transform boredom with 'Range Recognition':
    1. Range respect ritual
    2. Consolidation calm:
       - Build during boredom
       - Prepare for breakout
    3. Range opportunity plan
    How do you handle chop?`
  };

  // Enhanced matching logic
  for (const [key, value] of Object.entries(responses)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  // Default wisdom response
  return `I sense you're seeking guidance on your crypto journey. Let's start with a mindful check-in:
  1. Take three conscious breaths
  2. Notice your current state
  3. Share what's present for you
  What specific aspect would you like to explore?`;
};

export const AsciiArt = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "agent", 
      content: "Hello! I'm Rose of Jericho, your AI Wellness Agent. Select your meditation duration and sound preference above. When you're ready, click the button below to begin.", 
      timestamp: new Date(),
      showMeditationStart: true 
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundOption, setSoundOption] = useState<SoundOption>("silent");
  const { toast } = useToast();

  useEffect(() => {
    setTimeRemaining(selectedDuration * 60);
  }, [selectedDuration]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      toast({
        title: "Meditation Complete! 🎉",
        description: `${selectedDuration} minutes have been added to your daily progress.`,
      });
      const newMessage: Message = {
        role: "agent",
        content: "Wonderful! You've completed your meditation session. How do you feel? Would you like to share your experience?",
        timestamp: new Date(),
        showMeditationStart: false
      };
      setMessages(prev => [...prev, newMessage]);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining, toast, selectedDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(selectedDuration * 60);
  };

  const startMeditation = () => {
    setIsTimerRunning(true);
    const newMessage: Message = {
      role: "agent",
      content: `Starting ${selectedDuration}-minute meditation with ${soundOption === "silent" ? "no sound" : `${soundOption} sounds`}. Find a comfortable position and close your eyes. I'll be here when you're done.`,
      timestamp: new Date(),
      showMeditationStart: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      showMeditationStart: false
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        role: "agent",
        content: getAIResponse(inputValue),
        timestamp: new Date(),
        showMeditationStart: inputValue.toLowerCase().includes("meditate") || inputValue.toLowerCase().includes("meditation")
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#9C27B0] to-[#FF8A00] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 items-stretch">
          {/* Profile Section - 50% */}
          <div className="col-span-1 h-[600px]">
            <div className="h-full bg-black/20 rounded-xl backdrop-blur-sm p-6 border border-white/20">
              <div className="h-full overflow-y-auto">
                <UserProfile />
              </div>
            </div>
          </div>

          {/* Chat Simulation Section - 50% */}
          <div className="col-span-1 bg-black/20 rounded-xl backdrop-blur-sm p-6 border border-white/20 h-[600px] flex flex-col">
            <div className="flex flex-col gap-4 border-b border-white/20 pb-4 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src="/lovable-uploads/28340a82-c555-4abe-abb5-5ceecab27f08.png"
                      alt="Rose of Jericho"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Rose of Jericho (alpha version v0.01)</h3>
                    <span className="text-white/70 text-sm">AI Wellness Agent</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-white text-xl font-mono">{formatTime(timeRemaining)}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTimer}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {isTimerRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Timer className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Timer Duration and Sound Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Duration (minutes)</label>
                  <Select 
                    value={selectedDuration.toString()}
                    onValueChange={(value) => setSelectedDuration(Number(value))}
                  >
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Sound</label>
                  <Select 
                    value={soundOption}
                    onValueChange={(value: SoundOption) => setSoundOption(value)}
                  >
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue placeholder="Select sound" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silent">Silent</SelectItem>
                      <SelectItem value="forest">Forest Sounds</SelectItem>
                      <SelectItem value="waves">Ocean Waves</SelectItem>
                      <SelectItem value="birds">Bird Songs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-softPurple text-white"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="text-sm md:text-base">{message.content}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.showMeditationStart && !isTimerRunning && (
                    <Button
                      onClick={startMeditation}
                      className="mt-2 bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Meditation
                    </Button>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-white/70"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src="/lovable-uploads/2666064f-8909-4cd1-844b-4cfbed2e83f6.png"
                      alt="Rose of Jericho"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm">typing...</div>
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="relative mt-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-white/10 rounded-full px-6 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-softPurple"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white px-6 py-2 rounded-full text-sm hover:opacity-90 transition-opacity"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
