
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pause, Play, SkipForward } from "lucide-react";
import { motion } from "framer-motion";
import type { MeditationType } from "@/types/database";

interface MeditationTimerProps {
  initialDuration: number;
  initialType: MeditationType;
  onComplete: (duration: number) => Promise<void>;
  sessionId: string;
}

export const MeditationTimer: React.FC<MeditationTimerProps> = ({
  initialDuration,
  initialType,
  onComplete,
  sessionId
}) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Audio refs
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const completeSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Format time display (e.g., "5:30")
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Initialize audio elements
  useEffect(() => {
    startSoundRef.current = new Audio("/meditation-start.mp3");
    completeSoundRef.current = new Audio("/meditation-end.mp3");
    
    // Play the start sound when the component mounts
    if (startSoundRef.current) {
      startSoundRef.current.play().catch(error => {
        console.error("Error playing start sound:", error);
      });
    }
    
    return () => {
      // Cleanup audio elements when component unmounts
      if (startSoundRef.current) {
        startSoundRef.current.pause();
        startSoundRef.current = null;
      }
      if (completeSoundRef.current) {
        completeSoundRef.current.pause();
        completeSoundRef.current = null;
      }
    };
  }, []);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          const newProgress = (newTime / initialDuration) * 100;
          setProgress(Math.min(newProgress, 100));
          
          // Check if meditation duration is reached
          if (newTime >= initialDuration) {
            setIsRunning(false);
            
            // Play completion sound
            if (completeSoundRef.current) {
              completeSoundRef.current.play().catch(error => {
                console.error("Error playing completion sound:", error);
              });
            }
            
            onComplete(newTime).catch(error => {
              console.error('Error completing meditation session:', error);
            });
            if (interval) clearInterval(interval);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, initialDuration, onComplete]);
  
  // Toggle pause/play
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  // Skip to end (for testing or emergency exit)
  const skipToEnd = () => {
    setIsRunning(false);
    
    // Play completion sound
    if (completeSoundRef.current) {
      completeSoundRef.current.play().catch(error => {
        console.error("Error playing completion sound:", error);
      });
    }
    
    onComplete(time).catch(error => {
      console.error('Error completing meditation session:', error);
    });
  };
  
  // Convert meditation type to readable format
  const getTypeDisplay = (type: MeditationType) => {
    return type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };
  
  // Remaining time calculation
  const remainingTime = initialDuration - time;
  const remainingFormatted = formatTime(remainingTime);
  
  return (
    <Card className="bg-gradient-to-br from-black to-zinc-900 border border-white/20 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
      <CardContent className="p-6">
        <div className="text-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {getTypeDisplay(initialType)} Meditation
          </motion.h2>
          <p className="text-white/70">Find a comfortable position and focus on your breath</p>
        </div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-full w-36 h-36 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {remainingFormatted}
            </span>
          </div>
        </motion.div>
        
        <div className="mb-6">
          <p className="text-white/70 mb-2 text-sm flex justify-between">
            <span>Progress</span>
            <span>{Math.min(Math.round(progress), 100)}%</span>
          </p>
          <Progress value={progress} className="bg-white/10" />
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={toggleTimer}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isRunning ? 'Pause' : 'Resume'}
          </Button>
          
          <Button 
            onClick={skipToEnd}
            variant="outline"
            className="text-white/70 border-white/20 hover:bg-white/10"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Complete
          </Button>
        </div>
        
        <p className="text-center text-white/60 text-sm mt-4">
          Stay focused for maximum points. Avoid tab switching and movement.
        </p>
      </CardContent>
    </Card>
  );
};
