
import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Play, Clock } from "lucide-react";
import { MeditationRecommendation } from "@/lib/services/meditationAgentService";

export type MessageType = {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  showMeditationStart: boolean;
  recommendation?: MeditationRecommendation;
};

interface ChatMessageProps {
  message: MessageType;
  index: number;
  isTimerRunning: boolean;
  startMeditation: (recommendation?: MeditationRecommendation) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  index,
  isTimerRunning,
  startMeditation,
}) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} mb-4`}
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
      
      {/* Display meditation recommendation if available */}
      {message.recommendation && message.role === "agent" && !isTimerRunning && (
        <div className="mt-3 bg-white/10 rounded-xl p-3 max-w-[80%]">
          <h4 className="text-white font-medium text-base">
            {message.recommendation.title}
          </h4>
          <p className="text-white/80 text-sm mt-1">
            {message.recommendation.description}
          </p>
          <div className="flex items-center mt-2 text-white/70 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {Math.floor(message.recommendation.duration / 60)} minutes
          </div>
          <Button
            onClick={() => startMeditation(message.recommendation)}
            className="mt-3 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
          >
            <Play className="w-4 h-4 mr-2" />
            Start This Meditation
          </Button>
        </div>
      )}
      
      {/* Legacy button for backward compatibility */}
      {message.showMeditationStart && !isTimerRunning && !message.recommendation && (
        <Button
          onClick={() => startMeditation()}
          className="mt-2 bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Meditation
        </Button>
      )}
    </motion.div>
  );
};
