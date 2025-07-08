import { useState, useEffect, useRef } from 'react';

export const useWakeLock = () => {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Check if Wake Lock API is supported
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Wake Lock API is not supported in this browser');
      return false;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsWakeLockActive(true);
      
      // Listen for wake lock release
      wakeLockRef.current.addEventListener('release', () => {
        setIsWakeLockActive(false);
      });

      console.log('Wake lock is active');
      return true;
    } catch (error) {
      console.error('Failed to acquire wake lock:', error);
      return false;
    }
  };

  const releaseWakeLock = async (): Promise<void> => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsWakeLockActive(false);
        console.log('Wake lock released');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  // Handle visibility change - reacquire wake lock when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isWakeLockActive && document.visibilityState === 'visible' && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isWakeLockActive]);

  return {
    isWakeLockActive,
    isSupported,
    requestWakeLock,
    releaseWakeLock
  };
};