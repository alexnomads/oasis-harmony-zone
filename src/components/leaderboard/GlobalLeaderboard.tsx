
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { LeaderboardService } from '@/lib/services/leaderboardService';
import { LeaderboardEntry } from './LeaderboardEntry';
import { LeaderboardPagination } from './LeaderboardPagination';
import { LeaderboardLoading } from './LeaderboardLoading';
import { LeaderboardEmpty } from './LeaderboardEmpty';

type LeaderboardEntry = {
  user_id: string;
  total_points: number;
  meditation_streak: number;
  fitness_streak: number;
  total_sessions: number;
  total_meditation_time: number;
  total_fitness_sessions: number;
  total_fitness_time: number;
  display_name: string;
  email: string;
  active_streak: number; // Added the active_streak property that's required by LeaderboardEntry
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

  const handlePageChange = (page: number) => {
    // Ensure page is within bounds
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="w-full space-y-4">
      {loading ? (
        <LeaderboardLoading />
      ) : leaderboard.length === 0 ? (
        <LeaderboardEmpty />
      ) : (
        <>
          <div className="text-sm text-zinc-400 mb-2">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
          </div>
          
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <LeaderboardEntry 
                key={entry.user_id} 
                entry={entry} 
                index={index} 
                currentPage={currentPage} 
                itemsPerPage={itemsPerPage} 
              />
            ))}
          </div>
          
          <LeaderboardPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};
