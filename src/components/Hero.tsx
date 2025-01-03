import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/20" /> {/* Overlay for better text readability */}
      </div>
      <div className="relative z-10 container mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-sage/20 text-sage rounded-full">
            Launching at ETH Denver 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Rose of Jericho: Your Wellness Sanctuary
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white">
            Experience rejuvenation and connection at major crypto conferences through our wellness zones
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-sage hover:bg-sage/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-300"
            >
              Join Waitlist
            </Button>
            <Button
              variant="outline"
              className="border-sage text-white hover:bg-sage/10 px-8 py-6 text-lg rounded-full transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};