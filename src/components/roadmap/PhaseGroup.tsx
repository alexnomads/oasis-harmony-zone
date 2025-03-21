
import { Badge } from "../ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Phase, PhaseItem, SubItem } from "@/types/roadmap";
import { useIsMobile } from "@/hooks/use-mobile";

interface PhaseGroupProps {
  phase: Phase;
}

export const PhaseGroup = ({ phase }: PhaseGroupProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col md:flex-row h-full">
      {phase.phases && phase.phases.map((subPhase, subIndex) => (
        <div key={subIndex} className="md:w-1/2 p-2 h-full">
          <div className="flex items-center mb-4 gap-2">
            <h3 className="text-2xl font-bold text-softOrange">{subPhase.title}</h3>
            {subPhase.completed && (
              <Badge variant="outline" className="text-green-400 border-green-400">
                <CheckCircle2 className="mr-1 h-4 w-4" /> Completed
              </Badge>
            )}
          </div>
          
          <div className="space-y-4 overflow-auto pr-2 roadmap-content" style={{ maxHeight: isMobile ? '50vh' : '60vh' }}>
            {subPhase.items && Array.isArray(subPhase.items) && subPhase.items.map((item, itemIndex) => (
              <div key={itemIndex} className="text-base text-white/80">
                {typeof item === 'string' ? (
                  <p className="text-white">{item}</p>
                ) : (
                  <div className="mb-4">
                    <p className="font-medium text-white mb-2 border-l-2 border-softOrange pl-3">
                      {item.title}
                    </p>
                    <ul className="pl-5 space-y-2">
                      {item.subitems.map((subitem, subIndex) => (
                        <li key={subIndex} className="text-sm list-disc text-white/80">
                          {subitem}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
