import { useEffect, useState } from 'react';
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
import { PetSection } from '@/components/pet/PetSection';
import { MoodSessionEntry } from '@/components/dashboard/MoodSessionEntry';
import { MeditationSessionEntry } from '@/components/dashboard/MeditationSessionEntry';
import { FitnessSessionEntry } from '@/components/dashboard/FitnessSessionEntry';
import { usePet } from '@/hooks/usePet';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { moodHistory } = usePet(user?.id);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'meditation' | 'mood' | 'fitness'>('all');

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_sessions_${user.id}`)
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
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'fitness_sessions',
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        console.log("New user fitness session detected:", payload);
        refetch();
        toast({
          title: "Fitness session completed!",
          description: "Your dashboard has been updated with your latest workout.",
        });
      })
      .subscribe((status) => {
        console.log("User subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to user session updates for user:", user.id);
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error subscribing to user session updates");
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
  const meditationStreak = userData?.points?.meditation_streak || 0;
  const fitnessStreak = userData?.points?.fitness_streak || 0;
  const totalMeditationSessions = userData?.sessions?.length || 0;
  const totalFitnessSessions = userData?.fitnessSessions?.length || 0;
  const totalSessions = totalMeditationSessions + totalFitnessSessions;
  
  const totalMeditationDuration = userData?.sessions?.reduce((acc, session) => {
    const sessionDuration = session.duration || 0;
    console.log(`Adding meditation session duration: ${sessionDuration}`);
    return acc + sessionDuration;
  }, 0) || 0;

  const totalFitnessDuration = userData?.fitnessSessions?.reduce((acc, session) => {
    const sessionDuration = session.duration || 0;
    console.log(`Adding fitness session duration: ${sessionDuration}`);
    return acc + sessionDuration;
  }, 0) || 0;

  const totalDuration = totalMeditationDuration + totalFitnessDuration;
  
  console.log("Calculated user stats:", {
    totalPoints,
    meditationStreak,
    fitnessStreak,
    totalSessions,
    totalDuration
  });

  console.log("userData points data:", userData?.points);

  if (loading || loadingData) return null;

  const recentSessions = userData?.sessions.slice(0, 5) || [];
  const recentFitnessSessions = userData?.fitnessSessions?.slice(0, 5) || [];
  const recentMoods = moodHistory.slice(0, 5) || [];
  
  // Combine and sort recent activities
  const combinedActivities = [
    ...recentSessions.map(session => ({
      type: 'meditation' as const,
      data: session,
      date: new Date(session.created_at)
    })),
    ...recentFitnessSessions.map(session => ({
      type: 'fitness' as const,
      data: session,
      date: new Date(session.created_at)
    })),
    ...recentMoods.map(mood => ({
      type: 'mood' as const,
      data: mood,
      date: new Date(mood.created_at)
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);
  
  // Filter activities based on selected filter
  const filteredActivities = combinedActivities.filter(activity => {
    if (sessionFilter === 'all') return true;
    return activity.type === sessionFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    const datePart = date.toLocaleDateString('en-US', dateOptions);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${datePart} at ${timePart}`;
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
    <div className="min-h-screen relative">
      <Header />
      <div className="container mx-auto px-4 pt-16 pb-8 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="cyber-heading text-3xl sm:text-4xl">Your Journey</h1>
            <div className="flex flex-col xs:flex-row gap-3">
              <button
                onClick={() => navigate('/meditate')}
                className="retro-button px-6 py-3 w-full xs:w-auto"
              >
                <Timer className="mr-2 h-5 w-5" />
                Start Meditating
              </button>
              <button
                onClick={() => navigate('/global-dashboard')}
                className="tape-card px-6 py-3 border border-secondary/50 bg-secondary/10 hover:bg-secondary/20 text-white transition-all duration-300 w-full xs:w-auto"
              >
                <Globe className="mr-2 h-5 w-5" />
                Global Dashboard
              </button>
            </div>
          </div>

          <div className="space-y-6">
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <div className="tape-card p-4 h-24 sm:h-28 flex items-center">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 sm:p-3 bg-primary/20 rounded-lg flex-shrink-0">
                        <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm retro-text text-muted-foreground leading-tight">ROJ Points</p>
                        <h3 className="text-base sm:text-lg font-bold cyber-heading leading-tight">{totalPoints.toFixed(1)}</h3>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="tape-card p-4 h-24 sm:h-28 flex items-center">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 sm:p-3 bg-accent/20 rounded-lg flex-shrink-0">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm retro-text text-muted-foreground leading-tight">Meditation Streak</p>
                        <h3 className="text-base sm:text-lg font-bold cyber-heading leading-tight">{meditationStreak} days</h3>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="tape-card p-4 h-24 sm:h-28 flex items-center">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 sm:p-3 bg-secondary/20 rounded-lg flex-shrink-0">
                        <History className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm retro-text text-muted-foreground leading-tight">Total Sessions</p>
                        <h3 className="text-base sm:text-lg font-bold cyber-heading leading-tight">{totalSessions}</h3>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="tape-card p-4 h-24 sm:h-28 flex items-center">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 sm:p-3 bg-lime/20 rounded-lg flex-shrink-0">
                        <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-lime" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm retro-text text-muted-foreground leading-tight">Total Time</p>
                        <h3 className="text-base sm:text-lg font-bold cyber-heading leading-tight">{formatDurationDetails(totalDuration)}</h3>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

            <MeditationTrendChart 
              sessions={userData?.sessions || []} 
              userStreak={meditationStreak}
              userTotalPoints={totalPoints}
            />

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PetSection />
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <div className="crt-frame p-5 sm:p-6">
                <div className="border-b border-primary/30 pb-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="cyber-heading text-xl sm:text-2xl">Recent Activity</h2>
                    <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
                      <button 
                        className={`tape-card px-4 py-2 text-sm font-medium transition-all ${sessionFilter === 'all' ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'}`}
                        onClick={() => setSessionFilter('all')}
                      >
                        All ({combinedActivities.length})
                      </button>
                      <button 
                        className={`tape-card px-4 py-2 text-sm font-medium transition-all ${sessionFilter === 'meditation' ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'}`}
                        onClick={() => setSessionFilter('meditation')}
                      >
                        🧘 Meditation
                      </button>
                      <button 
                        className={`tape-card px-4 py-2 text-sm font-medium transition-all ${sessionFilter === 'mood' ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'}`}
                        onClick={() => setSessionFilter('mood')}
                      >
                        💭 Mood
                      </button>
                      <button 
                        className={`tape-card px-4 py-2 text-sm font-medium transition-all ${sessionFilter === 'fitness' ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'}`}
                        onClick={() => setSessionFilter('fitness')}
                      >
                        💪 Fitness
                      </button>
                    </div>
                  </div>
                </div>
                {filteredActivities.length > 0 ? (
                  <div className="space-y-2">
                     {filteredActivities.map((activity, index) => (
                       activity.type === 'meditation' ? (
                         <MeditationSessionEntry
                           key={`meditation-${activity.data.id}`}
                           session={activity.data}
                           index={index}
                         />
                       ) : activity.type === 'fitness' ? (
                         <FitnessSessionEntry
                           key={`fitness-${activity.data.id}`}
                           session={activity.data}
                           index={index}
                         />
                       ) : (
                         <MoodSessionEntry 
                           key={`mood-${activity.data.id}`}
                           moodLog={activity.data}
                           index={index}
                         />
                       )
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="retro-text"
                    >
                      <Timer className="h-12 w-12 mx-auto mb-3 text-primary" />
                      <p className="text-lg">
                        {sessionFilter === 'mood' ? 'No mood logs yet.' : 
                         sessionFilter === 'meditation' ? 'No meditation sessions yet.' : 
                         sessionFilter === 'fitness' ? 'No fitness sessions yet.' :
                         'No activity yet.'}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {sessionFilter === 'mood' ? 'Check in with yourself in the pet section!' : 
                         sessionFilter === 'fitness' ? 'Start working out to see your progress!' :
                         'Start your journey today!'}
                      </p>
                      {sessionFilter !== 'mood' && sessionFilter !== 'fitness' && (
                        <button
                          onClick={() => navigate('/meditate')}
                          className="retro-button mt-6 px-6 py-3"
                        >
                          Begin Meditation
                        </button>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
