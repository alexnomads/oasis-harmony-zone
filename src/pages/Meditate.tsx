
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MeditationAgentChat } from '@/components/meditation/MeditationAgentChat';
import { QuickMeditation } from '@/components/meditation/QuickMeditation';

export default function Meditate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black text-white">
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
          
          {/* Meditation Sections */}
          <div className="space-y-12">
            {/* AI Meditation Coach Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">AI Meditation Coach</h2>
              {user ? (
                <MeditationAgentChat />
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
            </section>

            {/* Quick Meditation Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Meditate Now</h2>
              {user ? (
                <QuickMeditation />
              ) : (
                <Card className="bg-gradient-to-br from-vibrantOrange to-vibrantPurple border-none">
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
            </section>
          </div>
          
          {/* Info Cards */}
          <div className="grid gap-6 sm:gap-8 mt-12 mb-12">
            <motion.h2 
              className="text-2xl font-semibold text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Meditation Benefits for Web3 Professionals
            </motion.h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Enhanced Focus</h2>
                  <p className="text-zinc-400">
                    Regular meditation improves concentration and decision-making—critical skills for navigating 
                    volatile markets and complex DeFi strategies.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Stress Reduction</h2>
                  <p className="text-zinc-400">
                    Learn to maintain emotional balance during market volatility, helping you make rational decisions
                    rather than reactive ones driven by FOMO or FUD.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Burnout Prevention</h2>
                  <p className="text-zinc-400">
                    The 24/7 crypto market never sleeps, but you need to. Regular meditation helps prevent burnout 
                    in this always-on industry.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Earn While You Heal</h2>
                  <ul className="space-y-2 text-zinc-400">
                    <li>• Earn $ROJ tokens for consistent practice</li>
                    <li>• Build your daily streak for bonus rewards</li>
                    <li>• Track your progress and achievements</li>
                    <li>• Invest in yourself and your portfolio</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
