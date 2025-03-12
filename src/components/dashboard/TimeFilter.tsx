
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimePeriod = "all" | "day" | "week" | "month" | "year";

interface TimeFilterProps {
  timePeriod: TimePeriod;
  onChange: (value: TimePeriod) => void;
}

export function TimeFilter({ timePeriod, onChange }: TimeFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      <CalendarIcon className="h-5 w-5 text-zinc-400" />
      <Select value={timePeriod} onValueChange={(value) => onChange(value as TimePeriod)}>
        <SelectTrigger className="w-[180px] bg-zinc-900/50 border-zinc-800 text-white">
          <SelectValue placeholder="Select time period" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="day">Today</SelectItem>
          <SelectItem value="week">Last Week</SelectItem>
          <SelectItem value="month">Last Month</SelectItem>
          <SelectItem value="year">Last Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
