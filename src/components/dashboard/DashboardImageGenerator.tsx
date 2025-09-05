import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SharingService } from '@/lib/services/sharingService';

interface ChartDataPoint {
  date: string;
  dateDisplay: string;
  sessions: number;
  totalMinutes: number;
}

interface DashboardImageGeneratorProps {
  userEmail: string;
  totalPoints: number;
  streak: number;
  totalSessions: number;
  totalDuration: string;
  profileUrl?: string;
  chartData?: ChartDataPoint[];
  selectedPeriod?: 7 | 14 | 30;
}

export const DashboardImageGenerator = ({
  userEmail,
  totalPoints,
  streak,
  totalSessions,
  totalDuration,
  profileUrl,
  chartData,
  selectedPeriod
}: DashboardImageGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log('DashboardImageGenerator props:', { 
    userEmail, 
    totalPoints, 
    streak, 
    totalSessions, 
    totalDuration, 
    profileUrl, 
    selectedPeriod 
  });

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas dimensions for social media sharing (1200x800 for better chart visibility)
    canvas.width = 1200;
    canvas.height = 800;

    // Create cyberpunk gradient background matching the site's theme
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#000000'); // vhs-black
    bgGradient.addColorStop(0.3, '#1a0d1a'); // deep purple-black
    bgGradient.addColorStop(0.6, '#2d1b2d'); // medium purple
    bgGradient.addColorStop(1, '#4a1a4a'); // darker purple
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add cyberpunk border with neon glow effect
    const borderGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    borderGradient.addColorStop(0, '#9C27B0'); // vibrantPurple
    borderGradient.addColorStop(0.5, '#FF00E5'); // neon-magenta
    borderGradient.addColorStop(1, '#FF8A00'); // vibrantOrange
    ctx.fillStyle = borderGradient;
    ctx.fillRect(0, 0, canvas.width, 8);

    // Add title with cyberpunk styling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText('MY MEDITATION JOURNEY', canvas.width / 2, 60);

    // Add subtitle with user and period info
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px Space Mono, monospace';
    const displayName = userEmail.split('@')[0];
    ctx.fillText(`@${displayName} • Last ${selectedPeriod || 30} Days • Rose of Jericho`, canvas.width / 2, 90);

    // Chart area configuration
    const chartX = 60;
    const chartY = 120;
    const chartWidth = canvas.width - 120;
    const chartHeight = 280;

    // Draw chart background with CRT frame effect
    ctx.fillStyle = 'rgba(39, 39, 42, 0.9)';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    
    // Chart border with neon glow
    ctx.strokeStyle = '#9C27B0';
    ctx.lineWidth = 3;
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
    
    // Add glow effect
    ctx.shadowColor = '#9C27B0';
    ctx.shadowBlur = 20;
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
    ctx.shadowBlur = 0;

    // Chart title and subtitle - show always
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Space Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`Meditation Frequency - ${selectedPeriod || 30} Days`, chartX + 20, chartY - 10);
    
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '14px Space Mono';
    ctx.fillText('Sessions per day', chartX + 20, chartY + 25);

    // Draw the meditation frequency chart
    if (chartData && chartData.length > 0) {
      const maxSessions = Math.max(...chartData.map(d => d.sessions), 1);
      
      // Draw grid lines first
      ctx.strokeStyle = 'rgba(161, 161, 170, 0.3)';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const gridY = chartY + chartHeight - 40 - (i * (chartHeight - 80)) / 4;
        ctx.beginPath();
        ctx.moveTo(chartX + 40, gridY);
        ctx.lineTo(chartX + chartWidth - 40, gridY);
        ctx.stroke();
      }
      
      // Vertical grid lines
      const visibleData = chartData.slice(-Math.min(chartData.length, 15)); // Show max 15 data points for readability
      for (let i = 0; i < visibleData.length; i++) {
        const gridX = chartX + 40 + (i * (chartWidth - 80)) / Math.max(visibleData.length - 1, 1);
        ctx.beginPath();
        ctx.moveTo(gridX, chartY + 40);
        ctx.lineTo(gridX, chartY + chartHeight - 40);
        ctx.stroke();
      }

      // Calculate data points for the visible data
      const dataPoints = visibleData.map((point, index) => {
        const x = chartX + 40 + (index * (chartWidth - 80)) / Math.max(visibleData.length - 1, 1);
        const normalizedSessions = point.sessions / maxSessions;
        const y = chartY + chartHeight - 40 - (normalizedSessions * (chartHeight - 80));
        return { x, y, sessions: point.sessions, date: point.dateDisplay };
      });

      // Draw connecting lines if we have multiple points
      if (dataPoints.length > 1) {
        const lineGradient = ctx.createLinearGradient(chartX, 0, chartX + chartWidth, 0);
        lineGradient.addColorStop(0, '#9C27B0');
        lineGradient.addColorStop(1, '#FF8A00');
        
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(dataPoints[0].x, dataPoints[0].y);
        for (let i = 1; i < dataPoints.length; i++) {
          ctx.lineTo(dataPoints[i].x, dataPoints[i].y);
        }
        ctx.stroke();
      }

      // Draw data points with glow
      dataPoints.forEach(point => {
        if (point.sessions > 0) {
          // Outer glow
          ctx.fillStyle = '#FF8A00';
          ctx.shadowColor = '#FF8A00';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Inner core
          ctx.fillStyle = '#9C27B0';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Add Y-axis labels
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px Space Mono';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const value = Math.round((i * maxSessions) / 4);
        const labelY = chartY + chartHeight - 40 - (i * (chartHeight - 80)) / 4;
        ctx.fillText(value.toString(), chartX + 35, labelY + 4);
      }
      
      // Add some sample X-axis labels
      ctx.textAlign = 'center';
      const labelInterval = Math.max(1, Math.floor(visibleData.length / 5));
      visibleData.forEach((point, index) => {
        if (index % labelInterval === 0) {
          const x = chartX + 40 + (index * (chartWidth - 80)) / Math.max(visibleData.length - 1, 1);
          ctx.fillText(point.dateDisplay, x, chartY + chartHeight - 15);
        }
      });
      
    } else {
      // Show "No data" message if no chart data
      ctx.fillStyle = '#666';
      ctx.font = '16px Space Mono';
      ctx.textAlign = 'center';
      ctx.fillText('No meditation data available', chartX + chartWidth / 2, chartY + chartHeight / 2);
      
      // Draw empty grid anyway for visual consistency
      ctx.strokeStyle = 'rgba(161, 161, 170, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const gridY = chartY + 40 + (i * (chartHeight - 80)) / 4;
        ctx.beginPath();
        ctx.moveTo(chartX + 40, gridY);
        ctx.lineTo(chartX + chartWidth - 40, gridY);
        ctx.stroke();
      }
    }

    // Stats cards layout - positioned below the chart
    const cardY = chartY + chartHeight + 40;
    const cardWidth = 240;
    const cardHeight = 100;
    const cardSpacing = 40;
    const totalCardsWidth = (4 * cardWidth) + (3 * cardSpacing);
    const startX = (canvas.width - totalCardsWidth) / 2;

    // Helper function to draw cyberpunk stat card
    const drawStatCard = (x: number, y: number, icon: string, value: string, label: string, color: string) => {
      // Card background with CRT effect
      ctx.fillStyle = 'rgba(39, 39, 42, 0.95)';
      ctx.fillRect(x, y, cardWidth, cardHeight);
      
      // Neon border
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cardWidth, cardHeight);
      
      // Glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(x, y, cardWidth, cardHeight);
      ctx.shadowBlur = 0;

      // Icon with glow
      ctx.fillStyle = color;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
      ctx.fillText(icon, x + 40, y + 35);
      ctx.shadowBlur = 0;

      // Value with cyberpunk font
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Space Mono, monospace';
      ctx.textAlign = 'left';
      const maxWidth = cardWidth - 90;
      let fontSize = 22;
      ctx.font = `bold ${fontSize}px Space Mono, monospace`;
      
      while (ctx.measureText(value).width > maxWidth && fontSize > 14) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px Space Mono, monospace`;
      }
      
      ctx.fillText(value, x + 65, y + 35);

      // Label
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px Space Mono, monospace';
      ctx.fillText(label.toUpperCase(), x + 65, y + 55);
    };

    // Draw stat cards in a single row
    console.log('Drawing stat cards with streak value:', streak);
    drawStatCard(startX, cardY, '🏆', totalPoints.toFixed(1), 'ROJ Points', '#FF00E5');
    drawStatCard(startX + cardWidth + cardSpacing, cardY, '🔥', `${streak}`, 'Day Streak', '#FF8A00');
    drawStatCard(startX + (cardWidth + cardSpacing) * 2, cardY, '📅', totalSessions.toString(), 'Sessions', '#00FFFF');
    drawStatCard(startX + (cardWidth + cardSpacing) * 3, cardY, '⏱️', totalDuration, 'Total Time', '#00FF88');

    // Footer with logo and branding
    const footerY = cardY + cardHeight + 30;
    
    // Add website URL and call to action
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROSEOFJERICHO.XYZ', canvas.width / 2, footerY + 20);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '18px Space Mono, monospace';
    ctx.fillText('JOIN THE DIGITAL MEDITATION REVOLUTION', canvas.width / 2, footerY + 45);

    // Add ROJ logo with glow effect
    const logo = new Image();
    logo.onload = () => {
      const logoSize = 50;
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = footerY - 40;
      
      // Add glow behind logo
      ctx.shadowColor = '#9C27B0';
      ctx.shadowBlur = 20;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      ctx.shadowBlur = 0;
    };
    logo.src = '/lovable-uploads/a707377f-d19b-40cc-a022-c7baa7bbced8.png';

    return canvas;
  }, [userEmail, totalPoints, streak, totalSessions, totalDuration, profileUrl, chartData, selectedPeriod]);

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

  const handleShareTwitter = useCallback(async () => {
    const canvas = generateImage();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Try to share using Web Share API with image
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'meditation-journey.png', { type: 'image/png' })] })) {
        try {
          const displayName = userEmail.split('@')[0];
          const text = `🧘‍♀️ Check out my meditation journey on @ROJOasis! 
      
