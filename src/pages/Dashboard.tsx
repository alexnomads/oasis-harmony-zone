import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { MeditationService } from '@/lib/meditationService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Award, TrendingUp, History, Globe } from 'lucide-react';
import { formatDurationDetails } from '@/lib/utils/timeFormat';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import MeditationTrendChart from '@/components/dashboard/MeditationTrendChart';
import { DashboardImageGenerator } from '@/components/dashboard/DashboardImageGenerator';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-16 pb-8 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-vibrantPurple to-vibrantOrange">Your Journey</h1>
            <div className="flex flex-col xs:flex-row gap-3">
              <Button
                onClick={() => navigate('/meditate')}
                className="bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90 w-full xs:w-auto"
                size="lg"
              >
                <Timer className="mr-2 h-5 w-5" />
                Start Meditating
              </Button>
              <Button
                onClick={() => navigate('/global-dashboard')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 w-full xs:w-auto"
                size="lg"
              >
                <Globe className="mr-2 h-5 w-5" />
                Global View
              </Button>
            </div>
          </div>

          {/* Share Dashboard Section */}
          {user && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Card className="bg-zinc-900/50 border-zinc-800">
                <div className="p-5 sm:p-6 border-b border-zinc-800">
                  <h2 className="text-xl sm:text-2xl font-bold">Share Your Journey</h2>
                  <p className="text-zinc-400 mt-1">Generate a beautiful image of your meditation progress</p>
                </div>
                <CardContent className="p-5 sm:p-6">
                  <DashboardImageGenerator
                    userEmail={user.email || ''}
                    totalPoints={totalPoints}
                    streak={streak}
                    totalSessions={totalSessions}
                    totalDuration={formatDurationDetails(totalDuration)}
                    profileUrl={`https://roseofjericho.xyz/profile/${user.email?.split('@')[0]}`}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <CardContent className="p-4 sm:pt-6">
                  <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                    </div>
                    <div className="text-center xs:text-left">
                      <p className="text-xs sm:text-sm text-zinc-400">Total Points</p>
                      <h3 className="text-xl sm:text-2xl font-bold">{totalPoints.toFixed(1)}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <CardContent className="p-4 sm:pt-6">
                  <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                    </div>
                    <div className="text-center xs:text-left">
                      <p className="text-xs sm:text-sm text-zinc-400">Current Streak</p>
                      <h3 className="text-xl sm:text-2xl font-bold">{streak} days</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <CardContent className="p-4 sm:pt-6">
                  <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <History className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                    </div>
                    <div className="text-center xs:text-left">
                      <p className="text-xs sm:text-sm text-zinc-400">Total Sessions</p>
                      <h3 className="text-xl sm:text-2xl font-bold">{totalSessions}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <CardContent className="p-4 sm:pt-6">
                  <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                    </div>
                    <div className="text-center xs:text-left">
                      <p className="text-xs sm:text-sm text-zinc-400">Total Time</p>
                      <h3 className="text-xl sm:text-2xl font-bold">{formatDurationDetails(totalDuration)}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Meditation Trend Chart */}
          <MeditationTrendChart sessions={userData?.sessions || []} />

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <div className="p-5 sm:p-6 border-b border-zinc-800">
                <h2 className="text-xl sm:text-2xl font-bold">Recent Sessions</h2>
              </div>
              <CardContent className="p-0">
                {recentSessions.length > 0 ? (
                  <div className="divide-y divide-zinc-800/70">
                    {recentSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 sm:p-5 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm sm:text-base">{session.type}</p>
                            <p className="text-xs sm:text-sm text-zinc-400">
                              {formatDate(session.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm sm:text-base">
                              {formatDurationDetails(session.duration)}
                            </p>
                            <p className="text-xs sm:text-sm text-vibrantOrange">
                              +{session.points_earned.toFixed(1)} points
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-zinc-400">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Timer className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                      <p className="text-lg">No meditation sessions yet.</p>
                      <p className="mt-2 text-sm">Start your journey today!</p>
                      <Button
                        onClick={() => navigate('/meditate')}
                        className="mt-6 bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
                      >
                        Begin Meditation
                      </Button>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
