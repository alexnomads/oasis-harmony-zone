
import { Header } from "@/components/Header";
import { useGlobalStats } from "@/hooks/use-global-stats";
import { GlobalStatsSection } from "@/components/dashboard/GlobalStatsSection";
import { LeaderboardSection } from "@/components/dashboard/LeaderboardSection";
import { RealTimeUpdates } from "@/components/dashboard/RealTimeUpdates";

export default function GlobalDashboard() {
  const { stats, isLoading, refetch } = useGlobalStats("all");

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <RealTimeUpdates refetch={refetch} />
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left text-white">
            Global Meditation Dashboard
          </h1>
          <p className="text-zinc-400 mt-2 text-center sm:text-left">All Time Statistics</p>
        </div>

        <GlobalStatsSection stats={stats} isLoading={isLoading} />
        <LeaderboardSection />
      </div>
    </div>
  );
}
