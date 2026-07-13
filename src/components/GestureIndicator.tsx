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
    <div className="flex gap-4">
      {/* Hands Detected */}
      <div
        className={`glass-panel rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
          handsDetected > 0 ? 'bg-white/5 border-white/10' : 'opacity-40'
        }`}
      >
        <div className={`p-2 rounded-lg ${handsDetected > 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-muted-foreground'}`}>
          <Hand className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Hands</span>
          <span className="font-medium text-base text-foreground leading-none mt-0.5">{handsDetected}</span>
        </div>
      </div>

      {/* Pinch Status */}
      <div
        className={`glass-panel rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
          isPinching ? 'bg-emerald-500/10 border-emerald-500/20' : 'opacity-40'
        }`}
      >
        <div className={`p-2 rounded-lg ${isPinching ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-muted-foreground'}`}>
          <Fingerprint className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Pinch</span>
          <span className="font-medium text-base text-foreground leading-none mt-0.5">{isPinching ? 'Active' : 'Ready'}</span>
        </div>
        {isPinching && (
          <RotateCcw className="w-4 h-4 text-emerald-400 animate-spin ml-2" style={{ animationDuration: '2s' }} />
        )}
      </div>

      {/* Scale Status */}
      <div
        className={`glass-panel rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
          isScaling ? 'bg-amber-500/10 border-amber-500/20' : 'opacity-40'
        }`}
      >
        <div className={`p-2 rounded-lg ${isScaling ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-muted-foreground'}`}>
          <Maximize2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Scale</span>
          <span className="font-medium text-base text-foreground leading-none mt-0.5">
            {isScaling ? `${((twoHandDistance || 0) * 200).toFixed(0)}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
