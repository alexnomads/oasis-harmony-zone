import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils/timeFormat";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Target } from "lucide-react";

interface SessionCardProps {
  session: {
    id: string;
    type: string;
    duration: number;
    points_earned: number;
    created_at: string;
    completed_at?: string;
  };
}

export function SessionCard({ session }: SessionCardProps) {
  const date = new Date(session.created_at).toLocaleDateString();
  const time = new Date(session.created_at).toLocaleTimeString();

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="h-5 w-5 text-green-400" />
            <div>
              <p className="font-medium capitalize">{session.type} Meditation</p>
              <p className="text-sm text-zinc-400">{date} at {time}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm">{formatDuration(session.duration)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">{session.points_earned}</span>
            </div>
            <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
              Completed
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}