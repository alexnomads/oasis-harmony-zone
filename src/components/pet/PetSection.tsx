
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompanionPetComponent } from './CompanionPet';
import { DailyMoodLogger } from './DailyMoodLogger';
import { Coins, Sparkles, Zap, RefreshCw } from 'lucide-react';
import { usePet } from '@/hooks/usePet';
import { useAuth } from '@/contexts/AuthContext';

export const PetSection: React.FC = () => {
  const { user } = useAuth();
  const {
    pet,
    currency,
    isLoading,
    logMood,
    getCurrentMood,
    getPetEmotion,
    forceSyncPoints
  } = usePet(user?.id);

  const hasLoggedMoodToday = !!getCurrentMood();
  const petEmotion = getPetEmotion();

  if (!user) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6 text-center">
          <p className="text-white/70">Sign in to meet your companion!</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-white/10 rounded-lg" />
            <div className="h-4 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pet Display */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Your Companion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pet ? (
            <div className="space-y-3">
              <CompanionPetComponent 
                pet={pet} 
                isAnimating={petEmotion === 'happy'} 
                size="medium"
                showStats={true}
              />
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
            </div>
          ) : (
            <div className="text-center text-white/70 py-4">
              <p>Your companion is being prepared...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Display */}
      {currency && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                Universal Currency
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={forceSyncPoints}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm font-medium">ROJ Points</span>
                </div>
                <span className="text-yellow-400 font-bold text-lg">{currency.roj_points}</span>
              </div>
              <p className="text-xs text-white/60">
                Main currency - synced with total meditation points
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-purple-400">⭐</span>
                <span className="text-white text-sm">Stars</span>
              </div>
              <span className="text-purple-400 font-medium">{currency.stars}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Mood Logger */}
      <DailyMoodLogger
        onLogMood={logMood}
        hasLoggedToday={hasLoggedMoodToday}
        isLoading={isLoading}
      />
    </div>
  );
};
