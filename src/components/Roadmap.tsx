
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Tweet } from 'react-tweet';

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
    <section className="py-16 bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            Roadmap
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Our Journey Forward
          </h2>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Building the future of wellness in the crypto space, one milestone at a time
          </p>
        </motion.div>
        
        {/* Mobile Roadmap (Vertical Timeline) */}
        <div className="md:hidden relative max-w-md mx-auto">
          <div className="absolute left-4 top-0 bottom-0 w-1 bg-white/20" />
          {phases.map((phase, index) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-10 last:mb-0 pl-10"
            >
              <div className="absolute left-4 top-0 transform -translate-x-1/2">
                <div className="w-4 h-4 rounded-full bg-softOrange" />
              </div>
              <Card className="bg-black/20 border-white/10 overflow-hidden">
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-4 text-softOrange">{phase.title}</h3>
                  {index === 0 && (
                    <div className="mb-4 w-full">
                      <div className="tweet-container" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                        <Tweet id="1886840995259592951" />
                      </div>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm sm:text-base text-white/80">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Desktop Roadmap (Horizontal Timeline) */}
        <div className="hidden md:block relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/20" />
          {phases.map((phase, index) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-16 last:mb-0"
            >
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full bg-softOrange" />
              </div>
              <Card className={`w-[calc(50%-20px)] ${index % 2 === 0 ? 'mr-[calc(50%+20px)]' : 'ml-[calc(50%+20px)]'} bg-black/20 border-white/10`}>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-softOrange">{phase.title}</h3>
                  {index === 0 && (
                    <div className="mb-6 w-full">
                      <div className="tweet-container" style={{ width: '100%', maxWidth: '100%' }}>
                        <Tweet id="1886840995259592951" />
                      </div>
                    </div>
                  )}
                  <ul className="space-y-3">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-base text-white/80">
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
