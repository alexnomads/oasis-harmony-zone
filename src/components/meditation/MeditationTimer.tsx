
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DurationSelector } from './DurationSelector';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { CompletedSession } from './CompletedSession';
import { ShareSession } from './ShareSession';
import { useMeditationSession } from '@/hooks/useMeditationSession';

export const MeditationTimer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    isRunning,
    time,
    sessionId,
    selectedDuration,
    setSelectedDuration,
    sessionCompleted,
    pointsEarned,
    totalPoints,
    setTotalPoints,
    formatTime,
    calculateProgress,
    toggleTimer,
    resetTimer
  } = useMeditationSession(user?.id);

  const handleShare = () => {
    // This is a simple wrapper for the ShareSession component functionality
    // to maintain compatibility with the CompletedSession component
    if (!sessionId) return;
    
    // Create the share text
    const shareText = `I just completed a meditation session and earned points on Zen Garden! Join me on my mindfulness journey: https://yourdomain.com`;
    
    // Open Twitter share dialog
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
  };

  // Handle success toast with share button
  const showSuccessToast = () => {
    if (!sessionId) return;
    
    toast({
      title: "Meditation Complete! 🎉",
      description: (
        <div className="space-y-2">
          <p>You earned {pointsEarned} points! Total: {totalPoints}</p>
          <p className="text-sm text-muted-foreground mt-1">Share on X to earn an additional point!</p>
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
            </Button>
            <ShareSession sessionId={sessionId} setTotalPoints={setTotalPoints} />
          </div>
        </div>
      ),
    });
  };

  // Show success toast when session is completed
  if (sessionCompleted && pointsEarned > 0 && !toast.current) {
    showSuccessToast();
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900/90 border-zinc-800 backdrop-blur-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
      <CardHeader>
        <CardTitle className="text-2xl text-white text-center">Meditation Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <DurationSelector 
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          isRunning={isRunning}
        />

        {sessionCompleted ? (
          <CompletedSession 
            pointsEarned={pointsEarned}
            totalPoints={totalPoints}
            resetTimer={resetTimer}
            handleShare={handleShare}
          />
        ) : (
          <>
            <TimerDisplay 
              time={time}
              isRunning={isRunning}
              calculateProgress={calculateProgress}
              formatTime={formatTime}
            />

            <TimerControls 
              isRunning={isRunning}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
