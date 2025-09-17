import { GlobalStats } from "@/hooks/use-global-stats";
import { ActiveMeditatorsCard } from "./stats/ActiveMeditatorsCard";
import { MeditationSessionsCard } from "./stats/MeditationSessionsCard";
import { TotalMeditationTimeCard } from "./stats/TotalMeditationTimeCard";
import { FitnessSessionsCard } from "./stats/FitnessSessionsCard";
import { TotalFitnessTimeCard } from "./stats/TotalFitnessTimeCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
interface GlobalStatsSectionProps {
  stats: GlobalStats;
  isLoading: boolean;
}
export function GlobalStatsSection({
  stats,
  isLoading
}: GlobalStatsSectionProps) {
  const plugin = useRef(Autoplay({
    delay: 4000,
    stopOnInteraction: true
  }));
  return <div className="space-y-6">
      {/* Compact Header */}
      <div className="text-center">
        
        
      </div>

      {/* Mobile Carousel View */}
      <div className="block md:hidden">
        <Carousel plugins={[plugin.current]} className="w-full max-w-sm mx-auto" onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset}>
          <CarouselContent>
            <CarouselItem>
              <div className="p-1">
                <ActiveMeditatorsCard totalUsers={stats.totalUsers} isLoading={isLoading} />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="p-1">
                <MeditationSessionsCard totalSessions={stats.totalSessions} isLoading={isLoading} />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="p-1">
                <TotalMeditationTimeCard totalMeditationTime={stats.totalMeditationTime} isLoading={isLoading} />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="p-1">
                <FitnessSessionsCard totalSessions={stats.totalFitnessSessions} isLoading={isLoading} />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="p-1">
                <TotalFitnessTimeCard totalFitnessTime={stats.totalFitnessTime} isLoading={isLoading} />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Desktop Compact Grid View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <ActiveMeditatorsCard totalUsers={stats.totalUsers} isLoading={isLoading} />
          <MeditationSessionsCard totalSessions={stats.totalSessions} isLoading={isLoading} />
          <TotalMeditationTimeCard totalMeditationTime={stats.totalMeditationTime} isLoading={isLoading} />
          <FitnessSessionsCard totalSessions={stats.totalFitnessSessions} isLoading={isLoading} />
          <TotalFitnessTimeCard totalFitnessTime={stats.totalFitnessTime} isLoading={isLoading} />
        </div>
      </div>
    </div>;
}