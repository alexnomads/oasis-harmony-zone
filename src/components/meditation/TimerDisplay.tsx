
import { motion } from 'framer-motion';

interface TimerDisplayProps {
  time: number;
  isRunning: boolean;
  calculateProgress: () => number;
  formatTime: (seconds: number) => string;
}

export const TimerDisplay = ({ 
  time, 
  isRunning, 
  calculateProgress, 
  formatTime 
}: TimerDisplayProps) => {
  return (
    <div className="text-center relative">
      <div className="relative w-48 h-48 mx-auto mb-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-vibrantPurple/20 to-vibrantOrange/20"
          animate={{
            scale: isRunning ? [1, 1.2, 1] : 1,
            opacity: isRunning ? [0.2, 0.4, 0.2] : 0.2
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeDasharray={`${calculateProgress() * 2.827}, 282.7`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: calculateProgress() / 100 }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--vibrant-purple)" />
                <stop offset="100%" stopColor="var(--vibrant-orange)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-vibrantPurple to-vibrantOrange">
            {formatTime(time)}
          </div>
        </motion.div>
        {isRunning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-white/40 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              times: [0, 0.5, 1]
            }}
          >
            {time % 8 < 4 ? "Breathe in..." : "Breathe out..."}
          </motion.div>
        )}
      </div>
      {isRunning && (
        <motion.p
          className="text-white/60 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {Math.round(calculateProgress())}% complete
        </motion.p>
      )}
    </div>
  );
};
