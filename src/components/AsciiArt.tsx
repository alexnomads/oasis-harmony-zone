
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserProfile } from "./profile/UserProfile";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { MessageType } from "./meditation/ChatMessage";
import { MeditationBubble } from "./meditation/MeditationBubble";
import { TimerControl } from "./meditation/Timer";
import { ChatInterface } from "./meditation/ChatInterface";
import { MeditationSettings, SoundOption } from "./meditation/MeditationSettings";
import { calculateSessionQuality, formatTime } from "./meditation/MeditationSessionManager";
import getAIResponse from "./meditation/AIResponseHandler";

export const AsciiArt = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    { 
      role: "agent", 
      content: "Hello! I'm Rose of Jericho, your AI Wellness Agent. Select your meditation duration and sound preference above. When you're ready, click the button below to begin.", 
      timestamp: new Date(),
      showMeditationStart: true 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundOption, setSoundOption] = useState<SoundOption>("silent");
  const [focusLost, setFocusLost] = useState(0);
  const [lastActiveTimestamp, setLastActiveTimestamp] = useState<Date | null>(null);
  const [hasMovement, setHasMovement] = useState(false);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [sessionId] = useState(`${Date.now()}-${Math.random()}`);
  const [lastActiveWindow, setLastActiveWindow] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    setTimeRemaining(selectedDuration * 60);
  }, [selectedDuration]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      
      // Verify session quality
      const sessionQuality = calculateSessionQuality(focusLost, windowBlurs, hasMovement);
      const rewardEarned = sessionQuality >= 0.7; // 70% quality threshold

      toast({
        title: rewardEarned ? "Meditation Complete! 🎉" : "Meditation Completed with Issues",
        description: rewardEarned 
          ? `Great job! ${selectedDuration} minutes have been added to your progress and rewards earned.`
          : "Session completed but quality threshold not met. Try to maintain better focus next time.",
        variant: rewardEarned ? "default" : "destructive"
      });

      // Show sharing dialog for successful meditations
      if (rewardEarned) {
        const referralCode = "ROJ123";
        const referralUrl = `https://roseofjericho.xyz/join?ref=${referralCode}`;
        
        const tweetText = encodeURIComponent(
          `I just finished a meditation on @ROJOasis and I feel better.\n\nGet rewards when you take care of yourself! ${referralUrl}`
        );
        
        // Ask user if they want to share
        if (window.confirm("Would you like to share your achievement on X (Twitter) and earn referral rewards?")) {
          // Use direct URL instead of popup
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
          
          // Award extra points for sharing
          toast({
            title: "Bonus Points & Referral Link Shared! 🌟",
            description: "Thank you for sharing! You've earned bonus points and will receive additional rewards when people join using your referral link!",
          });
        }
      }

      const newMessage: MessageType = {
        role: "agent",
        content: rewardEarned 
          ? "Wonderful! You've completed your meditation session successfully. Share your achievement to earn referral rewards when others join!"
          : "Session complete, but I noticed some distractions. Would you like tips for maintaining better focus next time?",
        timestamp: new Date(),
        showMeditationStart: false
      };
      setMessages(prev => [...prev, newMessage]);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining, toast, selectedDuration]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isTimerRunning) {
        if (document.hidden) {
          setFocusLost(prev => prev + 1);
          toast({
            title: "Focus Lost",
            description: "Please stay on this tab during meditation.",
            variant: "destructive"
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isTimerRunning, toast]);

  // Update the movement detection logic to only trigger on significant movement
  useEffect(() => {
    if (!isTimerRunning) return;

    const handleActivity = (event: MouseEvent | KeyboardEvent) => {
      if (isTimerRunning) {
        const now = new Date();
        if (lastActiveTimestamp) {
          const timeDiff = now.getTime() - lastActiveTimestamp.getTime();
          // Only detect excessive movement (more frequent than every 500ms)
          // This prevents false positives from subtle screen movements
          if (timeDiff < 500 && (
            // Consider mouse movement significant only if it's deliberate
            event instanceof MouseEvent && 
            (Math.abs(event.movementX) > 10 || Math.abs(event.movementY) > 10)
          )) {
            setHasMovement(true);
            toast({
              title: "Movement Detected",
              description: "Try to remain still during meditation.",
              variant: "destructive"
            });
          }
        }
        setLastActiveTimestamp(now);
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [isTimerRunning, lastActiveTimestamp, toast]);

  useEffect(() => {
    if (!isTimerRunning) return;

    // Track window blur events (user switching to other windows)
    const handleWindowBlur = () => {
      if (isTimerRunning) {
        setWindowBlurs(prev => prev + 1);
        toast({
          title: "Window Switch Detected",
          description: "Please keep this window focused during meditation.",
          variant: "destructive"
        });
      }
    };

    // Track window focus to detect potential multi-window/browser usage
    const handleWindowFocus = () => {
      if (isTimerRunning) {
        const now = new Date();
        const timeSinceLastActive = now.getTime() - lastActiveWindow.getTime();
        
        // If time since last active is suspiciously short (indicating multiple windows)
        if (timeSinceLastActive < 1000) {
          toast({
            title: "Multiple Windows Detected",
            description: "Please use only one window during meditation.",
            variant: "destructive"
          });
        }
        setLastActiveWindow(now);
      }
    };

    // Store session in localStorage to detect multiple browsers
    const checkMultipleBrowsers = () => {
      const currentSession = {
        id: sessionId,
        timestamp: Date.now(),
      };

      // Store current session
      localStorage.setItem('meditationSession', JSON.stringify(currentSession));

      // Check for other sessions
      const broadcastChannel = new BroadcastChannel('meditation_channel');
      broadcastChannel.postMessage({ type: 'SESSION_CHECK', sessionId });

      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'SESSION_CHECK' && event.data.sessionId !== sessionId) {
          toast({
            title: "Multiple Browsers Detected",
            description: "Please use only one browser window for meditation.",
            variant: "destructive"
          });
          setIsTimerRunning(false); // Stop the session
        }
      };

      return () => broadcastChannel.close();
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    const cleanup = checkMultipleBrowsers();

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      cleanup();
    };
  }, [isTimerRunning, sessionId, lastActiveWindow, toast]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(selectedDuration * 60);
  };

  const startMeditation = () => {
    // Clear any existing sessions
    localStorage.removeItem('meditationSession');
    
    setIsTimerRunning(true);
    setWindowBlurs(0);
    setFocusLost(0);
    setHasMovement(false);
    
    const newMessage: MessageType = {
      role: "agent",
      content: `Starting ${selectedDuration}-minute meditation with ${soundOption === "silent" ? "no" : soundOption} sounds. Find a comfortable position and close your eyes. I'll be here when you're done.`,
      timestamp: new Date(),
      showMeditationStart: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

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
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#9C27B0] to-[#FF8A00] py-12 relative">
      {/* Energy Bubble Component */}
      <MeditationBubble 
        isTimerRunning={isTimerRunning} 
        timeRemaining={timeRemaining} 
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 items-stretch">
          <div className="col-span-1 h-[600px]">
            <div className="h-full bg-black/20 rounded-xl backdrop-blur-sm p-6 border border-white/20">
              <div className="h-full overflow-y-auto">
                <UserProfile />
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-black/20 rounded-xl backdrop-blur-sm p-6 border border-white/20 h-[600px] flex flex-col">
            <div className="flex flex-col gap-4 border-b border-white/20 pb-4 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src="/lovable-uploads/28340a82-c555-4abe-abb5-5ceecab27f08.png"
                      alt="Rose of Jericho"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Rose of Jericho (alpha version v0.01)</h3>
                    <span className="text-white/70 text-sm">AI Wellness Agent</span>
                  </div>
                </div>
                <TimerControl
                  timeRemaining={timeRemaining}
                  isTimerRunning={isTimerRunning}
                  toggleTimer={toggleTimer}
                  resetTimer={resetTimer}
                  formatTime={formatTime}
                />
              </div>

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
              startMeditation={startMeditation}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
