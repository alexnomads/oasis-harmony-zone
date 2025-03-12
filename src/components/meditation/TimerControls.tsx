
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export const TimerControls = ({
  isRunning,
  toggleTimer,
  resetTimer
}: TimerControlsProps) => {
  return (
    <motion.div 
      className="flex justify-center space-x-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="icon"
          className={`w-16 h-16 rounded-full transition-all duration-300 ${
          isRunning
            ? 'bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none text-white hover:opacity-90'
            : 'bg-white/5 border-zinc-700 hover:bg-white/10 text-white'
        }`}
        onClick={toggleTimer}
        >
          {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        </Button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
          onClick={resetTimer}
          disabled={isRunning}
        >
          <RefreshCw className="h-8 w-8" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
