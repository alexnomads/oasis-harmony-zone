
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShareSession } from './ShareSession';
import { CommunityInviteModal } from './CommunityInviteModal';
import { useState, useEffect } from 'react';

interface CompletedSessionProps {
  pointsEarned: number;
  totalPoints: number;
  resetTimer: () => void;
  sessionId: string | null;
  handleShare?: () => void; // Added this optional prop
}

export const CompletedSession = ({
  pointsEarned,
  totalPoints,
  resetTimer,
  sessionId
}: CompletedSessionProps) => {
  const navigate = useNavigate();
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  useEffect(() => {
    // Check if user has opted out of community invites
    const hideInvite = localStorage.getItem('hideRoseOfJerichoInvite');
    if (hideInvite === 'true') return;

    // Get session count and determine if we should show the modal
    const sessionCount = parseInt(localStorage.getItem('completedSessionCount') || '0') + 1;
    localStorage.setItem('completedSessionCount', sessionCount.toString());

    // Show modal every 3rd session, but with a delay
    if (sessionCount % 3 === 0) {
      const timer = setTimeout(() => {
        setShowCommunityModal(true);
      }, 3000); // Show 3 seconds after completion

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-10 py-4"
    >
      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
        Meditation Complete!
      </div>
      <div className="space-y-4">
        <p className="text-2xl text-white">You earned {pointsEarned.toFixed(1)} points</p>
        <p className="text-2xl text-white">Your total: {totalPoints.toFixed(1)} points</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-5 justify-center">
        <Button
          variant="outline"
          className="sm:flex-1 bg-white/5 border-zinc-700 hover:bg-white/10 text-white py-6"
          onClick={() => navigate('/dashboard')}
        >
          View Dashboard
        </Button>
        
        <ShareSession 
          sessionId={sessionId} 
          setTotalPoints={() => {}} // We'll use the existing totalPoints from parent
        />
        
        <Button
          variant="outline"
          className="sm:flex-1 bg-white/5 border-zinc-700 hover:bg-white/10 text-white py-6"
          onClick={resetTimer}
        >
          New Session
        </Button>
      </div>

      <CommunityInviteModal 
        isOpen={showCommunityModal}
        onClose={() => setShowCommunityModal(false)}
      />
    </motion.div>
  );
};
