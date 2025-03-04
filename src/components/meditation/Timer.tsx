
import React from "react";
import { Button } from "../ui/button";
import { Timer as TimerIcon, Play, Square } from "lucide-react";

interface TimerControlProps {
  timeRemaining: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

export const TimerControl: React.FC<TimerControlProps> = ({
  timeRemaining,
  isTimerRunning,
  toggleTimer,
  resetTimer,
  formatTime,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-white text-xl font-mono">{formatTime(timeRemaining)}</div>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTimer}
        className="border-white/20 text-white hover:bg-white/10"
      >
        {isTimerRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={resetTimer}
        className="border-white/20 text-white hover:bg-white/10"
      >
        <TimerIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
