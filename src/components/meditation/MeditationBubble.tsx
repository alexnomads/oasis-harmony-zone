
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MeditationBubbleProps {
  isTimerRunning: boolean;
  timeRemaining: number;
}

export const MeditationBubble: React.FC<MeditationBubbleProps> = ({
  isTimerRunning,
  timeRemaining,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isTimerRunning && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Main bubble */}
            <motion.div
              className="w-80 h-80 rounded-full bg-gradient-to-br from-vibrantPurple to-vibrantOrange opacity-30 blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Inner bubble */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-gradient-to-tl from-softPurple to-softOrange opacity-40 blur-md"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Core light */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white opacity-50 blur-sm"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Timer display in center */}
            <div className="absolute flex items-center justify-center z-10">
              <div className="text-white text-6xl font-bold drop-shadow-lg">
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Particles */}
            <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-white opacity-70"
                  style={{
                    top: `${50 + 40 * Math.sin(i * (Math.PI / 8))}%`,
                    left: `${50 + 40 * Math.cos(i * (Math.PI / 8))}%`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                    x: [0, Math.random() * 15 - 7.5, 0],
                    y: [0, Math.random() * 15 - 7.5, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
