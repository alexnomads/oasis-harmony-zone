import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { MeditationService } from '@/lib/meditationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Award, TrendingUp, History, Globe } from 'lucide-react';
import { formatDurationDetails } from '@/lib/utils/timeFormat';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_meditation_${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'meditation_sessions',
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        console.log("New user meditation session detected:", payload);
        refetch();
        toast({
          title: "Session recorded!",
          description: "Your dashboard has been updated with your latest session.",
        });
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'meditation_sessions',
        filter: `user_id=eq.${user.id} AND status=eq.completed` 
      }, (payload) => {
        console.log("User meditation session completed:", payload);
        refetch();
        toast({
          title: "Session completed!",
          description: "Your dashboard has been updated with your latest session.",
        });
      })
      .subscribe((status) => {
        console.log("User subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to user meditation updates for user:", user.id);
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error subscribing to user meditation updates");
          toast({
            title: "Connection Error",
            description: "Failed to subscribe to real-time updates. Your data may not be current.",
            variant: "destructive",
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const { data: userData, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['userHistory', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      console.log("Fetching user history for:", user.id);
      const result = await MeditationService.getUserHistory(user.id);
      console.log("User history result:", result);
      return result;
    },
    enabled: !!user,
    staleTime: 1000,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const totalPoints = userData?.points?.total_points || 0;
  const streak = userData?.points?.meditation_streak || 0;
  const totalSessions = userData?.sessions?.length || 0;
  
  const totalDuration = userData?.sessions?.reduce((acc, session) => {
    const sessionDuration = session.duration || 0;
    console.log(`Adding user session duration: ${sessionDuration}`);
    return acc + sessionDuration;
  }, 0) || 0;
  
  console.log("Calculated user stats:", {
    totalPoints,
    streak,
    totalSessions,
    totalDuration
  });

  if (loading || loadingData) return null;

  const recentSessions = userData?.sessions.slice(0, 5) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Journey</h1>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/meditate')}
                className="bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
              >
                <Timer className="mr-2 h-5 w-5" />
                Start Meditating
              </Button>
              <Button
                onClick={() => navigate('/global-dashboard')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Globe className="mr-2 h-5 w-5" />
                Global Dashboard
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Award className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Points</p>
                    <h3 className="text-2xl font-bold">{totalPoints}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Current Streak</p>
                    <h3 className="text-2xl font-bold">{streak} days</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <History className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Sessions</p>
                    <h3 className="text-2xl font-bold">{totalSessions}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Timer className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Time</p>
                    <h3 className="text-2xl font-bold">{formatDurationDetails(totalDuration)}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{session.type}</p>
                        <p className="text-sm text-zinc-400">
                          {formatDate(session.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatDurationDetails(session.duration)}
                        </p>
                        <p className="text-sm text-zinc-400">
                          +{session.points_earned} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <p>No meditation sessions yet.</p>
                  <p className="mt-2">Start your journey today!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
