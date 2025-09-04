
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerControlsProps {
  isRunning: boolean;
  toggleTimer: () => void;
  resetTimer?: () => void;
  isLoading?: boolean;
  duration?: number;
  setDuration?: (duration: number) => void;
  disabled?: boolean;
}

export const TimerControls = ({ 
  isRunning, 
  toggleTimer, 
  resetTimer,
  isLoading = false,
  disabled = false
}: TimerControlsProps) => {
  return (
    <div className="flex gap-3 justify-center">
      <Button 
        onClick={toggleTimer} 
        disabled={isLoading || disabled}
        className="retro-button w-40 py-3"
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
      
      {resetTimer && (
        <Button 
          onClick={resetTimer} 
          className="retro-button opacity-60 hover:opacity-100"
          disabled={isLoading || disabled}
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      )}
    </div>
  );
};
