import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SessionService } from '@/lib/services/sessionService';
import { PetService } from '@/lib/services/petService';
import type { MeditationType } from '@/types/database';
import { useWakeLock } from './useWakeLock';

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
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const toastShownRef = useRef(false);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { requestWakeLock, releaseWakeLock, isSupported } = useWakeLock();

  // Preload audio on component mount
  useEffect(() => {
    // Create and preload the audio elements
    startSoundRef.current = new Audio('/meditation-start.mp3');
    endSoundRef.current = new Audio('/meditation-end.mp3');
    
    if (startSoundRef.current) startSoundRef.current.volume = 0.4;
    if (endSoundRef.current) endSoundRef.current.volume = 0.4;
    
    // Force preload
    startSoundRef.current?.load();
    endSoundRef.current?.load();
    
    return () => {
      startSoundRef.current = null;
      endSoundRef.current = null;
    };
  }, []);

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
      // Play the end sound with forced user interaction
      if (endSoundRef.current) {
        const playPromise = endSoundRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing end sound:", error);
          });
        }
      }
    } catch (e) {
      console.error("Error playing end sound:", e);
    }

    // First complete the basic session without reflection data
    const basicCompletion = async () => {
      try {
        const { session, userPoints } = await SessionService.completeSession(
          sessionId, 
          time, 
          { mouseMovements: 0, focusLost: 0, windowBlurs: 0 }
        );
        setPointsEarned(session.points_earned);
        setTotalPoints(userPoints.total_points);
        
        // Award pet experience and currency for meditation
        if (userId) {
          try {
            await PetService.addExperience(userId, Math.floor(time / 60) * 5); // 5 XP per minute
            await PetService.addCurrency(userId, 10, 0); // 10 ROJ points for meditation
            await PetService.updatePetEvolution(userId); // Check for evolution
          } catch (petError) {
            console.error('Error updating pet after meditation:', petError);
          }
        }
        
        // Release wake lock
        await releaseWakeLock();
        setIsRunning(false);
        
        // Show reflection modal
        setShowReflectionModal(true);
        
      } catch (error) {
        toast({
          title: "Error completing session",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      }
    };

    await basicCompletion();
  }, [sessionId, time, userId, toast, releaseWakeLock]);

  const handleReflectionSave = useCallback(async (reflectionData: { emoji: string; notes: string; notes_public: boolean }) => {
    if (!sessionId) return;

    try {
      // Complete the session (no reflection data here anymore)
      await SessionService.completeSession(
        sessionId, 
        time, 
        { mouseMovements: 0, focusLost: 0, windowBlurs: 0 }
      );

      setSessionCompleted(true);
      setShowReflectionModal(false);
      
      toast({
        title: "Session Saved! 🎉",
        description: `You earned ${pointsEarned.toFixed(1)} points! Your pet gained XP too! 🌸`,
      });
      
    } catch (error) {
      toast({
        title: "Error saving reflection",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      // Still complete the session even if reflection fails
      setSessionCompleted(true);
      setShowReflectionModal(false);
    }
  }, [sessionId, time, pointsEarned, toast]);

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

      // Request wake lock to prevent screen sleep
      const wakeLockAcquired = await requestWakeLock();
      if (wakeLockAcquired && isSupported) {
        toast({
          title: "Screen Sleep Prevented",
          description: "Your screen will stay on during meditation.",
        });
      }
      
      try {
        // Play the start sound with forced user interaction
        if (startSoundRef.current) {
          const playPromise = startSoundRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Error playing start sound:", error);
            });
          }
        }
      } catch (e) {
        console.error("Error playing start sound:", e);
      }
      
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
    setShowReflectionModal(false);
    toastShownRef.current = false;
    // Release wake lock when resetting
    releaseWakeLock();
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
    showReflectionModal,
    formatTime,
    calculateProgress,
    toggleTimer,
    resetTimer,
    handleReflectionSave,
    toastShownRef,
    timeRemaining: selectedDuration - time,
    totalDuration: selectedDuration,
  };
};
