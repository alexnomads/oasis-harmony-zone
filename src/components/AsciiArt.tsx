import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const AsciiArt = () => {
  const [messages, setMessages] = useState([
    { role: "agent", content: "Hello! I'm your AI Wellness Agent. How can I help you with meditation today?", timestamp: new Date() },
    { role: "user", content: "I'm feeling stressed about work", timestamp: new Date(Date.now() - 2000) },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* ASCII Art Section */}
          <div className="font-mono text-xs sm:text-sm md:text-base whitespace-pre overflow-x-auto">
            <pre className="text-white">
              <span className="text-white">              ..ooo.</span>
              <span className="text-softOrange">{`
             .888888888.
             88"P""T"T888 8o
         o8o 8.8"8 88o."8o 8o
        88 . o88o8 8 88."8 88P"o
       88 o8 88 oo.8 888 8 888 88
       88."8o."T88P.88". 88888 88
       "888o"8888oo8888 o888 o8P"
         "88888ooo  888P".o888
           ""8P"".oooooo8888P`}</span>
              <span className="text-softPurple">{`
  .oo888ooo.    8888NICK8P8
o88888"888"88o.  "8888"".88   .oo888oo..
 8888" "88 88888.       88".o88888888"888.
 "8888o.""o 88"88o.    o8".888"888"88 "88P
   88888888o "8 8 8  .8 .8"88 8"".o888o8P
    "8888C.o8o  8 8  8" 8 o" ...o"""8888
      "88888888 " 8 .8  8   88888888888"
        "8888888o  .8o=" o8o..o(8oo88"
            "888" 88"    888888888""
                o8P       "888"""
          ...oo88
 "8oo...oo888""`}</span>
            </pre>
          </div>

          {/* Chat Simulation Section */}
          <div className="bg-black/20 rounded-xl backdrop-blur-sm p-4 border border-white/20">
            <div className="flex items-center gap-3 border-b border-white/20 pb-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vibrantPurple to-vibrantOrange flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Wellness Agent</h3>
                <span className="text-white/70 text-sm">Online</span>
              </div>
            </div>

            <div className="h-[300px] overflow-y-auto mb-4 space-y-4">
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
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-sm">AI</span>
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