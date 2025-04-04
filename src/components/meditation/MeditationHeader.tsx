
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { User } from "lucide-react";
import { TimerControl } from "./TimerControl";
import { UserProfile } from "../profile/UserProfile";
import { formatTime } from "./MeditationSessionManager";

interface MeditationHeaderProps {
  timeRemaining: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export const MeditationHeader = ({ 
  timeRemaining,
  isTimerRunning,
  toggleTimer,
  resetTimer
}: MeditationHeaderProps) => {
  return (
    <div className="flex justify-between items-center gap-2 sm:gap-3 border-b border-white/20 pb-3 sm:pb-4 mb-3 sm:mb-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src="/lovable-uploads/28340a82-c555-4abe-abb5-5ceecab27f08.png"
            alt="Rose of Jericho"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm sm:text-base truncate">Rose of Jericho (alpha version v0.01)</h3>
          <span className="text-white/70 text-xs sm:text-sm">AI Wellness Agent</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <TimerControl
          timeRemaining={timeRemaining}
          isTimerRunning={isTimerRunning}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          formatTime={formatTime}
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="border-white/20 text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
            >
              <User className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 backdrop-blur-lg border-white/20 text-white max-w-sm sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <UserProfile />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
