
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageCircle, User, Coins } from "lucide-react";
import { MeditationAgentChat } from "./MeditationAgentChat";
import { QuickMeditation } from "./QuickMeditation";
import { UserProfile } from "../profile/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { CompanionPet } from "../pet/CompanionPet";
import { DailyMoodLogger } from "../pet/DailyMoodLogger";
import { usePet } from "@/hooks/usePet";

export const MeditationContainer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-deepPurple via-midnightBlue to-cosmicBlue p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-2rem)]">
          {/* Pet & Currency Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Pet Display */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4">
                {petLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-white/70">Loading your pet...</div>
                  </div>
                ) : pet ? (
                  <CompanionPet 
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

            {/* Currency Display */}
            {currency && (
              <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-sm">ROJ Points</span>
                      </div>
                      <span className="text-yellow-400 font-medium">{currency.roj_points}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-400">⭐</span>
                        <span className="text-white text-sm">Stars</span>
                      </div>
                      <span className="text-purple-400 font-medium">{currency.stars}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Mood Logger */}
            {user && (
              <DailyMoodLogger
                onLogMood={logMood}
                hasLoggedToday={hasLoggedMoodToday}
                isLoading={petLoading}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-white/20">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  AI Coach
                </TabsTrigger>
                <TabsTrigger value="quick" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Quick Session
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 h-[calc(100%-4rem)]">
                <TabsContent value="chat" className="h-full m-0">
                  <MeditationAgentChat />
                </TabsContent>

                <TabsContent value="quick" className="h-full m-0">
                  <QuickMeditation />
                </TabsContent>

                <TabsContent value="profile" className="h-full m-0">
                  <UserProfile />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
