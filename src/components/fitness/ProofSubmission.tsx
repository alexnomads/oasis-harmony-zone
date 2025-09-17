import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Send, Camera, MessageSquare, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { FitnessService } from "@/lib/services/fitnessService";
import type { FitnessSession } from "@/types/database";

interface ProofSubmissionProps {
  workoutType: 'abs' | 'pushups' | 'biceps';
  sessionData: {
    reps_completed: number;
    duration: number;
  };
  onBack: () => void;
  onSkip: () => void;
}

export const ProofSubmission = ({ workoutType, sessionData, onBack, onSkip }: ProofSubmissionProps) => {
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fitnessSession, setFitnessSession] = useState<FitnessSession | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Create fitness session when component mounts
  useEffect(() => {
    const createSession = async () => {
      if (!user) return;
      
      try {
        const session = await FitnessService.startSession(
          user.id,
          workoutType,
          sessionData.reps_completed,
          sessionData.duration
        );
        setFitnessSession(session);
        console.log('Fitness session created:', session);
      } catch (error) {
        console.error('Error creating fitness session:', error);
        toast({
          title: "Session Error",
          description: "Could not create fitness session. Please try again.",
          variant: "destructive"
        });
      }
    };

    createSession();
  }, [user, workoutType, sessionData, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const generateTweetText = () => {
    const workoutEmoji = workoutType === 'abs' ? '🏋️‍♂️' : workoutType === 'biceps' ? '💪' : '💪';
    const workoutName = workoutType === 'abs' ? 'ABS' : workoutType === 'biceps' ? 'BICEPS' : 'PUSH UPS';
    
    return encodeURIComponent(
      `Just crushed a ${workoutName} workout! ${workoutEmoji}\n` +
      `✅ ${sessionData.reps_completed} reps\n` +
      `⏱️ ${formatTime(sessionData.duration)}\n` +
      `Earning my ROJ points! 🚀\n\n` +
      `@ROJoasis #FitnessChallenge #ROJFitness`
    );
  };

  const handleTwitterPost = () => {
    const tweetText = generateTweetText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, '_blank');
    
    toast({
      title: "Twitter opened! 🐦",
      description: "Post your workout and paste the link below to earn points!",
    });
  };

  const handleSubmitProof = async () => {
    if (!proofUrl.trim()) {
      toast({
        title: "Missing proof link",
        description: "Please provide your Twitter post URL or DM confirmation.",
        variant: "destructive"
      });
      return;
    }

    if (!fitnessSession) {
      toast({
        title: "Session not found",
        description: "Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await FitnessService.submitProof(fitnessSession.id, proofUrl);
      
      toast({
        title: "Proof submitted! 🎉",
        description: `Your ${workoutType} workout proof is being reviewed. Points will be awarded once verified!`,
      });
      
      onBack();
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-accent hover:text-accent/80"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-3xl font-bold glitch-text" data-text="🏆 SUBMIT PROOF">
          🏆 SUBMIT PROOF
        </h2>
      </div>

      {/* Workout Summary */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-500/30">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">
              {workoutType === 'abs' ? '🏋️‍♂️' : workoutType === 'biceps' ? '💪' : '💪'}
            </div>
            <h3 className="text-2xl font-bold text-green-400">
              {workoutType.toUpperCase()} WORKOUT COMPLETED!
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">
                  {sessionData.reps_completed}
                </div>
                <div className="text-sm text-muted-foreground">Reps</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {formatTime(sessionData.duration)}
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proof Submission Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Twitter Option */}
        <Card className="bg-black/20 backdrop-blur-sm border border-blue-500/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-400">Post on X (Twitter)</h4>
                  <p className="text-sm text-muted-foreground">Share your achievement publicly</p>
                </div>
              </div>
              
              <Button 
                onClick={handleTwitterPost}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Post to Twitter
              </Button>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-400">
                  Paste your tweet URL here:
                </label>
                <Input
                  placeholder="https://twitter.com/yourusername/status/..."
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="bg-black/30 border-blue-500/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DM Option */}
        <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400">Send DM</h4>
                  <p className="text-sm text-muted-foreground">Private video proof</p>
                </div>
              </div>
              
              <Button 
                onClick={() => window.open('https://twitter.com/ROJoasis', '_blank')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                DM @ROJoasis
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Send a video of your workout completion with this session ID: 
                <span className="text-purple-400 font-mono block mt-1">
                  {fitnessSession?.id?.slice(0, 8) || 'Loading...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Proof */}
      {proofUrl && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-accent">Submit Your Proof</h4>
                <div className="flex gap-4">
                  <Button
                    onClick={handleSubmitProof}
                    disabled={isSubmitting}
                    className="retro-button flex-1"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Proof & Earn Points"}
                  </Button>
                  <Button
                    onClick={onSkip}
                    variant="outline"
                    className="px-8"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Instructions */}
      <Card className="bg-black/10 backdrop-blur-sm border border-white/20">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-accent">Points System:</strong></p>
            <p>• Base points: 50 points per workout session</p>
            <p>• Bonus points: +10 points for every 10 reps completed</p>
            <p>• Time bonus: +5 points for workouts over 5 minutes</p>
            <p>• Verification usually takes 24-48 hours</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};