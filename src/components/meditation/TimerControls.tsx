
import { Play, Pause, RotateCcw, Loader2, Volume2 } from 'lucide-react';
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
  // Function to manually enable audio context if browser blocks it
  const enableAudio = () => {
    // Create and play a silent audio to unlock audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create and play a quick silent sound
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 1;
    oscillator.connect(audioContext.destination);
    oscillator.start(0);
    oscillator.stop(0.001);
    
    console.log("Audio context unlocked");
  };
  
  return (
    <div className="flex gap-3 justify-center">
      <Button 
        onClick={() => {
          enableAudio(); // Try to enable audio before starting timer
          toggleTimer();
        }} 
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

      <div 
        className="ml-1 flex items-center text-zinc-500 text-xs cursor-pointer hover:text-zinc-300 transition-colors"
        onClick={enableAudio}
        title="Click to enable sounds if they're not playing"
      >
        <Volume2 className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Calming bell sounds</span>
        <span className="sm:hidden">Bells</span>
      </div>
    </div>
  );
};
