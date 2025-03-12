
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, User, Calendar, Timer, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatDuration } from '@/lib/utils/timeFormat';

type LeaderboardEntry = {
  user_id: string;
  total_points: number;
  meditation_streak: number;
  total_sessions: number;
  total_meditation_time: number;
  display_name: string;
  email: string;
};

export const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('global_leaderboard')
          .select('*')
          .order('total_points', { ascending: false })
          .limit(20);

        if (error) throw error;

        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leaderboard data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [toast]);

  const getInitials = (name: string) => {
    if (name.includes('@')) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-700';
      default: return 'text-zinc-500';
    }
  };

  const getUsernameFromEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;
    return email.split('@')[0];
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Award className="h-6 w-6 text-vibrantPurple" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <p>No meditation sessions recorded yet.</p>
            <p className="mt-2">Be the first to join the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => {
              const displayName = entry.display_name === entry.email 
                ? getUsernameFromEmail(entry.email)
                : entry.display_name;
                
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                    {index < 3 ? (
                      <Medal className={`h-6 w-6 ${getMedalColor(index)}`} />
                    ) : (
                      <span className="text-zinc-500 font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`} alt={displayName} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{displayName}</p>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {entry.total_points} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.meditation_streak} day streak
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-vibrantOrange">{entry.total_sessions} sessions</p>
                    <p className="text-sm text-zinc-400 flex items-center justify-end gap-1">
                      <Timer className="h-3 w-3" />
                      {formatDuration(entry.total_meditation_time)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
