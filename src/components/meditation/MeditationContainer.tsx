
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageCircle, User, Coins } from "lucide-react";
import { MeditationAgentChat } from "./MeditationAgentChat";
import { WelcomeMessage } from "./WelcomeMessage";
import { PersonalizedRecommendations } from "./PersonalizedRecommendations";
import { UserPointsDisplay } from "./UserPointsDisplay";
import { QuickMeditation } from "./QuickMeditation";
import { UserProfile } from "../profile/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { FitnessContainer } from "../fitness/FitnessContainer";
import { CompanionPetComponent } from "../pet/CompanionPet";
import { DailyMoodLogger } from "../pet/DailyMoodLogger";
import { usePet } from "@/hooks/usePet";

export const MeditationContainer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("quick");
  const {
    pet,
    currency,
    isLoading: petLoading,
    logMood,
    getCurrentMood,
    getPetEmotion
  } = usePet(user?.id);

  const hasLoggedMoodToday = !!getCurrentMood();
  const petEmotion = getPetEmotion();

  // Listen for recommended meditation start events
  useEffect(() => {
    const handleStartRecommendedMeditation = (event: CustomEvent) => {
      const { duration } = event.detail;
      // Quick Meditation is already the default tab, just ensure it's active
      setActiveTab("quick");
      // The QuickMeditation component will handle the session start
      window.dispatchEvent(new CustomEvent('setMeditationDuration', { 
        detail: { duration } 
      }));
    };

    const handleStartRecommendedWorkout = (event: CustomEvent) => {
      const { workoutType } = event.detail;
      // Switch to fitness tab
      setActiveTab("fitness");
      // The FitnessContainer will handle the workout start
      window.dispatchEvent(new CustomEvent('setWorkoutType', { 
        detail: event.detail 
      }));
    };

    window.addEventListener('startRecommendedMeditation', handleStartRecommendedMeditation as EventListener);
    window.addEventListener('startRecommendedWorkout', handleStartRecommendedWorkout as EventListener);
    
    return () => {
      window.removeEventListener('startRecommendedMeditation', handleStartRecommendedMeditation as EventListener);
      window.removeEventListener('startRecommendedWorkout', handleStartRecommendedWorkout as EventListener);
    };
  }, []);

  return (
    <div className="mobile-meditation-container bg-gradient-to-br from-deepPurple via-midnightBlue to-cosmicBlue p-4">
      <div className="max-w-7xl mx-auto space-y-4 min-h-screen pb-[40rem] lg:pb-96">
        {/* Welcome Message - Primary Section */}
        <section className="mb-6">
          <WelcomeMessage />
        </section>
        
        {/* Fullscreen meditation interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* Navigation tabs - minimal and clean */}
          <div className="flex justify-center mb-1">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl p-1">
              <TabsTrigger 
                value="quick" 
                className="retro-button flex items-center gap-2 justify-center py-3 px-2 text-xs sm:text-sm data-[state=active]:opacity-100 data-[state=inactive]:opacity-70 hover:opacity-90 rounded-lg"
              >
                <Brain className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">MEDITATION</span>
                <span className="sm:hidden">MED</span>
              </TabsTrigger>
              <TabsTrigger 
                value="fitness" 
                className="retro-button flex items-center gap-2 justify-center py-3 px-2 text-xs sm:text-sm data-[state=active]:opacity-100 data-[state=inactive]:opacity-70 hover:opacity-90 rounded-lg"
              >
                💪
                <span className="hidden sm:inline">FITNESS</span>
                <span className="sm:hidden">FIT</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="retro-button flex items-center gap-2 justify-center py-3 px-2 text-xs sm:text-sm data-[state=active]:opacity-100 data-[state=inactive]:opacity-70 hover:opacity-90 rounded-lg"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">AI COACH</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab content - fullscreen */}
          <div className="w-full">
            <TabsContent value="quick" className="m-0">
              <QuickMeditation />
            </TabsContent>

            <TabsContent value="fitness" className="m-0">
              <div className="max-w-4xl mx-auto">
                <FitnessContainer />
              </div>
            </TabsContent>

            <TabsContent value="chat" className="m-0">
              <div className="max-w-4xl mx-auto">
                <MeditationAgentChat />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Sidebar content moved to bottom on mobile, hidden during active meditation */}
        <div className="meditation-sidebar-content mt-16 lg:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Pet Display */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4">
                {petLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-white/70">Loading your pet...</div>
                  </div>
                ) : pet ? (
                  <CompanionPetComponent 
                    pet={pet} 
                    isAnimating={petEmotion === 'happy'} 
                    size="large" 
                    showStats={true} 
                  />
                ) : (
                  <div className="text-center text-white/70">
                    <p>Your companion will appear once you create an account!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Points Display */}
            <UserPointsDisplay />

            {/* Daily Mood Logger */}
            {user && (
              <DailyMoodLogger 
                onLogMood={logMood} 
                hasLoggedToday={hasLoggedMoodToday} 
                isLoading={petLoading} 
              />
            )}
          </div>

          {/* Personalized Recommendations */}
          <div className="mt-12 max-w-6xl mx-auto">
            <PersonalizedRecommendations type={activeTab === 'fitness' ? 'fitness' : 'meditation'} />
          </div>
        </div>
      </div>
    </div>
  );
};
