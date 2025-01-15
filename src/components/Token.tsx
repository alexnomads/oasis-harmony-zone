import { motion } from "framer-motion";
import { Coins } from "lucide-react";

export const Token = () => {
  return (
    <section className="py-16 bg-zinc-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
            ROJ Token
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Powering the Wellness Economy
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our native token enables seamless access to wellness services and rewards active community participation
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <Coins className="w-24 h-24 text-[#FF4444]" />
        </motion.div>
      </div>
    </section>
  );
};