import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Newsletter } from "@/components/Newsletter";
import { AsciiArt } from "@/components/AsciiArt";
import { Programs } from "@/components/Programs";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { UserProfile } from "@/components/profile/UserProfile";
import { motion, useScroll, useSpring } from "framer-motion";

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
      <Hero />
      <AsciiArt />
      <Programs />
      <Features />
      <div className="py-16 bg-black">
        <RegisterForm />
      </div>
      <div className="py-16 bg-zinc-900">
        <UserProfile />
      </div>
      <Newsletter />
    </div>
  );
};

export default Index;