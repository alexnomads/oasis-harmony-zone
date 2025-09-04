
import { motion } from "framer-motion";
import { Tweet } from 'react-tweet';
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Testimonials = () => {
  const isMobile = useIsMobile();
  
  const testimonials = [
    { id: "1940408069831418021", delay: 0.1 },
    { id: "1890440940772352257", delay: 0.2 },
    { id: "1915387070433939723", delay: 0.3 },
    { id: "1884682972248371583", delay: 0.4 },
    { 
      type: "linkedin", 
      src: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7294695290186432512",
      delay: 0.5 
    }
  ];
  return <section className="py-16 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-secondary/25 via-accent/20 to-primary/25"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,hsl(var(--deep-violet))_0%,transparent_50%),radial-gradient(circle_at_80%_30%,hsl(var(--neon-magenta))_0%,transparent_50%),radial-gradient(circle_at_45%_45%,hsl(var(--electric-cyan))_0%,transparent_55%)]"></div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            They say about us
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">Testimonials and Milestones</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            See what our community members are saying about Rose of Jericho
          </p>
        </motion.div>

        {isMobile ? (
          <Carousel className="w-full max-w-xs mx-auto" opts={{ align: "center" }}>
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id || index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: testimonial.delay }}
                    className="bg-black/20 rounded-xl p-4"
                  >
                    {testimonial.type === "linkedin" ? (
                      <div className="h-[600px] overflow-hidden">
                        <iframe 
                          src={testimonial.src} 
                          height="600" 
                          width="100%" 
                          frameBorder="0" 
                          allowFullScreen 
                          title="Embedded LinkedIn post" 
                          className="max-w-full -mt-16" 
                        />
                      </div>
                    ) : (
                      <Tweet id={testimonial.id} />
                    )}
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
            <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
          </Carousel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: testimonial.delay }}
                className="bg-black/20 rounded-xl p-4"
              >
                {testimonial.type === "linkedin" ? (
                  <div className="h-[600px] overflow-hidden">
                    <iframe 
                      src={testimonial.src} 
                      height="600" 
                      width="100%" 
                      frameBorder="0" 
                      allowFullScreen 
                      title="Embedded LinkedIn post" 
                      className="max-w-full -mt-16" 
                    />
                  </div>
                ) : (
                  <Tweet id={testimonial.id} />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>;
};
