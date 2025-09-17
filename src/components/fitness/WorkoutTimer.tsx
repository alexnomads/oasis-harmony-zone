import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useWakeLock } from "@/hooks/useWakeLock";

interface WorkoutTimerProps {
  workoutType: 'abs' | 'pushups' | 'biceps';
  onComplete: (reps: number, duration: number) => void;
  fixedDuration?: number; // For biceps which is fixed to 5 minutes
}

export const WorkoutTimer = ({ workoutType, onComplete, fixedDuration }: WorkoutTimerProps) => {
  const initialDuration = fixedDuration ? fixedDuration * 60 : 600; // Convert minutes to seconds for fixedDuration
  const [duration, setDuration] = useState(initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRepsInput, setShowRepsInput] = useState(false);
  const [inputReps, setInputReps] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const { toast } = useToast();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const presetDurations = [
    { label: "1 MIN", value: 60 },
    { label: "2 MIN", value: 120 },
    { label: "5 MIN", value: 300 },
    { label: "10 MIN", value: 600 },
  ];

  // Get the appropriate workout video based on type and duration
  const getWorkoutVideo = () => {
    if (workoutType === 'abs' && duration === 300) {
      return '/workout-videos/5min-abs.mp4';
    }
    if (workoutType === 'abs' && duration === 600) {
      return '/workout-videos/10min-abs.mp4';
    }
    if (workoutType === 'abs' && duration === 120) {
      return '/workout-videos/2min-plank.mp4';
    }
    if (workoutType === 'biceps' && duration === 300) {
      return '/workout-videos/5min-biceps.mp4';
    }
    return null;
  };

  // Cleanup wake lock on component unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (timeRemaining === 0) {
      setTimeRemaining(duration);
    }
    setIsRunning(true);
    setShowVideo(true);
    // Request wake lock to prevent screen from turning off during workout
    requestWakeLock();
  };

  const handlePause = () => {
    setIsRunning(false);
    setShowVideo(false);
    // Release wake lock when paused
    releaseWakeLock();
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(duration);
    setIsCompleted(false);
    setShowRepsInput(false);
    setInputReps("");
    setShowVideo(false);
    // Release wake lock when reset
    releaseWakeLock();
  };

  const handleComplete = () => {
    const actualDuration = duration - timeRemaining;
    setIsCompleted(true);
    setIsRunning(false);
    
    // Release wake lock when workout is complete
    releaseWakeLock();
    
    // For plank (2 minutes), skip reps input
    if (workoutType === 'abs' && duration === 120) {
      onComplete(0, actualDuration); // 0 reps for plank hold
      return;
    }
    
    setShowRepsInput(true);
    setShowVideo(false);
    
    toast({
      title: "Workout Complete! 🎉",
      description: `Great job! Time to log your reps.`,
    });
  };

  const handleRepsSubmit = () => {
    const reps = parseInt(inputReps) || 0;
    const actualDuration = duration - timeRemaining;
    onComplete(reps, actualDuration);
  };

  const selectDuration = (newDuration: number) => {
    if (!isRunning && !isCompleted && !fixedDuration) {
      setDuration(newDuration);
      setTimeRemaining(newDuration);
    }
  };

  const progress = ((duration - timeRemaining) / duration) * 100;

  return (
    <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Video Display */}
          <AnimatePresence>
            {showVideo && getWorkoutVideo() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md mx-auto"
              >
                <video
                  src={getWorkoutVideo()!}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  className="w-full h-auto rounded-lg border border-accent/30"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="bg-black/50 border-accent/30"
                  >
                    {isVideoMuted ? '🔇' : '🔊'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVideo(false)}
                    className="bg-black/50 border-accent/30"
                  >
                    ✕
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer Display */}
          <div className="text-center">
            <motion.div 
              className="text-6xl md:text-8xl font-bold text-accent mb-4"
              animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
            >
              {formatTime(timeRemaining)}
            </motion.div>
            
            {/* Progress Bar */}
            <div className="w-full bg-black/30 rounded-full h-3 mb-4">
              <motion.div 
                className="bg-gradient-to-r from-accent to-primary h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Duration Preset Buttons */}
          {!isRunning && !isCompleted && !fixedDuration && (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-accent">Select Duration</h3>
              <div className="grid grid-cols-2 sm:flex sm:justify-center gap-2 sm:gap-3 max-w-sm mx-auto">
                {presetDurations.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={duration === preset.value ? "default" : "outline"}
                    onClick={() => selectDuration(preset.value)}
                    className={`min-h-[44px] text-sm font-semibold ${
                      duration === preset.value ? "retro-button" : "hover:bg-accent/10"
                    }`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Workout Type Display */}
          {!showRepsInput && (
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {workoutType === 'abs' && duration === 120 ? '🏋️‍♂️ PLANK' : 
                 workoutType === 'abs' ? '🏋️‍♂️ ABS WORKOUT' : 
                 workoutType === 'biceps' ? '💪 BICEPS CURLS' : '💪 PUSH UPS'}
              </div>
              <p className="text-muted-foreground mt-2">
                {workoutType === 'abs' && duration === 120 ? 
                  'Hold your plank position steady' : 
                  workoutType === 'biceps' ? 
                  'Focus on controlled curls and perfect form' :
                  'Focus on your form and breathing'}
              </p>
            </div>
          )}

          {/* Reps Input after completion */}
          {showRepsInput && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-accent mb-4">
                How many reps did you complete?
              </div>
              <div className="flex items-center justify-center gap-4">
                <Input
                  type="number"
                  placeholder="Enter reps"
                  value={inputReps}
                  onChange={(e) => setInputReps(e.target.value)}
                  className="w-32 text-center text-lg"
                  min="0"
                />
                <Button
                  onClick={handleRepsSubmit}
                  className="retro-button px-6 py-2"
                  disabled={!inputReps}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          {!showRepsInput && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 px-4">
              <AnimatePresence mode="wait">
                {!isRunning ? (
                  <motion.div
                    key="play"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      onClick={handleStart}
                      className="retro-button w-full sm:w-auto px-6 sm:px-8 py-4 text-base sm:text-lg min-h-[48px]"
                      disabled={isCompleted}
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {timeRemaining === duration ? 'START' : 'RESUME'}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      onClick={handlePause}
                      variant="outline"
                      className="w-full sm:w-auto px-6 sm:px-8 py-4 text-base sm:text-lg min-h-[48px] border-accent/30 hover:bg-accent/10"
                    >
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      PAUSE
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-4 text-sm sm:text-base min-h-[48px] border-accent/30 hover:bg-accent/10"
                  disabled={isCompleted}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  RESET
                </Button>

                {!isCompleted && timeRemaining < duration && (
                  <Button
                    onClick={handleComplete}
                    className="flex-1 sm:flex-none retro-button px-4 sm:px-6 py-4 text-sm sm:text-base min-h-[48px] bg-green-600 hover:bg-green-700"
                  >
                    FINISH EARLY
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Completion Message */}
          <AnimatePresence>
            {isCompleted && !showRepsInput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30"
              >
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-green-400 font-semibold">
                  Time's up! Now tell us how many reps you completed.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};