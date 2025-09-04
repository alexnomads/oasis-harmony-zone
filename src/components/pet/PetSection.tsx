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
    return (
      <div className="crt-frame p-5 sm:p-6">
        <div className="text-center">
          <p className="text-white/70">Sign in to meet your companion!</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="crt-frame p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-white/10 rounded-lg" />
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pet Display */}
      <div className="crt-frame p-5 sm:p-6">
        <div className="border-b border-primary/30 pb-4 mb-4">
          <h2 className="cyber-heading text-xl sm:text-2xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Your Companion
          </h2>
        </div>
        <div>
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
        </div>
      </div>

      {/* Daily Mood Logger */}
      <DailyMoodLogger 
        onLogMood={logMood} 
        hasLoggedToday={hasLoggedMoodToday} 
        isLoading={isLoading} 
      />
    </div>
  );
};