import { useState, useEffect, useRef } from 'react';

interface MovementDetectionOptions {
  isActive: boolean;
  sensitivity?: number;
  onMovementDetected?: () => void;
}

export const useMovementDetection = ({ 
  isActive, 
  sensitivity = 5,
  onMovementDetected 
}: MovementDetectionOptions) => {
  const [isMoving, setIsMoving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0, z: 0 });
  const movementTimeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isActive) {
      setIsMoving(false);
      setShowWarning(false);
      return;
    }

    let deviceMotionSupported = false;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      
      deviceMotionSupported = true;
      const { x, y, z } = event.accelerationIncludingGravity;
      
      if (x === null || y === null || z === null) return;

      const deltaX = Math.abs(x - lastPosition.current.x);
      const deltaY = Math.abs(y - lastPosition.current.y);
      const deltaZ = Math.abs(z - lastPosition.current.z);

      const totalMovement = deltaX + deltaY + deltaZ;

      if (totalMovement > sensitivity) {
        setIsMoving(true);
        setShowWarning(true);
        onMovementDetected?.();

        // Clear existing timeouts
        if (movementTimeoutRef.current) {
          clearTimeout(movementTimeoutRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }

        // Stop detecting movement after a brief period
        movementTimeoutRef.current = setTimeout(() => {
          setIsMoving(false);
        }, 1000);

        // Hide warning after 3 seconds
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarning(false);
        }, 3000);
      }

      lastPosition.current = { x, y, z };
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (deviceMotionSupported) return; // Prefer motion if available
      
      const alpha = event.alpha || 0;
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      const deltaAlpha = Math.abs(alpha - lastPosition.current.x);
      const deltaBeta = Math.abs(beta - lastPosition.current.y);
      const deltaGamma = Math.abs(gamma - lastPosition.current.z);

      const totalMovement = deltaAlpha + deltaBeta + deltaGamma;

      if (totalMovement > sensitivity * 2) { // Higher threshold for orientation
        setIsMoving(true);
        setShowWarning(true);
        onMovementDetected?.();

        if (movementTimeoutRef.current) {
          clearTimeout(movementTimeoutRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }

        movementTimeoutRef.current = setTimeout(() => {
          setIsMoving(false);
        }, 1000);

        warningTimeoutRef.current = setTimeout(() => {
          setShowWarning(false);
        }, 3000);
      }

      lastPosition.current = { x: alpha, y: beta, z: gamma };
    };

    // Request permission for iOS devices
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        } catch (error) {
          console.warn('Device motion permission denied:', error);
          // Fallback to orientation
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } else {
        // For non-iOS devices
        window.addEventListener('devicemotion', handleDeviceMotion);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
      
      if (movementTimeoutRef.current) {
        clearTimeout(movementTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isActive, sensitivity, onMovementDetected]);

  return {
    isMoving,
    showWarning
  };
};