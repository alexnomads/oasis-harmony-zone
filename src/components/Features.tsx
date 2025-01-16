import { motion } from "framer-motion";
import { Brain, Dumbbell, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Meditation Growth",
    description: "Join our online meditation community for crypto professionals",
  },
  {
    icon: Dumbbell,
    title: "Fitness Growth",
    description: "Stay active with curated workout sessions designed for busy professionals",
  },
  {
    icon: Users,
    title: "Network Growth",
    description: "Connect with like-minded web3 pros in a relaxed environment",
  },
];

export const Features = () => {
  return (
    <section className="py-12 bg-gradient-to-b from-[#FFDEE2] to-[#E5DEFF]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white shadow-lg border-4 border-[#FEC6A1] hover:border-[#D946EF] transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-[#8B5CF6] mb-6 mx-auto" />
              <h3 className="text-xl font-semibold mb-3 text-[#4A3D52]">{feature.title}</h3>
              <p className="text-[#4A3D52]/80">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};