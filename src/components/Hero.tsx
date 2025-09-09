import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";
import { trackEvent } from "@/components/analytics/GoogleAnalytics";
export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["Wellness🧠", "Meditation🧘🏼‍♂️", "Fitness🏋️"];
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      trackEvent('engagement', 'view_hero_section');
    }
  }, []);
  const handleFollow = () => {
    window.open('https://x.com/ROJOasis', '_blank');
    trackEvent('social', 'click_follow_twitter', '@ROJOasis');
  };
  const handleMainButtonClick = () => {
    if (user) {
      trackEvent('navigation', 'start_meditation');
      navigate('/meditate');
    } else {
      trackEvent('user', 'sign_in_attempt', 'hero_button');
      navigate('/?login=true');
    }
  };
  return <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-0 sm:pt-1 w-full">
      <div className="absolute inset-0 w-full h-full">
        <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover opacity-20">
          <source src="https://res.cloudinary.com/dxmgomw2n/video/upload/v1711411674/k9d0w0gw52chf4vw9nrs.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* VHS static overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-secondary/10 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 text-center">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="max-w-3xl mx-auto">
          <div className="w-full flex justify-center mb-2 sm:mb-3">
            <span className="inline-block px-4 py-2 text-xs sm:text-sm font-mono uppercase tracking-wider border-2 border-primary bg-black/90 text-primary rounded-full backdrop-blur-sm shadow-[0_0_30px_hsl(var(--primary)/0.8)] relative animate-pulse">
              <span className="relative z-10">Your mental wellness comes before your crypto gains.</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full opacity-50"></div>
            </span>
          </div>
          
          <div className="w-full flex justify-center mb-2 sm:mb-4">
            <div className="relative">
              <img src="/lovable-uploads/277670c3-781e-4608-8e2f-d502243f163b.png" alt="ROJ Logo" className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-[0_0_20px_hsl(var(--primary))]" />
              <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse py-0"></div>
            </div>
          </div>
          
          <h1 className="cyber-heading text-4xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4 glitch-text" data-text="Rose of Jericho">
            Rose of Jericho
          </h1>
          
          <div className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-white/90 h-[60px] sm:h-[80px] flex flex-col items-center justify-center">
            <p className="mb-2 text-sm sm:text-base md:text-xl retro-text">An AI Agent that rewards you when focusing on</p>
            <motion.div key={currentSlide} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            duration: 0.5
          }} className="cyber-heading text-3xl sm:text-5xl md:text-7xl mb-2">
              {slides[currentSlide]}
            </motion.div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 w-full">
            <button onClick={handleMainButtonClick} className="retro-button px-3 sm:px-8 py-4 sm:py-6 text-xs sm:text-lg rounded-full w-full sm:w-auto max-w-[320px] sm:max-w-none">
              {user ? <>
                  
                  <span className="text-center leading-tight font-extrabold text-2xl">MEDITATE &amp; GET HEALTH POINTS NOW 🧘🏻</span>
                </> : "Sign In"}
            </button>
            
            
          </div>
        </motion.div>
      </div>

      <div className="h-2 sm:h-4"></div>
    </section>;
};