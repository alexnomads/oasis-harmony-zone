
import React, { useState } from "react";
import { ChatMessage, MessageType } from "./ChatMessage";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { MeditationRecommendation } from "@/lib/services/meditationAgentService";
import { DurationSelector } from "./DurationSelector";

interface ChatInterfaceProps {
  messages: MessageType[];
  isTyping: boolean;
  isTimerRunning: boolean;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  startMeditation: (recommendation?: MeditationRecommendation) => void;
  onSubmit: (e: React.FormEvent, message: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isTyping,
  isTimerRunning,
  selectedDuration,
  setSelectedDuration,
  startMeditation,
  onSubmit,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    
    onSubmit(e, inputValue);
    setInputValue("");
  };

  // Quick response suggestions
  const quickResponses = [
    "I'm feeling stressed about the market",
    "Need help focusing on my trades",
    "Feeling tired after chart watching",
    "Market volatility is making me anxious"
  ];

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
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-sm">thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Duration Selector */}
      {!isTimerRunning && (
        <div className="mb-4">
          <h3 className="text-white/80 text-sm mb-2 text-center">Choose Meditation Duration</h3>
          <DurationSelector
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            isRunning={isTimerRunning}
          />
        </div>
      )}

      {/* Quick response suggestions */}
      {!isTyping && !isTimerRunning && messages.length < 3 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {quickResponses.map((response, index) => (
            <button
              key={index}
              onClick={() => {
                setInputValue(response);
                // Use setTimeout to allow the UI to update before submitting
                setTimeout(() => {
                  const event = new Event('submit') as unknown as React.FormEvent;
                  onSubmit(event, response);
                }, 100);
              }}
              className="text-xs bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-full text-white/80"
            >
              {response}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="How are you feeling today?"
          disabled={isTyping || isTimerRunning}
          className={`w-full bg-white/10 rounded-full px-4 pr-16 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-softPurple transition-opacity ${
            isTyping || isTimerRunning ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        <button
          type="submit"
          disabled={isTyping || isTimerRunning || !inputValue.trim()}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm transition-all ${
            isTyping || isTimerRunning || !inputValue.trim()
              ? "opacity-50 cursor-not-allowed"
              : "hover:opacity-90"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </>
  );
};
