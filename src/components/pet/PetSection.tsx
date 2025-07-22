import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanionPetComponent } from './CompanionPet';
import { DailyMoodLogger } from './DailyMoodLogger';
import { Coins, Sparkles, Zap } from 'lucide-react';
import { usePet } from '@/hooks/usePet';
import { useAuth } from '@/contexts/AuthContext';
export const PetSection: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    pet,
    currency,
    isLoading,
    logMood,
    getCurrentMood,
    getPetEmotion
  } = usePet(user?.id);
  const hasLoggedMoodToday = !!getCurrentMood();
  const petEmotion = getPetEmotion();
  if (!user) {
    return <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6 text-center">
          <p className="text-white/70">Sign in to meet your companion!</p>
        </CardContent>
      </Card>;
  }
  if (isLoading) {
    return <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-white/10 rounded-lg" />
            <div className="h-4 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
          </div>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-4">
      {/* Pet Display */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Your Companion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pet ? <div className="space-y-3">
              <CompanionPetComponent pet={pet} isAnimating={petEmotion === 'happy'} size="medium" showStats={true} />
              <div className="bg-zinc-800/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm">Pet XP</span>
                  </div>
                  <span className="text-yellow-400 font-medium">{pet.experience_points}</span>
                </div>
                <p className="text-xs text-white/60">
                  Grows your companion through evolution stages
                </p>
              </div>
            </div> : <div className="text-center text-white/70 py-4">
              <p>Your companion is being prepared...</p>
            </div>}
        </CardContent>
      </Card>

      {/* Currency Display */}
      {currency && <Card className="bg-zinc-900/50 border-zinc-800">
          
          
        </Card>}

      {/* Daily Mood Logger */}
      <DailyMoodLogger onLogMood={logMood} hasLoggedToday={hasLoggedMoodToday} isLoading={isLoading} />
    </div>;
};