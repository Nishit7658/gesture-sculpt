import { useEffect, useRef, useState, useCallback } from 'react';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandData {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
}

interface GestureState {
  isPinching: boolean;
  pinchPosition: { x: number; y: number } | null;
  twoHandDistance: number | null;
  leftHandCenter: { x: number; y: number } | null;
  rightHandCenter: { x: number; y: number } | null;
  handsDetected: number;
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement>) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    isPinching: false,
    pinchPosition: null,
    twoHandDistance: null,
    leftHandCenter: null,
    rightHandCenter: null,
    handsDetected: 0,
  });
  const [hands, setHands] = useState<HandData[]>([]);
  
  const handLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const lastResultsRef = useRef<any>(null);

  // Smoothing for gesture detection
  const smoothedGestureRef = useRef<GestureState>({
    isPinching: false,
    pinchPosition: null,
    twoHandDistance: null,
    leftHandCenter: null,
    rightHandCenter: null,
    handsDetected: 0,
  });

  const calculatePinch = useCallback((landmarks: HandLandmark[]): boolean => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    return distance < 0.05; // Threshold for pinch detection
  }, []);

  const getHandCenter = useCallback((landmarks: HandLandmark[]): { x: number; y: number } => {
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    return {
      x: (wrist.x + middleMcp.x) / 2,
      y: (wrist.y + middleMcp.y) / 2,
    };
  }, []);

  const smoothValue = useCallback((current: number, target: number, factor: number = 0.3): number => {
    return current + (target - current) * factor;
  }, []);

  const initializeHandTracking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Dynamic import for MediaPipe
      const vision = await import('@mediapipe/tasks-vision');
      const { HandLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize hand tracking:', err);
      setError('Failed to initialize hand tracking. Please refresh and try again.');
      setIsLoading(false);
    }
  }, []);

  const detectHands = useCallback(() => {
    if (!handLandmarkerRef.current || !videoRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const startTimeMs = performance.now();
    const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);
    lastResultsRef.current = results;

    if (results.landmarks && results.landmarks.length > 0) {
      const handDataArray: HandData[] = results.landmarks.map((landmarks: HandLandmark[], index: number) => ({
        landmarks,
        handedness: results.handednesses?.[index]?.[0]?.categoryName || 'Right',
      }));

      setHands(handDataArray);

      // Process gestures
      let newGestureState: GestureState = {
        isPinching: false,
        pinchPosition: null,
        twoHandDistance: null,
        leftHandCenter: null,
        rightHandCenter: null,
        handsDetected: handDataArray.length,
      };

      // Find left and right hands
      const leftHand = handDataArray.find(h => h.handedness === 'Left');
      const rightHand = handDataArray.find(h => h.handedness === 'Right');

      if (leftHand) {
        newGestureState.leftHandCenter = getHandCenter(leftHand.landmarks);
      }
      if (rightHand) {
        newGestureState.rightHandCenter = getHandCenter(rightHand.landmarks);
      }

      // Check for pinch on either hand
      for (const hand of handDataArray) {
        if (calculatePinch(hand.landmarks)) {
          newGestureState.isPinching = true;
          const thumbTip = hand.landmarks[4];
          const indexTip = hand.landmarks[8];
          newGestureState.pinchPosition = {
            x: (thumbTip.x + indexTip.x) / 2,
            y: (thumbTip.y + indexTip.y) / 2,
          };
          break;
        }
      }

      // Calculate two-hand distance for scaling
      if (leftHand && rightHand && newGestureState.leftHandCenter && newGestureState.rightHandCenter) {
        const distance = Math.sqrt(
          Math.pow(newGestureState.leftHandCenter.x - newGestureState.rightHandCenter.x, 2) +
          Math.pow(newGestureState.leftHandCenter.y - newGestureState.rightHandCenter.y, 2)
        );
        
        // Smooth the distance
        const prevDistance = smoothedGestureRef.current.twoHandDistance;
        newGestureState.twoHandDistance = prevDistance 
          ? smoothValue(prevDistance, distance, 0.2)
          : distance;
      }

      smoothedGestureRef.current = newGestureState;
      setGestureState(newGestureState);
    } else {
      setHands([]);
      setGestureState({
        isPinching: false,
        pinchPosition: null,
        twoHandDistance: null,
        leftHandCenter: null,
        rightHandCenter: null,
        handsDetected: 0,
      });
    }

    animationFrameRef.current = requestAnimationFrame(detectHands);
  }, [videoRef, calculatePinch, getHandCenter, smoothValue]);

  useEffect(() => {
    initializeHandTracking();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeHandTracking]);

  useEffect(() => {
    if (!isLoading && !error && videoRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoading, error, detectHands, videoRef]);

  return {
    isLoading,
    error,
    gestureState,
    hands,
  };
}
