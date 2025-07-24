import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Lock, Edit3 } from "lucide-react";
import type { MeditationSession } from "@/types/database";
import { SessionReflectionModal } from "@/components/meditation/SessionReflectionModal";
import { SessionService } from "@/lib/services/sessionService";
import { useToast } from "@/hooks/use-toast";

interface MeditationSessionEntryProps {
  session: MeditationSession;
  index: number;
}

export const MeditationSessionEntry = ({ session, index }: MeditationSessionEntryProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

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

  const handleEditSave = async (reflectionData: { emoji: string; notes: string; notes_public: boolean }) => {
    try {
      await SessionService.completeSession(
        session.id,
        session.duration,
        { mouseMovements: 0, focusLost: 0, windowBlurs: 0 },
        reflectionData
      );
      
      toast({
        title: "Session updated! ✨",
        description: "Your meditation reflection has been saved.",
      });
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error updating session",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="p-4 sm:p-5 hover:bg-white/5 transition-colors cursor-pointer group"
        onClick={() => setShowEditModal(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm sm:text-base text-card-foreground">
                {getMeditationTypeDisplay()}
              </span>
              <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
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

          <div className="text-right ml-4">
            <p className="text-xs sm:text-sm text-vibrantOrange font-medium">
              +{session.points_earned.toFixed(1)} pts
            </p>
          </div>
        </div>
      </motion.div>

      <SessionReflectionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
        pointsEarned={session.points_earned}
        initialData={{
          emoji: session.emoji || '🧘',
          notes: session.notes || '',
          notes_public: session.notes_public || false
        }}
      />
    </>
  );
};