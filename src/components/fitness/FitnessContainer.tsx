import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Users, Camera } from "lucide-react";
import { AbsWorkout } from "./AbsWorkout";
import { PushUpWorkout } from "./PushUpWorkout";
import { BicepsWorkout } from "./BicepsWorkout";
import { FitnessStats } from "./FitnessStats";
import { CameraFitnessTracker } from "./CameraFitnessTracker";
import { FitnessService } from "@/lib/services/fitnessService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const FitnessContainer = () => {
  const [activeWorkout, setActiveWorkout] = useState<'selection' | 'abs' | 'pushups' | 'biceps' | 'ai-tracker'>('selection');
  const [selectedExercise, setSelectedExercise] = useState<'abs' | 'pushups' | 'biceps' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Listen for recommended workout start events
  useEffect(() => {
    const handleSetWorkoutType = (event: CustomEvent) => {
      const { workoutType } = event.detail;
      if (workoutType === 'abs') {
        setActiveWorkout('abs');
      } else if (workoutType === 'pushups') {
        setActiveWorkout('pushups');
      } else if (workoutType === 'biceps') {
        setActiveWorkout('biceps');
      }
    };
    window.addEventListener('setWorkoutType', handleSetWorkoutType as EventListener);
    return () => {
      window.removeEventListener('setWorkoutType', handleSetWorkoutType as EventListener);
    };
  }, []);

  // Also handle direct start events to be robust when already on Fitness tab
  useEffect(() => {
    const handleStartRecommendedWorkout = (event: CustomEvent) => {
      const { workoutType } = event.detail || {};
      if (workoutType === 'abs') {
        setActiveWorkout('abs');
      } else if (workoutType === 'pushups') {
        setActiveWorkout('pushups');
      } else if (workoutType === 'biceps') {
        setActiveWorkout('biceps');
      }
    };
    window.addEventListener('startRecommendedWorkout', handleStartRecommendedWorkout as EventListener);
    return () => {
      window.removeEventListener('startRecommendedWorkout', handleStartRecommendedWorkout as EventListener);
    };
  }, []);

  const handleBackToSelection = () => {
    setActiveWorkout('selection');
    setSelectedExercise(null);
  };

  const handleAITrackerComplete = async (reps: number, duration: number, formScore: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your workout session.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save AI-tracked workout session with double points
      const session = await FitnessService.startSession(
        user.id,
        selectedExercise as any, // Map to WorkoutType
        reps,
        duration,
        true, // isAiTracked = true for double points
        formScore,
        selectedExercise // aiExerciseType
      );

      console.log('AI Workout saved successfully:', session);
      toast({
        title: "🤖 AI Workout Completed!",
        description: `Great job! You earned ${session.points_earned} points (2x AI bonus) for ${reps} reps in ${Math.round(duration / 60)}min with ${Math.round(formScore * 100)}% form quality.`
      });

      // Return to selection screen
      setActiveWorkout('selection');
      setSelectedExercise(null);
    } catch (error) {
      console.error('Failed to save AI workout:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your workout session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startAITracker = (exercise: 'abs' | 'pushups' | 'biceps') => {
    setSelectedExercise(exercise);
    setActiveWorkout('ai-tracker');
  };

  if (activeWorkout === 'ai-tracker' && selectedExercise) {
    return <CameraFitnessTracker exerciseType={selectedExercise} onComplete={handleAITrackerComplete} onBack={handleBackToSelection} />;
  }

  if (activeWorkout === 'abs') {
    return <AbsWorkout onBack={handleBackToSelection} />;
  }

  if (activeWorkout === 'pushups') {
    return <PushUpWorkout onBack={handleBackToSelection} />;
  }

  if (activeWorkout === 'biceps') {
    return <BicepsWorkout onBack={handleBackToSelection} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 glitch-text" data-text="💪 FITNESS ZONE 💪">
          💪 FITNESS ZONE 💪
        </h2>
      </div>

      {/* Fitness Stats */}
      <FitnessStats />

      {/* Workout Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="exercise-card-enhanced">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                🏋️‍♂️
              </div>
              <h3 className="text-2xl font-bold text-accent">ABS & PLANK</h3>
              <p className="text-muted-foreground">Core strengthening exercises including plank & abs workouts</p>
              <div className="space-y-3">
                <Button onClick={() => setActiveWorkout('abs')} className="retro-button w-full py-3 text-lg">
                  START ABS 🔥
                </Button>
                <div className="relative">
                  <Button onClick={() => startAITracker('abs')} className="ai-tracker-button w-full py-3 text-lg">
                    🤖 AI TRACKER
                  </Button>
                  <div className="points-badge">2x POINTS</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="exercise-card-enhanced">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                💪
              </div>
              <h3 className="text-2xl font-bold text-accent">PUSH UPS</h3>
              <p className="text-muted-foreground">
                Upper body strength with classic push-up challenges
              </p>
              <div className="space-y-3">
                <Button onClick={() => setActiveWorkout('pushups')} className="retro-button w-full py-3 text-lg">
                  START PUSH UPS 💥
                </Button>
                <div className="relative">
                  <Button onClick={() => startAITracker('pushups')} className="ai-tracker-button w-full py-3 text-lg">
                    🤖 AI TRACKER
                  </Button>
                  <div className="points-badge">2x POINTS</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="exercise-card-enhanced">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                💪
              </div>
              <h3 className="text-2xl font-bold text-accent">BICEPS CURLS</h3>
              <p className="text-muted-foreground">
                Build those arms with focused bicep curl exercises
              </p>
              <div className="space-y-3">
                <Button onClick={() => setActiveWorkout('biceps')} className="retro-button w-full py-3 text-lg">
                  START BICEPS 🔥
                </Button>
                <div className="relative">
                  <Button onClick={() => startAITracker('biceps')} className="ai-tracker-button w-full py-3 text-lg">
                    🤖 AI TRACKER
                  </Button>
                  <div className="points-badge">2x POINTS</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};