📊 ${totalPoints.toFixed(1)} points earned
🔥 ${streak} day streak
📅 ${totalSessions} sessions completed
⏱️ ${totalDuration} of mindfulness

Join me at roseofjericho.xyz${profileUrl ? `\n${profileUrl}` : ''}

#Meditation #Mindfulness #RoseOfJericho`;

          await navigator.share({
            text,
            files: [new File([blob], 'meditation-journey.png', { type: 'image/png' })]
          });
          return;
        } catch (error) {
          console.log('Native share failed, falling back to Twitter intent');
        }
      }

      // Fallback to Twitter intent URL with unified sharing service
      await SharingService.shareOnX({
        type: 'journey_summary',
        userEmail,
        stats: {
          totalPoints,
          streak,
          totalSessions,
          totalDuration
        }
      });
      
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
      
      <div className="space-y-3">
        <Button
          onClick={handleDownload}
          className="w-full retro-button"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Journey Image
        </Button>
        
        {/* Share button - moved to less prominent position */}
        <Button
          onClick={handleShareTwitter}
          variant="outline"
          size="sm"
          className="w-full text-xs opacity-70 hover:opacity-100 border-white/20 text-white/70 hover:bg-white/10"
        >
          <Share2 className="mr-2 h-3 w-3" />
          Share on X
        </Button>
      </div>
    </div>
  );
};