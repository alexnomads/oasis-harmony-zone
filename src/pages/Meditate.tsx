
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
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
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
            Choose Your Meditation Experience
          </h1>
          
          {user ? (
            /* Meditation Choice Section */
            <div className="grid gap-6 md:grid-cols-2 mb-12">
              {/* Quick Meditation Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full bg-black/20 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                  <div className="h-1 w-full bg-gradient-to-r from-vibrantOrange to-vibrantPurple" />
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-vibrantOrange to-vibrantPurple flex items-center justify-center">
                        <Timer className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Quick Meditation</h3>
                      <p className="text-white/70 text-sm">
                        Jump straight into a focused meditation session
                      </p>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-white/60 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-vibrantOrange"></div>
                        <span>Choose from 30 seconds to 60 minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-vibrantPurple"></div>
                        <span>Screen sleep prevention on mobile</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-vibrantOrange"></div>
                        <span>Earn points and build streaks</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <QuickMeditation />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Meditation Coach Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full bg-black/20 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                  <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange flex items-center justify-center overflow-hidden">
                        <img 
                          src="/lovable-uploads/28340a82-c555-4abe-abb5-5ceecab27f08.png"
                          alt="Rose of Jericho"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">AI Meditation Coach</h3>
                      <p className="text-white/70 text-sm">
                        Get personalized guidance from Rose of Jericho
                      </p>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-white/60 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-vibrantPurple"></div>
                        <span>Personalized meditation advice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-vibrantOrange"></div>
                        <span>Interactive chat experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-vibrantPurple"></div>
                        <span>Tips and techniques for your journey</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Button
                        className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90 text-white"
                        onClick={() => {
                          const coachSection = document.getElementById('ai-coach-section');
                          coachSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Chat with Rose
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            /* Sign In Prompt */
            <div className="mb-12">
              <Card className="bg-gradient-to-br from-vibrantPurple to-vibrantOrange border-none">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-semibold mb-4 text-white">Start Your Meditation Journey</h2>
                  <p className="text-white/80 mb-6 text-lg">
                    Create an account to track your progress, earn points, and build your meditation streak.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white bg-transparent hover:bg-white/10 text-lg px-8 py-6"
                    onClick={() => navigate('/')}
                  >
                    Sign In to Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Coach Section - Full Experience */}
          {user && (
            <section id="ai-coach-section" className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-6 text-center">Full AI Meditation Coach Experience</h2>
                <MeditationAgentChat />
              </motion.div>
            </section>
          )}
          
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
