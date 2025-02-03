import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tweet } from 'react-tweet';

export const AsciiArt = () => {
  const [messages, setMessages] = useState([
    { role: "agent", content: "Hello! I'm Rose of Jericho, your AI Wellness Agent. How can I help you with meditation today?", timestamp: new Date() },
    { role: "user", content: "I'm stressed about the current crypto market condition", timestamp: new Date(Date.now() - 2000) },
    { role: "agent", content: "I understand. Let's start with a simple breathing exercise. Would you like to try a 5-minute meditation focused on stress relief?", timestamp: new Date(Date.now() - 1000) }
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: "agent",
        content: "That's a great point. Let's focus on your breath for a moment. Take a deep breath in through your nose for 4 counts, and out through your mouth for 6 counts.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="w-full bg-gradient-to-br from-vibrantPurple to-vibrantOrange py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Tweet Section */}
          <div className="bg-black/20 rounded-xl backdrop-blur-sm p-4 border border-white/20 h-[500px] flex items-center justify-center">
            <div className="scale-[0.85] transform origin-center">
              <Tweet id="1886406346787914235" />
            </div>
          </div>

          {/* Chat Simulation Section */}
          <div className="bg-black/20 rounded-xl backdrop-blur-sm p-4 border border-white/20 h-[500px] flex flex-col">
            <div className="flex items-center gap-3 border-b border-white/20 pb-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img 
                  src="/lovable-uploads/2666064f-8909-4cd1-844b-4cfbed2e83f6.png"
                  alt="Rose of Jericho"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-white font-semibold">Rose of Jericho (alpha version v0.01)</h3>
                <span className="text-white/70 text-sm">AI Wellness Agent</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
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
                    <p className="text-sm">{message.content}</p>
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

            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-white/10 rounded-full px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-softPurple"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white px-4 py-1 rounded-full text-sm hover:opacity-90 transition-opacity"
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
