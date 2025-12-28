import { Hand, Maximize2, RotateCcw, Fingerprint } from 'lucide-react';

interface GestureState {
  isPinching: boolean;
  pinchPosition: { x: number; y: number } | null;
  twoHandDistance: number | null;
  leftHandCenter: { x: number; y: number } | null;
  rightHandCenter: { x: number; y: number } | null;
  handsDetected: number;
}

interface GestureIndicatorProps {
  gestureState: GestureState;
}

export function GestureIndicator({ gestureState }: GestureIndicatorProps) {
  const { isPinching, handsDetected, twoHandDistance } = gestureState;
  const isScaling = handsDetected === 2 && twoHandDistance !== null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
      {/* Hands Detected */}
      <div
        className={`glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
          handsDetected > 0 ? 'glow-primary' : 'opacity-50'
        }`}
      >
        <Hand className={`w-5 h-5 ${handsDetected > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Hands</span>
          <span className="font-display text-lg text-foreground">{handsDetected}</span>
        </div>
      </div>

      {/* Pinch Status */}
      <div
        className={`glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
          isPinching ? 'glow-primary border-primary' : 'opacity-50'
        }`}
      >
        <Fingerprint className={`w-5 h-5 ${isPinching ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Pinch</span>
          <span className="font-display text-lg text-foreground">{isPinching ? 'Active' : 'Ready'}</span>
        </div>
        {isPinching && (
          <RotateCcw className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '2s' }} />
        )}
      </div>

      {/* Scale Status */}
      <div
        className={`glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
          isScaling ? 'glow-secondary border-secondary' : 'opacity-50'
        }`}
      >
        <Maximize2 className={`w-5 h-5 ${isScaling ? 'text-secondary' : 'text-muted-foreground'}`} />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Scale</span>
          <span className="font-display text-lg text-foreground">
            {isScaling ? `${((twoHandDistance || 0) * 200).toFixed(0)}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
