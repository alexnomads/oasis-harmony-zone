
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
    total_sessions: number;
    total_meditation_time: number;
    display_name: string;
    email: string;
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

  const getUsernameFromEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;
    return email.split('@')[0];
  };

  const displayName = entry.display_name === entry.email 
    ? getUsernameFromEmail(entry.email)
    : entry.display_name;
  
  const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
  
  // Using active_streak directly from the database view
  // This ensures streaks are only counted for users who have meditated today or yesterday
  const streak = entry.active_streak;

  // Generate username slug for URL
  const usernameSlug = getUsernameFromEmail(entry.email);

  return (
    <Link to={`/global-dashboard/${usernameSlug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10 shadow-sm hover:bg-white/10 transition-colors duration-200 cursor-pointer"
      >
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
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-400">
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            {entry.total_points} pts
          </span>
          <span className="flex items-center gap-1">
            <Flame className={`h-3 w-3 ${streak > 0 ? 'text-orange-500' : 'text-zinc-500'}`} />
            {streak} day streak
          </span>
        </div>
      </div>
      
      <div className="text-right flex-shrink-0">
        <p className="font-medium text-vibrantOrange text-base sm:text-lg whitespace-nowrap">{entry.total_sessions} sessions</p>
        <p className="text-xs sm:text-sm text-zinc-400 flex items-center justify-end gap-1 whitespace-nowrap">
          <Timer className="h-3 w-3" />
          {formatDuration(entry.total_meditation_time)}
        </p>
      </div>
    </motion.div>
    </Link>
  );
};
