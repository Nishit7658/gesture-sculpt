import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { HandOverlay } from './HandOverlay';
import { Scene3D } from './Scene3D';
import { GestureIndicator } from './GestureIndicator';
import { InstructionsPanel } from './InstructionsPanel';

export function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  const { isLoading, error: trackingError, gestureState, hands } = useHandTracking(videoRef);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraActive(true);
            if (videoRef.current) {
              setVideoDimensions({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight,
              });
            }
          };
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        setCameraError('Camera access denied. Please allow camera permissions.');
      }
    }

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  if (cameraError) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <CameraOff className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display text-xl text-foreground mb-2">Camera Access Required</h2>
          <p className="text-muted-foreground text-sm mb-4">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-display text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid scanline relative overflow-hidden">
      {/* 3D Scene Background */}
      <Scene3D gestureState={gestureState} />

      {/* Camera Feed Container */}
      <div className="absolute top-6 left-6 z-10">
        <div
          ref={containerRef}
          className="relative glass rounded-2xl overflow-hidden glow-primary"
          style={{ width: 320, height: 240 }}
        >
          {/* Loading Overlay */}
          {(isLoading || !isCameraActive) && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {!isCameraActive ? 'Starting camera...' : 'Loading hand tracking...'}
                </p>
              </div>
            </div>
          )}

          {/* Video Feed */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
          />

          {/* Hand Overlay */}
          {isCameraActive && !isLoading && (
            <HandOverlay
              hands={hands}
              videoWidth={320}
              videoHeight={240}
            />
          )}

          {/* Camera Status Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isCameraActive && !isLoading ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-xs text-foreground font-medium">
              {isCameraActive && !isLoading ? 'Live' : 'Initializing'}
            </span>
          </div>

          {/* Hand Count Badge */}
          {isCameraActive && !isLoading && gestureState.handsDetected > 0 && (
            <div className="absolute top-3 right-3 glass px-3 py-1.5 rounded-full flex items-center gap-2">
              <Camera className="w-3 h-3 text-primary" />
              <span className="text-xs text-foreground font-display">
                {gestureState.handsDetected} {gestureState.handsDetected === 1 ? 'Hand' : 'Hands'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions Panel */}
      <InstructionsPanel />

      {/* Gesture Indicators */}
      <GestureIndicator gestureState={gestureState} />

      {/* Title */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="font-display text-3xl md:text-4xl text-foreground glow-text tracking-wider">
          GESTURE SCULPT
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Control 3D objects with your hands</p>
      </div>

      {/* Error Toast */}
      {trackingError && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-lg border border-destructive/50">
          <p className="text-sm text-destructive">{trackingError}</p>
        </div>
      )}
    </div>
  );
}
