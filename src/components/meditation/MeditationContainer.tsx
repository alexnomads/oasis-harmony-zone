
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

    window.addEventListener('startRecommendedMeditation', handleStartRecommendedMeditation as EventListener);
    
    return () => {
      window.removeEventListener('startRecommendedMeditation', handleStartRecommendedMeditation as EventListener);
    };
  }, []);

  return (
    <div className="mobile-meditation-container bg-gradient-to-br from-deepPurple via-midnightBlue to-cosmicBlue p-4">
      <div className="max-w-7xl mx-auto space-y-8 min-h-screen pb-96">
        {/* Welcome Message - Primary Section */}
        <section className="mb-8">
          <WelcomeMessage />
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-h-screen lg:max-h-[calc(100vh-12rem)] pb-8 lg:pb-0">
          {/* Main Content - Meditation Interface (Mobile First) */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            <section className="space-y-6">
              {/* Grouped Navigation - Quick Meditation & AI Coach */}
              <div className="bg-black/10 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent border-0 gap-2">
                    <TabsTrigger 
                      value="quick" 
                      className="retro-button flex flex-col sm:flex-row items-center gap-1 sm:gap-2 justify-center py-3 px-2 text-xs sm:text-sm data-[state=active]:opacity-100 data-[state=inactive]:opacity-70 hover:opacity-90"
                    >
                      <Brain className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">QUICK MEDITATION</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="chat" 
                      className="retro-button flex flex-col sm:flex-row items-center gap-1 sm:gap-2 justify-center py-3 px-2 text-xs sm:text-sm data-[state=active]:opacity-100 data-[state=inactive]:opacity-70 hover:opacity-90"
                    >
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">AI COACH</span>
                    </TabsTrigger>
                  </TabsList>
                  <div className="mt-6">
                    <TabsContent value="quick" className="m-0 space-y-6">
                      <QuickMeditation />
                    </TabsContent>

                    <TabsContent value="chat" className="m-0">
                      <MeditationAgentChat />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Personalized Recommendations - Less Prominent Location */}
              <section className="mt-8 mb-32 lg:mb-24 relative z-10">
                <PersonalizedRecommendations />
              </section>
            </section>
          </div>

          {/* Pet & Currency Sidebar (Mobile Second) */}
          <div className="order-2 lg:order-1 lg:col-span-1 space-y-4 mb-8 lg:mb-0">
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
        </div>
      </div>
    </div>
  );
};
