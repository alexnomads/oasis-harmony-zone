import { SessionService } from './sessionService';
import { toast } from '@/components/ui/use-toast';

export interface ShareConfig {
  type: 'meditation_completed' | 'journey_summary';
  sessionId?: string | null;
  userEmail?: string;
  stats?: {
    totalPoints: number;
    streak: number;
    totalSessions: number;
    totalDuration: string;
  };
}

export class SharingService {
  private static generateShareText(config: ShareConfig): string {
    // Base text that's consistent across all meditation sharing
    const baseText = `I just completed a meditation session & earned points on @ROJOasis! 

Start your mindfulness journey and earn crypto on 

🧘🏼‍♂️🌹 https://oasis-harmony-zone.lovable.app`;

    // For journey summaries, we can still use the detailed stats but keep the same tone
    if (config.type === 'journey_summary' && config.stats && config.userEmail) {
      return `🧘‍♀️ Check out my meditation journey on @ROJOasis! 
      
📊 ${config.stats.totalPoints.toFixed(1)} points earned
🔥 ${config.stats.streak} day streak
📅 ${config.stats.totalSessions} sessions completed
⏱️ ${config.stats.totalDuration} of mindfulness

Start your mindfulness journey and earn crypto on 

🧘🏼‍♂️🌹 https://oasis-harmony-zone.lovable.app

#Meditation #Mindfulness #RoseOfJericho`;
    }

    // All completed meditation sessions use the same base text
    return baseText;
  }

  static async shareOnX(config: ShareConfig): Promise<{ success: boolean; pointsAwarded?: number; totalPoints?: number }> {
    try {
      const shareText = this.generateShareText(config);
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      
      // Open Twitter share dialog
      window.open(shareUrl, '_blank', 'width=550,height=420');
      
      // Award points only for completed meditation sessions
      if (config.type === 'meditation_completed' && config.sessionId) {
        try {
          const { userPoints } = await SessionService.awardSharingPoint(config.sessionId);
          
          toast({
            title: "Thanks for sharing!",
            description: `You earned an extra point! Total: ${userPoints.total_points.toFixed(1)}`,
          });
          
          return {
            success: true,
            pointsAwarded: 1,
            totalPoints: userPoints.total_points
          };
        } catch (error) {
          console.error('Error awarding sharing points:', error);
          
          toast({
            title: "Shared successfully!",
            description: "There was an issue awarding points, but your session was shared.",
            variant: "default",
          });
          
          return { success: true };
        }
      }
      
      // For journey summaries, just show success message
      toast({
        title: "Ready to share!",
        description: "Twitter opened! Share your meditation journey with the world.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sharing on X:', error);
      
      toast({
        title: "Error sharing",
        description: "Could not open Twitter. Please try again.",
        variant: "destructive",
      });
      
      return { success: false };
    }
  }

  static getShareText(config: ShareConfig): string {
    return this.generateShareText(config);
  }
}