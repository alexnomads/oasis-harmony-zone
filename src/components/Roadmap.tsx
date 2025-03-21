
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { useState, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem
} from "./ui/carousel";

import { roadmapData } from "@/types/roadmap";
import { PhaseSelector } from "./roadmap/PhaseSelector";
import { PhaseZero } from "./roadmap/PhaseZero";
import { PhaseGroup } from "./roadmap/PhaseGroup";
import { RoadmapNavigation } from "./roadmap/RoadmapNavigation";

export const Roadmap = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [api, setApi] = useState<any>(null);

  useEffect(() => {
    if (api) {
      api.scrollTo(activePhase);
    }
  }, [api, activePhase]);

  const handleSelect = () => {
    if (api) {
      const selectedIndex = api.selectedScrollSnap();
      setActivePhase(selectedIndex);
    }
  };

  useEffect(() => {
    if (!api) return;
    
    api.on('select', handleSelect);
    
    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

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
        
        <PhaseSelector 
          phases={roadmapData} 
          activePhase={activePhase} 
          setActivePhase={setActivePhase} 
        />
        
        <Carousel 
          className="max-w-5xl mx-auto relative"
          setApi={setApi}
          opts={{
            align: "start",
            loop: true
          }}
        >
          <CarouselContent className="px-4">
            {roadmapData.map((phase, index) => (
              <CarouselItem key={index} className="w-full">
                <Card className="h-full bg-black/20 border-white/10">
                  <CardContent className="p-6 h-full">
                    {index === 0 ? (
                      <PhaseZero phase={phase} />
                    ) : (
                      <PhaseGroup phase={phase} />
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <RoadmapNavigation />
        </Carousel>
      </div>
    </section>
  );
};
