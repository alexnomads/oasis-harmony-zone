import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChatInterface } from "./ChatInterface";
import { MessageType } from "./ChatMessage";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/components/analytics/GoogleAnalytics";
import { MeditationAgentService, MeditationRecommendation } from "@/lib/services/meditationAgentService";
import { SessionService } from "@/lib/services/sessionService";
import { toast } from "@/components/ui/use-toast";
import { MeditationTimer } from "./MeditationTimer";
import { Button } from "../ui/button";
import { TimerControls } from "./TimerControls";
import { DurationSelector } from "./DurationSelector";

export const MeditationAgentChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageType[]>([
    { 
      role: "agent", 
      content: "Hi there! I'm Rose of Jericho, your AI Wellness Agent. How are you feeling today?", 
      timestamp: new Date(),
      showMeditationStart: false
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(300); // 5 minutes in seconds
  const [currentSession, setCurrentSession] = useState<{
    sessionId: string;
    recommendation: MeditationRecommendation;
  } | null>(null);
  const [focusLost, setFocusLost] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [hasMovement, setHasMovement] = useState(false);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState<Date | null>(null);
  
  const sessionStartTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTimerRunning) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocusLost(prev => prev + 1);
        setWindowBlurs(prev => prev + 1);
        if (!warningShownRef.current) {
          toast({
            title: "Focus Lost",
            description: "Please stay on this tab during meditation to earn points.",
            variant: "destructive"
          });
          warningShownRef.current = true;
        }
      }
    };

    const handleActivity = (event: MouseEvent | KeyboardEvent) => {
      const now = new Date();
      if (lastActivityTimestamp) {
        const timeDiff = now.getTime() - lastActivityTimestamp.getTime();
        if (timeDiff < 500 && (
          event instanceof MouseEvent && 
          (Math.abs(event.movementX) > 10 || Math.abs(event.movementY) > 10)
        )) {
          setHasMovement(true);
          if (!warningShownRef.current) {
            toast({
              title: "Movement Detected",
              description: "Try to remain still during meditation to earn points.",
              variant: "destructive"
            });
            warningShownRef.current = true;
          }
        }
      }
      setLastActivityTimestamp(now);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [isTimerRunning, lastActivityTimestamp, toast]);

  useEffect(() => {
    if (!isTimerRunning) {
      warningShownRef.current = false;
    }
  }, [isTimerRunning]);

  const handleSubmit = async (e: React.FormEvent, userMessage: string) => {
    e.preventDefault();
    if (!userMessage.trim() || isTyping) return;
    
    const newUserMessage: MessageType = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      showMeditationStart: false
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);
    
    try {
      trackEvent('meditation', 'user_message_sent');
      
      const sentiment = MeditationAgentService.analyzeSentiment(userMessage);
      console.log('Detected sentiment:', sentiment);
      
      const recommendation = MeditationAgentService.getRecommendation(sentiment);
      
      let responseContent = '';
      
      if (sentiment.mainEmotion === 'neutral') {
        responseContent = "I understand. Based on what you've told me, I think a general mindfulness meditation might help you center yourself.";
      } else if (sentiment.mainEmotion === 'happy') {
        responseContent = `That's wonderful! A ${recommendation.title.toLowerCase()} could help you amplify those positive feelings.`;
      } else {
        const intensityWord = sentiment.intensity > 7 ? 'really ' : '';
        responseContent = `I understand you're feeling ${intensityWord}${sentiment.mainEmotion}. ` + 
          `I'd recommend a ${Math.floor(recommendation.duration / 60)}-minute meditation focused on ` +
          `${recommendation.type.replace('_', ' ')}.`;
      }
      
      setTimeout(() => {
        const aiResponse: MessageType = {
          role: "agent",
          content: responseContent,
          timestamp: new Date(),
          showMeditationStart: true,
          recommendation
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
        
        trackEvent('meditation', 'recommendation_given', recommendation.type, recommendation.duration);
      }, 1500);
      
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
      
      const fallbackResponse: MessageType = {
        role: "agent",
        content: "I'm having trouble processing that right now. Would you like to try a simple mindfulness meditation?",
        timestamp: new Date(),
        showMeditationStart: true
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    }
  };

  const startMeditation = async (recommendation?: MeditationRecommendation) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start a meditation session and earn points.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsTimerRunning(true);
      
      const meditationType = recommendation?.type || 'mindfulness';
      
      const session = await SessionService.startSession(user.id, meditationType);
      
      setCurrentSession({
        sessionId: session.id,
        recommendation: recommendation || {
          type: 'mindfulness',
          duration: selectedDuration,
          title: 'Mindfulness Meditation',
          description: 'Focus on your breath and the present moment.'
        }
      });
      
      setFocusLost(0);
      setWindowBlurs(0);
      setHasMovement(false);
      warningShownRef.current = false;
      
      sessionStartTimeRef.current = new Date();
      
      trackEvent('meditation', 'session_started', meditationType);
      
      const startMessage: MessageType = {
        role: "agent",
        content: `Your ${meditationType.replace('_', ' ')} meditation is starting. Find a comfortable position and when you're ready, focus on your breath.`,
        timestamp: new Date(),
        showMeditationStart: false
      };
      
      setMessages(prev => [...prev, startMessage]);
      
    } catch (error) {
      console.error('Error starting meditation session:', error);
      setIsTimerRunning(false);
      
      toast({
        title: "Failed to start session",
        description: "There was an error starting your meditation session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const quickStartMeditation = async () => {
    startMeditation({
      type: 'mindfulness',
      duration: selectedDuration,
      title: 'Quick Mindfulness Meditation',
      description: 'A quick session to center yourself and clear your mind.'
    });
  };

  const handleMeditationComplete = async (duration: number) => {
    if (!user || !currentSession) return;
    
    try {
      const focusQuality = calculateFocusQuality();
      
      const { session, userPoints } = await SessionService.completeSession(
        currentSession.sessionId,
        duration
      );
      
      setIsTimerRunning(false);
      setCurrentSession(null);
      
      trackEvent('meditation', 'session_completed', session.type, duration);
      
      const followUpMessage = await MeditationAgentService.getFollowUpMessage(user.id);
      
      let completionContent = `Great job! You've completed a ${Math.floor(duration / 60)}-minute ${session.type.replace('_', ' ')} meditation and earned ${session.points_earned} points!`;
      
      if (focusQuality < 0.7) {
        completionContent += " It seems you may have been distracted during your session. Try to remain still and focused next time for maximum benefit and points.";
      } else {
        completionContent += ` ${followUpMessage}`;
      }
      
      const completionMessage: MessageType = {
        role: "agent",
        content: completionContent,
        timestamp: new Date(),
        showMeditationStart: false
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      toast({
        title: "Meditation Complete",
        description: `You earned ${session.points_earned} points! Current streak: ${userPoints.meditation_streak} days`,
      });
      
    } catch (error) {
      console.error('Error completing meditation session:', error);
      
      setIsTimerRunning(false);
      setCurrentSession(null);
      
      toast({
        title: "Session Completion Error",
        description: "There was an error saving your session. Your progress might not be recorded.",
        variant: "destructive"
      });
    }
  };

  const calculateFocusQuality = () => {
    const distractionPenalty = windowBlurs * 0.1 + (hasMovement ? 0.3 : 0);
    return Math.max(0, 1 - distractionPenalty);
  };

  return (
    <div className="flex flex-col space-y-6">
      {isTimerRunning && currentSession ? (
        <div className="mb-8">
          <MeditationTimer
            initialType={currentSession.recommendation.type}
            initialDuration={currentSession.recommendation.duration}
            onComplete={handleMeditationComplete}
            sessionId={currentSession.sessionId}
          />
        </div>
      ) : (
        <div className="mb-6">
          <Card className="bg-black/20 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-white">Quick Start Meditation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <h3 className="text-white/80 text-sm mb-2 text-center">Choose Duration</h3>
                <DurationSelector
                  selectedDuration={selectedDuration}
                  setSelectedDuration={setSelectedDuration}
                  isRunning={isTimerRunning}
                />
              </div>
              <Button 
                onClick={quickStartMeditation}
                className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
              >
                Start Quick Meditation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card className="w-full bg-black/20 backdrop-blur-sm border border-white/20 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
        <CardHeader className="border-b border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src="/lovable-uploads/28340a82-c555-4abe-abb5-5ceecab27f08.png"
                alt="Rose of Jericho"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Rose of Jericho</CardTitle>
              <p className="text-white/70 text-sm">AI Wellness Agent</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-[400px] flex flex-col" ref={chatContainerRef}>
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            isTimerRunning={isTimerRunning}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            startMeditation={startMeditation}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};
