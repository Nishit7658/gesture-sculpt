import { useState } from 'react';
import { ChevronDown, ChevronUp, Hand, Fingerprint, Maximize2, X } from 'lucide-react';

export function InstructionsPanel() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-72">
      <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-foreground/80">
            Instructions
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-foreground/50" />
          ) : (
            <ChevronDown className="w-4 h-4 text-foreground/50" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-5 pb-5 space-y-4">
            {/* Instruction 1 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <Hand className="w-4 h-4 text-foreground/70" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Show Your Hands</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Position your hands in front of the camera. The system tracks up to 2 hands.
                </p>
              </div>
            </div>

            {/* Instruction 2 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <Fingerprint className="w-4 h-4 text-foreground/70" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Pinch to Rotate</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Touch thumb and index finger together, then move your hand to rotate the 3D object.
                </p>
              </div>
            </div>

            {/* Instruction 3 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <Maximize2 className="w-4 h-4 text-foreground/70" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Two Hands to Scale</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use both hands and move them apart to enlarge or closer together to shrink the object.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground/70 font-medium">Tip:</span> Ensure good lighting and keep your hands clearly visible.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
