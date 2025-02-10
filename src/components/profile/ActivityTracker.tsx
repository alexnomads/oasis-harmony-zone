
import { motion } from "framer-motion";
import { Timer, Calendar, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const ActivityTracker = () => {
  // Mock data - would be replaced with real data when connected to backend
  const mockData = {
    dailyMinutes: 15, // Updated to show complete daily goal
    weeklyMinutes: 52.5, // Updated to show 50% of weekly goal (105/2)
    dailyGoal: 15,
    weeklyGoal: 105,
    totalPoints: 560,
    currentStreak: 23, // Updated streak
  };

  const dailyProgress = (mockData.dailyMinutes / mockData.dailyGoal) * 100;
  const weeklyProgress = (mockData.weeklyMinutes / mockData.weeklyGoal) * 100;

  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Timer className="w-5 h-5 text-softOrange" />
          Activity Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-white/80">
            <span>Daily Progress</span>
            <span>{mockData.dailyMinutes} / {mockData.dailyGoal} min</span>
          </div>
          <Progress value={dailyProgress} className="h-2 bg-black/30">
            <div 
              className="h-full bg-softPurple transition-all" 
              style={{ width: `${dailyProgress}%` }} 
            />
          </Progress>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-white/80">
            <span>Weekly Progress</span>
            <span>{mockData.weeklyMinutes} / {mockData.weeklyGoal} min</span>
          </div>
          <Progress value={weeklyProgress} className="h-2 bg-black/30">
            <div 
              className="h-full bg-softOrange transition-all" 
              style={{ width: `${weeklyProgress}%` }} 
            />
          </Progress>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-black/30 rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-softOrange" />
              <h4 className="text-sm font-medium text-white">Points History</h4>
            </div>
            <p className="text-2xl font-bold text-softOrange">{mockData.totalPoints} pts</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-black/30 rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-softOrange" />
              <h4 className="text-sm font-medium text-white">Current Streak</h4>
            </div>
            <p className="text-2xl font-bold text-softOrange">{mockData.currentStreak} days</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};
