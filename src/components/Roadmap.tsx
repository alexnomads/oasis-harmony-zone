
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Tweet } from 'react-tweet';
import { CheckCircle2 } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "./ui/carousel";
import { Badge } from "./ui/badge";
import { useState } from "react";

export const Roadmap = () => {
  const [activePhase, setActivePhase] = useState(0);
  
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
            "Three-tier subscription model:",
            "Basic Plan (free)",
            "Pro Plan (paid subscription with monthly/yearly options)",
            "Enterprise Plan (custom pricing)",
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
        
        {/* Tweet Highlight */}
        <div className="mb-10 max-w-md mx-auto">
          <div className="tweet-container">
            <Tweet id="1886840995259592951" />
          </div>
        </div>
        
        {/* Phase Indicators - Moved above the carousel */}
        <div className="flex justify-center mb-6 gap-4">
          {phases.map((phase, index) => (
            <div 
              key={index} 
              onClick={() => setActivePhase(index)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                activePhase === index ? 'bg-white/20 shadow-lg' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${phase.completed ? 'bg-green-400' : activePhase === index ? 'bg-softOrange' : 'bg-white/30'}`} />
              <span className={`text-sm font-medium ${activePhase === index ? 'text-white' : 'text-white/70'}`}>{phase.title}</span>
              {phase.completed && <CheckCircle2 className="h-4 w-4 text-green-400" />}
            </div>
          ))}
        </div>
        
        {/* Roadmap Carousel */}
        <Carousel 
          className="max-w-4xl mx-auto" 
          onSelect={(index) => setActivePhase(index)}
          defaultIndex={activePhase}
        >
          <CarouselContent>
            {phases.map((phase, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                <Card className="h-full bg-black/20 border-white/10">
                  <CardContent className="p-6 h-full">
                    <div className="flex items-center mb-4 gap-2">
                      <h3 className="text-2xl font-bold text-softOrange">{phase.title}</h3>
                      {phase.completed && (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Completed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-4 overflow-auto pr-2" style={{ maxHeight: '70vh' }}>
                      {Array.isArray(phase.items) && phase.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="text-base text-white/80">
                          {typeof item === 'string' ? (
                            <p className="text-white">{item}</p>
                          ) : (
                            <div className="mb-4">
                              <p className="font-medium text-white mb-2 border-l-2 border-softOrange pl-3">
                                {item.title}
                              </p>
                              <ul className="pl-5 space-y-2">
                                {item.subitems.map((subitem, subIndex) => (
                                  <li key={subIndex} className="text-sm list-disc text-white/80">
                                    {subitem}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 bg-gradient-to-r from-vibrantPurple to-softPurple text-white hover:from-vibrantPurple/90 hover:to-softPurple/90 border-none shadow-md" />
          <CarouselNext className="right-0 bg-gradient-to-l from-vibrantOrange to-softOrange text-white hover:from-vibrantOrange/90 hover:to-softOrange/90 border-none shadow-md" />
        </Carousel>
      </div>
    </section>
  );
};
