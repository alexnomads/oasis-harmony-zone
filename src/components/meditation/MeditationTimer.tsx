
import React, { useState, useEffect, useRef } from "react";
import { MeditationType } from "@/types/database";
import { TimerDisplay } from "./TimerDisplay";
import { useToast } from "@/components/ui/use-toast";

interface TimerProps {
  initialDuration: number;
  initialType: MeditationType;
  onComplete: (duration: number, distractions: {
    mouseMovements: number,
    focusLost: number,
    windowBlurs: number
  }) => void;
  sessionId: string;
}

export const MeditationTimer: React.FC<TimerProps> = ({
  initialDuration,
  initialType,
  onComplete,
  sessionId
}) => {
  const [mouseMovements, setMouseMovements] = useState(0);
  const [focusLost, setFocusLost] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const { toast } = useToast();
  
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(true);
  const endSoundPlayedRef = useRef(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    return ((initialDuration - timeRemaining) / initialDuration) * 100;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  useEffect(() => {
    const handleActivity = (event: MouseEvent) => {
      if (isRunning) {
        setMouseMovements(prev => prev + 1);
        toast({
          title: "Movement Detected",
          description: "0.15 points will be deducted. Try to remain still during meditation.",
          variant: "destructive"
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setFocusLost(prev => prev + 1);
        toast({
          title: "Focus Lost",
          description: "0.5 points will be deducted. Please stay on this tab during meditation.",
          variant: "destructive"
        });
      }
    };

    const handleWindowBlur = () => {
      if (isRunning) {
        setWindowBlurs(prev => prev + 1);
        toast({
          title: "Window Switch Detected",
          description: "0.5 points will be deducted. Please keep this window focused during meditation.",
          variant: "destructive"
        });
      }
    };

    window.addEventListener("mousemove", handleActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isRunning, toast]);

  useEffect(() => {
    if (timeRemaining === 0 && isRunning && !endSoundPlayedRef.current) {
      endSoundPlayedRef.current = true;
      setIsRunning(false);
      onComplete(initialDuration, {
        mouseMovements,
        focusLost,
        windowBlurs
      });
    }
  }, [timeRemaining, isRunning, initialDuration, onComplete, mouseMovements, focusLost, windowBlurs]);

  return (
    <div>
      <TimerDisplay
        time={timeRemaining}
        isRunning={isRunning}
        calculateProgress={calculateProgress}
        formatTime={formatTime}
      />
    </div>
  );
};
