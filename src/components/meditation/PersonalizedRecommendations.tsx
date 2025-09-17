import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Zap, Moon, Sparkles, Dumbbell, Timer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SessionService } from '@/lib/services/sessionService';
import { useToast } from '@/components/ui/use-toast';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  duration: number;
  icon: React.ReactNode;
  reason: string;
  workoutType?: 'abs' | 'pushups';
}

interface PersonalizedRecommendationsProps {
  type?: 'meditation' | 'fitness';
}

export const PersonalizedRecommendations = ({ type = 'meditation' }: PersonalizedRecommendationsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState<string | null>(null);

  useEffect(() => {
    generateRecommendations();
  }, [user, type]);

  const generateRecommendations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (type === 'fitness') {
        // Fetch user's fitness history
        const { data: fitnessSessions } = await supabase
          .from('fitness_sessions')
          .select('workout_type, duration, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const recs = generateFitnessRecommendations(fitnessSessions || []);
        const allowedTypes: Array<'abs' | 'pushups'> = ['abs', 'pushups'];
        setRecommendations(recs.filter(r => r.workoutType && allowedTypes.includes(r.workoutType)));

      } else {
        // Fetch user's meditation history
        const { data: sessions } = await supabase
          .from('meditation_sessions')
          .select('duration, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch user's mood logs
        const { data: moods } = await supabase
          .from('daily_moods')
          .select('mood_rating, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(7);

        const recs = generatePersonalizedRecommendations(sessions || [], moods || []);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setRecommendations(type === 'fitness' ? getDefaultFitnessRecommendations() : getDefaultRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const getUniqueRecommendations = (recommendations: Recommendation[]): Recommendation[] => {
    const uniqueRecommendations: Recommendation[] = [];
    const seenDurations = new Set<number>();

    for (const recommendation of recommendations) {
      if (!seenDurations.has(recommendation.duration)) {
        uniqueRecommendations.push(recommendation);
        seenDurations.add(recommendation.duration);
      }
    }

    return uniqueRecommendations;
  };

  const generateFitnessRecommendations = (sessions: any[]): Recommendation[] => {
    const recs: Recommendation[] = [];
    const currentHour = new Date().getHours();

    // Time-based fitness recommendations
    if (currentHour < 10) {
      recs.push({
        id: 'morning-abs',
        title: 'Morning Core',
        description: 'Start your day with an energizing abs workout',
        duration: 300, // 5 minutes
        icon: <Dumbbell className="w-4 h-4" />,
        reason: 'Perfect for morning energy',
        workoutType: 'abs'
      });
    } else if (currentHour >= 10 && currentHour < 18) {
      recs.push({
        id: 'midday-pushups',
        title: 'Power Push-ups',
        description: 'Quick upper body strength session',
        duration: 120, // 2 minutes
        icon: <Zap className="w-4 h-4" />,
        reason: 'Great for midday boost',
        workoutType: 'pushups'
      });
    } else {
      recs.push({
        id: 'evening-plank',
        title: 'Evening Plank',
        description: 'End your day with core stability',
        duration: 120, // 2 minutes
        icon: <Timer className="w-4 h-4" />,
        reason: 'Perfect evening routine',
        workoutType: 'abs'
      });
    }

    // Based on fitness history
    if (sessions.length > 0) {
      const recentWorkout = sessions[0];
      const oppositeWorkout = recentWorkout.workout_type === 'abs' ? 'pushups' : 'abs';
      
      recs.push({
        id: 'balance-workout',
        title: oppositeWorkout === 'abs' ? 'Core Focus' : 'Upper Body',
        description: oppositeWorkout === 'abs' ? 'Balance with abs training' : 'Build upper body strength',
        duration: 300, // 5 minutes
        icon: <Dumbbell className="w-4 h-4" />,
        reason: `Balance your ${recentWorkout.workout_type} training`,
        workoutType: oppositeWorkout
      });
    }

    // Fill with defaults if needed
    while (recs.length < 2) {
      const defaults = getDefaultFitnessRecommendations();
      const newRec = defaults.find(d => !recs.some(r => r.id === d.id));
      if (newRec) recs.push(newRec);
      else break;
    }

    return getUniqueRecommendations(recs).slice(0, 2);
  };

  const getDefaultFitnessRecommendations = (): Recommendation[] => [
    {
      id: 'beginner-abs',
      title: 'Quick Abs',
      description: 'Simple 5-minute core workout',
      duration: 300,
      icon: <Dumbbell className="w-4 h-4" />,
      reason: 'Great for getting started',
      workoutType: 'abs'
    },
    {
      id: 'pushup-challenge',
      title: 'Push-up Power',
      description: 'Build upper body strength',
      duration: 120,
      icon: <Zap className="w-4 h-4" />,
      reason: 'Popular strength exercise',
      workoutType: 'pushups'
    }
  ];

  const generatePersonalizedRecommendations = (sessions: any[], moods: any[]): Recommendation[] => {
    const recs: Recommendation[] = [];
    const currentHour = new Date().getHours();

    // Time-based recommendations
    if (currentHour < 10) {
      recs.push({
        id: 'morning-energy',
        title: 'Morning Energy Boost',
        description: 'Start your day with focused breathing',
        duration: 300,
        icon: <Zap className="w-4 h-4" />,
        reason: 'Perfect for morning motivation'
      });
    } else if (currentHour > 20) {
      recs.push({
        id: 'evening-calm',
        title: 'Evening Wind Down',
        description: 'Gentle meditation to prepare for rest',
        duration: 600,
        icon: <Moon className="w-4 h-4" />,
        reason: 'Great for evening relaxation'
      });
    }

    // Based on session history
    if (sessions.length > 0) {
      const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
      let preferredDuration = Math.round(avgDuration / 60) * 60; // Round to nearest minute
      
      // Ensure minimum 1 minute, prefer 1 or 5 minutes
      if (preferredDuration < 60) {
        preferredDuration = 60; // Default to 1 minute
      } else if (preferredDuration < 300) {
        preferredDuration = Math.round(preferredDuration / 60) === 1 ? 60 : 300; // 1 or 5 minutes
      } else {
        preferredDuration = Math.max(300, preferredDuration); // At least 5 minutes for longer sessions
      }

      recs.push({
        id: 'preferred-duration',
        title: 'Your Usual Practice',
        description: `${preferredDuration / 60}-minute focused meditation`,
        duration: preferredDuration,
        icon: <Brain className="w-4 h-4" />,
        reason: `Based on your ${Math.round(avgDuration / 60)}-minute average sessions`
      });
    }

    // Based on mood patterns
    if (moods.length > 0) {
      const recentMood = moods[0]?.mood_rating || 3;
      if (recentMood < 3) {
        recs.push({
          id: 'mood-boost',
          title: 'Stress Relief',
          description: 'Calming meditation to lift your spirits',
          duration: 600,
          icon: <Heart className="w-4 h-4" />,
          reason: 'Recommended for stress relief'
        });
      }
    }

    // Fill with defaults if needed
    while (recs.length < 2) {
      const defaults = getDefaultRecommendations();
      const newRec = defaults.find(d => !recs.some(r => r.id === d.id));
      if (newRec) recs.push(newRec);
      else break;
    }

    // Filter out duplicate durations and return unique recommendations
    const uniqueRecs = getUniqueRecommendations(recs);
    return uniqueRecs.slice(0, 2);
  };

  const getDefaultRecommendations = (): Recommendation[] => [
    {
      id: 'beginner-breath',
      title: 'Mindful Breathing',
      description: 'Simple breathing exercise for beginners',
      duration: 300,
      icon: <Brain className="w-4 h-4" />,
      reason: 'Great for getting started'
    },
    {
      id: 'stress-relief',
      title: 'Stress Relief',
      description: 'Gentle meditation to reduce tension',
      duration: 600,
      icon: <Heart className="w-4 h-4" />,
      reason: 'Popular choice for relaxation'
    }
  ];

  const startSession = async (rec: Recommendation) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start a session.",
        variant: "destructive"
      });
      return;
    }

    try {
      setStartingSession(rec.title);
      
      if (type === 'fitness') {
        // For fitness, dispatch event to start workout
        const displayDuration = rec.duration === 30 ? "30-second" : `${Math.floor(rec.duration / 60)}-minute`;
        toast({
          title: "Starting Workout",
          description: `${rec.title} - ${displayDuration} ${rec.workoutType} workout starting now.`
        });

        // Switch to fitness workout
        window.dispatchEvent(new CustomEvent('startRecommendedWorkout', { 
          detail: { duration: rec.duration, workoutType: rec.workoutType, title: rec.title } 
        }));
      } else {
        // Create meditation session in database
        const session = await SessionService.startSession(user.id, 'mindfulness');
        
        // Show success message
        const displayDuration = rec.duration === 30 ? "30-second" : `${Math.floor(rec.duration / 60)}-minute`;
        toast({
          title: "Starting Meditation",
          description: `${rec.title} - ${displayDuration} session starting now.`
        });

        // Switch to Quick Meditation tab and trigger the session
        window.dispatchEvent(new CustomEvent('startRecommendedMeditation', { 
          detail: { duration: rec.duration, sessionId: session.id, title: rec.title } 
        }));
      }

    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Failed to start session",
        description: "There was an error starting your session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setStartingSession(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            Preparing your personalized recommendations...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            Sign in to get personalized meditation recommendations
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex items-start justify-between p-4 rounded-lg bg-black/30 border border-white/10 gap-4"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="text-accent mt-0.5 flex-shrink-0">{rec.icon}</div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground leading-tight">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hidden lg:inline-flex">
                  {rec.reason}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-end justify-start gap-2 flex-shrink-0">
              <div className="text-sm text-muted-foreground font-medium">
                {Math.round(rec.duration / 60)} min
              </div>
              <Button 
                size="sm" 
                className="retro-button text-xs px-4 py-2 min-w-[60px]"
                onClick={() => startSession(rec)}
                disabled={startingSession === rec.title}
              >
                {startingSession === rec.title ? 'Starting...' : 'START'}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};