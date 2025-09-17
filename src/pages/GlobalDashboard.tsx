
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
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-4">
          <h1 className="cyber-heading text-2xl sm:text-3xl text-center">
            Global Dashboard
          </h1>
          <p className="retro-text text-muted-foreground mt-1 text-center text-sm">Real-time wellness community insights</p>
        </div>

        <GlobalStatsSection stats={stats} isLoading={isLoading} />
        <div className="mt-8">
          <LeaderboardSection />
        </div>
      </div>
    </div>
  );
}
