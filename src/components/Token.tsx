
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export const Token = () => {
  const benefits = [
    {
      text: "Access to ROJ pop-up areas at conferences and in physical spots worldwide.",
      image: "/lovable-uploads/d129538f-def1-4f43-a2fe-9ef8cc81445a.png"
    },
    {
      text: "Owning $ROJ gives you access to the ROJ AI Wellness Agent.",
      image: "/lovable-uploads/d04ac241-16f8-41c0-a55c-ff656a5a92d9.png"
    },
    {
      text: "COMING UP! Discounts on wellness services (e.g., meditation sessions, yoga classes, healthy meals).",
      image: "/lovable-uploads/4e55ca27-b008-4b6e-b6ce-840accb1245f.png"
    },
    {
      text: "Priority booking for activities and services.",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
    },
    {
      text: "Exclusive networking opportunities within the Rose of Jericho (ROJ) community.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475"
    },
    {
      text: "Token rewards for participation in wellness activities or referrals.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
    }
  ];

  return (
    <section className="py-16 pb-8 bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            ROJ Token
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Powering the Wellness Economy
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Our native token enables seamless access to wellness services and rewards active community participation
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <Coins className="w-24 h-24 text-softOrange" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {benefits.map((benefit, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-black/20 border-white/10 h-[400px] flex flex-col">
                    <div className="h-[250px] w-full overflow-hidden">
                      <img 
                        src={benefit.image} 
                        alt={`Benefit ${index + 1}`}
                        className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <CardContent className="flex items-center justify-center flex-grow p-6">
                      <p className="text-white/80 text-center text-lg">{benefit.text}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="relative static bg-black/20 border-white/10 text-white hover:bg-black/30" />
              <CarouselNext className="relative static bg-black/20 border-white/10 text-white hover:bg-black/30" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};
