import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardImageGenerator } from './DashboardImageGenerator';
import { formatDurationDetails } from '@/lib/utils/timeFormat';

interface MeditationSession {
  id: string;
  created_at: string;
  duration: number;
  type: string;
  points_earned: number;
  status?: string;
}

interface MeditationTrendChartProps {
  sessions: MeditationSession[];
}

export default function MeditationTrendChart({ sessions }: MeditationTrendChartProps) {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(30);

  const chartData = useMemo(() => {
    if (!sessions?.length) return [];

    // Get the selected number of days
    const days = [];
    const today = new Date();
    
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: 0,
        totalMinutes: 0
      });
    }

    // Count only completed sessions per day
    const completedSessions = sessions.filter(session => 
      session.status === 'completed' || (!session.status && session.duration > 0)
    );
    
    completedSessions.forEach(session => {
      const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
      const dayData = days.find(day => day.date === sessionDate);
      if (dayData) {
        dayData.sessions += 1;
        dayData.totalMinutes += Math.round(session.duration / 60); // Convert seconds to minutes
      }
    });

    return days;
  }, [sessions, selectedPeriod]);

  const maxSessions = Math.max(...chartData.map(d => d.sessions));
  const chartTotalSessions = chartData.reduce((sum, day) => sum + day.sessions, 0);
  const averageSessionsPerDay = (chartTotalSessions / selectedPeriod).toFixed(1);

  // Calculate totals for sharing
  const totalCompletedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalDuration = sessions
    .filter(s => s.status === 'completed')
    .reduce((acc, session) => acc + (session.duration || 0), 0);
  const totalPoints = sessions
    .filter(s => s.status === 'completed')
    .reduce((acc, session) => acc + (session.points_earned || 0), 0);
  
  // Calculate streak (simplified - consecutive days with sessions)
  const today = new Date();
  const completedSessions = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  let streak = 0;
  if (completedSessions.length > 0) {
    const sessionDates = completedSessions.map(s => 
      new Date(s.created_at).toDateString()
    );
    const uniqueDates = [...new Set(sessionDates)];
    
    // Check if today has a session
    const todayStr = today.toDateString();
    const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toDateString();
        if (uniqueDates.includes(checkDate)) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-vibrantOrange">
            {data.sessions} session{data.sessions !== 1 ? 's' : ''}
          </p>
          {data.totalMinutes > 0 && (
            <p className="text-zinc-300 text-sm">
              {data.totalMinutes} minute{data.totalMinutes !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="crt-frame p-5 sm:p-6">
        <div className="border-b border-primary/30 pb-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="cyber-heading text-xl sm:text-2xl">Meditation Frequency</h2>
                <p className="text-white/80 mt-1">Your meditation activity over time</p>
              </div>
            </div>
            {user && (
              <div className="flex justify-center sm:justify-end">
                <DashboardImageGenerator
                  userEmail={user.email || ''}
                  totalPoints={totalPoints}
                  streak={streak}
                  totalSessions={totalCompletedSessions}
                  totalDuration={formatDurationDetails(totalDuration)}
                  profileUrl={`https://roseofjericho.xyz/profile/${user.email?.split('@')[0]}`}
                />
              </div>
            )}
          </div>
        </div>
        <div className="pt-0">
          {/* Time Period Filter */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg">
              {[7, 14, 30].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period as 7 | 14 | 30)}
                  className={`px-3 py-1 text-sm ${
                    selectedPeriod === period
                      ? "bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                  }`}
                >
                  {period}d
                </Button>
              ))}
            </div>
          </div>
          <div className="relative h-64 w-full">
            {/* Rose of Jericho Logo */}
            <div className="absolute top-4 right-4 z-10 opacity-20">
              <img 
                src="https://61b6909d-21c3-4d52-bc90-c6b7b0e6c0f4.lovableproject.com/lovable-uploads/a707377f-d19b-40cc-a022-c7baa7bbced8.png"
                alt="Rose of Jericho"
                className="w-12 h-12 object-contain"
              />
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(63, 63, 70, 0.3)"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="dateDisplay" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgb(161, 161, 170)', fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgb(161, 161, 170)', fontSize: 12 }}
                  domain={[0, maxSessions > 0 ? Math.max(maxSessions + 1, 3) : 3]}
                  tickCount={4}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="url(#trendGradient)"
                  strokeWidth={3}
                  dot={{ 
                    fill: '#FF8A00', 
                    strokeWidth: 2, 
                    stroke: '#9C27B0',
                    r: 4 
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: '#FF8A00',
                    stroke: '#9C27B0',
                    strokeWidth: 3
                  }}
                />
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9C27B0" />
                    <stop offset="100%" stopColor="#FF8A00" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {chartTotalSessions === 0 && (
            <div className="text-center py-4">
              <p className="text-zinc-400 text-sm">
                Start meditating to see your progress trend!
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}