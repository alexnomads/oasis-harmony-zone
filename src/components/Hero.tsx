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
  return <section className="relative min-h-screen max-h-screen flex items-center justify-center overflow-hidden pt-0 sm:pt-1 lg:pt-4 w-full">
      <div className="absolute inset-0 w-full h-full">
        <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover opacity-20">
          <source src="https://res.cloudinary.com/dxmgomw2n/video/upload/v1711411674/k9d0w0gw52chf4vw9nrs.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* VHS static overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-secondary/10 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-1 sm:py-2 lg:py-3 xl:py-4 text-center h-full flex items-center">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="max-w-3xl lg:max-w-5xl mx-auto w-full flex flex-col justify-center space-y-2 sm:space-y-3 lg:space-y-4 xl:space-y-5">
          <div className="w-full flex justify-center">
            <span className="inline-block px-3 py-1 lg:px-4 lg:py-2 text-xs sm:text-sm lg:text-base font-mono uppercase tracking-wider border-2 border-primary bg-black/90 text-primary rounded-full backdrop-blur-sm shadow-[0_0_30px_hsl(var(--primary)/0.8)] relative animate-pulse">
              <span className="relative z-10">Your mental wellness comes before your crypto gains.</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full opacity-50"></div>
            </span>
          </div>
          
          <div className="w-full flex justify-center">
            <div className="relative">
              <img src="/lovable-uploads/277670c3-781e-4608-8e2f-d502243f163b.png" alt="ROJ Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 drop-shadow-[0_0_20px_hsl(var(--primary))]" />
              <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse py-0"></div>
            </div>
          </div>
          
          <h1 className="cyber-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black glitch-text" data-text="Rose of Jericho">
            Rose of Jericho
          </h1>
          
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 h-[40px] sm:h-[50px] lg:h-[60px] xl:h-[70px] flex flex-col items-center justify-center">
            <p className="mb-1 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl retro-text">An AI Agent that rewards you when focusing on</p>
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
          }} className="cyber-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
              {slides[currentSlide]}
            </motion.div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 lg:gap-6 w-full">
            <button onClick={handleMainButtonClick} className="retro-button px-3 sm:px-4 lg:px-6 xl:py-4 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base xl:text-lg rounded-full w-full sm:w-auto max-w-[280px] sm:max-w-none">
              {user ? <>
                  <Clock size={14} className="mr-1 flex-shrink-0" />
                  <span className="text-center leading-tight font-extrabold text-sm lg:text-base xl:text-lg">MEDITATE &amp; GET HEALTH POINTS NOW 🧘🏻</span>
                </> : "Sign In"}
            </button>
          </div>
        </motion.div>
      </div>
    </section>;
};