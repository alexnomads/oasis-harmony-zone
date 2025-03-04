
import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Play } from "lucide-react";

export type MessageType = {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  showMeditationStart: boolean;
};

interface ChatMessageProps {
  message: MessageType;
  index: number;
  isTimerRunning: boolean;
  startMeditation: () => void;
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
      className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
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
      {message.showMeditationStart && !isTimerRunning && (
        <Button
          onClick={startMeditation}
          className="mt-2 bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Meditation
        </Button>
      )}
    </motion.div>
  );
};
