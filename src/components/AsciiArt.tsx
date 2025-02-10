import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserProfile } from "./profile/UserProfile";

const getAIResponse = (userMessage: string) => {
  const message = userMessage.toLowerCase();
  
  // Wealth and Success-related responses
  if (message.includes("money") || message.includes("wealth") || message.includes("success")) {
    return "True wealth extends beyond financial success. Let's explore how finding your authentic path and maintaining inner peace can lead to sustainable prosperity. Would you like to try a mindfulness exercise to clarify your goals?";
  }
  
  // Market and Crypto-specific responses
  else if (message.includes("market") || message.includes("price") || message.includes("crypto")) {
    return "The crypto market's volatility can be intense. Remember, your worth isn't tied to market fluctuations. Let's practice a grounding technique that helps maintain perspective during market movements. Shall we begin with a brief centering exercise?";
  }
  
  // Work-Life Balance
  else if (message.includes("overwhelmed") || message.includes("busy") || message.includes("work")) {
    return "In the fast-paced crypto world, feeling overwhelmed is common. Let's create a moment of stillness together. Close your eyes, take three deep breaths, and let's discuss how to integrate small mindful breaks into your day. What time of day do you typically feel most overwhelmed?";
  }
  
  // Mindfulness and Meditation
  else if (message.includes("meditation") || message.includes("mindful") || message.includes("peace")) {
    return "Meditation is your gateway to clarity and balanced decision-making. Let's start with a simple 60-second breath awareness practice. Focus on the natural rhythm of your breath, letting market thoughts float by like clouds. Would you like me to guide you?";
  }
  
  // Physical Wellness
  else if (message.includes("tired") || message.includes("exhausted") || message.includes("energy")) {
    return "Physical vitality is crucial for crypto professionals. Let's try an energizing breath technique: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. This 'box breathing' can help revitalize your energy. Shall we practice together?";
  }
  
  // Emotional Wellness
  else if (message.includes("stress") || message.includes("worried") || message.includes("anxiety")) {
    return "I hear the concern in your words. Remember that stress is inevitable, but burnout is preventable. Let's practice the 5-5-5 technique: breathe in for 5 seconds, hold for 5, release for 5. This can help bring you back to center. Ready to try?";
  }
  
  // Growth and Learning
  else if (message.includes("learn") || message.includes("grow") || message.includes("improve")) {
    return "Personal growth is a journey, not a destination. Your desire to learn shows wisdom. Would you like to explore some daily mindfulness practices that can support your development while maintaining balance?";
  }
  
  // Gratitude and Appreciation
  else if (message.includes("thank")) {
    return "Your commitment to self-care and growth is inspiring. Remember, small steps lead to lasting change. Is there a particular area of wellness you'd like to explore further in our next interaction?";
  }
  
  // Default Response
  else {
    return "In the dynamic world of crypto, maintaining balance is essential. I'm here to support your journey to wellness and clarity. Would you like to explore breathing techniques, meditation practices, or discuss specific challenges you're facing?";
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
