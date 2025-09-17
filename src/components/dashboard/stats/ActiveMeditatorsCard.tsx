
import { Users } from "lucide-react";
import { StatCard } from "../StatCard";

interface ActiveMeditatorsCardProps {
  totalUsers: number;
  isLoading: boolean;
}

export function ActiveMeditatorsCard({ totalUsers, isLoading }: ActiveMeditatorsCardProps) {
  return (
    <StatCard
      title="Active Wellness Seekers"
      subtitle="Registered Users"
      value={totalUsers}
      isLoading={isLoading}
      icon={<Users className="h-8 w-8 text-purple-500" />}
    />
  );
}
