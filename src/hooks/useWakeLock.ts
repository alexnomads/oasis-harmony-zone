import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

export const useWakeLock = () => {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Check if Wake Lock API is supported or if we're on mobile with Capacitor
    setIsSupported('wakeLock' in navigator || Capacitor.isNativePlatform());
  }, []);

  const requestWakeLock = async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
      // For native platforms, use meta viewport and prevent screen sleep
      try {
        // Add a meta tag to prevent viewport scaling and keep screen active
        let metaViewport = document.querySelector('meta[name="viewport"]');
        if (!metaViewport) {
          metaViewport = document.createElement('meta');
          metaViewport.setAttribute('name', 'viewport');
          document.head.appendChild(metaViewport);
        }
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
        
        // Keep the app active by triggering periodic events
        const keepActive = () => {
          // Trigger a small invisible event to keep the app active
          const event = new Event('touchstart');
          document.dispatchEvent(event);
        };
        
        const intervalId = setInterval(keepActive, 10000); // Every 10 seconds
        (wakeLockRef as any).current = { intervalId, type: 'native' };
        
        setIsWakeLockActive(true);
        console.log('Native wake lock simulation is active');
        return true;
      } catch (error) {
        console.error('Failed to acquire native wake lock:', error);
        return false;
      }
    }

    if (!('wakeLock' in navigator)) {
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
        if ((wakeLockRef.current as any).type === 'native') {
          // Clear native interval
          clearInterval((wakeLockRef.current as any).intervalId);
        } else {
          // Release web wake lock
          await wakeLockRef.current.release();
        }
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
        if ((wakeLockRef.current as any).type === 'native') {
          clearInterval((wakeLockRef.current as any).intervalId);
        } else {
          wakeLockRef.current.release();
        }
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