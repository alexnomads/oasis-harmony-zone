
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
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  
  const { showWarning, isCalibrating } = useMovementDetection({
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
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                  x: [0, Math.random() * 30 - 15, 0],
                  y: [0, Math.random() * 30 - 15, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.2,
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
                  background: 'radial-gradient(circle, rgba(139, 69, 19, 0.4) 0%, rgba(255, 140, 0, 0.3) 30%, rgba(138, 43, 226, 0.2) 100%)',
                  filter: 'blur(20px)',
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Middle Meditation Bubble */}
              <motion.div
                className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 140, 0, 0.5) 0%, rgba(138, 43, 226, 0.4) 50%, transparent 100%)',
                  filter: 'blur(15px)',
                }}
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />

              {/* Inner Core */}
              <motion.div
                className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full opacity-50"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 140, 0, 0.4) 40%, transparent 100%)',
                  filter: 'blur(8px)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
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
                <div className="text-white text-6xl md:text-8xl font-bold drop-shadow-2xl tracking-wider">
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
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        Breathe in... and out...
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

          {/* Movement Detection Warning */}
          <AnimatePresence>
            {showWarning && (
              <motion.div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 max-w-sm mx-auto"
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="bg-red-600/90 backdrop-blur-sm border border-red-400/50 rounded-xl px-6 py-4 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-yellow-300 mb-1">MOVEMENT DETECTED</h3>
                      <p className="text-sm">
                        {pointsDeducted.toFixed(2)} points will be deducted.
                      </p>
                      <p className="text-xs text-white/80 mt-1">
                        Try to remain still during meditation.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPointsDeducted(0)}
                      className="text-white/60 hover:text-white hover:bg-white/10 ml-4"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calibration Indicator */}
          <AnimatePresence>
            {isCalibrating && (
              <motion.div
                className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-sm mx-auto"
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="bg-blue-600/90 backdrop-blur-sm border border-blue-400/50 rounded-xl px-6 py-4 text-white shadow-2xl">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-cyan-300 mb-1">🔧 CALIBRATING</h3>
                    <p className="text-sm">
                      Setting up movement detection...
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      Please stay still for 10 seconds
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
