
import { useState } from "react";
import { UserProfile } from "../profile/UserProfile";
import { User } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { MessageType } from "./ChatMessage";
import { MeditationBubble } from "./MeditationBubble";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { MeditationHeader } from "./MeditationHeader";
import { MeditationSettings, SoundOption } from "./MeditationSettings";
import { useMeditationState } from "@/hooks/useMeditationState";
import { ChatInterface } from "./ChatInterface";

export const MeditationContainer = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    { 
      role: "agent", 
      content: "Hello! I'm Rose of Jericho, your AI Wellness Agent. Select your meditation duration and sound preference above. When you're ready, click the button below to begin.", 
      timestamp: new Date(),
      showMeditationStart: true 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [soundOption, setSoundOption] = useState<SoundOption>("silent");
  const { toast } = useToast();
  
  const { 
    timeRemaining,
    selectedDuration,
    setSelectedDuration,
    isTimerRunning,
    focusLost,
    windowBlurs,
    hasMovement,
    toggleTimer,
    resetTimer,
    startMeditation
  } = useMeditationState({ toast });

  const handleSubmit = (e: React.FormEvent, inputValue: string) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: MessageType = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      showMeditationStart: false
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    // Import this dynamically to reduce initial load time
    import("./AIResponseHandler").then(({ default: getAIResponse }) => {
      setTimeout(() => {
        const aiResponse: MessageType = {
          role: "agent",
          content: getAIResponse(inputValue),
          timestamp: new Date(),
          showMeditationStart: inputValue.toLowerCase().includes("meditate") || inputValue.toLowerCase().includes("meditation")
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    });
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#9C27B0] to-[#FF8A00] py-8 sm:py-12 relative">
      <MeditationBubble 
        isTimerRunning={isTimerRunning} 
        timeRemaining={timeRemaining} 
      />

      <div className="container mx-auto px-3 sm:px-4">
        <div className="relative">
          <div className="max-w-3xl mx-auto bg-black/20 rounded-xl backdrop-blur-sm p-4 sm:p-6 border border-white/20 h-[550px] sm:h-[600px] flex flex-col">
            <MeditationHeader 
              timeRemaining={timeRemaining}
              isTimerRunning={isTimerRunning}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
            />

            <div className="mb-3 sm:mb-4">
              <MeditationSettings
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                soundOption={soundOption}
                setSoundOption={setSoundOption}
              />
            </div>

            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              isTimerRunning={isTimerRunning}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              startMeditation={() => startMeditation(selectedDuration, soundOption)}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
