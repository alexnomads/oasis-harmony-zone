import { motion } from "framer-motion";
import { Dumbbell, Brain, Users } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export const Programs = () => {
  const programs = [
    {
      title: "Guided Meditation",
      description: "Expert-led sessions designed for crypto professionals to reduce stress and enhance focus.",
      icon: Brain,
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
    <section className="py-16 bg-gradient-to-br from-vibrantPurple to-vibrantOrange">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            Our Programs
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Wellness Programs for Crypto Professionals
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover our curated programs designed to enhance your mental & physical well-being
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-6">
                  <program.icon className="w-12 h-12 text-softOrange mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-white">{program.title}</h3>
                  <p className="text-white/80 mb-4">{program.description}</p>
                  <ul className="space-y-2">
                    {program.benefits.map((benefit) => (
                      <li key={benefit} className="text-white/70">
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
