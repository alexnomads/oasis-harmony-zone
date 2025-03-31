import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Play, Clock, Calendar } from "lucide-react";
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
  const formatMeditationContent = (content: string) => {
    if (content.includes("1.")) {
      const parts = content.split(/(\d+\.\s.*?)(?=\d+\.|$)/g).filter(Boolean);
      
      return parts.map((part, i) => {
        if (/^\d+\./.test(part)) {
          return (
            <div key={i} className="my-2 pl-2 border-l-2 border-softPurple">
              <span className="font-semibold">{part}</span>
            </div>
          );
        }
        return (
          <span key={i}>
            {part.split("\n").map((line, j) => (
              <React.Fragment key={j}>
                {line}
                {j < part.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      });
    }
    
    return content.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

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
        <div className="text-sm md:text-base">
          {formatMeditationContent(message.content)}
        </div>
        <span className="text-xs opacity-70 mt-1 inline-block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      {message.recommendation && message.role === "agent" && !isTimerRunning && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 max-w-[90%]"
        >
          <h4 className="text-white font-medium text-base bg-gradient-to-r from-vibrantPurple to-vibrantOrange bg-clip-text text-transparent">
            {message.recommendation.title}
          </h4>
          <p className="text-white/80 text-sm mt-2">
            {message.recommendation.description}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center text-white/70 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor(message.recommendation.duration / 60)} minutes
            </div>
            <div className="flex items-center text-white/70 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {message.recommendation.type.replace('_', ' ')}
            </div>
          </div>
          <Button
            onClick={() => startMeditation(message.recommendation)}
            className="mt-4 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90 transition-all duration-300"
          >
            <Play className="w-4 h-4 mr-2" />
            Start This Meditation
          </Button>
        </motion.div>
      )}
      
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
