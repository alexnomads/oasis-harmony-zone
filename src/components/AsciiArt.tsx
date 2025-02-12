import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserProfile } from "./profile/UserProfile";

const getAIResponse = (userMessage: string) => {
  const message = userMessage.toLowerCase();
  
  // Wealth and Success-related responses
  if (message.includes("money") || message.includes("wealth") || message.includes("success")) {
    return "I understand your interest in financial success. The crypto world can be intense, but let's approach it mindfully. Would you like to try a 2-minute breathing exercise designed specifically for traders? This technique has helped many stay centered during market volatility. We can also explore setting balanced financial goals that align with your personal values.";
  }
  
  // Market and Crypto-specific responses
  else if (message.includes("market") || message.includes("price") || message.includes("crypto")) {
    return "Market fluctuations can be emotionally challenging. Let's practice the '5-5-5' technique: observe the market for 5 seconds, breathe deeply for 5 seconds, then reassess your emotions for 5 seconds. This helps separate market movements from emotional reactions. Would you like to explore more strategies for maintaining emotional balance during trading?";
  }
  
  // Work-Life Balance
  else if (message.includes("overwhelmed") || message.includes("busy") || message.includes("work")) {
    return "I hear that you're feeling overwhelmed. The crypto space never sleeps, but you need to. Let's create a sustainable routine together. First, try this quick reset: close your eyes, inhale for 4 counts, hold for 4, exhale for 4. How do you feel? We can then discuss setting healthy boundaries between trading and personal time.";
  }
  
  // Mindfulness and Meditation
  else if (message.includes("meditation") || message.includes("mindful") || message.includes("peace")) {
    return "Excellent choice to explore meditation! Let's start with a simple but powerful exercise: the 'Market Observer' technique. Find a comfortable position, and for just 60 seconds, imagine your thoughts about the market as clouds passing by. Don't judge them, just observe. Would you like me to guide you through this brief meditation now?";
  }
  
  // Physical Wellness
  else if (message.includes("tired") || message.includes("exhausted") || message.includes("energy")) {
    return "Screen fatigue and market-watching can be draining. Let's try an energizing technique called 'Trading Breaks': Every hour, stand up, stretch your arms overhead, take 3 deep breaths, and gently roll your shoulders. This helps prevent burnout and maintains mental clarity. Would you like more desk-friendly exercises?";
  }
  
  // Emotional Wellness
  else if (message.includes("stress") || message.includes("worried") || message.includes("anxiety")) {
    return "Managing stress in crypto trading is crucial. Let's use the 'RAIN' method: Recognize your feelings, Allow them to be there, Investigate with kindness, and Non-identify (remember: you are not your trades). Take a moment now - what emotion is strongest for you right now? We can explore it together using this framework.";
  }
  
  // Growth and Learning
  else if (message.includes("learn") || message.includes("grow") || message.includes("improve")) {
    return "Your commitment to growth is admirable. Let's combine mindfulness with learning: Before each trading session, take 3 mindful breaths and set an intention to learn, not just earn. What specific aspect of trading mindfulness would you like to develop? We can create a personalized growth plan together.";
  }
  
  // Gratitude and Appreciation
  else if (message.includes("thank")) {
    return "Your journey toward mindful trading is inspiring. Remember, every market cycle is an opportunity for growth. Would you like to explore more specific techniques or discuss another aspect of trading wellness? I'm here to support your continued development.";
  }
  
  // Sleep and Rest
  else if (message.includes("sleep") || message.includes("rest") || message.includes("insomnia")) {
    return "Quality rest is crucial for traders. Let's try the '4-7-8' breathing technique: Inhale for 4 counts, hold for 7, exhale for 8. This naturally calms your nervous system. Would you like to learn more about creating a pre-sleep routine that helps separate trading thoughts from rest time?";
  }
  
  // Focus and Concentration
  else if (message.includes("focus") || message.includes("concentrate") || message.includes("distracted")) {
    return "In the fast-paced crypto world, maintaining focus is essential. Try this: Before checking charts, take 30 seconds to mentally state your trading intention. This creates a mindful pause and improves decision-making. Would you like to explore more concentration-enhancing techniques?";
  }
  
  // Default Response
  else {
    return "Welcome to your mindful trading journey. I'm here to help you navigate the crypto markets with greater awareness and emotional balance. Would you like to explore specific techniques for trading mindfulness, stress management, or maintaining work-life balance? Feel free to ask about any aspect of wellness in trading.";
  }
};

export const AsciiArt = () => {
  const [messages, setMessages] = useState([
    { 
      role: "agent", 
      content: "Hello! I'm Rose of Jericho, your AI Wellness Agent. I'm here to help you find balance and mindfulness in the dynamic crypto world. How are you feeling today?", 
      timestamp: new Date() 
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Generate dynamic AI response based on user input
    setTimeout(() => {
      const aiResponse = {
        role: "agent",
        content: getAIResponse(inputValue),
        timestamp: new Date()
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
            <div className="flex items-center gap-3 border-b border-white/20 pb-4 mb-4">
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

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-softPurple text-white ml-auto"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="text-sm md:text-base">{message.content}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
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
