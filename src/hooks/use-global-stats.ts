
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
      // Get total users count - accessing a view that shows all users
      // First try to get from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id', { count: 'exact' });

      let totalUsersCount = 0;
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        
        // Try user_points table as fallback
        const { data: userPointsData, error: userPointsError } = await supabase
          .from('user_points')
          .select('user_id');
          
        if (userPointsError) {
          console.error("Error fetching user points:", userPointsError);
          
          // Last resort: try direct count query which might work depending on permissions
          const { count, error: countError } = await supabase
            .from('user_points')
            .select('*', { count: 'exact', head: true });
            
          if (countError) {
            console.error("Error getting count:", countError);
            // Default to 0 if all attempts fail
          } else {
            totalUsersCount = count || 0;
            console.log("Users count from count query:", totalUsersCount);
          }
        } else {
          totalUsersCount = userPointsData?.length || 0;
          console.log("Users from user_points:", userPointsData, "Count:", totalUsersCount);
        }
      } else {
        totalUsersCount = profilesData?.length || 0;
        console.log("Users from profiles:", profilesData, "Count:", totalUsersCount);
      }

      // Get ALL completed meditation sessions using public query
      const { data: sessionsData, error: sessionsError } = await supabase
        .rpc('get_all_completed_sessions');

      let completedSessions: any[] = [];

      if (sessionsError) {
        console.error("Error calling RPC function:", sessionsError);
        
        // Fallback to direct query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('meditation_sessions')
          .select('*')
          .eq('status', 'completed');
          
        if (fallbackError) {
          console.error("Error with fallback query:", fallbackError);
          throw fallbackError;
        }
        
        console.log("Fallback sessions data:", fallbackData);
        completedSessions = fallbackData || [];
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

      // Log complete stats for verification
      console.log("Global Stats Retrieved:", {
        users: totalUsersCount,
        sessions: totalSessions,
        time: totalMeditationTime
      });

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
