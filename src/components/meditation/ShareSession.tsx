
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SharingService } from '@/lib/services/sharingService';
import { useState } from 'react';

interface ShareSessionProps {
  sessionId: string | null;
  setTotalPoints: (points: number) => void;
}

export const ShareSession = ({ sessionId, setTotalPoints }: ShareSessionProps) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!sessionId) {
      return;
    }
    
    try {
      setIsSharing(true);
      
      const result = await SharingService.shareOnX({
        type: 'meditation_completed',
        sessionId
      });
      
      if (result.success && result.totalPoints) {
        setTotalPoints(result.totalPoints);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="default"
      className="sm:flex-1 bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none text-white hover:opacity-90 py-6"
      onClick={handleShare}
      disabled={isSharing || !sessionId}
    >
      <Share2 className="mr-2 h-4 w-4" /> {isSharing ? 'Sharing...' : 'Share on X & Earn Points'}
    </Button>
  );
};
