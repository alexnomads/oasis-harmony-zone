import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChatInterface } from "./ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { MeditationTimer } from "./MeditationTimer";
import { CompletedSession } from "./CompletedSession";
import { MessageType } from "./ChatMessage";
import { MeditationRecommendation, MeditationAgentService } from "@/lib/services/meditationAgentService";
import { MeditationService } from "@/lib/meditationService";
import { useMeditationSession } from "@/hooks/useMeditationSession";

export const MeditationAgentChat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: "agent",
      content: "Hello! I'm Rose of Jericho, your AI Meditation Coach. How are you feeling today?",
      timestamp: new Date(),
      showMeditationStart: false,
    },
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [recommendation, setRecommendation] = useState<MeditationRecommendation | null>(null);

  const {
    isRunning,
    time,
    sessionId,
    selectedDuration,
    setSelectedDuration,
    sessionCompleted,
    pointsEarned,
    totalPoints,
    isLoading,
    toggleTimer,
    resetTimer,
  } = useMeditationSession(user?.id);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent, message: string) => {
    e.preventDefault();
    if (isTyping || isRunning) return;

    const newMessage: MessageType = {
      role: "user",
      content: message,
      timestamp: new Date(),
      showMeditationStart: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    try {
      const aiResponse = await MeditationAgentService.getResponse(message, messages);
      const newAgentMessage: MessageType = {
        role: "agent",
        content: aiResponse.message,
        timestamp: new Date(),
        showMeditationStart: aiResponse.showMeditationOption,
      };

      if (aiResponse.recommendation) {
        setRecommendation(aiResponse.recommendation);
        newAgentMessage.recommendation = aiResponse.recommendation;
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, newAgentMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startMeditation = (customRecommendation?: MeditationRecommendation) => {
    if (isRunning) return;

    const rec = customRecommendation || recommendation;
    if (rec) {
      setSelectedDuration(rec.duration);
    }

    const displayDuration = selectedDuration === 30 ? 
      "30-second" : 
      `${Math.floor(selectedDuration / 60)}-minute`;

    const newMessage: MessageType = {
      role: "agent",
      content: `Starting your ${displayDuration} meditation session. Find a comfortable position, close your eyes, and focus on your breath. I'll be here when you're done.`,
      timestamp: new Date(),
      showMeditationStart: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    toggleTimer();
  };

  useEffect(() => {
    if (sessionCompleted && pointsEarned > 0) {
      const newMessage: MessageType = {
        role: "agent",
        content: `Well done! You've earned ${pointsEarned.toFixed(2)} points for your meditation session. Your total is now ${totalPoints.toFixed(2)} points. How do you feel?`,
        timestamp: new Date(),
        showMeditationStart: false,
      };
      
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [sessionCompleted, pointsEarned, totalPoints]);

  return (
    <Card className="w-full bg-black/20 backdrop-blur-sm border border-white/20 h-[600px] flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
      <CardHeader className="border-b border-white/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="/lovable-uploads/2666064f-8909-4cd1-844b-4cfbed2e83f6.png"
              alt="Rose of Jericho"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">AI Meditation Coach</h3>
            <p className="text-sm text-white/70">Personalized guidance for your practice</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 overflow-hidden flex flex-col h-full max-h-[calc(600px-140px)]">
        {isRunning ? (
          <MeditationTimer
            initialDuration={selectedDuration}
            initialType="mindfulness"
            onComplete={(duration, distractions) => {
              if (!sessionId) return;
              MeditationService.completeSession(
                sessionId, 
                duration,
                distractions
              );
              resetTimer();
            }}
            sessionId={sessionId || ""}
          />
        ) : sessionCompleted ? (
          <CompletedSession
            pointsEarned={pointsEarned}
            totalPoints={totalPoints}
            resetTimer={resetTimer}
            sessionId={sessionId}
          />
        ) : (
          <div ref={chatContainerRef} className="flex flex-col h-full overflow-hidden">
            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              isTimerRunning={isRunning}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              startMeditation={startMeditation}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
