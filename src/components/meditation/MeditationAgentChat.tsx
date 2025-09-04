import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChatInterface } from "./ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MeditationTimer } from "./MeditationTimer";
import { CompletedSession } from "./CompletedSession";
import { MessageType } from "./ChatMessage";
import { MeditationRecommendation, MeditationAgentService } from "@/lib/services/meditationAgentService";
import { MeditationService } from "@/lib/meditationService";
import { useMeditationSession } from "@/hooks/useMeditationSession";
import { ImmersiveMeditationOverlay } from "./ImmersiveMeditationOverlay";
import { usePet } from "@/hooks/usePet";

export const MeditationAgentChat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { pet, isLoading: petLoading, getCurrentMood, getPetEmotion } = usePet(user?.id);
  const [showImmersiveOverlay, setShowImmersiveOverlay] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
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
    timeRemaining,
    totalDuration,
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
    setNeedsApiKey(false);

    try {
      const aiResponse = await MeditationAgentService.getResponse(message, messages);
      
      // Check if API key setup is needed
      if (aiResponse.needsApiKey) {
        setNeedsApiKey(true);
        setIsTyping(false);
        return;
      }

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
      }, 1500);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Check if it's an API key issue
      if (error.message?.includes('API key') || error.message?.includes('configuration')) {
        setNeedsApiKey(true);
        setIsTyping(false);
        return;
      }
      
      // Graceful fallback with encouraging message
      const fallbackMessage: MessageType = {
        role: "agent",
        content: "I'm experiencing a brief technical moment, but I'm still here to support you. How are you feeling right now? Would you like to try a meditation session?",
        timestamp: new Date(),
        showMeditationStart: true,
      };
      
      setTimeout(() => {
        setMessages((prev) => [...prev, fallbackMessage]);
        setIsTyping(false);
      }, 1000);
      
      toast({
        title: "Connection Issue",
        description: "AI temporarily unavailable, but fallback support is active.",
        variant: "default",
      });
    }
  };

  const handleApiKeySet = () => {
    setNeedsApiKey(false);
    toast({
      title: "Setup Complete",
      description: "Try sending a message to test the AI Coach!",
      variant: "default",
    });
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
    setShowImmersiveOverlay(true);
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

  const handleOverlayExit = () => {
    setShowImmersiveOverlay(false);
    resetTimer();
  };

  const petEmotion = getPetEmotion();

  return (
    <>
      <ImmersiveMeditationOverlay
        isActive={showImmersiveOverlay}
        timeRemaining={timeRemaining}
        totalDuration={totalDuration}
        isTimerRunning={isRunning}
        pet={pet}
        petEmotion={petEmotion}
        onExit={handleOverlayExit}
      />
      
      <Card className="w-full bg-black/20 backdrop-blur-sm border border-white/20 mobile-chat-container flex flex-col max-h-[70vh] lg:max-h-[calc(100vh-20rem)]">
        <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
        <CardHeader className="border-b border-white/20 pb-4 flex-shrink-0">
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
              <p className="text-sm text-white/70">
                {needsApiKey ? "Setup Required" : "Personalized guidance for your practice"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 flex-1 overflow-hidden flex flex-col min-h-0">
          {needsApiKey ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">
                <div className="text-center text-white/80 mb-4">
                  <p>The AI Coach needs to be configured with your API key to provide personalized responses.</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-white">Quick Setup Steps:</h4>
                    <ol className="text-sm text-white/80 space-y-2 list-decimal list-inside">
                      <li>Get a free API key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-vibrantOrange hover:underline">Hugging Face</a></li>
                      <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-vibrantOrange hover:underline">Supabase Dashboard</a></li>
                      <li>Go to Project Settings → Edge Functions → Secrets</li>
                      <li>Add secret: <code className="bg-black/20 px-1 rounded text-xs">HUGGING_FACE_API_KEY</code></li>
                      <li>Refresh and test the AI Coach</li>
                    </ol>
                    <button
                      onClick={handleApiKeySet}
                      className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity mt-3"
                    >
                      I've Set Up My API Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isRunning ? (
            <div className="hidden">
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
            </div>
          ) : sessionCompleted ? (
            <CompletedSession
              pointsEarned={pointsEarned}
              totalPoints={totalPoints}
              resetTimer={resetTimer}
              sessionId={sessionId}
            />
          ) : (
            <div ref={chatContainerRef} className="flex flex-col flex-1 min-h-0">
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
    </>
  );
};
