
import { Header } from "@/components/Header";
import { useGlobalStats } from "@/hooks/use-global-stats";
import { GlobalStatsSection } from "@/components/dashboard/GlobalStatsSection";
import { LeaderboardSection } from "@/components/dashboard/LeaderboardSection";
import { RealTimeUpdates } from "@/components/dashboard/RealTimeUpdates";

export default function GlobalDashboard() {
  const { stats, isLoading, refetch } = useGlobalStats("all");

  return (
    <div className="min-h-screen relative">
      <RealTimeUpdates refetch={refetch} />
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="cyber-heading text-3xl sm:text-4xl text-center sm:text-left">
            Global Meditation Dashboard
          </h1>
          <p className="retro-text text-muted-foreground mt-2 text-center sm:text-left">All Time Statistics</p>
        </div>

        <GlobalStatsSection stats={stats} isLoading={isLoading} />
        <LeaderboardSection />
      </div>
    </div>
  );
}
