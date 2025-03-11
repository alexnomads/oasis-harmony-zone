
import { useState, useEffect } from "react";
import { User, Mail, Calendar, Settings, Twitter, Instagram } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ActivityTracker } from "./ActivityTracker";
import { EditProfileDialog } from "./EditProfileDialog";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/lib/services/userService";
import type { UserProfile as UserProfileType } from "@/types/database";

export const UserProfile = () => {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfileType | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userProfile = await UserService.getUserProfile(user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };
    
    loadProfile();
  }, [user]);

  const handleProfileUpdate = (updatedProfile: UserProfileType) => {
    setProfile(updatedProfile);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-black/20 border-white/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center space-x-4 text-white/80">
                <User className="w-5 h-5 text-softOrange flex-shrink-0" />
                <span className="truncate">{profile?.nickname || user?.email?.split('@')[0]}</span>
              </div>
              <div className="flex items-center space-x-4 text-white/80">
                <Mail className="w-5 h-5 text-softOrange flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              {profile?.twitter_handle && (
                <div className="flex items-center space-x-4 text-white/80">
                  <Twitter className="w-5 h-5 text-softOrange flex-shrink-0" />
                  <a
                    href={`https://twitter.com/${profile.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:text-softOrange transition-colors"
                  >
                    @{profile.twitter_handle}
                  </a>
                </div>
              )}
              {profile?.instagram_handle && (
                <div className="flex items-center space-x-4 text-white/80">
                  <Instagram className="w-5 h-5 text-softOrange flex-shrink-0" />
                  <a
                    href={`https://instagram.com/${profile.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:text-softOrange transition-colors"
                  >
                    @{profile.instagram_handle}
                  </a>
                </div>
              )}
              <Button 
                className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90 text-white"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32">
                <AvatarImage 
                  src={profile?.avatar_url || "/lovable-uploads/97b94475-30c2-47c1-97f3-7fc62e26dd85.png"} 
                  alt={profile?.nickname || "Profile"} 
                />
                <AvatarFallback>
                  {profile?.nickname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardContent>
      </Card>

      <ActivityTracker />

      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentProfile={profile}
        onProfileUpdated={handleProfileUpdate}
      />
    </div>
  );
};
