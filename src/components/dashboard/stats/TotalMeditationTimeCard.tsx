
import { Trophy } from "lucide-react";
import { StatCard } from "../StatCard";
import { formatDurationDetails } from "@/lib/utils/timeFormat";

interface TotalMeditationTimeCardProps {
  totalMeditationTime: number;
  isLoading: boolean;
}

export function TotalMeditationTimeCard({ totalMeditationTime, isLoading }: TotalMeditationTimeCardProps) {
  return (
    <StatCard
      title="Total Meditation Time"
      subtitle="Collective Time"
      value={formatDurationDetails(totalMeditationTime)}
      isLoading={isLoading}
      icon={<Trophy className="h-8 w-8 text-orange-500" />}
    />
  );
}
