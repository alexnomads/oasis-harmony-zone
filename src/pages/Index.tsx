
import { Hero } from "@/components/Hero";
import { AsciiArt } from "@/components/AsciiArt";
import { Programs } from "@/components/Programs";
import { Token } from "@/components/Token";
import { Roadmap } from "@/components/Roadmap";
import { motion, useScroll, useSpring } from "framer-motion";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { GetInTouch } from "@/components/GetInTouch";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative min-h-screen bg-black">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-softOrange origin-left z-50"
        style={{ scaleX }}
      />
      <Header />
      <main className="relative">
        <section id="hero">
          <Hero />
        </section>
        <section id="ai-agent-alpha">
          <AsciiArt />
        </section>
        <section id="programs">
          <Programs />
        </section>
        <section id="subscription-plans">
          <SubscriptionPlans />
        </section>
        <section id="token">
          <Token />
        </section>
        <section id="newsletter">
          <Newsletter />
        </section>
        <section id="roadmap">
          <Roadmap />
        </section>
        <section>
          <GetInTouch />
        </section>
      </main>
    </div>
  );
};

export default Index;
