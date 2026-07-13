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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <CameraOff className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-3 tracking-tight">Camera Access Required</h2>
          <p className="text-muted-foreground text-sm mb-6">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      {/* 3D Scene Background */}
      <Scene3D gestureState={gestureState} />

      {/* Header / Title */}
      <div className="absolute top-8 w-full pointer-events-none z-10 flex justify-center">
        <div className="glass-panel px-6 py-3 rounded-full flex flex-col items-center">
          <h1 className="text-sm font-semibold tracking-widest uppercase text-foreground/90">
            Gesture Sculpt Pro
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Spatial Interface Studio</p>
        </div>
      </div>

      {/* Camera Feed Container */}
      <div className="absolute top-8 left-8 z-10">
        <div
          ref={containerRef}
          className="relative glass-panel rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-primary/5"
          style={{ width: 280, height: 210 }}
        >
          {/* Loading Overlay */}
          {(isLoading || !isCameraActive) && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
              <Loader2 className="w-6 h-6 text-foreground/50 animate-spin mb-3" />
              <p className="text-xs font-medium text-muted-foreground">
                {!isCameraActive ? 'Starting camera...' : 'Initializing tracking...'}
              </p>
            </div>
          )}

          {/* Video Feed */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover opacity-80 mix-blend-screen"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
          />

          {/* Hand Overlay */}
          {isCameraActive && !isLoading && (
            <HandOverlay
              hands={hands}
              videoWidth={280}
              videoHeight={210}
            />
          )}

          {/* Status Indicators overlaid on video */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-end">
              {isCameraActive && !isLoading && gestureState.handsDetected > 0 && (
                <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                  <Camera className="w-3 h-3 text-white/70" />
                  <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">
                    {gestureState.handsDetected} {gestureState.handsDetected === 1 ? 'Hand' : 'Hands'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-start">
              <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-2 border border-white/10">
                <div className={`w-1.5 h-1.5 rounded-full ${isCameraActive && !isLoading ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">
                  {isCameraActive && !isLoading ? 'Tracking Live' : 'Standby'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Panel */}
      <div className="absolute bottom-8 right-8 z-10">
        <InstructionsPanel />
      </div>

      {/* Gesture Indicators */}
      <div className="absolute bottom-8 left-8 z-10">
        <GestureIndicator gestureState={gestureState} />
      </div>

      {/* Error Toast */}
      {trackingError && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-panel bg-destructive/10 border-destructive/20 px-4 py-2.5 rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <p className="text-xs font-medium text-destructive-foreground">{trackingError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
