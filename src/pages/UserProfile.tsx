import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, 
  Flame, 
  Timer, 
  Calendar, 
  TrendingUp, 
  ArrowLeft,
  Share2,
  User
} from "lucide-react";
import { formatDuration } from "@/lib/utils/timeFormat";
import { LeaderboardService } from "@/lib/services/leaderboardService";
import { toast } from "sonner";
import { DashboardImageGenerator } from "@/components/dashboard/DashboardImageGenerator";
import { formatDurationDetails } from "@/lib/utils/timeFormat";

type UserProfileData = {
  user_id: string;
  total_points: number;
  meditation_streak: number;
  total_sessions: number;
  total_meditation_time: number;
  display_name: string;
  email: string;
  active_streak: number;
  rank?: number;
};

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        setError("No username provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const profile = await LeaderboardService.getUserByUsername(username);
        if (profile) {
          setUserProfile(profile);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

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

  const getUsernameFromEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;
    return email.split('@')[0];
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `Check out ${userProfile?.display_name}'s meditation journey on Rose of Jericho`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Profile URL copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy URL");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-32" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-4">
              <User className="h-16 w-16 mx-auto text-zinc-500" />
              <h1 className="text-2xl font-bold">User Not Found</h1>
              <p className="text-zinc-400">The user profile you're looking for doesn't exist.</p>
              <Button 
                onClick={() => navigate('/global-dashboard')}
                variant="outline"
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = userProfile.display_name === userProfile.email 
    ? getUsernameFromEmail(userProfile.email)
    : userProfile.display_name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => navigate('/global-dashboard')}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboard
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share Profile
            </Button>
          </div>

          {/* Profile Header */}
          <Card className="bg-zinc-900/50 border border-zinc-800 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-white/20">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`} 
                    alt={displayName} 
                  />
                  <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                  <div className="flex items-center gap-4 text-zinc-400">
                    {userProfile.rank && (
                      <Badge variant="secondary" className="gap-1">
                        <Award className="h-3 w-3" />
                        Rank #{userProfile.rank}
                      </Badge>
                    )}
                    <Badge 
                      variant={userProfile.active_streak > 0 ? "default" : "secondary"}
                      className="gap-1"
                    >
                      <Flame className="h-3 w-3" />
                      {userProfile.active_streak} day streak
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{userProfile.total_points}</p>
                <p className="text-sm text-zinc-400">Total Points</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{userProfile.total_sessions}</p>
                <p className="text-sm text-zinc-400">Total Sessions</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardContent className="p-4 text-center">
                <Timer className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{formatDuration(userProfile.total_meditation_time)}</p>
                <p className="text-sm text-zinc-400">Total Time</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardContent className="p-4 text-center">
                <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{userProfile.meditation_streak}</p>
                <p className="text-sm text-zinc-400">Best Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Share Profile Journey */}
          <Card className="bg-zinc-900/50 border border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardImageGenerator
                userEmail={userProfile.display_name === userProfile.email ? userProfile.email : userProfile.display_name}
                totalPoints={userProfile.total_points}
                streak={userProfile.active_streak}
                totalSessions={userProfile.total_sessions}
                totalDuration={formatDurationDetails(userProfile.total_meditation_time)}
                profileUrl={window.location.href}
              />
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card className="bg-zinc-900/50 border border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Meditation Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span>Mindfulness Explorer</span>
                  <Badge variant={userProfile.total_sessions >= 10 ? "default" : "secondary"}>
                    {userProfile.total_sessions >= 10 ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span>Consistency Master</span>
                  <Badge variant={userProfile.active_streak >= 7 ? "default" : "secondary"}>
                    {userProfile.active_streak >= 7 ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span>Meditation Warrior</span>
                  <Badge variant={userProfile.total_points >= 1000 ? "default" : "secondary"}>
                    {userProfile.total_points >= 1000 ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}