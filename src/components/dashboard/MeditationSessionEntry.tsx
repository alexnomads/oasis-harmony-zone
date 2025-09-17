import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Lock, Edit3 } from "lucide-react";
import type { MeditationSession } from "@/types/database";
import type { SessionReflection } from "@/types/reflection";
import { SessionReflectionModal } from "@/components/meditation/SessionReflectionModal";
import { ReflectionService } from "@/lib/services/reflectionService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface MeditationSessionEntryProps {
  session: MeditationSession;
  index: number;
}

export const MeditationSessionEntry = ({ session, index }: MeditationSessionEntryProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [reflection, setReflection] = useState<SessionReflection | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load reflection data when component mounts
  useEffect(() => {
    const loadReflection = async () => {
      if (user && session.status === 'completed') {
        const reflectionData = await ReflectionService.getReflection(session.id, user.id);
        setReflection(reflectionData);
      }
    };
    
    loadReflection();
  }, [session.id, session.status, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
    const emoji = reflection?.emoji || '🧘';
    const type = session.type.replace('_', ' ');
    return `${emoji} ${type}`;
  };

  const handleEditSave = async (reflectionData: { emoji: string; notes: string; notes_public: boolean }) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const updatedReflection = await ReflectionService.createOrUpdateReflection(
        session.id, 
        user.id, 
        reflectionData
      );
      
      setReflection(updatedReflection);
      setShowEditModal(false);
      
      toast({
        title: "Session updated! ✨",
        description: "Your meditation reflection has been saved.",
      });
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
        className="p-3 sm:p-4 hover:bg-white/5 transition-colors cursor-pointer group border-l-2 border-primary/30"
        onClick={() => setShowEditModal(true)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm sm:text-base text-card-foreground">
                {getMeditationTypeDisplay()}
              </span>
              <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(session.duration)}</span>
              </div>
              <span className="text-xs">{formatDate(session.created_at)}</span>
            </div>

            {reflection?.notes && (
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1">
                  {reflection.notes_public ? (
                    <Users className="w-3 h-3 text-green-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {reflection.notes_public ? 'Public reflection' : 'Private reflection'}
                  </span>
                </div>
                <p className="text-sm text-card-foreground bg-muted/50 p-2 rounded text-left">
                  {reflection.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 sm:text-right">
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
          emoji: reflection?.emoji || '🧘',
          notes: reflection?.notes || '',
          notes_public: reflection?.notes_public || false
        }}
      />
    </>
  );
};