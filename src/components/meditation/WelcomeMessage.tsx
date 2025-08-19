import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export const WelcomeMessage = () => {
  const { user } = useAuth();
  
  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      // Extract name from email (before @)
      return user.email.split('@')[0];
    }
    return 'Friend';
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border border-white/20 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-accent" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {getTimeOfDayGreeting()}, {getDisplayName()}!
            </h2>
            <p className="text-muted-foreground text-sm">
              Ready for your mindfulness journey today?
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};