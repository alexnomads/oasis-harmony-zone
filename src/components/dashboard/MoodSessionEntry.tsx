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
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
      className="p-3 sm:p-4 hover:bg-white/5 transition-colors border-l-2 border-purple-500/50"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{MOOD_EMOJIS[moodLog.mood_score as keyof typeof MOOD_EMOJIS]}</span>
            <div className="flex-1">
              <p className="font-medium text-sm sm:text-base text-purple-300">💭 Mood Check-in</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(moodLog.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <Zap className={`h-3 w-3 ${getEnergyColor(moodLog.energy_level)}`} />
              <span className="text-xs text-muted-foreground">Energy: {moodLog.energy_level}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <Cloud className={`h-3 w-3 ${getStressColor(moodLog.stress_level)}`} />
              <span className="text-xs text-muted-foreground">Stress: {moodLog.stress_level}/10</span>
            </div>
          </div>
          
          {moodLog.symptoms && moodLog.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {moodLog.symptoms.slice(0, 3).map((symptom) => (
                <Badge key={symptom} variant="secondary" className="text-xs px-2 py-0.5">
                  {symptom.replace('_', ' ')}
                </Badge>
              ))}
              {moodLog.symptoms.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{moodLog.symptoms.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 sm:text-right">
          <div className="flex items-center gap-1 text-purple-400">
            <Heart className="h-3 w-3" />
            <span className="text-xs font-medium">Well-being</span>
          </div>
          <p className="text-xs sm:text-sm text-vibrantOrange font-medium">
            +5.0 pts
          </p>
        </div>
      </div>
    </motion.div>
  );
};