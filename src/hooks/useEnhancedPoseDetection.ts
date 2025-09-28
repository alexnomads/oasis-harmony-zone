import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

export interface PosePoint {
  x: number;
  y: number;
  score?: number;
}

export interface Pose {
  keypoints: Array<{
    x: number;
    y: number;
    z?: number;
    score?: number;
    name?: string;
  }>;
  score?: number;
}

export interface EnhancedExerciseMetrics {
  reps: number;
  formScore: number;
  isExercising: boolean;
  confidence: number;
  bodyOrientation: 'front' | 'side' | 'lying' | 'unknown';
  detectedExercise: string | null;
  timeUnderTension?: number; // For planks
  repQuality: number; // Average quality of recent reps
  suggestions: string[];
  // New resilience properties
  trackingStatus: 'full' | 'partial' | 'recovering' | 'lost';
  visibleKeypoints: string[];
  trackingConfidenceBuffer: number;
}

export type ExerciseType = 'pushups' | 'abs' | 'biceps' | 'plank' | 'abs-situps' | 'abs-crunches' | 'auto';

export const useEnhancedPoseDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  exerciseType: ExerciseType = 'auto'
) => {
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseMetrics, setExerciseMetrics] = useState<EnhancedExerciseMetrics>({
    reps: 0,
    formScore: 0,
    isExercising: false,
    confidence: 0,
    bodyOrientation: 'unknown',
    detectedExercise: null,
    timeUnderTension: 0,
    repQuality: 0,
    suggestions: [],
    trackingStatus: 'lost',
    visibleKeypoints: [],
    trackingConfidenceBuffer: 0
  });
  
  const animationRef = useRef<number>();
  const repCountRef = useRef(0);
  const exerciseStateRef = useRef<'up' | 'down' | 'neutral' | 'hold'>('neutral');
  const plankStartTimeRef = useRef<number | null>(null);
  const recentRepScoresRef = useRef<number[]>([]);
  const bodyOrientationHistoryRef = useRef<string[]>([]);
  const lastRepTimeRef = useRef<number>(0); // Prevent rapid rep counting
  const debugCounterRef = useRef(0); // For debug logging frequency

  // New resilience refs for enhanced tracking
  const keypointMemoryRef = useRef<Map<string, { x: number, y: number, score: number, timestamp: number }[]>>(new Map());
  const confidenceBufferRef = useRef<number[]>([]);
  const lastFullTrackingTimeRef = useRef<number>(Date.now());
  const trackingStateHistoryRef = useRef<'full' | 'partial' | 'recovering' | 'lost'>('lost');
  const partialRepProgressRef = useRef<{ inProgress: boolean, startTime: number, minVisibilityMet: boolean }>({
    inProgress: false,
    startTime: 0,
    minVisibilityMet: false
  });

  // Initialize TensorFlow and pose detector
  useEffect(() => {
    const initializePoseDetection = async () => {
      try {
        setIsLoading(true);
        await tf.ready();
        
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        };
        
        const poseDetector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(poseDetector);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize pose detection:', err);
        setError('Failed to initialize pose detection');
      } finally {
        setIsLoading(false);
      }
    };

    initializePoseDetection();
  }, []);

  // ========= NEW RESILIENCE HELPER FUNCTIONS =========
  
  // Store keypoint positions in memory for temporal smoothing
  const updateKeypointMemory = useCallback((keypoints: any[]) => {
    const now = Date.now();
    const memoryDuration = 2000; // Keep 2 seconds of history
    
    keypoints.forEach(kp => {
      if (!kp.name || !kp.score || kp.score < 0.1) return;
      
      if (!keypointMemoryRef.current.has(kp.name)) {
        keypointMemoryRef.current.set(kp.name, []);
      }
      
      const history = keypointMemoryRef.current.get(kp.name)!;
      history.push({ x: kp.x, y: kp.y, score: kp.score, timestamp: now });
      
      // Remove old entries
      keypointMemoryRef.current.set(
        kp.name, 
        history.filter(entry => now - entry.timestamp < memoryDuration)
      );
    });
  }, []);
  
  // Get keypoint with fallback to recent memory
  const getKeypointWithFallback = useCallback((name: string, currentKeypoints: any[], minConfidence: number = 0.2) => {
    // Try current detection first
    const current = currentKeypoints.find(kp => kp.name === name);
    if (current && (current.score || 0) > minConfidence) {
      return current;
    }
    
    // Fallback to recent memory
    const history = keypointMemoryRef.current.get(name);
    if (!history || history.length === 0) return null;
    
    // Get most recent high-confidence keypoint
    const recent = history
      .filter(kp => kp.score > minConfidence * 0.7) // Slightly lower threshold for memory
      .sort((a, b) => b.timestamp - a.timestamp)[0];
      
    if (recent && Date.now() - recent.timestamp < 1000) { // Within last second
      return { 
        ...recent, 
        name, 
        isFromMemory: true,
        confidence: recent.score * 0.8 // Reduce confidence for memory-based keypoints
      };
    }
    
    return null;
  }, []);
  
  // Update confidence buffer and determine tracking status
  const updateTrackingStatus = useCallback((currentConfidence: number, visibleKeypoints: string[]) => {
    const now = Date.now();
    
    // Update confidence buffer
    confidenceBufferRef.current.push(currentConfidence);
    if (confidenceBufferRef.current.length > 10) {
      confidenceBufferRef.current.shift();
    }
    
    const avgConfidence = confidenceBufferRef.current.reduce((sum, c) => sum + c, 0) / confidenceBufferRef.current.length;
    const keyRequiredKeypoints = ['left_shoulder', 'right_shoulder'];
    const hasRequiredKeypoints = keyRequiredKeypoints.every(kp => visibleKeypoints.includes(kp));
    
    let trackingStatus: 'full' | 'partial' | 'recovering' | 'lost';
    
    if (hasRequiredKeypoints && avgConfidence > 0.6 && visibleKeypoints.length >= 6) {
      trackingStatus = 'full';
      lastFullTrackingTimeRef.current = now;
    } else if (hasRequiredKeypoints && avgConfidence > 0.3 && visibleKeypoints.length >= 4) {
      trackingStatus = 'partial';
    } else if (visibleKeypoints.length >= 2 && now - lastFullTrackingTimeRef.current < 3000) {
      trackingStatus = 'recovering';
    } else {
      trackingStatus = 'lost';
    }
    
    trackingStateHistoryRef.current = trackingStatus;
    return { trackingStatus, avgConfidence };
  }, []);

  // Enhanced body orientation detection with push-up specific logic
  const detectBodyOrientation = useCallback((pose: Pose): 'front' | 'side' | 'lying' | 'unknown' => {
    const keypoints = pose.keypoints;
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');
    const nose = keypoints.find(kp => kp.name === 'nose');
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    const rightWrist = keypoints.find(kp => kp.name === 'right_wrist');

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !nose) {
      return 'unknown';
    }

    const minConfidence = 0.2; // Lower threshold for better detection
    if ([leftShoulder, rightShoulder, leftHip, rightHip, nose].some(kp => (kp?.score || 0) < minConfidence)) {
      return 'unknown';
    }

    // Calculate shoulder and hip width
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    
    // Calculate body alignment ratios
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const bodyHeight = Math.abs(shoulderMidY - hipMidY);

    // Special logic for push-up position detection
    if (leftWrist && rightWrist) {
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      
      // If wrists are below shoulders, likely in push-up position
      if (avgWristY > avgShoulderY && bodyHeight > 0.08) {
        // Check if body is horizontal-ish (push-up position)
        const bodyAngle = Math.abs(shoulderMidY - hipMidY);
        if (bodyAngle < 0.15) {
          return 'lying'; // Push-up position
        }
      }
    }

    // Standard orientation detection
    if (shoulderWidth < 0.04 && hipWidth < 0.04) {
      return 'side';
    } else if (bodyHeight < 0.08) {
      return 'lying';
    } else if (shoulderWidth > 0.08 && hipWidth > 0.08) {
      return 'front';
    }

    return 'unknown';
  }, []);

  // Auto-detect exercise type based on movement patterns
  const detectExerciseType = useCallback((pose: Pose, orientation: string): string | null => {
    const keypoints = pose.keypoints;
    const leftElbow = keypoints.find(kp => kp.name === 'left_elbow');
    const rightElbow = keypoints.find(kp => kp.name === 'right_elbow');
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    const rightWrist = keypoints.find(kp => kp.name === 'right_wrist');
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const nose = keypoints.find(kp => kp.name === 'nose');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');

    if (!leftElbow || !rightElbow || !leftShoulder || !rightShoulder) return null;

    // Enhanced push-up detection (works from multiple angles)
    if (leftWrist && rightWrist && (orientation === 'front' || orientation === 'lying')) {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      
      // Check for push-up arm position and body alignment
      const armsExtended = avgElbowY > avgWristY;
      const bodyInPushupPosition = avgWristY > avgShoulderY;
      
      if (armsExtended && bodyInPushupPosition) {
        return 'pushups';
      }
    }

    // Check for bicep curls (elbow movement, upright posture)
    if (leftWrist && rightWrist && (orientation === 'front' || orientation === 'side')) {
      const elbowAngleL = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const elbowAngleR = calculateAngle(rightShoulder, rightElbow, rightWrist);
      
      if (elbowAngleL < 120 || elbowAngleR < 120) { // Flexed arms
        return 'biceps';
      }
    }

    // Check for abs/plank (core engagement)
    if (nose && leftHip && rightHip) {
      const hipMidY = (leftHip.y + rightHip.y) / 2;
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      const bodyAngle = Math.abs(hipMidY - shoulderMidY);
      
      if (orientation === 'lying' || bodyAngle < 0.05) {
        return 'plank';
      } else if (orientation === 'side' && bodyAngle > 0.1) {
        return 'abs-situps';
      }
    }

    return null;
  }, []);

  // Enhanced exercise analysis with sub-type detection
  const analyzeExercise = useCallback((pose: Pose) => {
    if (!pose.keypoints || pose.keypoints.length === 0) return;

    const keypoints = pose.keypoints;
    updateKeypointMemory(keypoints);
    
    let reps = repCountRef.current;
    let formScore = 0;
    let isExercising = false;
    let confidence = pose.score || 0;
    const suggestions: string[] = [];

    // Detect body orientation
    const orientation = detectBodyOrientation(pose);
    bodyOrientationHistoryRef.current.push(orientation);
    if (bodyOrientationHistoryRef.current.length > 10) {
      bodyOrientationHistoryRef.current.shift();
    }

    // Get most common orientation
    const orientationCounts = bodyOrientationHistoryRef.current.reduce((acc, ori) => {
      acc[ori] = (acc[ori] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const dominantOrientation = Object.keys(orientationCounts).reduce((a, b) => 
      orientationCounts[a] > orientationCounts[b] ? a : b
    );

    // Auto-detect exercise if in auto mode
    let currentExerciseType = exerciseType;
    if (exerciseType === 'auto') {
      const detected = detectExerciseType(pose, dominantOrientation);
      if (detected) {
        currentExerciseType = detected as ExerciseType;
      }
    }

    // Get key body points with enhanced fallback system
    const getKeypoint = (name: string) => {
      return getKeypointWithFallback(name, keypoints, 0.2);
    };

    const nose = getKeypoint('nose');
    const leftShoulder = getKeypoint('left_shoulder');
    const rightShoulder = getKeypoint('right_shoulder');
    const leftElbow = getKeypoint('left_elbow');
    const rightElbow = getKeypoint('right_elbow');
    const leftWrist = getKeypoint('left_wrist');
    const rightWrist = getKeypoint('right_wrist');
    const leftHip = getKeypoint('left_hip');
    const rightHip = getKeypoint('right_hip');
    const leftKnee = getKeypoint('left_knee');
    const rightKnee = getKeypoint('right_knee');

    // Track visible keypoints
    const visibleKeypoints = [
      nose && 'nose',
      leftShoulder && 'left_shoulder',
      rightShoulder && 'right_shoulder', 
      leftElbow && 'left_elbow',
      rightElbow && 'right_elbow',
      leftWrist && 'left_wrist',
      rightWrist && 'right_wrist',
      leftHip && 'left_hip',
      rightHip && 'right_hip',
      leftKnee && 'left_knee',
      rightKnee && 'right_knee'
    ].filter(Boolean) as string[];

    // Update tracking status with resilience logic
    const { trackingStatus, avgConfidence } = updateTrackingStatus(confidence, visibleKeypoints);

    // Progressive degradation: continue with reduced functionality if minimal keypoints available
    if (!leftShoulder && !rightShoulder && trackingStatus === 'lost') {
      setExerciseMetrics(prev => ({ 
        ...prev, 
        confidence: 0,
        trackingStatus: 'lost',
        visibleKeypoints: [],
        trackingConfidenceBuffer: avgConfidence,
        bodyOrientation: dominantOrientation as any,
        suggestions: ['Position yourself so your shoulders are visible to the camera']
      }));
      return;
    }

    // Allow partial tracking with just one shoulder
    if (!leftShoulder && !rightShoulder) {
      setExerciseMetrics(prev => ({ 
        ...prev, 
        confidence: Math.round(avgConfidence * 100),
        trackingStatus,
        visibleKeypoints,
        trackingConfidenceBuffer: avgConfidence,
        bodyOrientation: dominantOrientation as any,
        suggestions: ['Try to keep both shoulders in view of the camera']
      }));
      return;
    }

    isExercising = true;
    confidence = [leftShoulder, rightShoulder, leftElbow, rightElbow]
      .filter(kp => kp)
      .reduce((sum, kp) => sum + (kp?.score || kp?.confidence || 0), 0) / 4;

    // Exercise-specific analysis with enhanced resilience
    switch (currentExerciseType) {
      case 'pushups':
        if ((leftWrist || rightWrist) && (leftElbow || rightElbow)) {
          // Enhanced push-up logic with partial tracking
          const leftAngle = leftShoulder && leftElbow && leftWrist ? 
            calculateAngle(leftShoulder, leftElbow, leftWrist) : null;
          const rightAngle = rightShoulder && rightElbow && rightWrist ? 
            calculateAngle(rightShoulder, rightElbow, rightWrist) : null;
          
          // Use available angle or interpolate
          const avgElbowAngle = leftAngle && rightAngle ? (leftAngle + rightAngle) / 2 :
                               leftAngle || rightAngle || 90; // Neutral assumption

          // Enhanced form scoring with partial data
          const shoulderAlignment = leftShoulder && rightShoulder ? 
            Math.abs(leftShoulder.y - rightShoulder.y) : 0;
          const wristAlignment = leftWrist && rightWrist ? 
            Math.abs(leftWrist.y - rightWrist.y) : 0;
          
          // Body alignment score with graceful degradation
          let bodyAlignment = 100;
          if (leftHip && rightHip && nose) {
            const shoulderMidY = leftShoulder && rightShoulder ? 
              (leftShoulder.y + rightShoulder.y) / 2 : 
              (leftShoulder?.y || rightShoulder?.y || 0);
            const hipMidY = (leftHip.y + rightHip.y) / 2;
            const bodyLineDeviation = Math.abs(shoulderMidY - hipMidY);
            bodyAlignment = Math.max(0, 100 - bodyLineDeviation * 400);
          }
          
          // Progressive form scoring based on available data
          const hasFullTracking = leftShoulder && rightShoulder && leftWrist && rightWrist;
          formScore = hasFullTracking ? 
            Math.max(0, (bodyAlignment * 0.6 + (100 - shoulderAlignment * 150) * 0.2 + (100 - wristAlignment * 150) * 0.2)) :
            Math.max(0, bodyAlignment * 0.8 + 20); // Base score for partial tracking

          // Enhanced rep counting with frame-exit tolerance
          const minFormForRep = trackingStatus === 'full' ? 40 : 25; // More forgiving for partial tracking
          const goodForm = formScore > minFormForRep;
          const now = Date.now();
          const minTimeBetweenReps = 600; // Slightly reduced for better responsiveness
          
          // Partial rep progress tracking
          if (avgElbowAngle < 110 && !partialRepProgressRef.current.inProgress && goodForm) {
            partialRepProgressRef.current = {
              inProgress: true,
              startTime: now,
              minVisibilityMet: trackingStatus !== 'lost'
            };
            exerciseStateRef.current = 'down';
            console.log(`Push-up DOWN (${trackingStatus}): angle=${Math.round(avgElbowAngle)}°, form=${Math.round(formScore)}%`);
          }
          
          // Complete rep with tolerance for brief frame exits
          if (avgElbowAngle > 140 && partialRepProgressRef.current.inProgress && 
              (goodForm || trackingStatus === 'recovering') && 
              (now - lastRepTimeRef.current) > minTimeBetweenReps) {
            
            const repDuration = now - partialRepProgressRef.current.startTime;
            const minVisibilityMet = partialRepProgressRef.current.minVisibilityMet || trackingStatus !== 'lost';
            
            // Complete rep if it meets minimum criteria
            if (repDuration > 400 && minVisibilityMet) { // At least 400ms and some visibility
              repCountRef.current += 1;
              reps = repCountRef.current;
              lastRepTimeRef.current = now;
              exerciseStateRef.current = 'up';
              
              console.log(`Push-up REP completed (${trackingStatus}): ${reps}, angle=${Math.round(avgElbowAngle)}°, form=${Math.round(formScore)}%`);
              
              // Track rep quality
              recentRepScoresRef.current.push(formScore);
              if (recentRepScoresRef.current.length > 5) {
                recentRepScoresRef.current.shift();
              }
            }
            
            partialRepProgressRef.current.inProgress = false;
          }
          
          // Update visibility tracking during rep
          if (partialRepProgressRef.current.inProgress && trackingStatus !== 'lost') {
            partialRepProgressRef.current.minVisibilityMet = true;
          }

          // Enhanced suggestions based on tracking status
          if (trackingStatus === 'partial') {
            suggestions.push('Try to keep your full body in view for better tracking');
          } else if (trackingStatus === 'recovering') {
            suggestions.push('Move back into camera view to continue tracking');
          } else if (dominantOrientation === 'unknown') {
            suggestions.push('Position camera at a side angle for optimal push-up tracking');
          }
          
          if (formScore < 40 && trackingStatus === 'full') {
            suggestions.push('Keep your body in straight line from head to heels');
          }
        }
        break;

      // Similar enhancements for other exercises...
      case 'plank':
        if (leftHip && rightHip && nose) {
          const shoulderCenter = leftShoulder && rightShoulder ? {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2
          } : (leftShoulder || rightShoulder || { x: 0, y: 0 });
          
          const hipCenter = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
          };

          // Body alignment for plank with partial tracking tolerance
          const bodyAngle = Math.abs(Math.atan2(
            hipCenter.y - shoulderCenter.y,
            hipCenter.x - shoulderCenter.x
          )) * (180 / Math.PI);
          
          formScore = trackingStatus === 'full' ? 
            Math.max(0, 100 - Math.abs(bodyAngle - 180) * 2) :
            Math.max(0, 100 - Math.abs(bodyAngle - 180) * 3); // More tolerant for partial tracking

          // Track plank hold time with interruption tolerance
          if (formScore > 40) { // Lower threshold for partial tracking
            if (exerciseStateRef.current !== 'hold') {
              plankStartTimeRef.current = Date.now();
              exerciseStateRef.current = 'hold';
            }
          } else if (trackingStatus === 'lost') {
            // Don't reset immediately on lost tracking, allow recovery
            exerciseStateRef.current = 'neutral';
          }
          
          if (trackingStatus === 'partial') {
            suggestions.push('Keep your full body visible for accurate plank tracking');
          }
        }
        break;

      case 'abs':
      case 'abs-situps':
      case 'abs-crunches':
        // Similar resilience enhancements for abs exercises
        if (nose && leftHip && rightHip) {
          const hipCenter = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
          };

          const isCrunch = currentExerciseType === 'abs-crunches';
          const torsoMovement = Math.abs(nose.y - hipCenter.y);
          
          const shoulderHipDistance = leftShoulder ? Math.abs(
            Math.sqrt(Math.pow(leftShoulder.x - hipCenter.x, 2) + Math.pow(leftShoulder.y - hipCenter.y, 2))
          ) : 0.3; // Default assumption for partial tracking
          
          formScore = Math.min(100, shoulderHipDistance * 300);
          if (trackingStatus !== 'full') formScore *= 0.8; // Reduce for partial tracking

          // Rep counting with movement thresholds
          const movementThreshold = isCrunch ? 0.05 : 0.1;
          
          if (torsoMovement < movementThreshold && exerciseStateRef.current !== 'up') {
            exerciseStateRef.current = 'up';
          } else if (torsoMovement > movementThreshold * 2 && exerciseStateRef.current === 'up') {
            exerciseStateRef.current = 'down';
            repCountRef.current += 1;
            reps = repCountRef.current;
            
            recentRepScoresRef.current.push(formScore);
            if (recentRepScoresRef.current.length > 5) {
              recentRepScoresRef.current.shift();
            }
          }
          
          if (trackingStatus === 'partial') {
            suggestions.push('Position yourself so your torso is fully visible');
          }
        }
        break;

      case 'biceps':
        // Enhanced biceps tracking with partial visibility
        if ((leftWrist || rightWrist) && (leftElbow || rightElbow)) {
          const leftAngle = leftShoulder && leftElbow && leftWrist ? 
            calculateAngle(leftShoulder, leftElbow, leftWrist) : null;
          const rightAngle = rightShoulder && rightElbow && rightWrist ? 
            calculateAngle(rightShoulder, rightElbow, rightWrist) : null;
          
          // Elbow stability check with graceful degradation
          const elbowStabilityL = leftElbow && leftShoulder ? 
            Math.abs(leftElbow.x - leftShoulder.x) : 0;
          const elbowStabilityR = rightElbow && rightShoulder ? 
            Math.abs(rightElbow.x - rightShoulder.x) : 0;
          
          formScore = Math.max(0, 100 - (elbowStabilityL + elbowStabilityR) * 200);
          if (trackingStatus !== 'full') formScore *= 0.7;

          // Rep counting for bicep curls with partial tracking
          const avgElbowAngle = leftAngle && rightAngle ? (leftAngle + rightAngle) / 2 :
                               leftAngle || rightAngle || 90;
          
          if (avgElbowAngle < 70 && exerciseStateRef.current !== 'up') {
            exerciseStateRef.current = 'up';
            repCountRef.current += 1;
            reps = repCountRef.current;
            
            recentRepScoresRef.current.push(formScore);
            if (recentRepScoresRef.current.length > 5) {
              recentRepScoresRef.current.shift();
            }
          } else if (avgElbowAngle > 140 && exerciseStateRef.current === 'up') {
            exerciseStateRef.current = 'down';
          }

          if (trackingStatus === 'partial') {
            suggestions.push('Keep both arms visible for accurate bicep curl tracking');
          }
        }
        break;
    }

    // Calculate rep quality
    const repQuality = recentRepScoresRef.current.length > 0 
      ? recentRepScoresRef.current.reduce((sum, score) => sum + score, 0) / recentRepScoresRef.current.length
      : formScore;

    // Calculate time under tension for plank
    const timeUnderTension = plankStartTimeRef.current 
      ? Math.floor((Date.now() - plankStartTimeRef.current) / 1000)
      : 0;

    setExerciseMetrics({
      reps,
      formScore: Math.round(formScore),
      isExercising,
      confidence: Math.round(confidence * 100),
      bodyOrientation: dominantOrientation as any,
      detectedExercise: currentExerciseType === 'auto' ? (detectExerciseType(pose, dominantOrientation) || 'unknown') : currentExerciseType,
      timeUnderTension,
      repQuality: Math.round(repQuality),
      suggestions,
      trackingStatus,
      visibleKeypoints,
      trackingConfidenceBuffer: avgConfidence
    });
  }, [exerciseType, detectBodyOrientation, detectExerciseType, updateKeypointMemory, getKeypointWithFallback, updateTrackingStatus]);

  // Helper function to calculate angle between three points
  const calculateAngle = (a: PosePoint, b: PosePoint, c: PosePoint): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  };

  // Main pose detection loop
  const detectPoses = useCallback(async () => {
    if (!detector || !videoRef.current || videoRef.current.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectPoses);
      return;
    }

    try {
      const video = videoRef.current;
      const poses = await detector.estimatePoses(video);
      
      setPoses(poses);
      
      if (poses.length > 0) {
        analyzeExercise(poses[0]);
      }
    } catch (err) {
      console.error('Pose detection error:', err);
    }

    animationRef.current = requestAnimationFrame(detectPoses);
  }, [detector, analyzeExercise]);

  // Start/stop detection
  useEffect(() => {
    if (detector && videoRef.current) {
      detectPoses();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [detector, detectPoses]);

  // Reset when exercise type changes
  useEffect(() => {
    repCountRef.current = 0;
    exerciseStateRef.current = 'neutral';
    plankStartTimeRef.current = null;
    recentRepScoresRef.current = [];
    bodyOrientationHistoryRef.current = [];
    lastRepTimeRef.current = 0;
    debugCounterRef.current = 0;
    // Reset resilience refs
    keypointMemoryRef.current.clear();
    confidenceBufferRef.current = [];
    lastFullTrackingTimeRef.current = Date.now();
    trackingStateHistoryRef.current = 'lost';
    partialRepProgressRef.current = { inProgress: false, startTime: 0, minVisibilityMet: false };
    
    setExerciseMetrics({
      reps: 0,
      formScore: 0,
      isExercising: false,
      confidence: 0,
      bodyOrientation: 'unknown',
      detectedExercise: null,
      timeUnderTension: 0,
      repQuality: 0,
      suggestions: [],
      trackingStatus: 'lost',
      visibleKeypoints: [],
      trackingConfidenceBuffer: 0
    });
  }, [exerciseType]);

  return {
    poses,
    isLoading,
    error,
    exerciseMetrics,
    resetReps: () => {
      repCountRef.current = 0;
      exerciseStateRef.current = 'neutral';
      plankStartTimeRef.current = null;
      recentRepScoresRef.current = [];
      lastRepTimeRef.current = 0;
      debugCounterRef.current = 0;
      // Reset resilience refs
      keypointMemoryRef.current.clear();
      confidenceBufferRef.current = [];
      partialRepProgressRef.current = { inProgress: false, startTime: 0, minVisibilityMet: false };
      
      setExerciseMetrics(prev => ({ 
        ...prev, 
        reps: 0, 
        timeUnderTension: 0,
        repQuality: 0,
        trackingStatus: 'lost',
        visibleKeypoints: [],
        trackingConfidenceBuffer: 0
      }));
    }
  };
};