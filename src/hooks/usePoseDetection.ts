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

export interface ExerciseMetrics {
  reps: number;
  formScore: number;
  isExercising: boolean;
  confidence: number;
}

export const usePoseDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  exerciseType: 'pushups' | 'abs' | 'biceps' | null = null
) => {
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseMetrics, setExerciseMetrics] = useState<ExerciseMetrics>({
    reps: 0,
    formScore: 0,
    isExercising: false,
    confidence: 0
  });
  
  const animationRef = useRef<number>();
  const lastPoseRef = useRef<Pose | null>(null);
  const repCountRef = useRef(0);
  const exerciseStateRef = useRef<'up' | 'down' | 'neutral'>('neutral');

  // Initialize TensorFlow and pose detector
  useEffect(() => {
    const initializePoseDetection = async () => {
      try {
        setIsLoading(true);
        
        // Initialize TensorFlow.js
        await tf.ready();
        
        // Create pose detector
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

  // Calculate exercise-specific metrics
  const analyzeExercise = useCallback((pose: Pose) => {
    if (!pose.keypoints || pose.keypoints.length === 0) return;

    const keypoints = pose.keypoints;
    let reps = repCountRef.current;
    let formScore = 0;
    let isExercising = false;
    let confidence = pose.score || 0;

    // Get key body points
    const nose = keypoints.find(kp => kp.name === 'nose');
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const leftElbow = keypoints.find(kp => kp.name === 'left_elbow');
    const rightElbow = keypoints.find(kp => kp.name === 'right_elbow');
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    const rightWrist = keypoints.find(kp => kp.name === 'right_wrist');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');

    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow) {
      setExerciseMetrics(prev => ({ ...prev, confidence: 0 }));
      return;
    }

    const minConfidence = 0.3;
    const validKeypoints = [leftShoulder, rightShoulder, leftElbow, rightElbow]
      .filter(kp => (kp?.score || 0) > minConfidence);

    if (validKeypoints.length < 4) {
      setExerciseMetrics(prev => ({ ...prev, confidence: 0 }));
      return;
    }

    isExercising = true;
    confidence = validKeypoints.reduce((sum, kp) => sum + (kp?.score || 0), 0) / validKeypoints.length;

    switch (exerciseType) {
      case 'pushups':
        // Analyze push-up form and count reps
        if (leftWrist && rightWrist && leftHip && rightHip) {
          const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
          const elbowAngleL = calculateAngle(leftShoulder, leftElbow, leftWrist);
          const elbowAngleR = calculateAngle(rightShoulder, rightElbow, rightWrist);
          
          // Body alignment score
          const bodyAlignment = Math.abs(leftShoulder.y - rightShoulder.y) / shoulderWidth;
          formScore = Math.max(0, 100 - (bodyAlignment * 100));

          // Rep counting logic for push-ups
          const avgElbowAngle = (elbowAngleL + elbowAngleR) / 2;
          
          if (avgElbowAngle < 100 && exerciseStateRef.current !== 'down') {
            exerciseStateRef.current = 'down';
          } else if (avgElbowAngle > 150 && exerciseStateRef.current === 'down') {
            exerciseStateRef.current = 'up';
            repCountRef.current += 1;
            reps = repCountRef.current;
          }
        }
        break;

      case 'abs':
        // Analyze sit-up or plank form
        if (nose && leftHip && rightHip) {
          const hipCenter = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
          };
          
          // For planks, check body alignment
          const shoulderCenter = {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2
          };
          
          const bodyAngle = Math.abs(Math.atan2(
            hipCenter.y - shoulderCenter.y,
            hipCenter.x - shoulderCenter.x
          )) * (180 / Math.PI);
          
          formScore = Math.max(0, 100 - Math.abs(bodyAngle) * 2);

          // For sit-ups, detect up/down movement
          const torsoAngle = Math.abs(nose.y - hipCenter.y);
          
          if (torsoAngle < 50 && exerciseStateRef.current !== 'up') {
            exerciseStateRef.current = 'up';
          } else if (torsoAngle > 100 && exerciseStateRef.current === 'up') {
            exerciseStateRef.current = 'down';
            repCountRef.current += 1;
            reps = repCountRef.current;
          }
        }
        break;

      case 'biceps':
        // Analyze bicep curl form
        if (leftWrist && rightWrist) {
          const elbowAngleL = calculateAngle(leftShoulder, leftElbow, leftWrist);
          const elbowAngleR = calculateAngle(rightShoulder, rightElbow, rightWrist);
          
          // Form score based on elbow position stability
          const shoulderElbowDistL = Math.abs(leftShoulder.x - leftElbow.x);
          const shoulderElbowDistR = Math.abs(rightShoulder.x - rightElbow.x);
          
          formScore = Math.max(0, 100 - (shoulderElbowDistL + shoulderElbowDistR) * 50);

          // Rep counting for bicep curls
          const avgElbowAngle = (elbowAngleL + elbowAngleR) / 2;
          
          if (avgElbowAngle < 60 && exerciseStateRef.current !== 'up') {
            exerciseStateRef.current = 'up';
            repCountRef.current += 1;
            reps = repCountRef.current;
          } else if (avgElbowAngle > 150 && exerciseStateRef.current === 'up') {
            exerciseStateRef.current = 'down';
          }
        }
        break;
    }

    setExerciseMetrics({
      reps,
      formScore: Math.round(formScore),
      isExercising,
      confidence: Math.round(confidence * 100)
    });
  }, [exerciseType]);

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
        lastPoseRef.current = poses[0];
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

  // Reset rep count when exercise type changes
  useEffect(() => {
    repCountRef.current = 0;
    exerciseStateRef.current = 'neutral';
    setExerciseMetrics({
      reps: 0,
      formScore: 0,
      isExercising: false,
      confidence: 0
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
      setExerciseMetrics(prev => ({ ...prev, reps: 0 }));
    }
  };
};