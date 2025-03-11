
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalLeaderboard } from "@/components/leaderboard/GlobalLeaderboard";

export function LeaderboardSection() {
  return (
    <Card className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-500" />
          <span>Global Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GlobalLeaderboard />
      </CardContent>
    </Card>
  );
}
