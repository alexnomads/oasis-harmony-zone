import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { WorkoutTimer } from "./WorkoutTimer";
import { ProofSubmission } from "./ProofSubmission";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface AbsWorkoutProps {
  onBack: () => void;
}

export const AbsWorkout = ({ onBack }: AbsWorkoutProps) => {
  const { user } = useAuth();
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [sessionData, setSessionData] = useState<{
    reps_completed: number;
    duration: number;
  } | null>(null);

  const handleWorkoutComplete = (reps: number, duration: number) => {
    setSessionData({ reps_completed: reps, duration });
    setIsSessionComplete(true);
  };

  const handleProofSubmitted = () => {
    setIsSessionComplete(false);
    setSessionData(null);
    onBack();
  };

  if (isSessionComplete && sessionData) {
    return (
      <ProofSubmission
        workoutType="abs"
        sessionData={sessionData}
        onBack={handleProofSubmitted}
        onSkip={handleProofSubmitted}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-accent hover:text-accent/80"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-3xl font-bold glitch-text" data-text="🏋️‍♂️ ABS WORKOUT">
          🏋️‍♂️ ABS WORKOUT
        </h2>
      </div>

      {/* Workout Instructions */}
      <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-accent">Workout Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-accent">Exercises:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Crunches</li>
                <li>• Bicycle crunches</li>
                <li>• Plank hold</li>
                <li>• Russian twists</li>
                <li>• Mountain climbers</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-accent">Tips:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Focus on form over speed</li>
                <li>• Keep your core engaged</li>
                <li>• Breathe steadily</li>
                <li>• Quality over quantity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WorkoutTimer
          workoutType="abs"
          onComplete={handleWorkoutComplete}
        />
      </motion.div>

      {/* Motivation Card */}
      <Card className="bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-sm border border-accent/20">
        <CardContent className="p-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl mb-2"
          >
            🔥
          </motion.div>
          <p className="text-lg font-medium text-accent">
            "Your only limit is you!"
          </p>
          <p className="text-muted-foreground mt-2">
            Push through and earn those ROJ points! 💪
          </p>
        </CardContent>
      </Card>
    </div>
  );
};