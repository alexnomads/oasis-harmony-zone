
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShareSession } from './ShareSession';

interface CompletedSessionProps {
  pointsEarned: number;
  totalPoints: number;
  resetTimer: () => void;
  handleShare: () => void;
}

export const CompletedSession = ({
  pointsEarned,
  totalPoints,
  resetTimer,
  handleShare
}: CompletedSessionProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
        Meditation Complete!
      </div>
      <div className="space-y-2">
        <p className="text-white">You earned {pointsEarned} points</p>
        <p className="text-white">Your total: {totalPoints} points</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          className="sm:flex-1 bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
          onClick={() => navigate('/dashboard')}
        >
          View Dashboard
        </Button>
        <Button
          variant="default"
          className="sm:flex-1 bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none text-white hover:opacity-90"
          onClick={handleShare}
        >
          Share on X & Earn Points
        </Button>
        <Button
          variant="outline"
          className="sm:flex-1 bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
          onClick={resetTimer}
        >
          New Session
        </Button>
      </div>
    </motion.div>
  );
};
