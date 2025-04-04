
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SessionService } from '@/lib/services/sessionService';
import { useState } from 'react';

interface ShareSessionProps {
  sessionId: string | null;
  setTotalPoints: (points: number) => void;
}

export const ShareSession = ({ sessionId, setTotalPoints }: ShareSessionProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!sessionId) {
      toast({
        title: "Cannot share session",
        description: "No active session to share.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSharing(true);
      
      // First open the sharing window to ensure user gets sharing functionality
      // even if the database update fails
      const shareText = `I just completed a meditation session & earned points on @ROJOasis! 
Start your mindfulness journey and earn crypto on 

🧘🏼‍♂️🌹 https://oasis-harmony-zone.lovable.app`;
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(shareUrl, '_blank', 'width=550,height=420');
      
      // Then try to award the point
      try {
        const { userPoints } = await SessionService.awardSharingPoint(sessionId);
        setTotalPoints(userPoints.total_points);
        
        toast({
          title: "Thanks for sharing!",
          description: `You earned an extra point! Total: ${userPoints.total_points.toFixed(1)}`,
        });
      } catch (error) {
        console.error('Error awarding points:', error);
        // Still consider this a success since the share window opened
        toast({
          title: "Shared successfully!",
          description: "There was an issue awarding points, but your session was shared.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error sharing session:', error);
      toast({
        title: "Error sharing session",
        description: "Could not share your session. Please try again.",
        variant: "destructive",
      });
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
