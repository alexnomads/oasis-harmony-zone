
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
      let totalUsersCount = 0;
      let completedSessions: any[] = [];
      
      if (timePeriod === "all") {
        // Get all users who have ever completed a meditation
        const { data: allUsers, error: usersError } = await supabase
          .rpc('get_all_meditation_users');
          
        if (usersError) {
          console.error("Error fetching all users:", usersError);
          throw usersError;
        }
        
        totalUsersCount = allUsers?.length || 0;
        
        // Get ALL completed meditation sessions
        const { data: allSessions, error: sessionsError } = await supabase
          .rpc('get_all_completed_sessions');
          
        if (sessionsError) {
          console.error("Error fetching all sessions:", sessionsError);
          throw sessionsError;
        }
        
        completedSessions = allSessions || [];
      } else {
        // This is for time periods other than "all"
        let startDate: Date | null = null;
        const now = new Date();
        
        // Set the appropriate start date based on the selected time period
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

      // Calculate total meditation time
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
    staleTime: 1000,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  useEffect(() => {
    if (globalStats) {
      console.log("Updated global stats:", globalStats);
      setStats(globalStats);
    }
  }, [globalStats]);

  return { stats, isLoading, refetch };
}
