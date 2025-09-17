import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface WorkoutTimerProps {
  workoutType: 'abs' | 'pushups';
  onComplete: (reps: number, duration: number) => void;
}

export const WorkoutTimer = ({ workoutType, onComplete }: WorkoutTimerProps) => {
  const [duration, setDuration] = useState(600); // 10 minutes default
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRepsInput, setShowRepsInput] = useState(false);
  const [inputReps, setInputReps] = useState("");
  const { toast } = useToast();

  const presetDurations = [
    { label: "1 MIN", value: 60 },
    { label: "5 MIN", value: 300 },
    { label: "10 MIN", value: 600 },
  ];

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
    toast({
      title: `${workoutType.toUpperCase()} Workout Started! 💪`,
      description: "Keep track of your reps and stay focused!",
    });
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(duration);
    setIsCompleted(false);
    setShowRepsInput(false);
    setInputReps("");
  };

  const handleComplete = () => {
    const actualDuration = duration - timeRemaining;
    setIsCompleted(true);
    setIsRunning(false);
    setShowRepsInput(true);
    
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
    if (!isRunning && !isCompleted) {
      setDuration(newDuration);
      setTimeRemaining(newDuration);
    }
  };

  const progress = ((duration - timeRemaining) / duration) * 100;

  return (
    <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
      <CardContent className="p-6">
        <div className="space-y-6">
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
          {!isRunning && !isCompleted && (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-accent">Select Duration</h3>
              <div className="flex justify-center gap-3">
                {presetDurations.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={duration === preset.value ? "default" : "outline"}
                    onClick={() => selectDuration(preset.value)}
                    className={duration === preset.value ? "retro-button" : ""}
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
                {workoutType === 'abs' ? '🏋️‍♂️ ABS WORKOUT' : '💪 PUSH UPS'}
              </div>
              <p className="text-muted-foreground mt-2">
                Focus on your form and breathing
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
            <div className="flex justify-center gap-4">
              <AnimatePresence mode="wait">
                {!isRunning ? (
                  <motion.div
                    key="play"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handleStart}
                      className="retro-button px-8 py-4 text-lg"
                      disabled={isCompleted}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {timeRemaining === duration ? 'START' : 'RESUME'}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handlePause}
                      variant="outline"
                      className="px-8 py-4 text-lg"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      PAUSE
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleReset}
                variant="outline"
                className="px-6 py-4"
                disabled={isCompleted}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                RESET
              </Button>

              {!isCompleted && timeRemaining < duration && (
                <Button
                  onClick={handleComplete}
                  className="retro-button px-6 py-4 bg-green-600 hover:bg-green-700"
                >
                  FINISH EARLY
                </Button>
              )}
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