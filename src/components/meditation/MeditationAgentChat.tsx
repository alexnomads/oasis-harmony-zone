
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChatInterface } from "./ChatInterface";
import { MessageType } from "./ChatMessage";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/components/analytics/GoogleAnalytics";
import { MeditationAgentService, MeditationRecommendation } from "@/lib/services/meditationAgentService";
import { SessionService } from "@/lib/services/sessionService";
import { useToast } from "@/components/ui/use-toast";
import { MeditationTimer } from "./MeditationTimer";
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
  const [currentSession, setCurrentSession] = useState<{
    sessionId: string;
    recommendation: MeditationRecommendation;
  } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(300); // Default 5 minutes (in seconds)
  const [focusLost, setFocusLost] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [hasMovement, setHasMovement] = useState(false);
  const [lastActiveTimestamp, setLastActiveTimestamp] = useState<Date | null>(null);
  
  // Refs to store session start time and timer handle
  const sessionStartTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages are added
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus tracking for meditation sessions
  useEffect(() => {
    if (!isTimerRunning) return;

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocusLost(prev => prev + 1);
        toast({
          title: "Focus Lost",
          description: "Please stay on this tab during meditation to earn points.",
          variant: "destructive"
        });
      }
    };

    // Track mouse movement
    const handleActivity = (event: MouseEvent | KeyboardEvent) => {
      const now = new Date();
      if (lastActiveTimestamp) {
        const timeDiff = now.getTime() - lastActiveTimestamp.getTime();
        // Consider significant movements only (more than 500ms apart)
        if (timeDiff < 500 && (
          event instanceof MouseEvent && 
          (Math.abs(event.movementX) > 10 || Math.abs(event.movementY) > 10)
        )) {
          setHasMovement(true);
          toast({
            title: "Movement Detected",
            description: "Try to remain still during meditation to earn full points.",
            variant: "destructive"
          });
        }
      }
      setLastActiveTimestamp(now);
    };

    // Track window blur events (user switching to other windows)
    const handleWindowBlur = () => {
      setWindowBlurs(prev => prev + 1);
      toast({
        title: "Window Switch Detected",
        description: "Please keep this window focused during meditation to earn points.",
        variant: "destructive"
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isTimerRunning, lastActiveTimestamp, toast]);

  // Handle user message submission
  const handleSubmit = async (e: React.FormEvent, userMessage: string) => {
    e.preventDefault();
    if (!userMessage.trim() || isTyping) return;
    
    // Add user message to chat
    const newUserMessage: MessageType = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      showMeditationStart: false
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);
    
    try {
      // Track user message event for analytics
      trackEvent('meditation', 'user_message_sent');
      
      // Process the message with our NLP service
      const sentiment = MeditationAgentService.analyzeSentiment(userMessage);
      console.log('Detected sentiment:', sentiment);
      
      // Get meditation recommendation
      const recommendation = MeditationAgentService.getRecommendation(sentiment);
      
      // Use the user-selected duration for the meditation
      recommendation.duration = selectedDuration;
      
      // Generate AI response based on sentiment
      let responseContent = '';
      
      if (sentiment.mainEmotion === 'neutral') {
        responseContent = `I understand. Based on what you've told me, I think a ${Math.floor(selectedDuration / 60)}-minute mindfulness meditation might help you center yourself.`;
      } else if (sentiment.mainEmotion === 'happy') {
        responseContent = `That's wonderful! A ${Math.floor(selectedDuration / 60)}-minute ${recommendation.title.toLowerCase()} could help you amplify those positive feelings.`;
      } else {
        const intensityWord = sentiment.intensity > 7 ? 'really ' : '';
        responseContent = `I understand you're feeling ${intensityWord}${sentiment.mainEmotion}. ` + 
          `I'd recommend a ${Math.floor(selectedDuration / 60)}-minute meditation focused on ` +
          `${recommendation.type.replace('_', ' ')}.`;
      }
      
      // Add AI response to chat after a short delay
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
        
        // Track that recommendation was provided
        trackEvent('meditation', 'recommendation_given', recommendation.type, recommendation.duration);
      }, 1500);
      
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
      
      // Send a fallback message
      const fallbackResponse: MessageType = {
        role: "agent",
        content: `I'm having trouble processing that right now. Would you like to try a simple ${Math.floor(selectedDuration / 60)}-minute mindfulness meditation?`,
        timestamp: new Date(),
        showMeditationStart: true
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    }
  };

  // Start meditation based on recommendation
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
      
      // Reset focus tracking metrics
      setFocusLost(0);
      setWindowBlurs(0);
      setHasMovement(false);
      setLastActiveTimestamp(new Date());
      
      // Use provided recommendation or default to mindfulness
      const meditationType = recommendation?.type || 'mindfulness';
      
      // Create session in database
      const session = await SessionService.startSession(user.id, meditationType);
      
      // Set current session
      setCurrentSession({
        sessionId: session.id,
        recommendation: recommendation || {
          type: 'mindfulness',
          duration: selectedDuration,
          title: 'Mindfulness Meditation',
          description: 'Focus on your breath and the present moment.'
        }
      });
      
      // Record start time
      sessionStartTimeRef.current = new Date();
      
      // Track meditation start
      trackEvent('meditation', 'session_started', meditationType);
      
      // Add an agent message acknowledging the start
      const startMessage: MessageType = {
        role: "agent",
        content: `Your ${Math.floor(selectedDuration / 60)}-minute ${meditationType.replace('_', ' ')} meditation is starting. Find a comfortable position and when you're ready, focus on your breath.`,
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

  // Handle meditation completion
  const handleMeditationComplete = async (duration: number) => {
    if (!user || !currentSession) return;
    
    try {
      // Calculate session quality based on focus metrics
      const distractionCount = focusLost + windowBlurs + (hasMovement ? 1 : 0);
      const qualityFactor = Math.max(0, 1 - (distractionCount * 0.1));
      
      // Complete the session in the database
      const { session, userPoints } = await SessionService.completeSession(
        currentSession.sessionId,
        duration
      );
      
      // Reset timer state
      setIsTimerRunning(false);
      setCurrentSession(null);
      
      // Track completion
      trackEvent('meditation', 'session_completed', session.type, duration);
      
      // Get follow-up message
      const followUpMessage = await MeditationAgentService.getFollowUpMessage(user.id);
      
      // Adjust points based on quality factor
      const earnedPoints = Math.round(session.points_earned * qualityFactor);
      const qualityMessage = qualityFactor < 1 
        ? `\n\nI noticed some distractions during your meditation. You earned ${earnedPoints} out of a possible ${session.points_earned} points.` 
        : `\n\nWell done on maintaining focus! You earned the full ${earnedPoints} points.`;
      
      // Add completion message
      const completionMessage: MessageType = {
        role: "agent",
        content: `Great job! You've completed a ${Math.floor(duration / 60)}-minute ${session.type.replace('_', ' ')} meditation! ${qualityMessage} ${followUpMessage}`,
        timestamp: new Date(),
        showMeditationStart: false
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      // Show toast notification
      toast({
        title: "Meditation Complete",
        description: `You earned ${earnedPoints} points! Current streak: ${userPoints.meditation_streak} days`,
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

  return (
    <div className="flex flex-col space-y-6">
      {isTimerRunning && currentSession ? (
        <div className="mb-8">
          <MeditationTimer
            initialType={currentSession.recommendation.type}
            initialDuration={selectedDuration}
            onComplete={handleMeditationComplete}
            sessionId={currentSession.sessionId}
          />
        </div>
      ) : null}
      
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
              <p className="text-white/70 text-sm">AI Meditation Coach</p>
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
