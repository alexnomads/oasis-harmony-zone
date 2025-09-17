import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Users } from "lucide-react";
import { AbsWorkout } from "./AbsWorkout";
import { PushUpWorkout } from "./PushUpWorkout";
import { FitnessStats } from "./FitnessStats";

export const FitnessContainer = () => {
  const [activeWorkout, setActiveWorkout] = useState<'selection' | 'abs' | 'pushups'>('selection');

  // Listen for recommended workout start events
  useEffect(() => {
    const handleSetWorkoutType = (event: CustomEvent) => {
      const { workoutType } = event.detail;
      if (workoutType === 'abs') {
        setActiveWorkout('abs');
      } else if (workoutType === 'pushups') {
        setActiveWorkout('pushups');
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
      }
    };

    window.addEventListener('startRecommendedWorkout', handleStartRecommendedWorkout as EventListener);

    return () => {
      window.removeEventListener('startRecommendedWorkout', handleStartRecommendedWorkout as EventListener);
    };
  }, []);

  const handleBackToSelection = () => {
    setActiveWorkout('selection');
  };

  if (activeWorkout === 'abs') {
    return <AbsWorkout onBack={handleBackToSelection} />;
  }

  if (activeWorkout === 'pushups') {
    return <PushUpWorkout onBack={handleBackToSelection} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 glitch-text" data-text="💪 FITNESS ZONE 💪">
          💪 FITNESS ZONE 💪
        </h2>
        <p className="text-muted-foreground text-lg">
          Choose your workout and earn points by posting proof on X.com
        </p>
      </div>

      {/* Fitness Stats */}
      <FitnessStats />

      {/* Workout Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="bg-black/20 backdrop-blur-sm border border-accent/30 hover:border-accent/50 transition-all duration-300 group cursor-pointer">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                🏋️‍♂️
              </div>
              <h3 className="text-2xl font-bold text-accent">ABS & PLANK</h3>
              <p className="text-muted-foreground">
                Core strengthening exercises including plank holds and ab workouts
              </p>
              <Button 
                onClick={() => setActiveWorkout('abs')}
                className="retro-button w-full py-3 text-lg"
              >
                START ABS 🔥
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border border-accent/30 hover:border-accent/50 transition-all duration-300 group cursor-pointer">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                💪
              </div>
              <h3 className="text-2xl font-bold text-accent">PUSH UPS</h3>
              <p className="text-muted-foreground">
                Upper body strength with classic push-up challenges
              </p>
              <Button 
                onClick={() => setActiveWorkout('pushups')}
                className="retro-button w-full py-3 text-lg"
              >
                START PUSH UPS 💥
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-black/10 backdrop-blur-sm border border-white/20 max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-semibold mb-2 text-accent">How to Earn Points</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>1. Complete your workout session</p>
                <p>2. Post proof on X.com tagging <span className="text-accent font-medium">@ROJoasis</span></p>
                <p>3. Or send a DM with video proof to <span className="text-accent font-medium">@ROJoasis</span></p>
                <p>4. Earn points once your proof is verified! 🎉</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};