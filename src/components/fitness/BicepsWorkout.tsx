import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutTimer } from "./WorkoutTimer";
import { ProofSubmission } from "./ProofSubmission";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface BicepsWorkoutProps {
  onBack: () => void;
}

export const BicepsWorkout = ({ onBack }: BicepsWorkoutProps) => {
  const { user } = useAuth();
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [sessionData, setSessionData] = useState<{
    reps_completed: number;
    duration: number;
  } | null>(null);

  const handleWorkoutComplete = (reps: number, duration: number) => {
    setSessionData({
      reps_completed: reps,
      duration
    });
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
        workoutType="biceps"
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
        <Button variant="ghost" onClick={onBack} className="text-accent hover:text-accent/80">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-3xl font-bold glitch-text" data-text="💪 BICEPS CURLS">
          💪 BICEPS CURLS
        </h2>
      </div>

      {/* Timer Component - Fixed to 5 minutes only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WorkoutTimer
          workoutType="biceps"
          onComplete={handleWorkoutComplete}
          fixedDuration={5} // 5 minutes only
        />
      </motion.div>

      {/* Motivation Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20">
        <CardContent className="p-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl mb-2"
          >
            🔥
          </motion.div>
          <p className="text-lg font-medium text-blue-400">
            "Build those guns!"
          </p>
          <p className="text-muted-foreground mt-2">
            Every rep counts towards your stronger self! 💪
          </p>
        </CardContent>
      </Card>
    </div>
  );
};