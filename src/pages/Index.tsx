
import { Hero } from "@/components/Hero";
import { AsciiArt } from "@/components/AsciiArt";
import { Programs } from "@/components/Programs";
import { Token } from "@/components/Token";
import { Roadmap } from "@/components/Roadmap";
import { motion, useScroll, useSpring } from "framer-motion";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";

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
      </div>
    </div>
  );
};

export default Index;
