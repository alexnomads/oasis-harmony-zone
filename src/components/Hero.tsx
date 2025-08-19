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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
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
      // Use URL parameter to trigger sign-in modal
      navigate('/?login=true');
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-5 sm:pt-6">
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
        >
          <source
            src="https://res.cloudinary.com/dxmgomw2n/video/upload/v1711411674/k9d0w0gw52chf4vw9nrs.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <img 
            src="/lovable-uploads/a707377f-d19b-40cc-a022-c7baa7bbced8.png" 
            alt="ROJ Logo" 
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-8"
          />
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 mb-4 sm:mb-6 text-xs sm:text-sm font-medium bg-white/10 text-white rounded-full">
            Your mental wellness comes before your crypto gains.
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 text-white">
            Rose of Jericho
          </h1>
          <div className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90 h-[80px] sm:h-[120px] flex flex-col items-center justify-center">
            <p className="mb-2 text-sm sm:text-base md:text-xl">An AI Agent that rewards you when focusing on</p>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-white font-semibold text-3xl sm:text-5xl md:text-7xl mb-2"
            >
              {slides[currentSlide]}
            </motion.div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 px-2 sm:px-4">
            <Button
              onClick={handleMainButtonClick}
              className="bg-white/10 hover:bg-white/20 text-white px-12 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px]"
            >
              {user ? (
                <>
                  <Clock className="mr-2" size={20} />
                  Meditate & Accrue Points Now
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <Button
              onClick={handleFollow}
              className="bg-black/30 hover:bg-black/40 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full transition-all duration-300 border border-white/20 hover:border-white/40"
            >
              <img 
                src="/lovable-uploads/0b88d178-91da-4c76-9d67-7e294d0a1de6.png" 
                alt="X Logo" 
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2 invert"
              /> 
              <span className="whitespace-nowrap">Follow @ROJOasis</span>
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="h-7 sm:h-17 md:h-22"></div>
    </section>
  );
};
