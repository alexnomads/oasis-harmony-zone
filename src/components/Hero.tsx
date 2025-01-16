import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FEC6A1] to-[#FFDEE2]">
      <div className="absolute inset-0 z-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8L3N2Zz4=')] opacity-50" />
      <div className="relative z-10 container mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 mx-auto mb-8 rounded-full bg-white p-4 shadow-lg transform hover:rotate-6 transition-transform"
          >
            <img 
              src="/lovable-uploads/d392e042-f503-4777-9d67-9d7149153ca5.png" 
              alt="ROJ Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="inline-block px-6 py-2 mb-6 text-sm font-medium bg-[#E5DEFF] text-[#8B5CF6] rounded-full shadow-md"
          >
            Your mental wellness comes before your crypto gains.
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#4A3D52] [text-shadow:2px_2px_0px_#FEC6A1]">
            Rose of Jericho
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#4A3D52]/90">
            A physical and digital community that caters to Wellness, Meditation, and Fitness-conscious crypto professionals
          </p>
          <div className="flex justify-center">
            <Button
              className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white px-16 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 w-full max-w-md"
            >
              Join Waitlist
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};