import { motion } from 'framer-motion';
import { Heart, Zap, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MoodLog } from '@/types/pet';
import { MOOD_EMOJIS, SYMPTOMS_OPTIONS } from '@/types/pet';

interface MoodSessionEntryProps {
  moodLog: MoodLog;
  index: number;
}

export const MoodSessionEntry = ({ moodLog, index }: MoodSessionEntryProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    const datePart = date.toLocaleDateString('en-US', dateOptions);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${datePart} at ${timePart}`;
  };

  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'text-green-400';
    if (level >= 6) return 'text-yellow-400';
    if (level >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStressColor = (level: number) => {
    if (level >= 8) return 'text-red-400';
    if (level >= 6) return 'text-orange-400';
    if (level >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="p-4 sm:p-5 hover:bg-white/5 transition-colors border-l-4 border-purple-500/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{MOOD_EMOJIS[moodLog.mood_score as keyof typeof MOOD_EMOJIS]}</span>
            <div>
              <p className="font-medium text-sm sm:text-base text-purple-300">Mood Check-in</p>
              <p className="text-xs sm:text-sm text-zinc-400">
                {formatDate(moodLog.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Zap className={`h-4 w-4 ${getEnergyColor(moodLog.energy_level)}`} />
              <span className="text-xs text-zinc-400">Energy: {moodLog.energy_level}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <Cloud className={`h-4 w-4 ${getStressColor(moodLog.stress_level)}`} />
              <span className="text-xs text-zinc-400">Stress: {moodLog.stress_level}/10</span>
            </div>
          </div>
          
          {moodLog.symptoms && moodLog.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {moodLog.symptoms.slice(0, 3).map((symptom) => (
                <Badge key={symptom} variant="secondary" className="text-xs">
                  {symptom.replace('_', ' ')}
                </Badge>
              ))}
              {moodLog.symptoms.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{moodLog.symptoms.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-purple-400">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Well-being</span>
          </div>
          <p className="text-xs sm:text-sm text-vibrantOrange mt-1">
            +5.0 ROJ points
          </p>
        </div>
      </div>
    </motion.div>
  );
};