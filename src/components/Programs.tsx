
import { motion } from "framer-motion";
import { Dumbbell, Brain, Users, MessageSquare, Play, LogIn } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TokenBuyButton } from "@/components/TokenBuyButton";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Programs = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const programs = [
    {
      title: "Guided Meditation",
      description: "AI Agent-led sessions designed for crypto professionals to reduce stress and enhance focus.",
      icon: Brain,
      benefits: [
        "Stress reduction",
        "Improved focus",
        "Better decision making",
        "Mental clarity"
      ]
    },
    {
      title: "Fitness Programs",
      description: "Tailored workout sessions that fit into your busy work schedule.",
      icon: Dumbbell,
      benefits: [
        "Physical wellness",
        "Energy boost",
        "Stress relief",
        "Better sleep"
      ],
      comingSoon: true
    },
    {
      title: "Community Sessions",
      description: "Connect with like-minded individuals in our wellness-focused community.",
      icon: Users,
      benefits: [
        "Networking and mindfullness",
        "Support system",
        "Community growth",
        "Shared experiences"
      ]
    }
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--deep-violet))_0%,transparent_50%),radial-gradient(circle_at_80%_20%,hsl(var(--neon-magenta))_0%,transparent_50%),radial-gradient(circle_at_40%_40%,hsl(var(--electric-cyan))_0%,transparent_50%)]"></div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            Our Programs
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Score An All-Time-High For Your Wellness
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover AI Agents designed to enhance your mental & physical well-being
          </p>
        </motion.div>
        {isMobile ? (
          <Carousel className="w-full max-w-sm mx-auto" opts={{ align: "center" }}>
            <CarouselContent>
              {programs.map((program, index) => (
                <CarouselItem key={program.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Card className="bg-black/20 border-white/10 h-full flex flex-col">
                      <CardContent className="p-6 flex flex-col h-full">
                        <program.icon className="w-12 h-12 text-softOrange mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-3 text-white">{program.title}</h3>
                        <p className="text-white/80 mb-4">{program.description}</p>
                        <ul className="space-y-2 mb-4 flex-grow">
                          {program.benefits.map((benefit) => (
                            <li key={benefit} className="text-white/70">
                              • {benefit}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0">
                        {program.title === "Guided Meditation" && (
                          user ? (
                             <button 
                               className="retro-button w-full px-6 py-3 text-sm rounded-full"
                               onClick={() => window.location.href = "/meditate"}
                             >
                               <Play className="w-4 h-4 mr-2" />
                               Meditate & Accrue Points Now
                             </button>
                          ) : (
                            <Button 
                              className="w-full bg-white/10 hover:bg-white/20 text-white"
                              onClick={() => window.location.href = "/?login=true"}
                            >
                              <LogIn className="w-4 h-4 mr-2" />
                              Log In
                            </Button>
                          )
                        )}
                        
                        {program.title === "Fitness Programs" && (
                          <TokenBuyButton />
                        )}
                        
                        {program.title === "Community Sessions" && (
                        <button 
                          className="retro-button w-full px-6 py-3 text-sm rounded-full"
                          onClick={() => window.open('https://t.me/roseofjerichoweb3', '_blank')}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Join Our Telegram Group
                        </button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
            <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
          </Carousel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="bg-black/20 border-white/10 h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col h-full">
                    <program.icon className="w-12 h-12 text-softOrange mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-3 text-white">{program.title}</h3>
                    <p className="text-white/80 mb-4">{program.description}</p>
                    <ul className="space-y-2 mb-4 flex-grow">
                      {program.benefits.map((benefit) => (
                        <li key={benefit} className="text-white/70">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    {program.title === "Guided Meditation" && (
                      user ? (
                        <button 
                          className="retro-button w-full px-6 py-3 text-sm rounded-full"
                          onClick={() => window.location.href = "/meditate"}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Meditate & Accrue Points Now
                        </button>
                      ) : (
                        <Button 
                          className="w-full bg-white/10 hover:bg-white/20 text-white"
                          onClick={() => window.location.href = "/?login=true"}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Log In
                        </Button>
                      )
                    )}
                    
                    {program.title === "Fitness Programs" && (
                      <TokenBuyButton />
                    )}
                    
                    {program.title === "Community Sessions" && (
                      <button 
                        className="retro-button w-full px-6 py-3 text-sm rounded-full"
                        onClick={() => window.open('https://t.me/roseofjerichoweb3', '_blank')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Join Our Telegram Group
                      </button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
