
import { Tweet } from 'react-tweet';
import { Badge } from "../ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Phase } from "@/types/roadmap";

interface PhaseZeroProps {
  phase: Phase;
}

export const PhaseZero = ({ phase }: PhaseZeroProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-4 gap-2 justify-center">
        <h3 className="text-2xl font-bold text-softOrange">{phase.title}</h3>
        {phase.completed && (
          <Badge variant="outline" className="text-green-400 border-green-400">
            <CheckCircle2 className="mr-1 h-4 w-4" /> Completed
          </Badge>
        )}
      </div>
      
      <div className="mb-6 flex justify-center w-full">
        <div className="tweet-container w-full md:w-3/4 max-w-[500px]">
          <Tweet id="1886840995259592951" />
        </div>
      </div>
      
      <div className="space-y-4 text-center">
        {phase.items && Array.isArray(phase.items) && phase.items.map((item, itemIndex) => (
          <p key={itemIndex} className="text-white">{item.toString()}</p>
        ))}
      </div>
    </div>
  );
};
