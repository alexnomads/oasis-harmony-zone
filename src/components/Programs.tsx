import { motion } from "framer-motion";

export const Programs = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-black to-zinc-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
            Our Programs
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Wellness Programs for Crypto Professionals
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover our carefully curated programs designed to enhance your mental and physical well-being
          </p>
        </motion.div>
      </div>
    </section>
  );
};