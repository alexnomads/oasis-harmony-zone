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
      text: "Access to Rose of Jericho (ROJ) pop-up areas at conferences and in physical spots worldwide.",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
    },
    {
      text: "Access to online ROJ wellness platform",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
    },
    {
      text: "Discounts on wellness services (e.g., meditation sessions, yoga classes, healthy meals).",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
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
    <section className="py-16 pb-8 bg-zinc-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-[#FF4444]/20 text-[#FF4444] rounded-full">
            ROJ Token
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Powering the Wellness Economy
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our native token enables seamless access to wellness services and rewards active community participation
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <Coins className="w-24 h-24 text-[#FF4444]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {benefits.map((benefit, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-zinc-800/50 border-zinc-700 overflow-hidden">
                    <div className="h-40 w-full overflow-hidden">
                      <img 
                        src={benefit.image} 
                        alt={`Benefit ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <CardContent className="flex items-center p-6">
                      <p className="text-gray-300 text-center">{benefit.text}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-4">
              <CarouselPrevious className="relative static" />
              <CarouselNext className="relative static" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};