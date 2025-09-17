
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { CompanionPetComponent } from "../pet/CompanionPet";
import { CompanionPet } from "@/types/pet";
import { Button } from "@/components/ui/button";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useMovementDetection } from "@/hooks/useMovementDetection";
import { Capacitor } from '@capacitor/core';

interface ImmersiveMeditationOverlayProps {
  isActive: boolean;
  timeRemaining: number;
  totalDuration: number;
  isTimerRunning: boolean;
  pet?: CompanionPet | null;
  petEmotion?: 'happy' | 'neutral' | 'sad' | 'sleepy' | 'stressed';
  onExit: () => void;
  onMovementPenalty?: (penaltyPoints: number) => void;
}

export const ImmersiveMeditationOverlay: React.FC<ImmersiveMeditationOverlayProps> = ({
  isActive,
  timeRemaining,
  totalDuration,
  isTimerRunning,
  pet,
  petEmotion = 'neutral',
  onExit,
  onMovementPenalty,
}) => {
  const [showExitButton, setShowExitButton] = useState(false);
  const [showBreathingText, setShowBreathingText] = useState(true);
  const [pointsDeducted, setPointsDeducted] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  
  const { showWarning, isCalibrating, isMoving } = useMovementDetection({
    isActive: isActive && isTimerRunning,
    sensitivity: Capacitor.isNativePlatform() ? 3 : 5, // More sensitive on mobile
    onMovementDetected: () => {
      const penalty = 0.15;
      setPointsDeducted(prev => prev + penalty);
      onMovementPenalty?.(penalty);
    }
  });

  // Handle wake lock when overlay becomes active
  useEffect(() => {
    if (isActive && isTimerRunning) {
      requestWakeLock();
      
      // For mobile apps, also prevent viewport scaling and add fullscreen meta tags
      if (Capacitor.isNativePlatform()) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        
        // Request fullscreen on mobile if available
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {
            // Fullscreen not available or denied
          });
        }
      }
    } else {
      releaseWakeLock();
      
      if (Capacitor.isNativePlatform()) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {
            // Exit fullscreen failed
          });
        }
      }
    }
    
    // Cleanup on unmount
    return () => {
      releaseWakeLock();
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isActive, isTimerRunning, requestWakeLock, releaseWakeLock]);

  // Hide breathing text after initial cycles
  useEffect(() => {
    if (isActive && isTimerRunning) {
      const timer = setTimeout(() => setShowBreathingText(false), 30000); // Hide after 30s
      return () => clearTimeout(timer);
    }
  }, [isActive, isTimerRunning]);

  // Show video for 5-minute meditation
  useEffect(() => {
    if (isActive && isTimerRunning && totalDuration === 300) {
      setShowVideo(true);
    } else {
      setShowVideo(false);
    }
  }, [isActive, isTimerRunning, totalDuration]);

  // Handle keyboard exit (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        onExit();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, onExit]);

  // Handle mobile gestures and touch
  useEffect(() => {
    if (!isActive) return;

    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;

      // Detect swipe up or corner tap to exit
      if (deltaY > 50 && Math.abs(deltaX) < 100) {
        onExit();
      }
      
      // Corner taps for exit
      const { clientHeight, clientWidth } = document.documentElement;
      if (
        (touchEndX < 50 && touchEndY < 50) || // Top-left
        (touchEndX > clientWidth - 50 && touchEndY < 50) || // Top-right
        (touchEndX < 50 && touchEndY > clientHeight - 50) || // Bottom-left
        (touchEndX > clientWidth - 50 && touchEndY > clientHeight - 50) // Bottom-right
      ) {
        onExit();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive, onExit]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress = totalDuration > 0 ? Math.round(((totalDuration - timeRemaining) / totalDuration) * 100) : 0;

  const getPetAnimationScale = () => {
    const breathingCycle = Math.sin(Date.now() / 2000) * 0.1 + 1; // Breathing rhythm
    return petEmotion === 'happy' ? breathingCycle * 1.1 : breathingCycle;
  };

  const getPetPosition = () => {
    const angle = (Date.now() / 8000) % (2 * Math.PI); // Slow orbital movement
    const radius = 180; // Distance from center
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.6, // Elliptical orbit
    };
  };

  const petPosition = getPetPosition();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden bg-black immersive-meditation-overlay immersive-meditation-active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          onMouseEnter={() => setShowExitButton(true)}
          onMouseLeave={() => setShowExitButton(false)}
        >
          {/* Cosmic Background - Subtle overlay on black */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.3) 0%, rgba(25, 25, 112, 0.2) 50%, transparent 100%)',
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          {/* Ambient Particles */}
          <div className="absolute inset-0 opacity-40">
            {[...Array(pet?.evolution_stage ? (pet.evolution_stage + 1) * 8 : 16)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full transition-colors duration-300 ${
                  isMoving ? 'bg-red-300' : 'bg-white'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: isMoving ? [1, 2, 0.5, 1.5, 1] : [1, 1.5, 1],
                  opacity: isMoving ? [0.3, 0.9, 0.1, 0.8, 0.3] : [0.3, 0.8, 0.3],
                  x: isMoving ? [0, Math.random() * 60 - 30, Math.random() * 40 - 20, 0] : [0, Math.random() * 30 - 15, 0],
                  y: isMoving ? [0, Math.random() * 60 - 30, Math.random() * 40 - 20, 0] : [0, Math.random() * 30 - 15, 0],
                }}
                transition={{
                  duration: isMoving ? 2 + Math.random() * 2 : 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: isMoving ? "easeOut" : "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Main Meditation Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative flex items-center justify-center"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Outer Meditation Bubble */}
              <motion.div
                className="absolute w-96 h-96 md:w-[500px] md:h-[500px] rounded-full opacity-20"
                style={{
                  background: isMoving 
                    ? 'radial-gradient(circle, rgba(255, 69, 69, 0.4) 0%, rgba(255, 140, 0, 0.3) 30%, rgba(138, 43, 226, 0.2) 100%)'
                    : 'radial-gradient(circle, rgba(139, 69, 19, 0.4) 0%, rgba(255, 140, 0, 0.3) 30%, rgba(138, 43, 226, 0.2) 100%)',
                  filter: 'blur(20px)',
                }}
                animate={{
                  scale: isMoving ? [1, 1.25, 1.1, 1.2, 1] : [1, 1.15, 1],
                  opacity: isMoving ? [0.2, 0.6, 0.3, 0.5, 0.2] : [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: isMoving ? 1.5 : 3,
                  repeat: Infinity,
                  ease: isMoving ? "easeOut" : "easeInOut",
                }}
              />

              {/* Middle Meditation Bubble */}
              <motion.div
                className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full opacity-30"
                style={{
                  background: isMoving 
                    ? 'radial-gradient(circle, rgba(255, 100, 100, 0.5) 0%, rgba(255, 43, 43, 0.4) 50%, transparent 100%)'
                    : 'radial-gradient(circle, rgba(255, 140, 0, 0.5) 0%, rgba(138, 43, 226, 0.4) 50%, transparent 100%)',
                  filter: 'blur(15px)',
                }}
                animate={{
                  scale: isMoving ? [1, 1.35, 1.1, 1.3, 1] : [1, 1.25, 1],
                  opacity: isMoving ? [0.3, 0.8, 0.4, 0.7, 0.3] : [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: isMoving ? 2 : 5,
                  repeat: Infinity,
                  ease: isMoving ? "easeOut" : "easeInOut",
                  delay: 0.5,
                }}
              />

              {/* Inner Core */}
              <motion.div
                className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full opacity-50"
                style={{
                  background: isMoving 
                    ? 'radial-gradient(circle, rgba(255, 180, 180, 0.6) 0%, rgba(255, 100, 100, 0.4) 40%, transparent 100%)'
                    : 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 140, 0, 0.4) 40%, transparent 100%)',
                  filter: 'blur(8px)',
                }}
                animate={{
                  scale: isMoving ? [1, 1.2, 0.9, 1.15, 1] : [1, 1.1, 1],
                  opacity: isMoving ? [0.5, 0.9, 0.3, 0.8, 0.5] : [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: isMoving ? 1 : 2,
                  repeat: Infinity,
                  ease: isMoving ? "easeOut" : "easeInOut",
                }}
              />

              {/* Timer Display */}
              <motion.div
                className="absolute z-10 flex flex-col items-center"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className={`text-6xl md:text-8xl font-bold drop-shadow-2xl tracking-wider transition-colors duration-500 ${
                  isMoving ? 'text-amber-200' : 'text-white'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
                
                {/* Progress Indicator */}
                <motion.div
                  className="mt-4 text-white/70 text-lg font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {progress}% Complete
                </motion.div>

                {/* Breathing Guidance */}
                <AnimatePresence>
                  {showBreathingText && isTimerRunning && (
                    <motion.div
                      className="mt-6 text-white/80 text-xl font-light text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 1 }}
                    >
                      <motion.div
                        animate={{ 
                          opacity: isCalibrating ? [1, 0.3, 1] : [1, 0.5, 1],
                          scale: isCalibrating ? [1, 1.05, 1] : [1, 1, 1]
                        }}
                        transition={{ 
                          duration: isCalibrating ? 2 : 4, 
                          repeat: Infinity 
                        }}
                      >
                        {isCalibrating ? 'Finding your center...' : 
                         isMoving ? 'Return to stillness...' : 
                         'Breathe in... and out...'}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Companion Pet Integration */}
              {pet && (
                <motion.div
                  className="absolute z-20"
                  style={{
                    transform: `translate(${petPosition.x}px, ${petPosition.y}px)`,
                  }}
                  animate={{
                    scale: getPetAnimationScale(),
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <motion.div
                    className="scale-75 md:scale-100"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 120, // Very slow rotation
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <CompanionPetComponent
                      pet={pet}
                      isAnimating={true}
                      size="medium"
                      showStats={false}
                    />
                  </motion.div>

                  {/* Pet Breathing Aura */}
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-30 -z-10"
                    style={{
                      background: pet.evolution_stage >= 2 
                        ? 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(144, 238, 144, 0.4) 0%, transparent 70%)',
                      filter: 'blur(10px)',
                    }}
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>


          {/* Exit Controls */}
          <AnimatePresence>
            {showExitButton && (
              <motion.div
                className="absolute top-4 right-4 z-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExit}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Exit Hint */}
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 md:hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-white/60 text-sm text-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
              Swipe up or tap corners to exit
            </div>
          </motion.div>

          {/* 5-minute Meditation Video */}
          <AnimatePresence>
            {showVideo && (
              <motion.div
                className="absolute top-4 left-4 z-30 w-80 h-60 bg-black/80 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20"
                initial={{ opacity: 0, scale: 0.8, x: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-full h-full">
                  <video
                    src="/meditation-videos/5min-meditation.mp4"
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVideo(false)}
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
