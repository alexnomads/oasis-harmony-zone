import { motion } from "framer-motion";
import { Milestone } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export const Roadmap = () => {
  const phases = [
    {
      title: "Phase 1",
      items: [
        "Concept validation and community building.",
        "Development of ROJ token and smart contracts.",
        "Strategic partnerships with wellness brands and crypto projects."
      ]
    },
    {
      title: "Phase 2",
      items: [
        "Launch of the first Rose of Jericho (ROJ) pop-up at a major crypto conference.",
        "Initial token sale and distribution.",
        "Collect feedback for improvements."
      ]
    },
    {
      title: "Phase 3",
      items: [
        "Expansion to additional conferences globally.",
        "Development of a digital platform for ongoing engagement.",
        "Introduce staking mechanisms and token rewards for wellness activities."
      ]
    },
    {
      title: "Phase 4",
      items: [
        "Establish permanent Rose of Jericho (ROJ) wellness hubs in key crypto hubs (e.g., Singapore, Miami, Lisbon).",
        "Collaborate with Web3 health-tech projects to integrate innovative wellness solutions."
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-zinc-900 to-black">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
            Roadmap
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Our Journey Forward
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Building the future of wellness in the crypto space, one milestone at a time
          </p>
        </motion.div>
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#FF4444]/20" />
          {phases.map((phase, index) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-12 last:mb-0"
            >
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full bg-[#FF4444]" />
              </div>
              <Card className={`w-[calc(50%-40px)] ${index % 2 === 0 ? 'ml-0' : 'ml-[calc(50%+40px)]'} bg-zinc-800/50 border-zinc-700`}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-[#FF4444]">{phase.title}</h3>
                  <ul className="space-y-3">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-300">
                        {item}
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