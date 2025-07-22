import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/dashboard/StatCard";
import { MeditationSession } from "@/components/dashboard/MeditationSession";
import { formatDuration } from "@/lib/utils";
import {
  Trophy,
  Flame,
  Target,
  Clock
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      console.log('Fetching dashboard data for user:', user.id);
      
      const [userStatsResult, sessionsResult] = await Promise.all([
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('meditation_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (userStatsResult.error && !userStatsResult.error.message.includes('No data returned')) {
        throw userStatsResult.error;
      }
      
      if (sessionsResult.error) {
        throw sessionsResult.error;
      }

      // Get ROJ currency data (now synced with main points)
      const rojResult = await supabase
        .from('roj_currency')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const userStats = userStatsResult.data || {
        user_id: user.id,
        total_points: 0,
        meditation_streak: 0,
        last_meditation_date: null
      };

      const rojCurrency = rojResult.data || {
        user_id: user.id,
        roj_points: 0,
        stars: 0
      };

      // Use ROJ points as the primary display currency (should be synced)
      const displayPoints = rojCurrency.roj_points || userStats.total_points;

      console.log('Dashboard data loaded:', { userStats, rojCurrency, displayPoints });

      return {
        userStats: { ...userStats, total_points: displayPoints },
        sessions: sessionsResult.data || [],
        rojCurrency
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm p-4 rounded-md">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-opacity-10 rounded-full">
                  <Skeleton className="h-6 w-6" />
                </div>
                <div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm p-4 rounded-md">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              <Skeleton className="h-8 w-8 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-white">
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-4 text-white">
        <p>No data available.</p>
      </div>
    );
  }

  const totalDuration = dashboardData.sessions.reduce((acc, session) => acc + session.duration, 0);

  const stats = [
    {
      title: "ROJ Points",
      value: dashboardData.userStats.total_points.toFixed(1),
      icon: <Trophy className="h-6 w-6 text-yellow-400" />,
      subtitle: "Total earned",
      isLoading
    },
    {
      title: "Meditation Streak",
      value: dashboardData.userStats.meditation_streak,
      icon: <Flame className="h-6 w-6 text-orange-400" />,
      subtitle: "Days in a row",
      isLoading
    },
    {
      title: "Sessions Completed",
      value: dashboardData.sessions.length,
      icon: <Target className="h-6 w-6 text-green-400" />,
      subtitle: "Total sessions",
      isLoading
    },
    {
      title: "Total Time",
      value: formatDuration(totalDuration),
      icon: <Clock className="h-6 w-6 text-blue-400" />,
      subtitle: "Meditation time",
      isLoading
    }
  ];

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white">Recent Sessions</h2>
      <div className="space-y-2">
        {dashboardData.sessions.map(session => (
          <MeditationSession key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
