import { motion } from "framer-motion";
import { Meditation, Dumbbell, Brain, Users } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export const Programs = () => {
  const programs = [
    {
      title: "Guided Meditation",
      description: "Expert-led sessions designed for crypto professionals to reduce stress and enhance focus.",
      icon: Meditation,
      benefits: [
        "Stress reduction",
        "Improved focus",
        "Better decision making",
        "Mental clarity"
      ]
    },
    {
      title: "Fitness Programs",
      description: "Tailored workout sessions that fit into your busy crypto trading schedule.",
      icon: Dumbbell,
      benefits: [
        "Physical wellness",
        "Energy boost",
        "Stress relief",
        "Better sleep"
      ]
    },
    {
      title: "Mindfulness Training",
      description: "Learn techniques to stay present and make better trading decisions.",
      icon: Brain,
      benefits: [
        "Emotional balance",
        "Trading psychology",
        "Anxiety management",
        "Focus enhancement"
      ]
    },
    {
      title: "Community Sessions",
      description: "Connect with like-minded individuals in our wellness-focused crypto community.",
      icon: Users,
      benefits: [
        "Networking",
        "Shared experiences",
        "Support system",
        "Knowledge sharing"
      ]
    }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-6">
                  <program.icon className="w-12 h-12 text-[#FF4444] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-white">{program.title}</h3>
                  <p className="text-gray-300 mb-4">{program.description}</p>
                  <ul className="space-y-2">
                    {program.benefits.map((benefit) => (
                      <li key={benefit} className="text-gray-400">
                        • {benefit}
                      </li>
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