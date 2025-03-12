
import { GlobalStats } from "@/hooks/use-global-stats";
import { ActiveMeditatorsCard } from "./stats/ActiveMeditatorsCard";
import { MeditationSessionsCard } from "./stats/MeditationSessionsCard";
import { TotalMeditationTimeCard } from "./stats/TotalMeditationTimeCard";

interface GlobalStatsSectionProps {
  stats: GlobalStats;
  isLoading: boolean;
}

export function GlobalStatsSection({ stats, isLoading }: GlobalStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <ActiveMeditatorsCard 
        totalUsers={stats.totalUsers} 
        isLoading={isLoading} 
      />

      <MeditationSessionsCard 
        totalSessions={stats.totalSessions} 
        isLoading={isLoading} 
      />

      <TotalMeditationTimeCard 
        totalMeditationTime={stats.totalMeditationTime} 
        isLoading={isLoading} 
      />
    </div>
  );
}
