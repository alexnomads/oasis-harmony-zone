import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserProfile } from "./profile/UserProfile";
import { UserCircle, Menu, X } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      
      const sessionQuality = calculateSessionQuality(focusLost, windowBlurs, hasMovement);
      const rewardEarned = sessionQuality >= 0.7;

      toast({
        title: rewardEarned ? "Meditation Complete! 🎉" : "Meditation Completed with Issues",
        description: rewardEarned 
          ? `Great job! ${selectedDuration} minutes have been added to your progress and rewards earned.`
          : "Session completed but quality threshold not met. Try to maintain better focus next time.",
        variant: rewardEarned ? "default" : "destructive"
      });

      if (rewardEarned) {
        const referralCode = "ROJ123";
        const referralUrl = `https://roseofjericho.xyz/join?ref=${referralCode}`;
        
        const tweetText = encodeURIComponent(
          `I just finished a meditation on @ROJOasis and I feel better.\n\nGet rewards when you take care of yourself! ${referralUrl}`
        );
        
        if (window.confirm("Would you like to share your achievement on X (Twitter) and earn referral rewards?")) {
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
          
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

  useEffect(() => {
    if (!isTimerRunning) return;

    const handleActivity = (event: MouseEvent | KeyboardEvent) => {
      if (isTimerRunning) {
        const now = new Date();
        if (lastActiveTimestamp) {
          const timeDiff = now.getTime() - lastActiveTimestamp.getTime();
          if (timeDiff < 500 && (
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

    const handleWindowFocus = () => {
      if (isTimerRunning) {
        const now = new Date();
        const timeSinceLastActive = now.getTime() - lastActiveWindow.getTime();
        
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

    const checkMultipleBrowsers = () => {
      const currentSession = {
        id: sessionId,
        timestamp: Date.now(),
      };

      localStorage.setItem('meditationSession', JSON.stringify(currentSession));

      const broadcastChannel = new BroadcastChannel('meditation_channel');
      broadcastChannel.postMessage({ type: 'SESSION_CHECK', sessionId });

      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'SESSION_CHECK' && event.data.sessionId !== sessionId) {
          toast({
            title: "Multiple Browsers Detected",
            description: "Please use only one browser window for meditation.",
            variant: "destructive"
          });
          setIsTimerRunning(false);
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
    localStorage.removeItem('meditationSession');
    
    setIsTimerRunning(true);
    setWindowBlurs(0);
    setFocusLost(0);
    setHasMovement(false);
    setSidebarOpen(false);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#9C27B0] to-[#FF8A00] py-12 min-h-[800px] relative">
      <MeditationBubble 
        isTimerRunning={isTimerRunning} 
        timeRemaining={timeRemaining} 
      />

      <div className="container mx-auto px-4 relative flex">
        <motion.div 
          className="fixed top-0 left-0 h-full bg-black/80 backdrop-blur-sm z-40 shadow-xl overflow-y-auto"
          initial={{ width: "0px", opacity: 0 }}
          animate={{ 
            width: sidebarOpen ? "350px" : "0px",
            opacity: sidebarOpen ? 1 : 0,
            x: sidebarOpen ? 0 : "-100%"
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <UserProfile />
          </div>
        </motion.div>

        <div className="w-full">
          <div className="max-w-3xl mx-auto bg-black/20 rounded-xl backdrop-blur-sm p-6 border border-white/20 h-[650px] flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-white/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleSidebar} 
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                >
                  <Menu className="w-5 h-5 text-white" />
                </button>
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

            <div className="mb-4">
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

      {sidebarOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};
