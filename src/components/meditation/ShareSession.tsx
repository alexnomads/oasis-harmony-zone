
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
    if (!sessionId) return;
    
    try {
      setIsSharing(true);
      
      // First ensure schema is updated
      console.log("Initiating share process for session:", sessionId);
      
      // Create the share text first
      const shareText = `I just completed a meditation session and earned points on Zen Garden! Join me on my mindfulness journey: https://yourdomain.com`;
      
      // Open Twitter share dialog
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(shareUrl, '_blank', 'width=550,height=420');
      
      // Award extra point for sharing
      try {
        const { userPoints } = await SessionService.awardSharingPoint(sessionId);
        setTotalPoints(userPoints.total_points);
        
        toast({
          title: "Thanks for sharing!",
          description: `You earned an extra point! Total: ${userPoints.total_points}`,
        });
      } catch (error) {
        console.error('Error awarding points:', error);
        // Still consider this a partial success since the share window opened
        toast({
          title: "Shared successfully!",
          description: "There was an issue awarding points. Please try again later.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error sharing session:', error);
      toast({
        title: "Error sharing session",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="default"
      className="sm:flex-1 bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none text-white hover:opacity-90"
      onClick={handleShare}
      disabled={isSharing || !sessionId}
    >
      <Share2 className="mr-2 h-4 w-4" /> {isSharing ? 'Sharing...' : 'Share on X & Earn Points'}
    </Button>
  );
};
