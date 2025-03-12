
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { TimePeriod } from "@/components/dashboard/TimeFilter";

export interface GlobalStats {
  totalUsers: number;
  totalSessions: number;
  totalMeditationTime: number;
}

export function useGlobalStats(timePeriod: TimePeriod = "all") {
  const [stats, setStats] = useState<GlobalStats>({
    totalUsers: 0,
    totalSessions: 0,
    totalMeditationTime: 0,
  });

  const fetchGlobalStats = async () => {
    console.log(`Fetching global stats for period: ${timePeriod}...`);
    
    try {
      let startDate: Date | null = null;
      const now = new Date();
      
      // Set the appropriate start date based on the selected time period
      if (timePeriod !== "all") {
        startDate = new Date();
        
        switch(timePeriod) {
          case "day":
            // Set to the beginning of today
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        console.log(`Using start date: ${startDate.toISOString()} for period: ${timePeriod}`);
      }
      
      let totalUsersCount = 0;
      let completedSessions: any[] = [];
      
      // Handle users count based on time period
      if (timePeriod === "all") {
        // Get total users count using leaderboard view which has all users
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('global_leaderboard')
          .select('user_id');
        
        if (leaderboardError) {
          console.error("Error fetching leaderboard:", leaderboardError);
          throw leaderboardError;
        }
        
        totalUsersCount = leaderboardData?.length || 0;
        console.log("Total users from leaderboard (all time):", totalUsersCount);
      } else if (startDate) {
        // Get users who have meditated in the selected time period
        const { data: activeUsers, error: activeUsersError } = await supabase
          .rpc('get_users_by_meditation_period', { 
            start_date: startDate.toISOString() 
          });
          
        if (activeUsersError) {
          console.error("Error fetching active users:", activeUsersError);
          // Fallback to leaderboard data
          const { data: leaderboardData } = await supabase
            .from('global_leaderboard')
            .select('user_id');
            
          totalUsersCount = leaderboardData?.length || 0;
          console.log("Fallback: Total users from leaderboard:", totalUsersCount);
        } else {
          totalUsersCount = activeUsers?.length || 0;
          console.log(`Active users for period ${timePeriod}:`, totalUsersCount);
        }
      }
      
      // Get meditation sessions based on time period
      if (timePeriod === "all") {
        // Get ALL completed meditation sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .rpc('get_all_completed_sessions');
          
        if (sessionsError) {
          console.error("Error calling RPC function:", sessionsError);
          throw sessionsError;
        }
        
        completedSessions = sessionsData || [];
        console.log("All time sessions count:", completedSessions.length);
      } else if (startDate) {
        // Get filtered sessions for the selected time period
        const { data: filteredSessions, error: filteredError } = await supabase
          .rpc('get_filtered_completed_sessions', { 
            start_date: startDate.toISOString() 
          });
          
        if (filteredError) {
          console.error("Error fetching filtered sessions:", filteredError);
          // Fallback to unfiltered data if there's an error
          const { data: fallbackData } = await supabase
            .rpc('get_all_completed_sessions');
            
          completedSessions = fallbackData || [];
          console.log("Fallback: Using all sessions due to filtering error");
        } else {
          completedSessions = filteredSessions || [];
          console.log(`Filtered sessions for period ${timePeriod}:`, completedSessions.length);
        }
      }

      // Calculate the total meditation time across sessions
      const totalMeditationTime = completedSessions.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);

      console.log(`Stats for ${timePeriod}: Users: ${totalUsersCount}, Sessions: ${completedSessions.length}, Time: ${totalMeditationTime}`);

      return {
        totalUsers: totalUsersCount,
        totalSessions: completedSessions.length,
        totalMeditationTime,
      };
    } catch (error) {
      console.error("Error fetching global stats:", error);
      toast({
        title: "Error loading global stats",
        description: "There was a problem fetching the global statistics.",
        variant: "destructive",
      });
      return {
        totalUsers: 0,
        totalSessions: 0,
        totalMeditationTime: 0,
      };
    }
  };

  const { data: globalStats, isLoading, refetch } = useQuery({
    queryKey: ["globalStats", timePeriod],
    queryFn: fetchGlobalStats,
    staleTime: 1000, // Consider data stale after just 1 second for more frequent updates
    refetchInterval: 5000, // More frequent polling every 5 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed queries 3 times
  });

  useEffect(() => {
    if (globalStats) {
      console.log("Updated global stats:", globalStats);
      setStats(globalStats);
    }
  }, [globalStats]);

  return { stats, isLoading, refetch };
}
