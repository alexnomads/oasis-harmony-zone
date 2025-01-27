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
    <section className="py-12 bg-gradient-to-br from-vibrantPurple/90 to-vibrantOrange/90">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-black/20 hover:bg-black/30 transition-all duration-300 border border-white/10"
            >
              <feature.icon className="w-12 h-12 text-softOrange mb-6" />
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};