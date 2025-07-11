import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Users, MessageCircle } from 'lucide-react';

interface CommunityInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityInviteModal = ({ isOpen, onClose }: CommunityInviteModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideRoseOfJerichoInvite', 'true');
    }
    onClose();
  };

  const handleTelegramJoin = () => {
    window.open('https://t.me/RoseOfJerichoweb3', '_blank');
    handleClose();
  };

  const handleXFollow = () => {
    window.open('https://x.com/ROJOasis', '_blank');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative mx-4 w-full max-w-md rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/95 to-zinc-800/95 p-6 shadow-2xl backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-700/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Rose of Jericho Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-4 text-center">
              <h3 className="mb-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
                Join Our Mindful Community! 🧘‍♀️
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Connect with fellow meditators, share your journey, and stay updated with the latest from Rose of Jericho.
              </p>
            </div>

            {/* Community buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleTelegramJoin}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Join our Telegram Community
              </Button>
              
              <Button
                onClick={handleXFollow}
                className="w-full bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white border-0"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Follow us on X
              </Button>
            </div>

            {/* Don't show again option */}
            <div className="mt-4 flex items-center justify-center">
              <label className="flex items-center text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="mr-2 h-3 w-3 rounded border-zinc-600 bg-zinc-700 text-vibrantPurple focus:ring-vibrantPurple/50"
                />
                Don't show this again
              </label>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};