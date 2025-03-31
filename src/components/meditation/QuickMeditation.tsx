import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Play, PauseIcon, Timer } from "lucide-react";
import { SessionService } from "@/lib/services/sessionService";
import { DurationSelector } from "./DurationSelector";
import { MeditationTimer } from "./MeditationTimer";

export const QuickMeditation: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState(300); // Default 5 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Focus monitoring
  const [focusLost, setFocusLost] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [hasMovement, setHasMovement] = useState(false);
  const [lastActiveTimestamp, setLastActiveTimestamp] = useState<Date | null>(null);

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
        if (timeDiff < 500 && (
          event instanceof MouseEvent && 
          (Math.abs(event.movementX) > 10 || Math.abs(event.movementY) > 10)
        )) {
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

  const startMeditation = async () => {
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
      
      toast({
        title: "Meditation Started",
        description: `Starting ${Math.floor(selectedDuration / 60)}-minute mindfulness meditation.`,
      });
      
    } catch (error) {
      console.error('Error starting meditation session:', error);
      
      toast({
        title: "Failed to start session",
        description: "There was an error starting your meditation session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMeditationComplete = async (duration: number, distractions: {
    mouseMovements: number,
    focusLost: number,
    windowBlurs: number
  }) => {
    if (!user || !sessionId) return;
    
    try {
      // Calculate session quality based on focus metrics
      const distractionCount = distractions.mouseMovements + distractions.focusLost + distractions.windowBlurs;
      const qualityFactor = Math.max(0, 1 - (distractionCount * 0.1));
      
      // Complete the session in the database
      const { session, userPoints } = await SessionService.completeSession(
        sessionId,
        duration,
        distractions
      );
      
      // Reset timer state
      setIsTimerRunning(false);
      setSessionId(null);
      
      // Adjust points based on quality factor
      const earnedPoints = Math.round(session.points_earned * qualityFactor);
      const qualityMessage = qualityFactor < 1 
        ? `You earned ${earnedPoints} out of a possible ${session.points_earned} points due to distractions.` 
        : `Well done on maintaining focus! You earned the full ${earnedPoints} points.`;
      
      // Show toast notification
      toast({
        title: "Meditation Complete",
        description: `${qualityMessage} Current streak: ${userPoints.meditation_streak} days`,
      });
      
    } catch (error) {
      console.error('Error completing meditation session:', error);
      
      setIsTimerRunning(false);
      setSessionId(null);
      
      toast({
        title: "Session Completion Error",
        description: "There was an error saving your session. Your progress might not be recorded.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full bg-black/20 backdrop-blur-sm border border-white/20">
      <div className="h-1 w-full bg-gradient-to-r from-vibrantOrange to-vibrantPurple" />
      <CardHeader className="border-b border-white/20 pb-4">
        <div className="flex items-center gap-3">
          <Timer className="w-8 h-8 text-white" />
          <CardTitle className="text-white text-lg">Meditate Now</CardTitle>
        </div>
        <p className="text-white/70 mt-2">
          Select your duration and start a quick meditation session
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {isTimerRunning && sessionId ? (
          <MeditationTimer
            initialType="mindfulness"
            initialDuration={selectedDuration}
            onComplete={handleMeditationComplete}
            sessionId={sessionId}
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-white/80 text-base">Select Duration:</h3>
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
                  className="bg-gradient-to-r from-vibrantOrange to-vibrantPurple hover:opacity-90 text-lg px-6 py-6"
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start {Math.floor(selectedDuration / 60)}-Minute Meditation
                </Button>
              </motion.div>
            </div>
            
            <p className="text-center text-white/60 text-sm">
              Stay focused to earn maximum points. Movement, tab switching, or leaving the page will reduce points earned.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
