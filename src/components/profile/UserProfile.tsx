
import { motion } from "framer-motion";
import { User, Mail, Calendar, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const UserProfile = () => {
  const mockUser = {
    name: "Siddhartha Gautama",
    email: "buddha@enlightenment.com",
    joinDate: "January 2024",
    guidedMeditations: 8,
    soundMeditations: 4,
    rojTokens: 2000,
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/lovable-uploads/97b94475-30c2-47c1-97f3-7fc62e26dd85.png" alt="Buddha" />
              <AvatarFallback>BU</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl text-white">Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 text-white/80">
            <User className="w-5 h-5 text-softOrange flex-shrink-0" />
            <span className="truncate">{mockUser.name}</span>
          </div>
          <div className="flex items-center space-x-4 text-white/80">
            <Mail className="w-5 h-5 text-softOrange flex-shrink-0" />
            <span className="truncate">{mockUser.email}</span>
          </div>
          <div className="flex items-center space-x-4 text-white/80">
            <Calendar className="w-5 h-5 text-softOrange flex-shrink-0" />
            <span className="truncate">Member since {mockUser.joinDate}</span>
          </div>
          <Button className="w-full mt-4 bg-black/30 hover:bg-black/40 text-white border border-white/10">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Activity Overview</CardTitle>
          <CardDescription className="text-white/60">
            Your wellness journey progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-2">Guided Meditations</h4>
                <p className="text-3xl font-bold text-softOrange">{mockUser.guidedMeditations}</p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-2">Sound Meditations</h4>
                <p className="text-3xl font-bold text-softOrange">{mockUser.soundMeditations}</p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-2">$ROJ Tokens</h4>
                <p className="text-3xl font-bold text-softOrange">${mockUser.rojTokens.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-black/30">
                View History
              </Button>
              <Button className="w-full bg-softPurple hover:bg-softPurple/90">
                Check Balance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
