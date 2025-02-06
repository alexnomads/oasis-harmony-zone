
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["Wellness🧠", "Meditation🧘🏼‍♂️", "Fitness🏋️"];

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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]">
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
        >
          <source
            src="https://player.vimeo.com/progressive_redirect/playback/498700403/rendition/1080p/file.mp4?loc=external&signature=08e3e9180c27918a30c79d3abebc8e48b50e3c5ec63e1dac1fa37eb2799acf0f"
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
            src="/lovable-uploads/a707377f-d19b-40cc-a022-c7baa7bbced8.png" 
            alt="ROJ Logo" 
            className="w-32 h-32 mx-auto mb-8"
          />
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            Your mental wellness comes before your crypto gains.
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Rose of Jericho
          </h1>
          <div className="text-xl md:text-2xl mb-8 text-white/90 h-[120px] flex flex-col items-center justify-center">
            <p className="mb-2">An AI Agent that rewards you with crypto when focusing on</p>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-white font-semibold text-5xl md:text-7xl mb-2"
            >
              {slides[currentSlide]}
            </motion.div>
          </div>
          <div className="flex justify-center gap-4 px-4">
            <Button
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 flex-[0.6] border border-white/20"
            >
              Join the Waitlist
            </Button>
            <Button
              onClick={handleFollow}
              className="bg-black/30 hover:bg-black/40 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 border border-white/20 hover:border-white/40 flex-[0.4]"
            >
              <img 
                src="/lovable-uploads/0b88d178-91da-4c76-9d67-7e294d0a1de6.png" 
                alt="X Logo" 
                className="w-5 h-5 mr-2 invert"
              /> 
              Follow @ROJOasis
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
