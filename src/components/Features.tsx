import { motion } from "framer-motion";
import { Brain, Dumbbell, Users, Sparkles } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Meditation Spaces",
    description: "Find your center with guided meditation sessions in our serene spaces",
  },
  {
    icon: Dumbbell,
    title: "Fitness Activities",
    description: "Stay active with curated workout sessions designed for busy professionals",
  },
  {
    icon: Users,
    title: "Networking",
    description: "Connect with like-minded individuals in a relaxed environment",
  },
  {
    icon: Sparkles,
    title: "ROJ Token Benefits",
    description: "Exclusive access and rewards through our Rose of Jericho utility token",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
            Features
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">A Complete Wellness Experience</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to stay balanced and connected during crypto conferences
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-all duration-300 border border-zinc-800"
            >
              <feature.icon className="w-12 h-12 text-[#FF4444] mb-6" />
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};