import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RotateCcw, Award, Users } from 'lucide-react';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import type { WorkoutType } from '@/types/database';

interface CameraFitnessTrackerProps {
  exerciseType: WorkoutType;
  onComplete: (reps: number, duration: number, formScore: number) => void;
  onBack: () => void;
}

export const CameraFitnessTracker: React.FC<CameraFitnessTrackerProps> = ({
  exerciseType,
  onComplete,
  onBack
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showPoseOverlay, setShowPoseOverlay] = useState(true);
  
  const { poses, isLoading, error, exerciseMetrics, resetReps } = usePoseDetection(
    videoRef,
    exerciseType
  );

  // Timer for workout duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && isStreaming) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isStreaming]);

  // Start camera stream
  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' // Use front camera on mobile
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('Setting video source...');
        videoRef.current.srcObject = stream;
        
        // Wait for video metadata to load
        const videoElement = videoRef.current;
        
        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded, starting playback...');
          videoElement.play().then(() => {
            console.log('Video playing successfully');
            setIsStreaming(true);
            toast({
              title: "Camera Active",
              description: "Position yourself in frame and click Start Workout"
            });
          }).catch((playErr) => {
            console.error('Error playing video:', playErr);
            toast({
              title: "Playback Error",
              description: "Failed to start video playback",
              variant: "destructive"
            });
          });
        };
        
        const handleError = (err: Event) => {
          console.error('Video error:', err);
          toast({
            title: "Video Error",
            description: "Failed to initialize video stream",
            variant: "destructive"
          });
        };
        
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
        videoElement.addEventListener('error', handleError, { once: true });
        
        // Set video attributes
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.playsInline = true;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Camera Error",
        description: `Unable to access camera: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setIsActive(false);
  };

  // Start workout
  const startWorkout = () => {
    if (!isStreaming) {
      toast({
        title: "Camera Required",
        description: "Please start the camera first",
        variant: "destructive"
      });
      return;
    }
    
    setIsActive(true);
    setDuration(0);
    resetReps();
    
    toast({
      title: "Workout Started!",
      description: "Your movements are being tracked. Keep good form!"
    });
  };

  // Complete workout
  const completeWorkout = () => {
    if (duration < 10) {
      toast({
        title: "Workout Too Short",
        description: "Minimum workout duration is 10 seconds",
        variant: "destructive"
      });
      return;
    }

    setIsActive(false);
    stopCamera();
    
    // Calculate bonus points for good form
    const formBonus = exerciseMetrics.formScore > 80 ? 5 : 
                     exerciseMetrics.formScore > 60 ? 3 : 0;
    
    toast({
      title: "Workout Complete! 🎉",
      description: `${exerciseMetrics.reps} reps completed with ${exerciseMetrics.formScore}% form accuracy`
    });
    
    onComplete(exerciseMetrics.reps, duration, exerciseMetrics.formScore);
  };

  // Draw pose overlay on canvas
  useEffect(() => {
    if (!showPoseOverlay || !canvasRef.current || !videoRef.current || poses.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pose keypoints and connections
    poses.forEach(pose => {
      // Draw keypoints
      pose.keypoints.forEach(keypoint => {
        const { x, y, score } = keypoint;
        if (score && score > 0.3) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = exerciseMetrics.confidence > 70 ? '#00ff00' : '#ff6b6b';
          ctx.fill();
        }
      });

      // Draw skeleton connections
      const connections = [
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'],
        ['right_shoulder', 'right_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip']
      ];

      ctx.strokeStyle = exerciseMetrics.confidence > 70 ? '#00ff00' : '#ff6b6b';
      ctx.lineWidth = 2;

      connections.forEach(([pointA, pointB]) => {
        const keypointA = pose.keypoints.find(kp => kp.name === pointA);
        const keypointB = pose.keypoints.find(kp => kp.name === pointB);
        
        if (keypointA && keypointB && 
            (keypointA.score || 0) > 0.3 && (keypointB.score || 0) > 0.3) {
          ctx.beginPath();
          ctx.moveTo(keypointA.x, keypointA.y);
          ctx.lineTo(keypointB.x, keypointB.y);
          ctx.stroke();
        }
      });
    });
  }, [poses, showPoseOverlay, exerciseMetrics.confidence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseEmoji = () => {
    switch (exerciseType) {
      case 'pushups': return '💪';
      case 'abs': return '🏋️‍♂️';
      case 'biceps': return '💪';
      default: return '🏃‍♂️';
    }
  };

  const getExerciseName = () => {
    switch (exerciseType) {
      case 'pushups': return 'Push-ups';
      case 'abs': return 'Abs & Core';
      case 'biceps': return 'Bicep Curls';
      default: return 'Exercise';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="text-accent hover:text-accent/80">
            ← Back
          </Button>
          <h2 className="text-2xl font-bold text-accent">
            {getExerciseEmoji()} AI {getExerciseName()} Tracker
          </h2>
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowPoseOverlay(!showPoseOverlay)}
          className="text-sm"
        >
          {showPoseOverlay ? 'Hide' : 'Show'} Pose
        </Button>
      </div>

      {/* Camera and Metrics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
            <CardContent className="p-4">
              <div className="relative aspect-video bg-black/30 rounded-lg overflow-hidden">
                {isStreaming ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    {showPoseOverlay && (
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ mixBlendMode: 'screen' }}
                      />
                    )}
                    
                    {/* Status Overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        exerciseMetrics.confidence > 70 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        Tracking: {exerciseMetrics.confidence}%
                      </div>
                      
                      {isActive && (
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                          🔴 RECORDING
                        </div>
                      )}
                    </div>

                    {/* Center guidance */}
                    {exerciseMetrics.confidence < 50 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white/80 bg-black/50 p-4 rounded-lg">
                          <Users className="w-8 h-8 mx-auto mb-2" />
                          <p>Position yourself in the center</p>
                          <p className="text-sm">Make sure your full body is visible</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/60">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4" />
                      <p>Camera not active</p>
                      <p className="text-sm">Click "Start Camera" to begin</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex justify-center gap-4 mt-4">
                {!isStreaming ? (
                  <Button onClick={startCamera} className="retro-button">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    {!isActive ? (
                      <Button onClick={startWorkout} className="retro-button">
                        Start Workout
                      </Button>
                    ) : (
                      <Button onClick={completeWorkout} className="retro-button">
                        Complete Workout
                      </Button>
                    )}
                    <Button onClick={stopCamera} variant="secondary">
                      <CameraOff className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Sidebar */}
        <div className="space-y-4">
          {/* Timer */}
          <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {formatTime(duration)}
              </div>
              <p className="text-sm text-muted-foreground">Duration</p>
            </CardContent>
          </Card>

          {/* Rep Counter */}
          <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
            <CardContent className="p-4 text-center">
              <motion.div
                key={exerciseMetrics.reps}
                initial={{ scale: 1.2, color: '#00ff00' }}
                animate={{ scale: 1, color: 'inherit' }}
                className="text-3xl font-bold text-accent mb-2"
              >
                {exerciseMetrics.reps}
              </motion.div>
              <p className="text-sm text-muted-foreground">Reps Detected</p>
            </CardContent>
          </Card>

          {/* Form Score */}
          <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Form Score</span>
                <span className={`text-sm font-bold ${
                  exerciseMetrics.formScore > 80 ? 'text-green-400' :
                  exerciseMetrics.formScore > 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {exerciseMetrics.formScore}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    exerciseMetrics.formScore > 80 ? 'bg-green-400' :
                    exerciseMetrics.formScore > 60 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${exerciseMetrics.formScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Exercise Status */}
          <Card className="bg-black/20 backdrop-blur-sm border border-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  exerciseMetrics.isExercising && isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                }`} />
                <span className="text-sm">
                  {exerciseMetrics.isExercising && isActive ? 'Exercising' : 'Ready'}
                </span>
              </div>
              
              {isActive && exerciseMetrics.formScore > 80 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-green-400 text-xs"
                >
                  <Award className="w-3 h-3" />
                  Perfect Form Bonus!
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Button 
            onClick={resetReps} 
            variant="secondary" 
            className="w-full"
            disabled={!isActive}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Reps
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-sm border border-accent/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-accent mb-2">🎯 AI Tracking Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ensure your full body is visible in the camera frame</li>
            <li>• Maintain good lighting for better tracking accuracy</li>
            <li>• Keep a steady pace for accurate rep counting</li>
            <li>• Higher form scores earn bonus points! 🏆</li>
          </ul>
        </CardContent>
      </Card>

      {/* Loading/Error States */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="bg-black/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
                <p>Loading AI tracking model...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
          >
            <p className="text-red-300">Error: {error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};