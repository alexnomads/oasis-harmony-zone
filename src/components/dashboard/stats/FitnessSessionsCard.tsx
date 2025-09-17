import { StatCard } from "@/components/dashboard/StatCard";

interface FitnessSessionsCardProps {
  totalSessions: number;
  isLoading: boolean;
}

export function FitnessSessionsCard({ totalSessions, isLoading }: FitnessSessionsCardProps) {
  return (
    <StatCard
      title="FITNESS SESSIONS"
      value={totalSessions}
      icon="💪"
      isLoading={isLoading}
      subtitle="Total workouts completed"
    />
  );
}