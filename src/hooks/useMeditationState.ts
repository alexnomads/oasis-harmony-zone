
import { useState, useEffect } from "react";
import { calculateSessionQuality, formatTime } from "../components/meditation/MeditationSessionManager";
import { SoundOption } from "../components/meditation/MeditationSettings";

interface MeditationStateProps {
  toast: any;
}

export const useMeditationState = ({ toast }: MeditationStateProps) => {
  const [timeRemaining, setTimeRemaining] = useState(5 * 60);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [focusLost, setFocusLost] = useState(0);
  const [lastActiveTimestamp, setLastActiveTimestamp] = useState<Date | null>(null);
  const [hasMovement, setHasMovement] = useState(false);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [sessionId] = useState(`${Date.now()}-${Math.random()}`);
  const [lastActiveWindow, setLastActiveWindow] = useState<Date>(new Date());

  useEffect(() => {
    setTimeRemaining(selectedDuration * 60);
  }, [selectedDuration]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      
      const sessionQuality = calculateSessionQuality(focusLost, windowBlurs, hasMovement);
      const rewardEarned = sessionQuality >= 0.7;

      toast({
        title: rewardEarned ? "Meditation Complete! 🎉" : "Meditation Completed with Issues",
        description: rewardEarned 
          ? `Great job! ${selectedDuration} minutes have been added to your progress and rewards earned.`
          : "Session completed but quality threshold not met. Try to maintain better focus next time.",
        variant: rewardEarned ? "default" : "destructive"
      });

      if (rewardEarned) {
        handleShareOpportunity();
      }
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining, toast, selectedDuration, focusLost, windowBlurs, hasMovement]);

  const handleShareOpportunity = () => {
    const referralCode = "ROJ123";
    const referralUrl = `https://roseofjericho.xyz/join?ref=${referralCode}`;
    
    const tweetText = encodeURIComponent(
      `I just finished a meditation on @ROJOasis and I feel better.\n\nGet rewards when you take care of yourself! ${referralUrl}`
    );
    
    if (window.confirm("Would you like to share your achievement on X (Twitter) and earn referral rewards?")) {
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
      
      toast({
        title: "Bonus Points & Referral Link Shared! 🌟",
        description: "Thank you for sharing! You've earned bonus points and will receive additional rewards when people join using your referral link!",
      });
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isTimerRunning) {
        if (document.hidden) {
          setFocusLost(prev => prev + 1);
          toast({
            title: "Focus Lost",
            description: "Please stay on this tab during meditation.",
            variant: "destructive"
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isTimerRunning, toast]);

  useEffect(() => {
    if (!isTimerRunning) return;

    const handleActivity = (event: MouseEvent | KeyboardEvent) => {
      if (isTimerRunning) {
        const now = new Date();
        if (lastActiveTimestamp) {
          const timeDiff = now.getTime() - lastActiveTimestamp.getTime();
          if (timeDiff < 500 && (
            event instanceof MouseEvent && 
            (Math.abs(event.movementX) > 10 || Math.abs(event.movementY) > 10)
          )) {
            setHasMovement(true);
            toast({
              title: "Movement Detected",
              description: "Try to remain still during meditation.",
              variant: "destructive"
            });
          }
        }
        setLastActiveTimestamp(now);
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [isTimerRunning, lastActiveTimestamp, toast]);

  useEffect(() => {
    if (!isTimerRunning) return;

    const handleWindowBlur = () => {
      if (isTimerRunning) {
        setWindowBlurs(prev => prev + 1);
        toast({
          title: "Window Switch Detected",
          description: "Please keep this window focused during meditation.",
          variant: "destructive"
        });
      }
    };

    const handleWindowFocus = () => {
      if (isTimerRunning) {
        const now = new Date();
        const timeSinceLastActive = now.getTime() - lastActiveWindow.getTime();
        
        if (timeSinceLastActive < 1000) {
          toast({
            title: "Multiple Windows Detected",
            description: "Please use only one window during meditation.",
            variant: "destructive"
          });
        }
        setLastActiveWindow(now);
      }
    };

    const checkMultipleBrowsers = () => {
      const currentSession = {
        id: sessionId,
        timestamp: Date.now(),
      };

      localStorage.setItem('meditationSession', JSON.stringify(currentSession));

      const broadcastChannel = new BroadcastChannel('meditation_channel');
      broadcastChannel.postMessage({ type: 'SESSION_CHECK', sessionId });

      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'SESSION_CHECK' && event.data.sessionId !== sessionId) {
          toast({
            title: "Multiple Browsers Detected",
            description: "Please use only one browser window for meditation.",
            variant: "destructive"
          });
          setIsTimerRunning(false);
        }
      };

      return () => broadcastChannel.close();
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    const cleanup = checkMultipleBrowsers();

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      cleanup();
    };
  }, [isTimerRunning, sessionId, lastActiveWindow, toast]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(selectedDuration * 60);
  };

  const startMeditation = (duration: number, soundOption: SoundOption) => {
    localStorage.removeItem('meditationSession');
    setTimeRemaining(duration * 60);
    setIsTimerRunning(true);
    setWindowBlurs(0);
    setFocusLost(0);
    setHasMovement(false);
  };

  return {
    timeRemaining,
    selectedDuration,
    setSelectedDuration,
    isTimerRunning,
    focusLost,
    windowBlurs,
    hasMovement,
    sessionId,
    formatTime,
    toggleTimer,
    resetTimer,
    startMeditation
  };
};
