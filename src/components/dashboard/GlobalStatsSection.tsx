
import { GlobalStats } from "@/hooks/use-global-stats";
import { ActiveMeditatorsCard } from "./stats/ActiveMeditatorsCard";
import { MeditationSessionsCard } from "./stats/MeditationSessionsCard";
import { TotalMeditationTimeCard } from "./stats/TotalMeditationTimeCard";
import { FitnessSessionsCard } from "./stats/FitnessSessionsCard";
import { TotalFitnessTimeCard } from "./stats/TotalFitnessTimeCard";

interface GlobalStatsSectionProps {
  stats: GlobalStats;
  isLoading: boolean;
}

export function GlobalStatsSection({ stats, isLoading }: GlobalStatsSectionProps) {
  return (
    <div className="space-y-12">
      {/* Meditation Stats */}
      <div>
        <h2 className="text-2xl font-bold text-accent mb-6">🧘 Meditation Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Fitness Stats */}
      <div>
        <h2 className="text-2xl font-bold text-accent mb-6">💪 Fitness Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FitnessSessionsCard 
            totalSessions={stats.totalFitnessSessions} 
            isLoading={isLoading} 
          />

          <TotalFitnessTimeCard 
            totalFitnessTime={stats.totalFitnessTime} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
