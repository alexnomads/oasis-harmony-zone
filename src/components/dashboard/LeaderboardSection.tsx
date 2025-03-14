
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalLeaderboard } from "@/components/leaderboard/GlobalLeaderboard";

export function LeaderboardSection() {
  return (
    <Card className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm overflow-hidden rounded-xl shadow-lg">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <Trophy className="h-5 w-5 text-orange-500" />
          <span>Global Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-6">
        <GlobalLeaderboard />
      </CardContent>
    </Card>
  );
}
