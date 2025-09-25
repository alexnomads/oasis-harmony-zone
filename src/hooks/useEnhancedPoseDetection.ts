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
    suggestions: []
  });
  
  const animationRef = useRef<number>();
  const repCountRef = useRef(0);
  const exerciseStateRef = useRef<'up' | 'down' | 'neutral' | 'hold'>('neutral');
  const plankStartTimeRef = useRef<number | null>(null);
  const recentRepScoresRef = useRef<number[]>([]);
  const bodyOrientationHistoryRef = useRef<string[]>([]);

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

  // Detect body orientation based on pose
  const detectBodyOrientation = useCallback((pose: Pose): 'front' | 'side' | 'lying' | 'unknown' => {
    const keypoints = pose.keypoints;
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');
    const nose = keypoints.find(kp => kp.name === 'nose');

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !nose) {
      return 'unknown';
    }

    const minConfidence = 0.3;
    if ([leftShoulder, rightShoulder, leftHip, rightHip, nose].some(kp => (kp?.score || 0) < minConfidence)) {
      return 'unknown';
    }

    // Calculate shoulder and hip width
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    
    // Calculate body vertical alignment
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const bodyHeight = Math.abs(shoulderMidY - hipMidY);

    // Determine orientation
    if (shoulderWidth < 0.05 && hipWidth < 0.05) {
      // Very narrow profile - likely side view
      return 'side';
    } else if (bodyHeight < 0.1) {
      // Very short body height - likely lying down
      return 'lying';
    } else if (shoulderWidth > 0.1 && hipWidth > 0.1) {
      // Good width and height - likely front view
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

    // Check for push-ups (arms extended, body aligned)
    if (leftWrist && rightWrist && orientation === 'front') {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      
      if (avgElbowY > avgWristY) { // Arms extended downward
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

    // Get key body points with confidence check
    const getKeypoint = (name: string) => {
      const kp = keypoints.find(kp => kp.name === name);
      return kp && (kp.score || 0) > 0.3 ? kp : null;
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

    if (!leftShoulder || !rightShoulder) {
      setExerciseMetrics(prev => ({ 
        ...prev, 
        confidence: 0, 
        bodyOrientation: dominantOrientation as any,
        suggestions: ['Position yourself so both shoulders are visible to the camera']
      }));
      return;
    }

    isExercising = true;
    confidence = [leftShoulder, rightShoulder, leftElbow, rightElbow]
      .filter(kp => kp)
      .reduce((sum, kp) => sum + (kp?.score || 0), 0) / 4;

    // Exercise-specific analysis
    switch (currentExerciseType) {
      case 'pushups':
        if (leftWrist && rightWrist && leftElbow && rightElbow) {
          const elbowAngleL = calculateAngle(leftShoulder, leftElbow, leftWrist);
          const elbowAngleR = calculateAngle(rightShoulder, rightElbow, rightWrist);
          const avgElbowAngle = (elbowAngleL + elbowAngleR) / 2;

          // Body alignment score
          const shoulderAlignment = Math.abs(leftShoulder.y - rightShoulder.y);
          const wristAlignment = Math.abs(leftWrist.y - rightWrist.y);
          formScore = Math.max(0, 100 - (shoulderAlignment + wristAlignment) * 200);

          // Rep counting with form validation
          const goodForm = formScore > 60;
          if (avgElbowAngle < 90 && exerciseStateRef.current !== 'down' && goodForm) {
            exerciseStateRef.current = 'down';
          } else if (avgElbowAngle > 150 && exerciseStateRef.current === 'down') {
            exerciseStateRef.current = 'up';
            repCountRef.current += 1;
            reps = repCountRef.current;
            
            // Track rep quality
            recentRepScoresRef.current.push(formScore);
            if (recentRepScoresRef.current.length > 5) {
              recentRepScoresRef.current.shift();
            }
          }

          // Suggestions based on form
          if (dominantOrientation === 'side') {
            suggestions.push('Try facing the camera for better push-up tracking');
          }
          if (formScore < 50) {
            suggestions.push('Keep your body straight and aligned');
          }
          if (avgElbowAngle > 120 && exerciseStateRef.current === 'down') {
            suggestions.push('Go lower - aim for 90 degree elbow angle');
          }
        }
        break;

      case 'plank':
        if (leftHip && rightHip && nose) {
          const shoulderCenter = {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2
          };
          const hipCenter = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
          };

          // Body alignment for plank
          const bodyAngle = Math.abs(Math.atan2(
            hipCenter.y - shoulderCenter.y,
            hipCenter.x - shoulderCenter.x
          )) * (180 / Math.PI);
          
          formScore = Math.max(0, 100 - Math.abs(bodyAngle - 180) * 2);

          // Track plank hold time
          if (formScore > 50) {
            if (exerciseStateRef.current !== 'hold') {
              plankStartTimeRef.current = Date.now();
              exerciseStateRef.current = 'hold';
            }
          } else {
            exerciseStateRef.current = 'neutral';
            plankStartTimeRef.current = null;
          }

          // Suggestions for plank
          if (dominantOrientation === 'front') {
            suggestions.push('Turn to the side for better plank form tracking');
          }
          if (formScore < 60) {
            suggestions.push('Keep your body in a straight line from head to heels');
          }
        }
        break;

      case 'abs':
      case 'abs-situps':
      case 'abs-crunches':
        if (nose && leftHip && rightHip) {
          const hipCenter = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
          };

          // Different logic for crunches vs sit-ups
          const isCrunch = currentExerciseType === 'abs-crunches';
          const torsoMovement = Math.abs(nose.y - hipCenter.y);
          
          // Form scoring based on controlled movement
          const shoulderHipDistance = Math.abs(
            Math.sqrt(Math.pow(leftShoulder.x - hipCenter.x, 2) + Math.pow(leftShoulder.y - hipCenter.y, 2))
          );
          formScore = Math.min(100, shoulderHipDistance * 300);

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

          // Suggestions
          if (dominantOrientation === 'front' && leftKnee && rightKnee) {
            suggestions.push('Turn to the side for better ab exercise tracking');
          }
          if (formScore < 40) {
            suggestions.push('Focus on controlled movement - avoid using momentum');
          }
        }
        break;

      case 'biceps':
        if (leftWrist && rightWrist && leftElbow && rightElbow) {
          const elbowAngleL = calculateAngle(leftShoulder, leftElbow, leftWrist);
          const elbowAngleR = calculateAngle(rightShoulder, rightElbow, rightWrist);
          
          // Elbow stability check
          const elbowStabilityL = Math.abs(leftElbow.x - leftShoulder.x);
          const elbowStabilityR = Math.abs(rightElbow.x - rightShoulder.x);
          formScore = Math.max(0, 100 - (elbowStabilityL + elbowStabilityR) * 200);

          // Rep counting for bicep curls
          const avgElbowAngle = (elbowAngleL + elbowAngleR) / 2;
          
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

          // Suggestions
          if (formScore < 50) {
            suggestions.push('Keep your elbows close to your body');
          }
          if (dominantOrientation === 'side') {
            suggestions.push('Face the camera for better bicep curl tracking');
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
      suggestions
    });
  }, [exerciseType, detectBodyOrientation, detectExerciseType]);

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
    setExerciseMetrics({
      reps: 0,
      formScore: 0,
      isExercising: false,
      confidence: 0,
      bodyOrientation: 'unknown',
      detectedExercise: null,
      timeUnderTension: 0,
      repQuality: 0,
      suggestions: []
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
      setExerciseMetrics(prev => ({ 
        ...prev, 
        reps: 0, 
        timeUnderTension: 0,
        repQuality: 0
      }));
    }
  };
};