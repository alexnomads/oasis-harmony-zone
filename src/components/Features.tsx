import { motion } from "framer-motion";
import { Brain, Dumbbell, Users, Flower, Map } from "lucide-react";

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

const tokenBenefits = [
  "Access to Rose of Jericho (ROJ) online community and physical areas worldwide",
  "Discounted meditation sessions and fitness classes",
  "Priority booking for activities and services",
  "Exclusive networking opportunities within the Rose of Jericho (ROJ) community",
  "Token rewards for participation in wellness activities or referrals",
];

const monetizationStrategy = [
  "Initial Token Sale: To raise funds for the development and launch of Rose of Jericho (ROJ)",
  "Transaction Fees: A small fee for every ROJ transaction",
  "Partnerships: Collaborations with crypto projects, wellness brands, and event organizers",
];

const roadmapPhases = [
  {
    phase: "Phase 1",
    items: [
      "Concept validation and community building.",
      "Development of ROJ token and smart contracts.",
      "Strategic partnerships with wellness brands and crypto projects.",
    ],
  },
  {
    phase: "Phase 2",
    items: [
      "Launch of the first Rose of Jericho (ROJ) pop-up at a major crypto conference.",
      "Initial token sale and distribution.",
      "Collect feedback for improvements.",
    ],
  },
  {
    phase: "Phase 3",
    items: [
      "Expansion to additional conferences globally.",
      "Development of a digital platform for ongoing engagement.",
      "Introduce staking mechanisms and token rewards for wellness activities.",
    ],
  },
  {
    phase: "Phase 4",
    items: [
      "Establish permanent Rose of Jericho (ROJ) wellness hubs in key crypto hubs (e.g., Singapore, Miami, Lisbon).",
      "Collaborate with Web3 health-tech projects to integrate innovative wellness solutions.",
    ],
  },
];

export const Features = () => {
  return (
    <>
      <section className="py-12 bg-black">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Flower className="w-16 h-16 text-[#FF4444] mx-auto mb-6" />
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
                Token Utility
              </span>
              <h2 className="text-4xl font-bold mb-4 text-white">Rose of Jericho (ROJ)</h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-zinc-800 border border-zinc-700"
            >
              <h3 className="text-2xl font-bold mb-6 text-white">Functions</h3>
              <ul className="space-y-4">
                {tokenBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <span className="text-[#FF4444] mt-1">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-zinc-800 border border-zinc-700"
            >
              <h3 className="text-2xl font-bold mb-6 text-white">Monetization Strategy</h3>
              <ul className="space-y-4">
                {monetizationStrategy.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <span className="text-[#FF4444] mt-1">•</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Map className="w-16 h-16 text-[#FF4444] mx-auto mb-6" />
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
                Roadmap
              </span>
              <h2 className="text-4xl font-bold mb-4 text-white">Development Timeline</h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roadmapPhases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-all duration-300 border border-zinc-800"
              >
                <h3 className="text-2xl font-bold mb-6 text-[#FF4444]">{phase.phase}</h3>
                <ul className="space-y-4">
                  {phase.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-gray-300">
                      <span className="text-[#FF4444] mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
