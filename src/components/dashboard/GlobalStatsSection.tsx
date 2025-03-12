
import { Trophy, Award } from "lucide-react";
import { StatCard } from "./StatCard";
import { formatDurationDetails } from "@/lib/utils/timeFormat";
import { GlobalStats } from "@/hooks/use-global-stats";

interface GlobalStatsSectionProps {
  stats: GlobalStats;
  isLoading: boolean;
}

export function GlobalStatsSection({ stats, isLoading }: GlobalStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <StatCard
        title="Meditation Sessions"
        subtitle="Total Sessions"
        value={stats.totalSessions}
        isLoading={isLoading}
        icon={<Award className="h-8 w-8 text-green-500" />}
      />

      <StatCard
        title="Total Meditation Time"
        subtitle="Collective Time"
        value={formatDurationDetails(stats.totalMeditationTime)}
        isLoading={isLoading}
        icon={<Trophy className="h-8 w-8 text-orange-500" />}
      />
    </div>
  );
}
