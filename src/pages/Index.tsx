import { Hero } from "@/components/Hero";
import { AsciiArt } from "@/components/AsciiArt";
import { Programs } from "@/components/Programs";
import { Token } from "@/components/Token";
import { Roadmap } from "@/components/Roadmap";
import { motion, useScroll, useSpring } from "framer-motion";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { Linkedin, MessageCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-sage origin-left z-50"
        style={{ scaleX }}
      />
      <Header />
      <div className="pt-16">
        <div id="hero">
          <Hero />
        </div>
        <div id="ai-agent-alpha">
          <AsciiArt />
        </div>
        <div id="programs">
          <Programs />
        </div>
        <div id="subscription-plans">
          <SubscriptionPlans />
        </div>
        <div id="token">
          <Token />
        </div>
        <div id="newsletter">
          <Newsletter />
        </div>
        <div id="roadmap">
          <Roadmap />
        </div>
        
        {/* Contact Section */}
        <div id="contact" className="py-16 px-4">
          <Card className="max-w-2xl mx-auto bg-black/20 border-white/10">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-center text-white mb-6">Get in Touch with the Founder</h2>
              <p className="text-white/80 text-center mb-8">
                Connect with Alex to learn more about Rose of Jericho and join our mission of bringing mindfulness to the crypto world.
              </p>
              <div className="flex justify-center gap-8">
                <a 
                  href="https://x.com/alexnomads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-softOrange transition-colors"
                >
                  <X className="w-8 h-8" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/alessandrocapezza/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-softOrange transition-colors"
                >
                  <Linkedin className="w-8 h-8" />
                </a>
                <a 
                  href="http://t.me/alexnomads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-softOrange transition-colors"
                >
                  <MessageCircle className="w-8 h-8" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
