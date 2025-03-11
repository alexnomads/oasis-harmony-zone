
import { Header } from "@/components/Header";
import { useGlobalStats } from "@/hooks/use-global-stats";
import { GlobalStatsSection } from "@/components/dashboard/GlobalStatsSection";
import { LeaderboardSection } from "@/components/dashboard/LeaderboardSection";
import { RealTimeUpdates } from "@/components/dashboard/RealTimeUpdates";

export default function GlobalDashboard() {
  const { stats, isLoading, refetch } = useGlobalStats();

  // Set up real-time updates
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <RealTimeUpdates refetch={refetch} />
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
          Global Meditation Dashboard
        </h1>

        <GlobalStatsSection stats={stats} isLoading={isLoading} />
        <LeaderboardSection />
      </div>
    </div>
  );
}
