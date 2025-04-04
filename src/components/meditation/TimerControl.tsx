
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerControlProps {
  timeRemaining: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

export const TimerControl = ({ 
  timeRemaining, 
  isTimerRunning, 
  toggleTimer, 
  resetTimer, 
  formatTime 
}: TimerControlProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="px-3 py-1 bg-white/10 rounded-md text-white text-xs sm:text-sm">
        {formatTime(timeRemaining)}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        className="border-white/20 text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
        onClick={toggleTimer}
      >
        {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="border-white/20 text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
        onClick={resetTimer}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
