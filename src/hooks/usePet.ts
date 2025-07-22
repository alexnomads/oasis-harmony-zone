
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PetService } from '@/lib/services/petService';
import type { CompanionPet, MoodLog, ROJCurrency } from '@/types/pet';

export const usePet = (userId: string | undefined) => {
  const [pet, setPet] = useState<CompanionPet | null>(null);
  const [currency, setCurrency] = useState<ROJCurrency | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load pet data with better error handling
  const loadPetData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading pet data for user:', userId);
      
      const [petData, currencyData, moodData] = await Promise.all([
        PetService.getUserPet(userId),
        PetService.getUserCurrency(userId),
        PetService.getMoodHistory(userId, 7) // Last 7 days
      ]);

      console.log('Pet data loaded successfully:', { petData, currencyData, moodData });
      setPet(petData);
      setCurrency(currencyData);
      setMoodHistory(moodData);
    } catch (err) {
      console.error('Error loading pet data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pet data';
      setError(errorMessage);
      
      toast({
        title: "Pet Loading Error",
        description: "Having trouble loading your companion. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // Update pet evolution
  const updateEvolution = useCallback(async () => {
    if (!userId) return;

    try {
      const updatedPet = await PetService.updatePetEvolution(userId);
      const oldStage = pet?.evolution_stage;
      const newStage = updatedPet.evolution_stage;
      
      setPet(updatedPet);
      
      // Show evolution notification
      if (oldStage !== undefined && newStage > oldStage) {
        toast({
          title: "🌹 Pet Evolution!",
          description: `Your rose has evolved! Welcome to the ${updatedPet.evolution_stage === 1 ? 'Sprout' : updatedPet.evolution_stage === 2 ? 'Bloom' : 'Mystic Rose'} stage!`,
        });
      }
    } catch (err) {
      console.error('Error updating pet evolution:', err);
    }
  }, [userId, pet?.evolution_stage, toast]);

  // Add experience to pet
  const addExperience = useCallback(async (points: number) => {
    if (!userId) return;

    try {
      const updatedPet = await PetService.addExperience(userId, points);
      setPet(updatedPet);
    } catch (err) {
      console.error('Error adding experience:', err);
    }
  }, [userId]);

  // Log mood with improved error handling
  const logMood = useCallback(async (moodData: {
    mood_score: number;
    energy_level: number;
    stress_level: number;
    symptoms?: string[];
  }) => {
    if (!userId) return;

    try {
      console.log('Attempting to log mood:', moodData);
      
      const newMoodLog = await PetService.logMood(userId, moodData);
      setMoodHistory(prev => [newMoodLog, ...prev.slice(0, 6)]); // Keep last 7 days
      
      // Refresh currency data
      try {
        const updatedCurrency = await PetService.getUserCurrency(userId);
        setCurrency(updatedCurrency);
      } catch (currencyError) {
        console.error('Failed to refresh currency:', currencyError);
      }
      
      // Add experience for mood logging
      try {
        await addExperience(10);
      } catch (expError) {
        console.error('Failed to add experience:', expError);
      }
      
      toast({
        title: "Mood Logged! 🌸",
        description: "You earned 5 ROJ points and 10 XP for checking in with yourself.",
      });
    } catch (err) {
      console.error('Error logging mood:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to log mood';
      toast({
        title: "Mood Logging Failed",
        description: errorMessage + ". Please try again.",
        variant: "destructive",
      });
    }
  }, [userId, addExperience, toast]);

  // Award currency
  const awardCurrency = useCallback(async (rojPoints: number, stars: number) => {
    if (!userId) return;

    try {
      const updatedCurrency = await PetService.addCurrency(userId, rojPoints, stars);
      setCurrency(updatedCurrency);
    } catch (err) {
      console.error('Error awarding currency:', err);
    }
  }, [userId]);

  // Get current mood
  const getCurrentMood = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return moodHistory.find(log => log.date === today);
  }, [moodHistory]);

  // Get pet emotion based on recent mood
  const getPetEmotion = useCallback(() => {
    const recentMood = getCurrentMood();
    if (!recentMood) return 'neutral';
    
    if (recentMood.mood_score >= 4) return 'happy';
    if (recentMood.mood_score <= 2) return 'sad';
    if (recentMood.energy_level <= 3) return 'sleepy';
    if (recentMood.stress_level >= 7) return 'stressed';
    
    return 'neutral';
  }, [getCurrentMood]);

  useEffect(() => {
    loadPetData();
  }, [loadPetData]);

  return {
    pet,
    currency,
    moodHistory,
    isLoading,
    error,
    updateEvolution,
    addExperience,
    logMood,
    awardCurrency,
    getCurrentMood,
    getPetEmotion,
    reload: loadPetData
  };
};
