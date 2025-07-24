import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Lock } from "lucide-react";
import type { MeditationSession } from "@/types/database";

interface MeditationSessionEntryProps {
  session: MeditationSession;
  index: number;
}

export const MeditationSessionEntry = ({ session, index }: MeditationSessionEntryProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
  };

  const getMeditationTypeDisplay = () => {
    const emoji = session.emoji || '🧘';
    const type = session.type.replace('_', ' ');
    return `${emoji} ${type}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start justify-between p-4 rounded-lg border bg-card"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-card-foreground">
            {getMeditationTypeDisplay()}
          </span>
          <Badge variant="secondary" className="text-xs">
            {session.points_earned.toFixed(1)} pts
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(session.duration)}
          </div>
          <span>{formatDate(session.created_at)}</span>
        </div>

        {session.notes && (
          <div className="mt-2">
            <div className="flex items-center gap-1 mb-1">
              {session.notes_public ? (
                <Users className="w-3 h-3 text-green-500" />
              ) : (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {session.notes_public ? 'Public reflection' : 'Private reflection'}
              </span>
            </div>
            <p className="text-sm text-card-foreground bg-muted/50 p-2 rounded text-left">
              {session.notes}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};