
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChatMessage, MessageType } from "./ChatMessage";
import getAIResponse from "./AIResponseHandler";

export const SimpleChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    { 
      role: "agent", 
      content: "Hello! I'm Rose of Jericho, your AI Wellness Agent. How can I assist you with your meditation practice today?", 
      timestamp: new Date(),
      showMeditationStart: false
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newUserMessage: MessageType = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      showMeditationStart: false
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: MessageType = {
        role: "agent",
        content: getAIResponse(inputValue),
        timestamp: new Date(),
        showMeditationStart: false
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-black/20 backdrop-blur-sm border border-white/20 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
      <CardHeader className="border-b border-white/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src="/lovable-uploads/28340a82-c555-4abe-abb5-5ceecab27f08.png"
              alt="Rose of Jericho"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-white text-lg">Rose of Jericho (alpha version v0.01)</CardTitle>
            <p className="text-white/70 text-sm">AI Wellness Agent</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-[400px] flex flex-col">
        <div 
          id="chat-container"
          className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2"
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              index={index}
              isTimerRunning={false}
              startMeditation={() => {}}
            />
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
            className="w-full bg-white/10 rounded-full px-4 pr-16 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-softPurple"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </form>
      </CardContent>
    </Card>
  );
};
