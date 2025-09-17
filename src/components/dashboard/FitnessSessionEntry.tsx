import { motion } from "framer-motion";
import { Clock, Dumbbell } from "lucide-react";
import type { FitnessSession } from "@/types/database";

interface FitnessSessionEntryProps {
  session: FitnessSession;
  index: number;
}

export const FitnessSessionEntry = ({ session, index }: FitnessSessionEntryProps) => {
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
  };

  const getWorkoutTypeDisplay = () => {
    const emoji = session.workout_type === 'abs' ? '🏋️‍♂️' : '💪';
    const type = session.workout_type.toUpperCase();
    return `${emoji} ${type} WORKOUT`;
  };

  const getWorkoutDetails = () => {
    if (session.reps_completed > 0) {
      return `${session.reps_completed} reps`;
    }
    return 'Completed';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-3 sm:p-4 hover:bg-white/5 transition-colors border-l-2 border-vibrantOrange/30"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm sm:text-base text-card-foreground">
              {getWorkoutTypeDisplay()}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(session.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                <span>{getWorkoutDetails()}</span>
              </div>
            </div>
            <span className="text-xs">{formatDate(session.created_at)}</span>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 sm:text-right">
          <p className="text-xs sm:text-sm text-vibrantOrange font-medium">
            +{session.points_earned.toFixed(1)} pts
          </p>
        </div>
      </div>
    </motion.div>
  );
};