import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Trophy, Target, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export const FitnessStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalReps: 0,
    fitnessPoints: 0,
    weekStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFitnessStats();
    }
  }, [user]);

  const fetchFitnessStats = async () => {
    try {
      // Mock data for now - in real implementation, this would fetch from database
      setStats({
        totalWorkouts: 12,
        totalReps: 450,
        fitnessPoints: 650,
        weekStreak: 3
      });
    } catch (error) {
      console.error('Error fetching fitness stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Sign in to track your fitness progress! 💪
          </p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Workouts",
      value: stats.totalWorkouts,
      suffix: "",
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "from-yellow-400/10 to-orange-400/10",
      borderColor: "border-yellow-400/30"
    },
    {
      title: "Total Reps",
      value: stats.totalReps,
      suffix: "",
      icon: Target,
      color: "text-blue-400",
      bgColor: "from-blue-400/10 to-cyan-400/10",
      borderColor: "border-blue-400/30"
    },
    {
      title: "Fitness Points",
      value: stats.fitnessPoints,
      suffix: "pts",
      icon: Zap,
      color: "text-accent",
      bgColor: "from-accent/10 to-primary/10",
      borderColor: "border-accent/30"
    },
    {
      title: "Week Streak",
      value: stats.weekStreak,
      suffix: "days",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "from-green-400/10 to-emerald-400/10",
      borderColor: "border-green-400/30"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border ${stat.borderColor} hover:scale-105 transition-transform duration-300`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {loading ? '...' : stat.value.toLocaleString()}
                    <span className="text-sm ml-1">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.title}
                  </div>
                </div>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};