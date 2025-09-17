import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutTimer } from "./WorkoutTimer";
import { ProofSubmission } from "./ProofSubmission";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
interface PushUpWorkoutProps {
  onBack: () => void;
}
export const PushUpWorkout = ({
  onBack
}: PushUpWorkoutProps) => {
  const {
    user
  } = useAuth();
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
    return <ProofSubmission workoutType="pushups" sessionData={sessionData} onBack={handleProofSubmitted} onSkip={handleProofSubmitted} />;
  }
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="text-accent hover:text-accent/80">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-3xl font-bold glitch-text" data-text="💪 PUSH UPS">
          💪 PUSH UPS
        </h2>
      </div>

      {/* Workout Instructions */}
      <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-accent mb-3">📋 Instructions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Select your workout duration
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Complete as many push-ups as possible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Log your reps when the timer ends
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Your screen will stay on during the workout
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-accent mb-3">🎯 Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Keep your body in a straight line
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Lower your chest close to the ground
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Focus on controlled movements
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Component */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        <WorkoutTimer workoutType="pushups" onComplete={handleWorkoutComplete} />
      </motion.div>

      {/* Motivation Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm border border-primary/20">
        <CardContent className="p-6 text-center">
          <motion.div animate={{
          scale: [1, 1.05, 1]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} className="text-4xl mb-2">
            💥
          </motion.div>
          <p className="text-lg font-medium text-primary">
            "Strength doesn't come from what you can do."
          </p>
          <p className="text-muted-foreground mt-2">
            "It comes from overcoming what you thought you couldn't!" 🚀
          </p>
        </CardContent>
      </Card>
    </div>;
};