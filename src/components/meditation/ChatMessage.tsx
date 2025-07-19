import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Play, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
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

const DurationSelector: React.FC<{
  onSelect: (duration: number) => void;
  currentDuration: number;
}> = ({ onSelect, currentDuration }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const durations = [
    { value: 60, label: "1 minute", description: "Quick reset" },
    { value: 180, label: "3 minutes", description: "Short break" },
    { value: 300, label: "5 minutes", description: "Standard session" },
    { value: 600, label: "10 minutes", description: "Deep practice" },
    { value: 900, label: "15 minutes", description: "Extended session" },
    { value: 1200, label: "20 minutes", description: "Comprehensive" }
  ];

  const currentLabel = durations.find(d => d.value === currentDuration)?.label || "5 minutes";

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between bg-white/5 border-white/20 text-white hover:bg-white/10"
      >
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {currentLabel}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden z-10"
        >
          {durations.map((duration) => (
            <button
              key={duration.value}
              onClick={() => {
                onSelect(duration.value);
                setIsExpanded(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                duration.value === currentDuration ? "bg-white/10 text-vibrantPurple" : "text-white"
              }`}
            >
              <div className="font-medium">{duration.label}</div>
              <div className="text-xs text-white/70">{duration.description}</div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  index,
  isTimerRunning,
  startMeditation,
}) => {
  const [selectedDuration, setSelectedDuration] = useState(300); // Default 5 minutes

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
              <span key={j}>
                {line}
                {j < part.split("\n").length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      });
    }
    
    return content.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  const handleStartMeditation = (customRecommendation?: MeditationRecommendation) => {
    if (customRecommendation) {
      startMeditation(customRecommendation);
    } else {
      // Create a custom recommendation with selected duration
      const customRec: MeditationRecommendation = {
        type: 'mindfulness',
        duration: selectedDuration,
        title: `${Math.floor(selectedDuration / 60)}-Minute Mindfulness`,
        description: `A ${Math.floor(selectedDuration / 60)}-minute mindfulness meditation to center yourself and find inner peace.`
      };
      startMeditation(customRec);
    }
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
          
          <div className="mt-4">
            <Button
              onClick={() => handleStartMeditation(message.recommendation)}
              className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90 transition-all duration-300"
            >
              <Play className="w-4 h-4 mr-2" />
              Start {Math.floor(message.recommendation.duration / 60)}-Minute Session
            </Button>
          </div>
        </motion.div>
      )}
      
      {message.showMeditationStart && !isTimerRunning && !message.recommendation && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4"
        >
          <div className="space-y-3">
            <DurationSelector 
              onSelect={setSelectedDuration}
              currentDuration={selectedDuration}
            />
            <Button
              onClick={() => handleStartMeditation()}
              className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
            >
              <Play className="w-4 h-4 mr-2" />
              Start {Math.floor(selectedDuration / 60)}-Minute Meditation
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};