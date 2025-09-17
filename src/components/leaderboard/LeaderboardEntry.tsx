
import { Medal, Timer, Award, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDuration } from '@/lib/utils/timeFormat';

type LeaderboardEntryProps = {
  entry: {
    user_id: string;
    total_points: number;
    meditation_streak: number;
    fitness_streak: number;
    total_sessions: number;
    total_meditation_time: number;
    total_fitness_sessions: number;
    total_fitness_time: number;
    display_name: string;
    active_streak: number; // Using the active_streak field from the SQL view
  };
  index: number;
  currentPage: number;
  itemsPerPage: number;
};

export const LeaderboardEntry = ({ entry, index, currentPage, itemsPerPage }: LeaderboardEntryProps) => {
  const getInitials = (name: string) => {
    if (name.includes('@')) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getMedalColor = (position: number) => {
    const globalPosition = (currentPage - 1) * itemsPerPage + position;
    
    switch (globalPosition) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-700';
      default: return 'text-zinc-500';
    }
  };

  const displayName = entry.display_name || `User ${entry.user_id.substring(0, 8)}`;
  
  const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
  
  // Using active_streak directly from the database view
  // This ensures streaks are only counted for users who have meditated today or yesterday
  const streak = entry.active_streak;

  // Generate username slug for URL using display_name
  const usernameSlug = entry.display_name.replace(/\s+/g, '-').toLowerCase();

  return (
    <Link to={`/global-dashboard/${usernameSlug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="bg-white/5 rounded-lg border border-white/10 shadow-sm hover:bg-white/10 transition-colors duration-200 cursor-pointer"
      >
        {/* Mobile Card Layout */}
        <div className="block sm:hidden p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
              {globalRank <= 3 ? (
                <Medal className={`h-6 w-6 ${getMedalColor(index)}`} />
              ) : (
                <span className="text-zinc-500 font-medium">{globalRank}</span>
              )}
            </div>
            
            <Avatar className="h-12 w-12 border-2 border-white/10">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`} alt={displayName} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{displayName}</h3>
              <div className="text-sm text-zinc-400 mb-2">
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {entry.total_points} pts
                </span>
              </div>
              <div className="text-vibrantOrange font-medium text-sm mb-2">
                {entry.total_sessions + (entry.total_fitness_sessions || 0)} sessions
              </div>
              <div className="text-zinc-400 text-xs mb-3">
                {formatDuration(entry.total_meditation_time + (entry.total_fitness_time || 0))}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>🧘{entry.meditation_streak}d</span>
                <span>💪{entry.fitness_streak || 0}d</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Row Layout */}
        <div className="hidden sm:flex items-center gap-2 p-3">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
            {globalRank <= 3 ? (
              <Medal className={`h-6 w-6 ${getMedalColor(index)}`} />
            ) : (
              <span className="text-zinc-500 font-medium">{globalRank}</span>
            )}
          </div>
          
          <Avatar className="h-12 w-12 border-2 border-white/10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`} alt={displayName} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 ml-1">
            <p className="font-semibold text-base sm:text-lg">{displayName}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {entry.total_points} pts
              </span>
              <span>
                🧘{entry.meditation_streak}d • 💪{entry.fitness_streak || 0}d
              </span>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-1 text-xs sm:text-sm">
                <span>🧘</span>
                <span className="font-medium text-vibrantOrange">{entry.total_sessions}</span>
                <span className="text-zinc-400">({formatDuration(entry.total_meditation_time)})</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-xs sm:text-sm">
                <span>💪</span>
                <span className="font-medium text-vibrantOrange">{entry.total_fitness_sessions || 0}</span>
                <span className="text-zinc-400">({formatDuration(entry.total_fitness_time || 0)})</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
