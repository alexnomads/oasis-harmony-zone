
import { Award } from "lucide-react";
import { StatCard } from "../StatCard";

interface MeditationSessionsCardProps {
  totalSessions: number;
  isLoading: boolean;
}

export function MeditationSessionsCard({ totalSessions, isLoading }: MeditationSessionsCardProps) {
  return (
    <StatCard
      title="Meditation Sessions"
      subtitle="Total Sessions"
      value={totalSessions}
      isLoading={isLoading}
      icon={<Award className="h-8 w-8 text-green-500" />}
    />
  );
}
