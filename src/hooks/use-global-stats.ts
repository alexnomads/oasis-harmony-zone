
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export interface GlobalStats {
  totalUsers: number;
  totalSessions: number;
  totalMeditationTime: number;
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats>({
    totalUsers: 0,
    totalSessions: 0,
    totalMeditationTime: 0,
  });

  const fetchGlobalStats = async () => {
    console.log("Fetching global stats...");
    
    try {
      // Get total users count using leaderboard view which has all users
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('global_leaderboard')
        .select('user_id');
      
      if (leaderboardError) {
        console.error("Error fetching leaderboard:", leaderboardError);
        throw leaderboardError;
      }
      
      const totalUsersCount = leaderboardData?.length || 0;
      console.log("Total users from leaderboard:", totalUsersCount);

      // Get ALL completed meditation sessions using RPC function
      const { data: sessionsData, error: sessionsError } = await supabase
        .rpc('get_all_completed_sessions');

      let completedSessions: any[] = [];

      if (sessionsError) {
        console.error("Error calling RPC function:", sessionsError);
        
        // Try to query the global leaderboard for aggregate data instead
        const { data: aggregateData, error: aggregateError } = await supabase
          .from('global_leaderboard')
          .select('total_sessions, total_meditation_time');
          
        if (aggregateError) {
          console.error("Error with aggregate query:", aggregateError);
          throw aggregateError;
        }
        
        // Calculate total sessions and meditation time from aggregate data
        const totalSessions = aggregateData.reduce((sum, entry) => sum + (entry.total_sessions || 0), 0);
        const totalMeditationTime = aggregateData.reduce((sum, entry) => sum + (entry.total_meditation_time || 0), 0);
        
        console.log("Aggregate stats calculated:", { totalSessions, totalMeditationTime });
        
        return {
          totalUsers: totalUsersCount,
          totalSessions,
          totalMeditationTime,
        };
      } else {
        console.log("RPC sessions data:", sessionsData);
        completedSessions = sessionsData || [];
      }

      // Count of completed sessions
      const totalSessions = completedSessions.length;
      console.log("Total completed sessions count:", totalSessions);
      
      // Calculate the total meditation time across ALL sessions
      const totalMeditationTime = completedSessions.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);

      console.log("Total meditation time (seconds):", totalMeditationTime);

      return {
        totalUsers: totalUsersCount,
        totalSessions,
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
    queryKey: ["globalStats"],
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
