import { motion } from "framer-motion";
import { User, Mail, Calendar, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const UserProfile = () => {
  // This would typically fetch user data from a backend
  const mockUser = {
    name: "Siddhartha Gautama",
    email: "buddha@enlightenment.com",
    joinDate: "January 2024",
    programsAttended: 12,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-black/20 border-white/10">
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
              <User className="w-5 h-5 text-softOrange" />
              <span>{mockUser.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-white/80">
              <Mail className="w-5 h-5 text-softOrange" />
              <span>{mockUser.email}</span>
            </div>
            <div className="flex items-center space-x-4 text-white/80">
              <Calendar className="w-5 h-5 text-softOrange" />
              <span>Member since {mockUser.joinDate}</span>
            </div>
            <Button className="w-full mt-4 bg-black/30 hover:bg-black/40 text-white border border-white/10">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white">Activity Overview</CardTitle>
            <CardDescription className="text-white/60">
              Your wellness journey progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-2">Programs Attended</h4>
                <p className="text-3xl font-bold text-softOrange">{mockUser.programsAttended}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-black/30">
                  View History
                </Button>
                <Button className="w-full bg-softPurple hover:bg-softPurple/90">
                  Book Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};