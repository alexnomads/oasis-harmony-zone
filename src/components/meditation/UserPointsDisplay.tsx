import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const UserPointsDisplay = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (!user) return;

    try {
      // Fetch total points from currency table
      const { data: currency } = await supabase
        .from('user_currency')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (currency) {
        setPoints(currency.points);
      }

      // Fetch today's points from meditation sessions
      const today = new Date().toISOString().split('T')[0];
      const { data: sessions } = await supabase
        .from('meditation_sessions')
        .select('points_earned')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      const todayTotal = sessions?.reduce((sum, session) => sum + (session.points_earned || 0), 0) || 0;
      setTodayPoints(todayTotal);
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-accent" />
            <div>
              <div className="text-xl font-bold text-foreground">
                {loading ? '...' : points.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>
          {todayPoints > 0 && (
            <div className="flex items-center gap-1 text-accent">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{todayPoints} today</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};