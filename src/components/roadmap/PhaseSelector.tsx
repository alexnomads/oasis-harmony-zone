
import { CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Phase } from "@/types/roadmap";

interface PhaseSelectorProps {
  phases: Phase[];
  activePhase: number;
  setActivePhase: (index: number) => void;
}

export const PhaseSelector = ({ phases, activePhase, setActivePhase }: PhaseSelectorProps) => {
  return (
    <div className="flex justify-center mb-8 gap-2 md:gap-4 flex-wrap">
      {phases.map((phase, index) => (
        <div 
          key={index} 
          onClick={() => setActivePhase(index)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 ${
            activePhase === index 
              ? 'bg-white/20 shadow-lg' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <div 
            className={`w-3 h-3 rounded-full ${
              index === 0 || (phase.phases && phase.phases[0] && 'completed' in phase.phases[0] && phase.phases[0].completed)
                ? 'bg-green-400' 
                : activePhase === index 
                  ? 'bg-softOrange' 
                  : 'bg-white/30'
            }`} 
          />
          <span 
            className={`text-sm font-medium ${
              activePhase === index ? 'text-white' : 'text-white/70'
            }`}
          >
            {phase.title}
          </span>
          {(index === 0 || (phase.phases && phase.phases[0] && 'completed' in phase.phases[0] && phase.phases[0].completed)) && 
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          }
        </div>
      ))}
    </div>
  );
};
