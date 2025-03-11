
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Award } from "lucide-react";
import { formatDurationDetails } from "@/lib/utils/timeFormat";
import { GlobalLeaderboard } from "@/components/leaderboard/GlobalLeaderboard";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface GlobalStats {
  totalUsers: number;
  totalSessions: number;
  totalMeditationTime: number;
}

export default function GlobalDashboard() {
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

  useEffect(() => {
    const channel = supabase
      .channel('global_meditation_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'meditation_sessions' 
      }, (payload) => {
        console.log("New meditation session detected:", payload);
        // Immediately refetch data when a new session is inserted
        refetch();
        toast({
          title: "New meditation session completed",
          description: "Global stats have been updated!",
        });
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'meditation_sessions',
        filter: "status=eq.completed"
      }, (payload) => {
        console.log("Meditation session completed:", payload);
        // Immediately refetch data when a session status changes to completed
        refetch();
        toast({
          title: "Meditation session completed",
          description: "Global stats have been updated!",
        });
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to global meditation updates");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error subscribing to global meditation updates");
          toast({
            title: "Connection Error",
            description: "Failed to subscribe to real-time updates. Data may not be current.",
            variant: "destructive",
          });
        }
      });

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
          Global Meditation Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Active Meditators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-violet-500/10 rounded-full">
                  <Users className="h-8 w-8 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Users</p>
                  <h3 className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalUsers}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Meditation Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Award className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Sessions</p>
                  <h3 className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalSessions}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Meditation Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <Trophy className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Collective Time</p>
                  <h3 className="text-2xl font-bold">
                    {isLoading ? "Loading..." : formatDurationDetails(stats.totalMeditationTime)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              <span>Global Leaderboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GlobalLeaderboard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
