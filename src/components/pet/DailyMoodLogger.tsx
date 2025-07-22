
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Brain, Check } from 'lucide-react';
import { MOOD_EMOJIS, SYMPTOMS_OPTIONS } from '@/types/pet';

interface DailyMoodLoggerProps {
  onLogMood: (moodData: {
    mood_score: number;
    energy_level: number;
    stress_level: number;
    symptoms?: string[];
  }) => Promise<void>;
  hasLoggedToday: boolean;
  isLoading?: boolean;
}

export const DailyMoodLogger: React.FC<DailyMoodLoggerProps> = ({
  onLogMood,
  hasLoggedToday,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [moodScore, setMoodScore] = useState(3);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('DailyMoodLogger: Starting mood submission with data:', {
        mood_score: moodScore,
        energy_level: energyLevel[0],
        stress_level: stressLevel[0],
        symptoms: selectedSymptoms
      });
      
      await onLogMood({
        mood_score: moodScore,
        energy_level: energyLevel[0],
        stress_level: stressLevel[0],
        symptoms: selectedSymptoms
      });
      
      console.log('DailyMoodLogger: Mood logged successfully');
      setIsOpen(false);
      // Reset form
      setMoodScore(3);
      setEnergyLevel([5]);
      setStressLevel([5]);
      setSelectedSymptoms([]);
    } catch (error) {
      console.error('DailyMoodLogger: Failed to log mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  if (hasLoggedToday) {
    return (
      <Card className="bg-green-500/20 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-white">Mood logged for today! 🌸</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          disabled={isLoading}
        >
          <Heart className="w-4 h-4 mr-2" />
          How are you feeling today?
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md bg-black/90 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-center">Daily Check-In</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Mood Score */}
          <div className="space-y-3">
            <label className="text-white font-medium">How's your mood?</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <motion.button
                  key={score}
                  onClick={() => setMoodScore(score)}
                  className={`text-4xl p-2 rounded-lg transition-all ${
                    moodScore === score 
                      ? 'bg-white/20 scale-110' 
                      : 'hover:bg-white/10 hover:scale-105'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {MOOD_EMOJIS[score as keyof typeof MOOD_EMOJIS]}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <label className="text-white font-medium">Energy Level</label>
              <span className="text-white/70">({energyLevel[0]}/10)</span>
            </div>
            <Slider
              value={energyLevel}
              onValueChange={setEnergyLevel}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Stress Level */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-red-400" />
              <label className="text-white font-medium">Stress Level</label>
              <span className="text-white/70">({stressLevel[0]}/10)</span>
            </div>
            <Slider
              value={stressLevel}
              onValueChange={setStressLevel}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <label className="text-white font-medium">Any symptoms? (optional)</label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS_OPTIONS.map((symptom) => (
                <Badge
                  key={symptom}
                  variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedSymptoms.includes(symptom)
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'border-white/30 text-white hover:bg-white/10'
                  }`}
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange"
          >
            {isSubmitting ? 'Logging...' : 'Log Mood (+5 ROJ Points)'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
