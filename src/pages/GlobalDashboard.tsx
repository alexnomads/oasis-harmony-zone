
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Award } from "lucide-react";
import { formatDurationDetails } from "@/lib/utils/timeFormat";
import { GlobalLeaderboard } from "@/components/leaderboard/GlobalLeaderboard";

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

  const { data: leaderboardData } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // We can get the global stats from the leaderboard data
      const response = await fetch("/api/leaderboard");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (leaderboardData) {
      // Calculate global stats from leaderboard data
      const totalUsers = leaderboardData.length;
      let totalSessions = 0;
      let totalMeditationTime = 0;

      leaderboardData.forEach((entry: any) => {
        totalSessions += entry.total_sessions || 0;
        totalMeditationTime += entry.total_meditation_time || 0;
      });

      setStats({
        totalUsers,
        totalSessions,
        totalMeditationTime,
      });
    }
  }, [leaderboardData]);

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
                  <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
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
                  <h3 className="text-2xl font-bold">{stats.totalSessions}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Meditation Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <Trophy className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Time</p>
                  <h3 className="text-2xl font-bold">{formatDurationDetails(stats.totalMeditationTime)}</h3>
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
