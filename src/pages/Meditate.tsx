
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { MeditationTimer } from '@/components/meditation/MeditationTimer';
import { SimpleChatInterface } from '@/components/meditation/SimpleChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Meditate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Begin Your Meditation Journey
          </h1>
          
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Today's Focus</h2>
                <p className="text-zinc-400">
                  Take a moment to breathe, center yourself, and let go of any tension.
                  Remember, every session brings you closer to inner peace and earns you
                  rewards in our community.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Earn points for each minute of meditation</li>
                  <li>• Build your daily streak</li>
                  <li>• Track your progress</li>
                  <li>• Unlock achievements</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 mb-12">
            {user ? (
              <MeditationTimer />
            ) : (
              <Card className="bg-gradient-to-br from-vibrantPurple to-vibrantOrange border-none">
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-semibold mb-4">Sign in to Start Meditating</h2>
                  <p className="text-white/80 mb-6">
                    Create an account to track your progress, earn points, and build your meditation streak.
                  </p>
                  <Button
                    variant="outline"
                    className="border-white text-white bg-transparent hover:bg-white/10"
                    onClick={() => navigate('/')}
                  >
                    Sign In to Continue
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Rose of Jericho AI Wellness Agent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-semibold text-center mb-6">
              Chat with Rose of Jericho
            </h2>
            <p className="text-center text-white/70 max-w-2xl mx-auto mb-8">
              Our AI Wellness Agent can guide you through meditation techniques, answer questions about mindfulness, 
              and provide personalized wellness recommendations.
            </p>
            <SimpleChatInterface />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
