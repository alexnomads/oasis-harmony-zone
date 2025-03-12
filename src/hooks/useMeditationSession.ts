import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SessionService } from '@/lib/services/sessionService';
import type { MeditationType } from '@/types/database';

// Calming meditation sound URLs - using publicly available sounds
const START_GONG_SOUND = "https://freesound.org/data/previews/371/371192_5121236-lq.mp3"; // Soft Tibetan singing bowl
const END_GONG_SOUND = "https://freesound.org/data/previews/414/414096_5121236-lq.mp3"; // Gentle meditation bell

export const useMeditationSession = (userId: string | undefined) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(300); // 5 minutes in seconds
  const [meditationType] = useState<MeditationType>('mindfulness');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [soundsReady, setSoundsReady] = useState(false);
  const toastShownRef = useRef(false);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create new audio elements
    startSoundRef.current = new Audio();
    endSoundRef.current = new Audio();
    
    // Set sources
    if (startSoundRef.current) startSoundRef.current.src = START_GONG_SOUND;
    if (endSoundRef.current) endSoundRef.current.src = END_GONG_SOUND;
    
    // Set volume
    if (startSoundRef.current) startSoundRef.current.volume = 0.6;
    if (endSoundRef.current) endSoundRef.current.volume = 0.6;
    
    // Preload the sounds
    const preloadSounds = async () => {
      try {
        if (startSoundRef.current) {
          startSoundRef.current.load();
          await startSoundRef.current.play();
          startSoundRef.current.pause();
          startSoundRef.current.currentTime = 0;
        }
        
        if (endSoundRef.current) {
          endSoundRef.current.load();
          await endSoundRef.current.play();
          endSoundRef.current.pause();
          endSoundRef.current.currentTime = 0;
        }
        
        console.log("Meditation sounds preloaded successfully");
        setSoundsReady(true);
      } catch (err) {
        console.error("Error preloading sounds:", err);
        // We'll still set sounds as ready to avoid blocking meditation functionality
        setSoundsReady(true);
      }
    };
    
    preloadSounds();
    
    return () => {
      if (startSoundRef.current) {
        startSoundRef.current.pause();
        startSoundRef.current = null;
      }
      if (endSoundRef.current) {
        endSoundRef.current.pause();
        endSoundRef.current = null;
      }
    };
  }, []);

  const playSound = useCallback((soundRef: React.RefObject<HTMLAudioElement | null>) => {
    if (soundRef.current) {
      console.log("Attempting to play sound...");
      soundRef.current.currentTime = 0;
      
      // Create a promise to check if sound plays
      const playPromise = soundRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Sound playing successfully");
          })
          .catch(err => {
            console.error("Error playing sound:", err);
            // Try one more time with user interaction
            toast({
              title: "Sound Error",
              description: "Click anywhere to enable meditation sounds",
            });
          });
      }
    } else {
      console.error("Sound reference is null");
    }
  }, [toast]);

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
      console.log("Playing end meditation sound");
      playSound(endSoundRef);
      
      const { session, userPoints } = await SessionService.completeSession(sessionId, time);
      setPointsEarned(session.points_earned);
      setTotalPoints(userPoints.total_points);
      setSessionCompleted(true);
      
      toast({
        title: "Meditation Complete! 🎉",
        description: `You earned ${session.points_earned} points! Total: ${userPoints.total_points}`,
      });
      
      setIsRunning(false);
    } catch (error) {
      toast({
        title: "Error completing session",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [sessionId, time, toast, playSound]);

  const startMeditation = async () => {
    try {
      if (!userId) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to start meditating",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      
      const session = await SessionService.startSession(userId, meditationType);
      setSessionId(session.id);
      setIsRunning(true);
      
      console.log("Playing start meditation sound");
      playSound(startSoundRef);
      
      toast({
        title: "Meditation Started",
        description: "Find a comfortable position and focus on your breath",
      });
    } catch (error) {
      console.error("Failed to start meditation:", error);
      toast({
        title: "Error starting session",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    toastShownRef.current = false;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
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

  return {
    isRunning,
    time,
    sessionId,
    selectedDuration,
    setSelectedDuration,
    sessionCompleted,
    pointsEarned,
    totalPoints,
    setTotalPoints,
    isLoading,
    soundsReady,
    formatTime,
    calculateProgress,
    toggleTimer,
    resetTimer,
    toastShownRef
  };
};
