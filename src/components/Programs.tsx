import { motion } from "framer-motion";
import { Meditation, Dumbbell, Brain, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const programs = [
  {
    icon: Meditation,
    title: "Guided Meditation",
    description: "Expert-led sessions designed for crypto professionals to reduce stress and enhance focus.",
    benefits: ["Stress reduction", "Improved focus", "Better decision making", "Mental clarity"]
  },
  {
    icon: Dumbbell,
    title: "Fitness Programs",
    description: "Tailored workout sessions that fit into your busy crypto trading schedule.",
    benefits: ["Physical wellness", "Energy boost", "Stress relief", "Better sleep"]
  },
  {
    icon: Brain,
    title: "Mindfulness Training",
    description: "Learn techniques to stay present and make better trading decisions.",
    benefits: ["Emotional balance", "Trading psychology", "Anxiety management", "Focus enhancement"]
  },
  {
    icon: Users,
    title: "Community Sessions",
    description: "Connect with like-minded individuals in our wellness-focused crypto community.",
    benefits: ["Networking", "Shared experiences", "Support system", "Knowledge sharing"]
  }
];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-all duration-300">
                <CardHeader>
                  <program.icon className="w-12 h-12 text-[#FF4444] mb-4" />
                  <CardTitle className="text-2xl font-bold text-white">{program.title}</CardTitle>
                  <CardDescription className="text-gray-300">{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {program.benefits.map((benefit, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="flex items-center text-gray-300"
                      >
                        <span className="text-[#FF4444] mr-2">•</span>
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};