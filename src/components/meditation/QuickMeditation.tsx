
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Play, Shield } from "lucide-react";
import { SessionService } from "@/lib/services/sessionService";
import { DurationSelector } from "./DurationSelector";
import { MeditationTimer } from "./MeditationTimer";
import { ImmersiveMeditationOverlay } from "./ImmersiveMeditationOverlay";
import { useWakeLock } from "@/hooks/useWakeLock";
import { usePet } from "@/hooks/usePet";

export const QuickMeditation: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { pet, isLoading: petLoading, getCurrentMood, getPetEmotion } = usePet(user?.id);
  const [showImmersiveOverlay, setShowImmersiveOverlay] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(300); // Default 5 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(selectedDuration);
  const [totalDuration, setTotalDuration] = useState(selectedDuration);
  const {
    isWakeLockActive,
    isSupported,
    requestWakeLock,
    releaseWakeLock
  } = useWakeLock();

  // Audio references
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);

  // Focus monitoring
  const [focusLost, setFocusLost] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [hasMovement, setHasMovement] = useState(false);
  const [lastActiveTimestamp, setLastActiveTimestamp] = useState<Date | null>(null);

  // Initialize audio elements
  useEffect(() => {
    startSoundRef.current = new Audio('/meditation-start.mp3');
    endSoundRef.current = new Audio('/meditation-end.mp3');
    if (startSoundRef.current) startSoundRef.current.volume = 0.7;
    if (endSoundRef.current) endSoundRef.current.volume = 0.7;

    // Preload audio files
    startSoundRef.current?.load();
    endSoundRef.current?.load();
    return () => {
      startSoundRef.current = null;
      endSoundRef.current = null;
    };
  }, []);

  const startMeditation = useCallback(async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start a meditation session and earn points.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Reset focus tracking metrics
      setFocusLost(0);
      setWindowBlurs(0);
      setHasMovement(false);
      setLastActiveTimestamp(new Date());

      // Create session in database
      const session = await SessionService.startSession(user.id, 'mindfulness');
      setSessionId(session.id);
      setIsTimerRunning(true);
      setShowImmersiveOverlay(true);
      setTimeRemaining(selectedDuration);
      setTotalDuration(selectedDuration);

      // Request wake lock to prevent screen from turning off
      const wakeLockAcquired = await requestWakeLock();
      if (wakeLockAcquired && isSupported) {
        toast({
          title: "Screen Sleep Prevented",
          description: "Your screen will stay on during meditation."
        });
      }

      // Play start sound
      await playSound(startSoundRef);

      // Display duration in the appropriate format (30 seconds or X minutes)
      const displayDuration = selectedDuration === 30 ? "30-second" : `${Math.floor(selectedDuration / 60)}-minute`;
      toast({
        title: "Meditation Started",
        description: `Starting ${displayDuration} mindfulness meditation.`
      });
    } catch (error) {
      console.error('Error starting meditation session:', error);
      toast({
        title: "Failed to start session",
        description: "There was an error starting your meditation session. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, selectedDuration, toast, requestWakeLock, isSupported]);

  // Listen for recommended meditation duration events
  useEffect(() => {
    const handleSetMeditationDuration = (event: CustomEvent) => {
      const { duration } = event.detail;
      setSelectedDuration(duration);
      // Small delay to ensure the duration is set before starting
      setTimeout(() => {
        startMeditation();
      }, 100);
    };

    window.addEventListener('setMeditationDuration', handleSetMeditationDuration as EventListener);
    
    return () => {
      window.removeEventListener('setMeditationDuration', handleSetMeditationDuration as EventListener);
    };
  }, [startMeditation]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer complete
          const duration = totalDuration;
          const distractions = {
            mouseMovements: hasMovement ? 1 : 0,
            focusLost,
            windowBlurs
          };
          handleMeditationComplete(duration, distractions);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, hasMovement, focusLost, windowBlurs, totalDuration]);

  // Focus tracking for meditation sessions
  useEffect(() => {
    if (!isTimerRunning) return;

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocusLost(prev => prev + 1);
        toast({
          title: "Focus Lost",
          description: "Please stay on this tab during meditation to earn points.",
          variant: "destructive"
        });
      }
    };

    // Track mouse movement
    const handleActivity = (event: MouseEvent | KeyboardEvent) => {
      const now = new Date();
      if (lastActiveTimestamp) {
        const timeDiff = now.getTime() - lastActiveTimestamp.getTime();
        // Consider significant movements only (more than 500ms apart)
        if (timeDiff < 500 && event instanceof MouseEvent && (Math.abs(event.movementX) > 10 || Math.abs(event.movementY) > 10)) {
          setHasMovement(true);
          toast({
            title: "Movement Detected",
            description: "Try to remain still during meditation to earn full points.",
            variant: "destructive"
          });
        }
      }
      setLastActiveTimestamp(now);
    };

    // Track window blur events (user switching to other windows)
    const handleWindowBlur = () => {
      setWindowBlurs(prev => prev + 1);
      toast({
        title: "Window Switch Detected",
        description: "Please keep this window focused during meditation to earn points.",
        variant: "destructive"
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isTimerRunning, lastActiveTimestamp, toast]);

  const playSound = async (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (!audioRef.current) return;
    try {
      // Reset to start to ensure it plays from the beginning
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const createDistractionMessage = (
    earnedPoints: number,
    distractionCount: number,
    focusLost: number,
    windowBlurs: number,
    hasMovement: boolean
  ) => {
    // If no distractions, show encouraging message
    if (distractionCount === 0) {
      return `Perfect focus! You earned the full ${earnedPoints.toFixed(1)} points. Well done on maintaining complete presence during your meditation.`;
    }

    // Create distraction details
    const distractionDetails = [];
    if (focusLost > 0) distractionDetails.push(`${focusLost} tab switch${focusLost > 1 ? 'es' : ''}`);
    if (windowBlurs > 0) distractionDetails.push(`${windowBlurs} window switch${windowBlurs > 1 ? 'es' : ''}`);
    if (hasMovement) distractionDetails.push('movement detected');

    const distractionText = distractionDetails.join(', ');

    // Encouraging message with specific feedback
    return `Great job completing your meditation! We noticed ${distractionText} during your session. You earned ${earnedPoints.toFixed(1)} points. Remember, staying present is a skill that improves with practice - each session is progress on your mindfulness journey!`;
  };


  const handleMeditationComplete = async (duration: number, distractions: {
    mouseMovements: number;
    focusLost: number;
    windowBlurs: number;
  }) => {
    if (!user || !sessionId) return;

    try {
      // Play end sound
      await playSound(endSoundRef);

      // Complete the session in the database
      const { session, userPoints } = await SessionService.completeSession(sessionId, duration, distractions);

      // Reset timer state
      setIsTimerRunning(false);
      setSessionId(null);
      setShowImmersiveOverlay(false);

      // Release wake lock
      await releaseWakeLock();

      // Calculate total distractions for messaging
      const distractionCount = distractions.mouseMovements + distractions.focusLost + distractions.windowBlurs;
      
      // Create encouraging message based on performance
      const qualityMessage = createDistractionMessage(
        session.points_earned,
        distractionCount,
        distractions.focusLost,
        distractions.windowBlurs,
        distractions.mouseMovements > 0
      );

      // Show toast notification
      toast({
        title: "Meditation Complete",
        description: `${qualityMessage} Current streak: ${userPoints.meditation_streak} days`
      });
    } catch (error) {
      console.error('Error completing meditation session:', error);
      setIsTimerRunning(false);
      setSessionId(null);

      // Release wake lock even on error
      await releaseWakeLock();
      setShowImmersiveOverlay(false);
      toast({
        title: "Session Completion Error",
        description: "There was an error saving your session. Your progress might not be recorded.",
        variant: "destructive"
      });
    }
  };

  const handleOverlayExit = () => {
    setShowImmersiveOverlay(false);
    setIsTimerRunning(false);
    setSessionId(null);
    releaseWakeLock();
  };

  const petEmotion = getPetEmotion();

  return (
    <>
      <ImmersiveMeditationOverlay
        isActive={showImmersiveOverlay}
        timeRemaining={timeRemaining}
        totalDuration={totalDuration}
        isTimerRunning={isTimerRunning}
        pet={pet}
        petEmotion={petEmotion}
        onExit={handleOverlayExit}
      />
      
      <Card className="w-full bg-black/20 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6">
          {isTimerRunning && sessionId ? (
            <div className="hidden">
              <MeditationTimer
                initialType="mindfulness"
                initialDuration={selectedDuration}
                onComplete={handleMeditationComplete}
                sessionId={sessionId}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <DurationSelector
                  selectedDuration={selectedDuration}
                  setSelectedDuration={setSelectedDuration}
                  isRunning={isTimerRunning}
                />
              </div>
              
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={startMeditation}
                    className="retro-button text-lg px-6 py-6"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {selectedDuration === 30 ? "Start 30-Second Meditation" : `Start ${Math.floor(selectedDuration / 60)}-Minute Meditation`}
                  </Button>
                </motion.div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-white/60 text-sm">
                  Stay focused to earn max points. Movement, tab switching, or leaving the page will reduce points earned.
                </p>
                {isWakeLockActive && (
                  <div className="flex items-center justify-center gap-2 text-vibrantOrange text-xs">
                    <Shield className="w-3 h-3" />
                    <span>Screen sleep prevented - meditation protected</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
