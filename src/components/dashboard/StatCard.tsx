
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle: string;
  isLoading: boolean;
}

export function StatCard({ title, value, icon, subtitle, isLoading }: StatCardProps) {
  return (
    <Card className="bg-zinc-900/50 border border-zinc-800 text-white backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-opacity-10 rounded-full">{icon}</div>
          <div>
            <p className="text-sm text-zinc-400">{subtitle}</p>
            <h3 className="text-2xl font-bold">{isLoading ? "Loading..." : value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
