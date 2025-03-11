
import { useState } from "react";
import { Header } from "@/components/Header";
import { useGlobalStats } from "@/hooks/use-global-stats";
import { GlobalStatsSection } from "@/components/dashboard/GlobalStatsSection";
import { LeaderboardSection } from "@/components/dashboard/LeaderboardSection";
import { RealTimeUpdates } from "@/components/dashboard/RealTimeUpdates";
import { TimeFilter, TimePeriod } from "@/components/dashboard/TimeFilter";

export default function GlobalDashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const { stats, isLoading, refetch } = useGlobalStats(timePeriod);

  // Handle time period change
  const handleTimeChange = (newTimePeriod: TimePeriod) => {
    setTimePeriod(newTimePeriod);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <RealTimeUpdates refetch={refetch} />
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl font-bold text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
            Global Meditation Dashboard
          </h1>
          <div className="mt-4 md:mt-0 self-center md:self-auto">
            <TimeFilter timePeriod={timePeriod} onChange={handleTimeChange} />
          </div>
        </div>

        <GlobalStatsSection stats={stats} isLoading={isLoading} />
        <LeaderboardSection />
      </div>
    </div>
  );
}
