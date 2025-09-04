
import { Trophy } from "lucide-react";
import { GlobalLeaderboard } from "@/components/leaderboard/GlobalLeaderboard";

export function LeaderboardSection() {
  return (
    <div className="crt-frame p-5 sm:p-6">
      <div className="border-b border-primary/30 pb-4 mb-4">
        <h2 className="cyber-heading text-xl sm:text-2xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-500" />
          Global Leaderboard
        </h2>
      </div>
      <div>
        <GlobalLeaderboard />
      </div>
    </div>
  );
}
