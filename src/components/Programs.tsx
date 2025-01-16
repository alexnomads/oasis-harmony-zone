import { motion } from "framer-motion";
import { Brain, Dumbbell, Users } from "lucide-react";

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
      "Knowledge sharing",
      "Support system",
      "Growth mindset"
    ]
  }
];

export const Programs = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-[#E5DEFF] to-[#FEC6A1]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white text-[#8B5CF6] rounded-full shadow-md">
            Our Programs
          </span>
          <h2 className="text-4xl font-bold mb-4 text-[#4A3D52]">
            Wellness Programs for Crypto Professionals
          </h2>
          <p className="text-xl text-[#4A3D52]/80 max-w-2xl mx-auto">
            Discover our carefully curated programs designed to enhance your mental and physical well-being
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-lg border-4 border-[#D946EF] hover:border-[#FEC6A1] transition-all duration-300"
            >
              <program.icon className="w-12 h-12 text-[#8B5CF6] mb-6 mx-auto" />
              <h3 className="text-xl font-bold mb-4 text-[#4A3D52]">{program.title}</h3>
              <p className="text-[#4A3D52]/80 mb-6">{program.description}</p>
              <ul className="space-y-3">
                {program.benefits.map((benefit, itemIndex) => (
                  <li key={itemIndex} className="text-[#4A3D52]/70 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#D946EF] mr-2" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};