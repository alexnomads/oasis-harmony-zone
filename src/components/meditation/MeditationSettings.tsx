
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SoundOption = "silent" | "forest" | "waves" | "birds";

interface MeditationSettingsProps {
  selectedDuration: number;
  setSelectedDuration: (value: number) => void;
  soundOption: SoundOption;
  setSoundOption: (value: SoundOption) => void;
}

export const MeditationSettings: React.FC<MeditationSettingsProps> = ({
  selectedDuration,
  setSelectedDuration,
  soundOption,
  setSoundOption,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm text-white/70">Duration</label>
        <Select 
          value={selectedDuration.toString()}
          onValueChange={(value) => setSelectedDuration(Number(value))}
        >
          <SelectTrigger className="bg-black/20 border-white/20 text-white">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">30 seconds</SelectItem>
            <SelectItem value="1">1 minute</SelectItem>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="10">10 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="20">20 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Sound</label>
        <Select 
          value={soundOption}
          onValueChange={(value: SoundOption) => setSoundOption(value)}
        >
          <SelectTrigger className="bg-black/20 border-white/20 text-white">
            <SelectValue placeholder="Select sound" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="silent">Silent</SelectItem>
            <SelectItem value="forest">Forest Sounds</SelectItem>
            <SelectItem value="waves">Ocean Waves</SelectItem>
            <SelectItem value="birds">Bird Songs</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
