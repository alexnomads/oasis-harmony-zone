
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselNext, CarouselPrevious } from "../ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

export const RoadmapNavigation = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`absolute ${isMobile ? 'bottom-4 right-4' : 'top-1/2 -translate-y-1/2 w-full'} flex ${isMobile ? 'flex-col gap-2' : 'justify-between px-4'}`}>
      <CarouselPrevious 
        className={`${isMobile ? 'relative left-auto -bottom-0 translate-y-0' : '-left-4 sm:-left-8 lg:-left-12'} 
          bg-gradient-to-r from-vibrantPurple to-softPurple text-white hover:from-vibrantPurple/90 hover:to-softPurple/90 
          border-none shadow-md w-10 h-10 rounded-full`}
      >
        <ChevronLeft className="h-6 w-6" />
      </CarouselPrevious>
      
      <CarouselNext 
        className={`${isMobile ? 'relative right-auto -bottom-0 translate-y-0' : '-right-4 sm:-right-8 lg:-right-12'} 
          bg-gradient-to-l from-vibrantOrange to-softOrange text-white hover:from-vibrantOrange/90 hover:to-softOrange/90 
          border-none shadow-md w-10 h-10 rounded-full`}
      >
        <ChevronRight className="h-6 w-6" />
      </CarouselNext>
    </div>
  );
};
