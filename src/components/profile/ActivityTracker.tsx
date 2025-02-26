
import { motion } from "framer-motion";
import { Timer, Calendar, History, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export const ActivityTracker = () => {
  const { toast } = useToast();
  
  // Mock data - would be replaced with real data when connected to backend
  const mockData = {
    dailyMinutes: 75,
    weeklyMinutes: 112.5,
    dailyGoal: 75,
    weeklyGoal: 105,
    totalPoints: 560,
    currentStreak: 23,
    referralCode: "ROJ123", // Mock referral code - would be unique per user
    meditationHistory: [
      { date: "2024-03-14", duration: 15, points: 30, shared: true },
      { date: "2024-03-13", duration: 20, points: 40 },
      { date: "2024-03-12", duration: 10, points: 20 },
      { date: "2024-03-11", duration: 30, points: 60, shared: true },
      { date: "2024-03-10", duration: 5, points: 10 },
    ]
  };

  const dailyProgress = (mockData.dailyMinutes / mockData.dailyGoal) * 100;
  const weeklyProgress = (mockData.weeklyMinutes / mockData.weeklyGoal) * 100;

  const handleShare = async (date: string) => {
    // Create referral URL with the new domain
    const referralUrl = `https://roseofjericho.xyz/join?ref=${mockData.referralCode}`;
    
    const tweetText = encodeURIComponent(
      `I just finished a meditation on @ROJOasis and I feel better.\n\nGet rewards when you take care of yourself! ${referralUrl}`
    );
    
    // Open in a new tab instead of redirecting
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    
    // In a real implementation, we would track the share and award points here
    console.log("Tweet shared! Awarding extra points...");
    toast({
      title: "Bonus Points Earned! 🌟",
      description: "Thanks for sharing! Extra points have been added to your account. You'll earn additional rewards when people join using your referral link!",
    });
  };

  const MeditationHistoryContent = () => (
    <div className="space-y-4">
      {mockData.meditationHistory.map((session, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/10">
          <div className="space-y-1">
            <p className="text-white text-sm">{new Date(session.date).toLocaleDateString()}</p>
            <p className="text-white/70 text-xs">{session.duration} minutes</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-softOrange font-medium">{session.points} pts</span>
            <button 
              onClick={() => handleShare(session.date)}
              className="text-softPurple hover:text-softPurple/80 transition-colors"
              title="Share and earn referral rewards"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

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
          <Dialog>
            <DialogTrigger asChild>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-black/30 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-softOrange" />
                  <h4 className="text-sm font-medium text-white">Meditation History</h4>
                </div>
                <p className="text-2xl font-bold text-softOrange">{mockData.totalPoints} pts</p>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Meditation History</DialogTitle>
              </DialogHeader>
              <MeditationHistoryContent />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-black/30 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-softOrange" />
                  <h4 className="text-sm font-medium text-white">View History</h4>
                </div>
                <p className="text-2xl font-bold text-softOrange">{mockData.currentStreak} days</p>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Meditation History</DialogTitle>
              </DialogHeader>
              <MeditationHistoryContent />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
