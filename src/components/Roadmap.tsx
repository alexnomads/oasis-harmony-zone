import { motion } from "framer-motion";
import { Milestone } from "lucide-react";

export const Roadmap = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-zinc-900 to-black">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
            Roadmap
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Our Journey Forward
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Building the future of wellness in the crypto space, one milestone at a time
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <Milestone className="w-24 h-24 text-[#FF4444]" />
        </motion.div>
      </div>
    </section>
  );
};