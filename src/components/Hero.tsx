import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["Wellness", "Meditation", "Fitness"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleFollow = () => {
    window.open('https://x.com/ROJOasis', '_blank');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-serene-blue/10">
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-ocean-waves-crashing-on-rocks-2527/1080p.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="relative z-10 container mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <img 
            src="/lovable-uploads/d392e042-f503-4777-9d67-9d7149153ca5.png" 
            alt="ROJ Logo" 
            className="w-32 h-32 mx-auto mb-8"
          />
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-soft-green text-muted-teal rounded-full">
            Your mental wellness comes before your crypto gains.
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-muted-teal">
            Rose of Jericho
          </h1>
          <div className="text-xl md:text-2xl mb-8 text-muted-teal/90 h-[120px] flex flex-col items-center justify-center">
            <p className="mb-2">An AI Agent & a physical community that helps crypto professionals with</p>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-peach font-semibold text-5xl md:text-7xl mb-2"
            >
              {slides[currentSlide]}
            </motion.div>
          </div>
          <div className="flex justify-center gap-4 px-4">
            <Button
              className="bg-soft-green hover:bg-soft-green/70 text-muted-teal px-8 py-6 text-lg rounded-full transition-all duration-300 flex-[0.6]"
            >
              Join AI Wellness Agent Waitlist
            </Button>
            <Button
              onClick={handleFollow}
              className="bg-lavender hover:bg-lavender/80 text-muted-teal px-8 py-6 text-lg rounded-full transition-all duration-300 border-2 border-muted-teal/20 hover:border-muted-teal/40 flex-[0.4]"
            >
              <img 
                src="/lovable-uploads/0b88d178-91da-4c76-9d67-7e294d0a1de6.png" 
                alt="X Logo" 
                className="w-5 h-5 mr-2"
              /> 
              Follow @ROJOasis
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
