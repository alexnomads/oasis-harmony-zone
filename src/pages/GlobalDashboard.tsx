
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
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('user_points')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get total sessions and meditation time
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('meditation_sessions')
        .select('duration')
        .eq('status', 'completed');

      if (sessionsError) throw sessionsError;

      const totalSessions = sessionsData?.length || 0;
      
      // Calculate the AGGREGATE total meditation time of all users
      const totalMeditationTime = sessionsData?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;

      console.log("Global Stats Retrieved:", {
        users: usersCount,
        sessions: totalSessions,
        time: totalMeditationTime
      });

      return {
        totalUsers: usersCount || 0,
        totalSessions,
        totalMeditationTime,
      };
    } catch (error) {
      console.error("Error fetching global stats:", error);
      throw error;
    }
  };

  // Set up real-time subscription for completed meditation sessions
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
      .subscribe();

    console.log("Subscribed to global meditation updates");

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { data: globalStats, isLoading, refetch } = useQuery({
    queryKey: ["globalStats"],
    queryFn: fetchGlobalStats,
    staleTime: 5000, // Consider data stale after 5 seconds
    refetchInterval: 10000, // Poll every 10 seconds
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
