import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import thriveProtocolLogo from "@/assets/thrive-protocol-logo.png";

const awards = [{
  name: "Thrive Protocol",
  logo: thriveProtocolLogo,
  link: "https://x.com/thriveprotocol/status/1915387070433939723"
}, {
  name: "Polygon",
  logo: "https://altcoinsbox.com/wp-content/uploads/2023/03/matic-logo.webp",
  link: "https://x.com/0xPolygon/status/1940408069831418021"
}, {
  name: "Soonami",
  logo: "https://pbs.twimg.com/profile_images/1709859920030347264/9SL23TTa_400x400.jpg",
  link: "https://x.com/soonami_io/status/1890440940772352257"
}];
export const Awards = () => {
  const isMobile = useIsMobile();
  
  // Reorder awards for mobile to show Polygon first
  const mobileAwards = [awards[1], awards[0], awards[2]]; // Polygon, Thrive, Soonami
  const awardsToShow = isMobile ? mobileAwards : awards;
  
  return <section className="py-8 relative overflow-hidden border-y border-white/10">
    <div className="absolute inset-0 bg-gradient-to-r from-deep-violet/30 via-primary/20 to-secondary/30"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--neon-magenta))_0%,transparent_40%),radial-gradient(circle_at_70%_30%,hsl(var(--electric-cyan))_0%,transparent_40%)]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-8">
           <span className="inline-block px-6 py-2 text-lg font-medium bg-white/10 text-white rounded-full">
             Grants & Hackathons Won So far
           </span>
        </motion.div>
        
        {isMobile ? (
          <div className="relative">
            <Carousel className="w-full max-w-xs mx-auto" opts={{ align: "center" }}>
              <CarouselContent>
                {awardsToShow.map((award, index) => (
                  <CarouselItem key={award.name}>
                     <motion.a 
                       href={award.link} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       initial={{ opacity: 0, scale: 0.8 }} 
                       whileInView={{ opacity: 1, scale: 1 }} 
                       whileHover={{ scale: 1.05 }} 
                       animate={{ 
                         y: [0, -5, 0],
                         transition: {
                           duration: 2,
                           repeat: Infinity,
                           ease: "easeInOut",
                           delay: index * 0.3
                         }
                       }}
                       transition={{ duration: 0.4, delay: index * 0.2 }} 
                       className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/20 w-36 h-36 flex items-center justify-center mx-auto"
                    >
                      <img 
                        src={award.logo} 
                        alt={award.name} 
                        className="w-24 h-24 rounded-lg object-contain" 
                      />
                    </motion.a>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
              <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
            </Carousel>
            {/* Scroll indicator dots */}
            <div className="flex justify-center mt-4 gap-2">
              {awardsToShow.map((_, index) => (
                <div key={index} className="w-2 h-2 rounded-full bg-white/30 animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-center items-center gap-3 sm:gap-8">
            {awardsToShow.map((award, index) => (
               <motion.a 
                 key={award.name}
                 href={award.link} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 initial={{ opacity: 0, scale: 0.8 }} 
                 whileInView={{ opacity: 1, scale: 1 }} 
                 whileHover={{ scale: 1.05 }} 
                 animate={{ 
                   y: [0, -5, 0],
                   transition: {
                     duration: 2,
                     repeat: Infinity,
                     ease: "easeInOut",
                     delay: index * 0.3
                   }
                 }}
                 transition={{ duration: 0.4, delay: index * 0.2 }} 
                 className="bg-black/20 backdrop-blur-sm p-2 sm:p-4 rounded-xl border border-white/20 w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center"
              >
                <img 
                  src={award.logo} 
                  alt={award.name} 
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg object-contain" 
                />
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>;
};
