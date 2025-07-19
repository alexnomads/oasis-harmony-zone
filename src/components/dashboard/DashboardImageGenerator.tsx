import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface DashboardImageGeneratorProps {
  userEmail: string;
  totalPoints: number;
  streak: number;
  totalSessions: number;
  totalDuration: string;
  profileUrl?: string;
}

export const DashboardImageGenerator = ({
  userEmail,
  totalPoints,
  streak,
  totalSessions,
  totalDuration,
  profileUrl
}: DashboardImageGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas dimensions for Twitter-friendly image (1200x675)
    canvas.width = 1200;
    canvas.height = 675;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#18181b'); // zinc-900
    gradient.addColorStop(1, '#000000'); // black
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add purple/orange accent border
    const borderGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    borderGradient.addColorStop(0, '#8b5cf6'); // vibrantPurple
    borderGradient.addColorStop(1, '#f97316'); // vibrantOrange
    ctx.fillStyle = borderGradient;
    ctx.fillRect(0, 0, canvas.width, 8);

    // Add logo area background
    ctx.fillStyle = 'rgba(39, 39, 42, 0.8)'; // zinc-800 with opacity
    ctx.fillRect(40, 40, canvas.width - 80, 120);

    // Add title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('My Meditation Journey', canvas.width / 2, 115);

    // Add subtitle with user email
    ctx.fillStyle = '#a1a1aa'; // zinc-400
    ctx.font = '22px Arial';
    const displayName = userEmail.split('@')[0];
    ctx.fillText(`@${displayName} on Rose of Jericho`, canvas.width / 2, 145);

    // Stats cards layout
    const cardWidth = 240;
    const cardHeight = 130;
    const cardSpacing = 50;
    const startX = (canvas.width - (2 * cardWidth + cardSpacing)) / 2;
    const topRowY = 200;
    const bottomRowY = 360;

    // Helper function to draw stat card
    const drawStatCard = (x: number, y: number, icon: string, value: string, label: string, color: string) => {
      // Card background
      ctx.fillStyle = 'rgba(39, 39, 42, 0.9)'; // zinc-800
      ctx.fillRect(x, y, cardWidth, cardHeight);
      
      // Card border
      ctx.strokeStyle = 'rgba(161, 161, 170, 0.2)'; // zinc-400 with opacity
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cardWidth, cardHeight);

      // Icon circle background
      ctx.fillStyle = color + '20'; // color with low opacity
      ctx.beginPath();
      ctx.arc(x + 60, y + 50, 25, 0, 2 * Math.PI);
      ctx.fill();

      // Icon text (emoji)
      ctx.fillStyle = color;
      ctx.font = '26px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(icon, x + 60, y + 58);

      // Value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      const maxWidth = cardWidth - 110; // Leave space for icon and padding
      let fontSize = 28;
      ctx.font = `bold ${fontSize}px Arial`;
      
      // Reduce font size if text is too wide
      while (ctx.measureText(value).width > maxWidth && fontSize > 16) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px Arial`;
      }
      
      ctx.fillText(value, x + 85, y + 48);

      // Label
      ctx.fillStyle = '#a1a1aa'; // zinc-400
      ctx.font = '16px Arial';
      ctx.fillText(label, x + 85, y + 70);
    };

    // Draw stat cards with adjusted positions
    drawStatCard(startX, topRowY, '🏆', totalPoints.toFixed(1), 'Total Points', '#eab308'); // yellow-500
    drawStatCard(startX + cardWidth + cardSpacing, topRowY, '🔥', `${streak} days`, 'Current Streak', '#f97316'); // orange-500
    drawStatCard(startX, bottomRowY, '📅', totalSessions.toString(), 'Total Sessions', '#3b82f6'); // blue-500
    drawStatCard(startX + cardWidth + cardSpacing, bottomRowY, '⏱️', totalDuration, 'Total Time', '#10b981'); // green-500

    // Add ROJ logo
    const logo = new Image();
    logo.onload = () => {
      // Draw logo at center bottom
      const logoSize = 60;
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = 520;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      
      // Add call to action
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Join me on roseofjericho.xyz', canvas.width / 2, 610);

      // Add profile URL if provided
      if (profileUrl) {
        ctx.fillStyle = '#a1a1aa'; // zinc-400
        ctx.font = '18px Arial';
        ctx.fillText(profileUrl, canvas.width / 2, 640);
      }
    };
    logo.src = '/lovable-uploads/a707377f-d19b-40cc-a022-c7baa7bbced8.png';

    return canvas;
  }, [userEmail, totalPoints, streak, totalSessions, totalDuration, profileUrl]);

  const handleDownload = useCallback(() => {
    const canvas = generateImage();
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meditation-journey-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Image downloaded!",
        description: "Your meditation journey image has been saved.",
      });
    }, 'image/png');
  }, [generateImage]);

  const handleShareTwitter = useCallback(() => {
    const canvas = generateImage();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const displayName = userEmail.split('@')[0];
      const text = `🧘‍♀️ Check out my meditation journey on @ROJOasis! 
      
📊 ${totalPoints.toFixed(1)} points earned
🔥 ${streak} day streak
📅 ${totalSessions} sessions completed
⏱️ ${totalDuration} of mindfulness

Join me at roseofjericho.xyz${profileUrl ? `\n${profileUrl}` : ''}

#Meditation #Mindfulness #RoseOfJericho`;

      // Try to share using Web Share API with image
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'meditation-journey.png', { type: 'image/png' })] })) {
        try {
          await navigator.share({
            text,
            files: [new File([blob], 'meditation-journey.png', { type: 'image/png' })]
          });
          return;
        } catch (error) {
          console.log('Native share failed, falling back to Twitter intent');
        }
      }

      // Fallback to Twitter intent URL
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank', 'width=550,height=420');
      
      // Also trigger download for user to manually attach
      handleDownload();
      
      toast({
        title: "Ready to share!",
        description: "Twitter opened and image downloaded. Attach the image to your tweet!",
      });
    }, 'image/png');
  }, [generateImage, userEmail, totalPoints, streak, totalSessions, totalDuration, profileUrl, handleDownload]);

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        className="hidden"
        aria-hidden="true"
      />
      
      <div className="flex gap-2">
        <Button
          onClick={handleShareTwitter}
          className="flex-1 bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Journey on X
        </Button>
        
        <Button
          onClick={handleDownload}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};