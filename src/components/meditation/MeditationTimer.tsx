
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { SessionService } from '@/lib/services/sessionService';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Pause, RefreshCw, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDurationDetails } from '@/lib/utils/timeFormat';
import type { MeditationType } from '@/types/database';

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

  const durations = [
    { label: '30 sec', value: 30 },
    { label: '1 min', value: 60 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 },
  ];

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900/90 border-zinc-800 backdrop-blur-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
      <CardHeader>
        <CardTitle className="text-2xl text-white text-center">Meditation Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-3 max-w-lg mx-auto"
        >
          {durations.map(({ label, value }) => (
            <motion.div
              key={value}
              whileHover={{ scale: isRunning ? 1 : 1.05 }}
              whileTap={{ scale: isRunning ? 1 : 0.95 }}
            >
              <Button
                variant={selectedDuration === value ? "default" : "outline"}
                className={`w-full transition-all duration-200 ${selectedDuration === value 
                  ? 'bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none text-white hover:opacity-90 shadow-lg' 
                  : 'bg-white/5 border-zinc-700 hover:bg-white/10 text-white'}`}
                onClick={() => {
                  if (!isRunning) {
                    setSelectedDuration(value);
                    setTime(0);
                  }
                }}
                disabled={isRunning}
              >
                {label}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {sessionCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
              Meditation Complete!
            </div>
            <div className="space-y-2">
              <p className="text-white">You earned {pointsEarned} points</p>
              <p className="text-white">Your total: {totalPoints} points</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="sm:flex-1 bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </Button>
              <Button
                variant="default"
                className="sm:flex-1 bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none text-white hover:opacity-90"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" /> Share on X & Earn Points
              </Button>
              <Button
                variant="outline"
                className="sm:flex-1 bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
                onClick={resetTimer}
              >
                New Session
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="text-center relative">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-vibrantPurple/20 to-vibrantOrange/20"
                  animate={{
                    scale: isRunning ? [1, 1.2, 1] : 1,
                    opacity: isRunning ? [0.2, 0.4, 0.2] : 0.2
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      strokeDasharray={`${calculateProgress() * 2.827}, 282.7`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: calculateProgress() / 100 }}
                      transition={{ duration: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--vibrant-purple)" />
                        <stop offset="100%" stopColor="var(--vibrant-orange)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
                    {formatTime(time)}
                  </div>
                </motion.div>
                {isRunning && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center text-white/40 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      times: [0, 0.5, 1]
                    }}
                  >
                    {time % 8 < 4 ? "Breathe in..." : "Breathe out..."}
                  </motion.div>
                )}
              </div>
              {isRunning && (
                <motion.p
                  className="text-white/60 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {Math.round(calculateProgress())}% complete
                </motion.p>
              )}
            </div>

            <motion.div 
              className="flex justify-center space-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className={`w-16 h-16 rounded-full transition-all duration-300 ${
                  isRunning
                    ? 'bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none text-white hover:opacity-90'
                    : 'bg-white/5 border-zinc-700 hover:bg-white/10 text-white'
                }`}
                onClick={toggleTimer}
                >
                  {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
                  onClick={resetTimer}
                  disabled={isRunning}
                >
                  <RefreshCw className="h-8 w-8" />
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
