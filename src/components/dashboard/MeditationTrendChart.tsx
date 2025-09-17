import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardImageGenerator } from './DashboardImageGenerator';
import { formatDurationDetails } from '@/lib/utils/timeFormat';
import { FitnessService } from '@/lib/services/fitnessService';
import { useQuery } from '@tanstack/react-query';

interface MeditationSession {
  id: string;
  created_at: string;
  duration: number;
  type: string;
  points_earned: number;
  status?: string;
}

interface FitnessSession {
  id: string;
  created_at: string;
  duration: number;
  workout_type: string;
  reps_completed: number;
  verified: boolean;
}

interface MeditationTrendChartProps {
  sessions: MeditationSession[];
  userStreak?: number;
  userTotalPoints?: number;
}

export default function MeditationTrendChart({ sessions, userStreak, userTotalPoints }: MeditationTrendChartProps) {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(30);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Fetch fitness sessions
  const { data: fitnessData } = useQuery({
    queryKey: ['userFitnessSessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await FitnessService.getUserSessions(user.id);
    },
    enabled: !!user?.id,
  });

  // Debug logging to track streak values
  console.log('MeditationTrendChart received:', { userStreak, userTotalPoints });

  const chartData = useMemo(() => {
    // Get the selected number of days
    const days = [];
    const today = new Date();
    
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        meditation: 0,
        fitness: 0,
        meditationMinutes: 0,
        fitnessMinutes: 0
      });
    }

    // Process meditation sessions
    if (sessions?.length) {
      const completedSessions = sessions.filter(session => 
        session.status === 'completed' || (!session.status && session.duration > 0)
      );
      
      completedSessions.forEach(session => {
        const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
        const dayData = days.find(day => day.date === sessionDate);
        if (dayData) {
          dayData.meditation += 1;
          dayData.meditationMinutes += Math.round(session.duration / 60);
        }
      });
    }

    // Process fitness sessions
    if (fitnessData?.length) {
      fitnessData.forEach(session => {
        const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
        const dayData = days.find(day => day.date === sessionDate);
        if (dayData) {
          dayData.fitness += 1;
          dayData.fitnessMinutes += Math.round(session.duration / 60);
        }
      });
    }

    return days;
  }, [sessions, fitnessData, selectedPeriod]);

  const maxSessions = Math.max(...chartData.map(d => Math.max(d.meditation, d.fitness)));
  const chartTotalMeditation = chartData.reduce((sum, day) => sum + day.meditation, 0);
  const chartTotalFitness = chartData.reduce((sum, day) => sum + day.fitness, 0);

  // Calculate totals for sharing
  const totalCompletedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalDuration = sessions
    .filter(s => s.status === 'completed')
    .reduce((acc, session) => acc + (session.duration || 0), 0);
  const totalPoints = sessions
    .filter(s => s.status === 'completed')
    .reduce((acc, session) => acc + (session.points_earned || 0), 0);
  
  // Use the actual user streak and points from Dashboard instead of calculating manually
  const actualStreak = userStreak || 0;
  const actualTotalPoints = userTotalPoints || totalPoints;

  console.log('DashboardImageGenerator will receive:', { actualStreak, actualTotalPoints, userStreak });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <div className="space-y-1">
            <p className="text-vibrantOrange">
              🧘 {data.meditation} meditation{data.meditation !== 1 ? 's' : ''}
              {data.meditationMinutes > 0 && <span className="text-zinc-300 text-sm"> ({data.meditationMinutes}min)</span>}
            </p>
            <p className="text-blue-400">
              💪 {data.fitness} workout{data.fitness !== 1 ? 's' : ''}
              {data.fitnessMinutes > 0 && <span className="text-zinc-300 text-sm"> ({data.fitnessMinutes}min)</span>}
            </p>
          </div>
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
                <h2 className="cyber-heading text-xl sm:text-2xl">Activity Frequency</h2>
                <p className="text-white/80 mt-1">Your meditation and fitness activity over time</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === 'line' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 ${
                    chartType === 'line'
                      ? "bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Line
                </Button>
                <Button
                  variant={chartType === 'bar' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 ${
                    chartType === 'bar'
                      ? "bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Bar
                </Button>
              </div>
            </div>
            {user && (
              <div className="flex justify-center sm:justify-end">
                <DashboardImageGenerator
                  userEmail={user.email || ''}
                  totalPoints={actualTotalPoints}
                  streak={actualStreak}
                  totalSessions={totalCompletedSessions}
                  totalDuration={formatDurationDetails(totalDuration)}
                  profileUrl={`https://roseofjericho.xyz/profile/${user.email?.split('@')[0]}`}
                  chartData={chartData}
                  selectedPeriod={selectedPeriod}
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
              {chartType === 'line' ? (
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
                    dataKey="meditation"
                    stroke="url(#meditationGradient)"
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
                  <Line
                    type="monotone"
                    dataKey="fitness"
                    stroke="url(#fitnessGradient)"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ 
                      fill: '#60A5FA', 
                      strokeWidth: 2, 
                      stroke: '#1E40AF',
                      r: 4 
                    }}
                    activeDot={{ 
                      r: 6, 
                      fill: '#60A5FA',
                      stroke: '#1E40AF',
                      strokeWidth: 3
                    }}
                  />
                  <defs>
                    <linearGradient id="meditationGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#9C27B0" />
                      <stop offset="100%" stopColor="#FF8A00" />
                    </linearGradient>
                    <linearGradient id="fitnessGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1E40AF" />
                      <stop offset="100%" stopColor="#60A5FA" />
                    </linearGradient>
                  </defs>
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                  <Bar dataKey="meditation" fill="url(#meditationBarGradient)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="fitness" fill="url(#fitnessBarGradient)" radius={[2, 2, 0, 0]} />
                  <defs>
                    <linearGradient id="meditationBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF8A00" />
                      <stop offset="100%" stopColor="#9C27B0" />
                    </linearGradient>
                    <linearGradient id="fitnessBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#1E40AF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {chartTotalMeditation === 0 && chartTotalFitness === 0 && (
            <div className="text-center py-4">
              <p className="text-zinc-400 text-sm">
                Start your wellness journey to see your progress trend!
              </p>
            </div>
          )}
          
          {/* Legend */}
          {(chartTotalMeditation > 0 || chartTotalFitness > 0) && (
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-zinc-700/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange"></div>
                <span className="text-sm text-zinc-300">Meditation ({chartTotalMeditation})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-800 to-blue-400"></div>
                <span className="text-sm text-zinc-300">Fitness ({chartTotalFitness})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}