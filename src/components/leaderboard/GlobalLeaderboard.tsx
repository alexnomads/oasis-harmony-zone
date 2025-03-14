
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, User, Calendar, Timer, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatDuration } from '@/lib/utils/timeFormat';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { LeaderboardService } from '@/lib/services/leaderboardService';

type LeaderboardEntry = {
  user_id: string;
  total_points: number;
  meditation_streak: number;
  total_sessions: number;
  total_meditation_time: number;
  display_name: string;
  email: string;
};

export const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Fetch total count first to calculate pagination
        const totalCount = await LeaderboardService.getLeaderboardCount();
        setTotalUsers(totalCount);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
        
        // Then fetch the current page of data
        const data = await LeaderboardService.getLeaderboard(itemsPerPage, (currentPage - 1) * itemsPerPage);
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leaderboard data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [toast, currentPage]);

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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

  const handlePageChange = (page: number) => {
    // Ensure page is within bounds
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Generate pagination links array
  const getPaginationLinks = () => {
    const links = [];
    const maxLinks = 5; // Maximum number of page links to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxLinks / 2));
    const endPage = Math.min(totalPages, startPage + maxLinks - 1);
    
    // Adjust startPage if we're near the end
    startPage = Math.max(1, endPage - maxLinks + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      links.push(i);
    }
    
    return links;
  };

  return (
    <div className="w-full space-y-4">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">
          <p>No meditation sessions recorded yet.</p>
          <p className="mt-2">Be the first to join the leaderboard!</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-zinc-400 mb-2">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} meditators
          </div>
          
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const displayName = entry.display_name === entry.email 
                ? getUsernameFromEmail(entry.email)
                : entry.display_name;
              
              const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
                
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10 shadow-sm hover:bg-white/10 transition-colors duration-200"
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
                        <Calendar className="h-3 w-3" />
                        {entry.meditation_streak} day streak
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
              );
            })}
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
                
                {getPaginationLinks().map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={page === currentPage}
                      onClick={() => handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};
