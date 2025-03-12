
import { motion } from "framer-motion";
import { Dumbbell, Brain, Users, MessageSquare, Play, LogIn } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "./ui/badge";

export const Programs = () => {
  const { user } = useAuth();
  
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
    <section className="py-16 bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]">
      <div className="container mx-auto px-6">
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
                      <Button 
                        className="w-full bg-softOrange hover:bg-softOrange/80 text-white"
                        asChild
                      >
                        <Link to="/meditate">
                          <Play className="w-4 h-4 mr-2" />
                          Meditate Now
                        </Link>
                      </Button>
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
                  
                  {program.comingSoon && (
                    <Badge variant="outline" className="w-full justify-center py-2 text-white border-white/20 bg-black/30">
                      COMING SOON
                    </Badge>
                  )}
                  
                  {program.title === "Community Sessions" && (
                    <Button 
                      className="w-full bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => window.open('https://t.me/roseofjerichoweb3', '_blank')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Join Our Telegram Group
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
