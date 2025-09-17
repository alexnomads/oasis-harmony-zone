import { StatCard } from "@/components/dashboard/StatCard";

interface TotalFitnessTimeCardProps {
  totalFitnessTime: number;
  isLoading: boolean;
}

export function TotalFitnessTimeCard({ totalFitnessTime, isLoading }: TotalFitnessTimeCardProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <StatCard
      title="FITNESS TIME"
      value={formatTime(totalFitnessTime)}
      icon="⏱️"
      isLoading={isLoading}
      subtitle="Total workout time"
    />
  );
}