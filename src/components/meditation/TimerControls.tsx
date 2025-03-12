
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerControlsProps {
  isRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  isLoading?: boolean;
}

export const TimerControls = ({ 
  isRunning, 
  toggleTimer, 
  resetTimer,
  isLoading = false 
}: TimerControlsProps) => {
  return (
    <div className="flex gap-3 justify-center">
      <Button 
        onClick={toggleTimer} 
        disabled={isLoading}
        variant="default" 
        className="w-40 bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none hover:opacity-90"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : isRunning ? (
          <>
            <Pause className="mr-2 h-4 w-4" /> Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" /> {isRunning ? 'Resume' : 'Start'}
          </>
        )}
      </Button>
      
      <Button 
        onClick={resetTimer} 
        variant="outline"
        disabled={isLoading}
        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
      >
        <RotateCcw className="mr-2 h-4 w-4" /> Reset
      </Button>
    </div>
  );
};
