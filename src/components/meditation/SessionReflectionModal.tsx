import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SessionReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { emoji: string; notes: string; notes_public: boolean }) => void;
  pointsEarned: number;
}

const MEDITATION_EMOJIS = [
  '🧘', '🌸', '🕉️', '☮️', '🌿', '🌺', '💆', '🙏',
  '✨', '🌟', '💫', '🌙', '🔮', '🧘‍♀️', '🧘‍♂️', '🌻'
];

export const SessionReflectionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  pointsEarned 
}: SessionReflectionModalProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState('🧘');
  const [notes, setNotes] = useState('');
  const [notesPublic, setNotesPublic] = useState(false);

  const handleSave = () => {
    onSave({
      emoji: selectedEmoji,
      notes: notes.trim(),
      notes_public: notesPublic
    });
    onClose();
  };

  const handleSkip = () => {
    onSave({
      emoji: '🧘',
      notes: '',
      notes_public: false
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Meditation Complete! 🎉
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            You earned {pointsEarned.toFixed(1)} points!
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Emoji Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              How was your session?
            </Label>
            <div className="grid grid-cols-8 gap-2">
              {MEDITATION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-8 h-8 text-lg rounded-md border-2 transition-colors ${
                    selectedEmoji === emoji
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Reflection (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="How did you feel during this session? What did you notice?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={280}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {notes.length}/280 characters
            </p>
          </div>

          {/* Privacy Toggle */}
          {notes.trim() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center space-x-2"
            >
              <Switch
                id="public-notes"
                checked={notesPublic}
                onCheckedChange={setNotesPublic}
              />
              <Label htmlFor="public-notes" className="text-sm">
                Share this reflection publicly (inspire others)
              </Label>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};