
import React, { useState } from "react";
import { ChatMessage, MessageType } from "./ChatMessage";
import { motion } from "framer-motion";

interface ChatInterfaceProps {
  messages: MessageType[];
  isTyping: boolean;
  isTimerRunning: boolean;
  startMeditation: () => void;
  onSubmit: (e: React.FormEvent, message: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isTyping,
  isTimerRunning,
  startMeditation,
  onSubmit,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    onSubmit(e, inputValue);
    setInputValue("");
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            index={index}
            isTimerRunning={isTimerRunning}
            startMeditation={startMeditation}
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
    </>
  );
};
