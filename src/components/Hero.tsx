import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Twitter } from "lucide-react";

export const Hero = () => {
  const handleFollow = () => {
    window.open('https://x.com/ROJOasis', '_blank');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
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
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
            Your mental wellness comes before your crypto gains.
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Rose of Jericho
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            A physical and digital community that caters to Wellness, Meditation, and Fitness-conscious crypto professionals
          </p>
          <div className="flex justify-center gap-4 px-4">
            <Button
              className="bg-[#FF4444] hover:bg-[#FF4444]/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 flex-[0.6]"
            >
              Join AI Wellness Agent Waitlist
            </Button>
            <Button
              onClick={handleFollow}
              className="bg-black hover:bg-black/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 border-2 border-white/20 flex-[0.4]"
            >
              <Twitter className="w-5 h-5 mr-2" /> Follow @ROJOasis
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};