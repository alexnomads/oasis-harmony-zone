
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TimerControls } from './TimerControls';
import { TimerDisplay } from './TimerDisplay';
import { CompletedSession } from './CompletedSession';
import { useMeditationSession } from '@/hooks/useMeditationSession';
import { useAuth } from '@/contexts/AuthContext';

export const Timer = () => {
  const { user } = useAuth();
  const {
    isRunning,
    time,
    sessionId,
    selectedDuration,
    setSelectedDuration,
    sessionCompleted,
    pointsEarned,
    totalPoints,
    calculateProgress,
    formatTime,
    toggleTimer,
    resetTimer
  } = useMeditationSession(user?.id);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col items-center">
      {!sessionCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <TimerDisplay
            time={time}
            isRunning={isRunning}
            calculateProgress={calculateProgress}
            formatTime={formatTime}
          />

          <div className="mt-8">
            <TimerControls
              isRunning={isRunning}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              disabled={sessionCompleted}
            />
          </div>
        </motion.div>
      )}

      {sessionCompleted && (
        <CompletedSession
          pointsEarned={pointsEarned}
          totalPoints={totalPoints}
          resetTimer={resetTimer}
          sessionId={sessionId}
        />
      )}
    </div>
  );
};
