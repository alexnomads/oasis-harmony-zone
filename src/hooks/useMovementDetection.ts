import { useState, useEffect, useRef } from 'react';

interface MovementDetectionOptions {
  isActive: boolean;
  sensitivity?: number;
  onMovementDetected?: () => void;
}

export const useMovementDetection = ({ 
  isActive, 
  sensitivity = 8, // Increased default sensitivity to reduce false positives
  onMovementDetected 
}: MovementDetectionOptions) => {
  const [isMoving, setIsMoving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  const lastPosition = useRef({ x: 0, y: 0, z: 0 });
  const baselineVariance = useRef({ x: 0, y: 0, z: 0 });
  const movementBuffer = useRef<number[]>([]);
  const calibrationReadings = useRef<Array<{ x: number, y: number, z: number }>>([]);
  const movementTimeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const calibrationTimeoutRef = useRef<NodeJS.Timeout>();

  // Helper functions for improved movement detection
  const calculateVariance = (readings: Array<{ x: number, y: number, z: number }>) => {
    if (readings.length === 0) return { x: 0, y: 0, z: 0 };
    
    const avg = readings.reduce(
      (acc, reading) => ({
        x: acc.x + reading.x,
        y: acc.y + reading.y,
        z: acc.z + reading.z
      }),
      { x: 0, y: 0, z: 0 }
    );
    
    avg.x /= readings.length;
    avg.y /= readings.length;
    avg.z /= readings.length;
    
    const variance = readings.reduce(
      (acc, reading) => ({
        x: acc.x + Math.pow(reading.x - avg.x, 2),
        y: acc.y + Math.pow(reading.y - avg.y, 2),
        z: acc.z + Math.pow(reading.z - avg.z, 2)
      }),
      { x: 0, y: 0, z: 0 }
    );
    
    return {
      x: Math.sqrt(variance.x / readings.length),
      y: Math.sqrt(variance.y / readings.length),
      z: Math.sqrt(variance.z / readings.length)
    };
  };

  const addToMovementBuffer = (movement: number) => {
    movementBuffer.current.push(movement);
    if (movementBuffer.current.length > 5) {
      movementBuffer.current.shift();
    }
  };

  const getMovementConfidence = () => {
    if (movementBuffer.current.length < 3) return 0;
    
    const recentMovements = movementBuffer.current.slice(-3);
    const sustainedMovement = recentMovements.filter(m => m > 1.5).length;
    
    return sustainedMovement / recentMovements.length;
  };

  useEffect(() => {
    if (!isActive) {
      setIsMoving(false);
      setShowWarning(false);
      setIsCalibrating(false);
      calibrationReadings.current = [];
      movementBuffer.current = [];
      return;
    }

    // Start calibration
    setIsCalibrating(true);
    console.log('🔧 Starting movement detection calibration...');
    
    // End calibration after 10 seconds
    calibrationTimeoutRef.current = setTimeout(() => {
      const variance = calculateVariance(calibrationReadings.current);
      baselineVariance.current = variance;
      setIsCalibrating(false);
      console.log('✅ Calibration complete. Baseline variance:', variance);
    }, 10000);

    let deviceMotionSupported = false;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      // Prefer acceleration without gravity if available
      const acceleration = event.acceleration || event.accelerationIncludingGravity;
      if (!acceleration) return;
      
      deviceMotionSupported = true;
      const { x, y, z } = acceleration;
      
      if (x === null || y === null || z === null) return;

      // During calibration, just collect baseline readings
      if (isCalibrating) {
        calibrationReadings.current.push({ x, y, z });
        lastPosition.current = { x, y, z };
        return;
      }

      const deltaX = Math.abs(x - lastPosition.current.x);
      const deltaY = Math.abs(y - lastPosition.current.y);
      const deltaZ = Math.abs(z - lastPosition.current.z);

      const totalMovement = deltaX + deltaY + deltaZ;
      
      // Apply deadzone for micro-movements
      if (totalMovement < 1.5) {
        addToMovementBuffer(0);
        lastPosition.current = { x, y, z };
        return;
      }

      // Add to movement buffer for confidence calculation
      addToMovementBuffer(totalMovement);

      // Calculate dynamic threshold based on baseline and current sensitivity
      const baselineNoise = (baselineVariance.current.x + baselineVariance.current.y + baselineVariance.current.z) / 3;
      const dynamicThreshold = Math.max(sensitivity, baselineNoise * 3);
      
      console.log('📱 Movement detected:', {
        totalMovement: totalMovement.toFixed(2),
        threshold: dynamicThreshold.toFixed(2),
        confidence: getMovementConfidence().toFixed(2),
        baseline: baselineNoise.toFixed(2)
      });

      // Only trigger if movement exceeds threshold AND confidence is high
      if (totalMovement > dynamicThreshold && getMovementConfidence() > 0.6) {
        console.log('⚠️ Significant movement detected - triggering warning');
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

      // During calibration, just collect baseline readings
      if (isCalibrating) {
        calibrationReadings.current.push({ x: alpha, y: beta, z: gamma });
        lastPosition.current = { x: alpha, y: beta, z: gamma };
        return;
      }

      const deltaAlpha = Math.abs(alpha - lastPosition.current.x);
      const deltaBeta = Math.abs(beta - lastPosition.current.y);
      const deltaGamma = Math.abs(gamma - lastPosition.current.z);

      const totalMovement = deltaAlpha + deltaBeta + deltaGamma;

      // Apply deadzone and higher threshold for orientation (less reliable)
      if (totalMovement < 3) {
        addToMovementBuffer(0);
        lastPosition.current = { x: alpha, y: beta, z: gamma };
        return;
      }

      addToMovementBuffer(totalMovement);

      const baselineNoise = (baselineVariance.current.x + baselineVariance.current.y + baselineVariance.current.z) / 3;
      const dynamicThreshold = Math.max(sensitivity * 3, baselineNoise * 5); // Higher threshold for orientation

      if (totalMovement > dynamicThreshold && getMovementConfidence() > 0.7) {
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
      if (calibrationTimeoutRef.current) {
        clearTimeout(calibrationTimeoutRef.current);
      }
    };
  }, [isActive, sensitivity, onMovementDetected, isCalibrating]);

  return {
    isMoving,
    showWarning,
    isCalibrating
  };
};