
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { SessionService } from '@/lib/services/sessionService';
import { useAuth } from '@/contexts/AuthContext';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDurationDetails } from '@/lib/utils/timeFormat';
import type { MeditationType } from '@/types/database';
import { DurationSelector } from './DurationSelector';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { CompletedSession } from './CompletedSession';

export const MeditationTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(300); // 5 minutes in seconds
  const [meditationType] = useState<MeditationType>('mindfulness');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    return (time / selectedDuration) * 100;
  };

  const handleComplete = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { session, userPoints } = await SessionService.completeSession(sessionId, time);
      setPointsEarned(session.points_earned);
      setTotalPoints(userPoints.total_points);
      setSessionCompleted(true);
      toast({
        title: "Meditation Complete! 🎉",
        description: (
          <div className="space-y-2">
            <p>You earned {session.points_earned} points! Total: {userPoints.total_points}</p>
            <p className="text-sm text-muted-foreground mt-1">Share on X to earn an additional point!</p>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none"
                onClick={() => handleShare()}
              >
                <Share2 className="mr-2 h-4 w-4" /> Share & Earn
              </Button>
            </div>
          </div>
        ),
      });
      setIsRunning(false);
    } catch (error) {
      toast({
        title: "Error completing session",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [sessionId, time, toast, navigate]);

  const handleShare = async () => {
    if (!sessionId) return;
    
    try {
      // Award extra point for sharing
      const { userPoints } = await SessionService.awardSharingPoint(sessionId);
      setTotalPoints(userPoints.total_points);
      
      // Create the share text
      const shareText = `I just completed a ${formatDurationDetails(time)} meditation session and earned points on Zen Garden! Join me on my mindfulness journey: https://yourdomain.com`;
      
      // Open Twitter share dialog
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(shareUrl, '_blank', 'width=550,height=420');
      
      toast({
        title: "Thanks for sharing!",
        description: `You earned an extra point! Total: ${userPoints.total_points}`,
      });
    } catch (error) {
      toast({
        title: "Error sharing session",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          // Only trigger completion when time is >= selectedDuration (instead of >)
          if (newTime === selectedDuration) {
            setIsRunning(false);
            handleComplete();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, selectedDuration, handleComplete]);

  useEffect(() => {
    if (isRunning) {
      const handleInteraction = () => {
        toast({
          title: "Movement Detected",
          description: "Please remain still during meditation. Moving or switching windows may affect your points.",
          variant: "destructive",
        });
      };

      window.addEventListener('mousemove', handleInteraction);
      window.addEventListener('blur', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);
      window.addEventListener('touchmove', handleInteraction);

      return () => {
        window.removeEventListener('mousemove', handleInteraction);
        window.removeEventListener('blur', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('touchmove', handleInteraction);
      };
    }
  }, [isRunning, toast]);

  const startMeditation = async () => {
    try {
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to start meditating",
          variant: "destructive",
        });
        return;
      }

      const session = await SessionService.startSession(user.id, meditationType);
      setSessionId(session.id);
      setIsRunning(true);
      toast({
        title: "Meditation Started",
        description: "Find a comfortable position and focus on your breath",
      });
    } catch (error) {
      toast({
        title: "Error starting session",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleTimer = () => {
    if (!isRunning && !sessionId) {
      startMeditation();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
    setSessionId(null);
    setSessionCompleted(false);
    setPointsEarned(0);
  };

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
