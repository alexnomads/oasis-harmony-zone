
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Tweet } from 'react-tweet';
import { CheckCircle2 } from "lucide-react";

export const Roadmap = () => {
  const phases = [
    {
      title: "Phase 1",
      completed: true,
      items: [
        {
          title: "Meditation Timer System",
          subitems: [
            "Interactive timer with start/pause functionality",
            "Duration selection options",
            "Visual progress tracking",
            "Session completion tracking and rewards"
          ]
        },
        {
          title: "Points & Rewards System",
          subitems: [
            "Point earning based on meditation duration",
            "Bonus points for sharing sessions",
            "Meditation streaks tracking",
            "Total points accumulation"
          ]
        },
        {
          title: "User Dashboard",
          subitems: [
            "Personal meditation statistics",
            "Progress tracking",
            "Activity history visualization"
          ]
        },
        {
          title: "Global Leaderboard",
          subitems: [
            "Rankings based on total points",
            "Display of user meditation statistics",
            "View of most active meditators"
          ]
        },
        {
          title: "Social Sharing",
          subitems: [
            "Twitter/X integration for sharing wellness accomplishments",
            "Bonus point earning for social shares"
          ]
        },
        {
          title: "User Authentication",
          subitems: [
            "Secure login/signup system",
            "Protected routes for authenticated users",
            "User profile management"
          ]
        },
        {
          title: "Global Dashboard",
          subitems: [
            "Community-wide meditation statistics",
            "Real-time activity updates",
            "Time-filtered analytics"
          ]
        }
      ]
    },
    {
      title: "Phase 2",
      items: [
        {
          title: "Subscription Plans",
          subitems: [
            "3-tier subscription model: Basic Plan (free), Pro Plan (paid subscription with monthly/yearly options), Enterprise Plan (custom pricing)",
            "Plan comparison with feature highlights",
            "20% discount for yearly subscriptions"
          ]
        },
        {
          title: "Web3 Integration",
          subitems: [
            "Wallet connection functionality",
            "Token ($ROJ) payment system for subscriptions",
            "Blockchain-based reward tracking"
          ]
        }
      ]
    },
    {
      title: "Phase 3",
      items: [
        "Launch of the first Rose of Jericho (ROJ) pop-up at a major crypto conference.",
        "Initial token sale and distribution.",
        "Collect feedback for improvements."
      ]
    },
    {
      title: "Phase 4",
      items: [
        "Establish permanent Rose of Jericho (ROJ) wellness hubs in key crypto hubs (e.g., Singapore, Miami, Lisbon).",
        "Collaborate with Web3 health-tech projects to integrate innovative wellness solutions."
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            Roadmap
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Our Journey Forward
          </h2>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Building the future of wellness in the crypto space, one milestone at a time
          </p>
        </motion.div>
        
        {/* Mobile Roadmap (Vertical Timeline) */}
        <div className="md:hidden relative max-w-md mx-auto">
          <div className="absolute left-4 top-0 bottom-0 w-1 bg-white/20" />
          {phases.map((phase, index) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-10 last:mb-0 pl-10"
            >
              <div className="absolute left-4 top-0 transform -translate-x-1/2">
                <div className="w-4 h-4 rounded-full bg-softOrange" />
              </div>
              <Card className="bg-black/20 border-white/10 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-bold text-softOrange">{phase.title}</h3>
                    {phase.completed && (
                      <CheckCircle2 className="ml-2 text-green-400 h-5 w-5" />
                    )}
                  </div>
                  {index === 0 && (
                    <div className="mb-4 tweet-container">
                      <Tweet id="1886840995259592951" />
                    </div>
                  )}
                  <ul className="space-y-2">
                    {Array.isArray(phase.items) && phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm sm:text-base text-white/80">
                        {typeof item === 'string' ? (
                          item
                        ) : (
                          <div className="mb-3">
                            <p className="font-medium text-white mb-1">{itemIndex + 1}. {item.title}</p>
                            <ul className="pl-5 space-y-1">
                              {item.subitems.map((subitem, subIndex) => (
                                <li key={subIndex} className="text-sm list-disc text-white/80">
                                  {subitem}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Desktop Roadmap (Horizontal Timeline) */}
        <div className="hidden md:block relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/20" />
          {phases.map((phase, index) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-16 last:mb-0"
            >
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full bg-softOrange" />
              </div>
              <Card className={`w-[calc(50%-20px)] ${index % 2 === 0 ? 'mr-[calc(50%+20px)]' : 'ml-[calc(50%+20px)]'} bg-black/20 border-white/10`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <h3 className="text-2xl font-bold text-softOrange">{phase.title}</h3>
                    {phase.completed && (
                      <CheckCircle2 className="ml-2 text-green-400 h-6 w-6" />
                    )}
                  </div>
                  {index === 0 && (
                    <div className="mb-6 tweet-container">
                      <Tweet id="1886840995259592951" />
                    </div>
                  )}
                  <ul className="space-y-3">
                    {Array.isArray(phase.items) && phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-base text-white/80">
                        {typeof item === 'string' ? (
                          item
                        ) : (
                          <div className="mb-4">
                            <p className="font-medium text-white mb-2">{itemIndex + 1}. {item.title}</p>
                            <ul className="pl-6 space-y-1.5">
                              {item.subitems.map((subitem, subIndex) => (
                                <li key={subIndex} className="text-sm list-disc text-white/80">
                                  {subitem}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

