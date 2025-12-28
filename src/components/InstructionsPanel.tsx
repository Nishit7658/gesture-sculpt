import { useState } from 'react';
import { ChevronDown, ChevronUp, Hand, Fingerprint, Maximize2, X } from 'lucide-react';

export function InstructionsPanel() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute top-6 right-6 w-80">
      <div className="glass rounded-2xl overflow-hidden transition-all duration-300">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
        >
          <span className="font-display text-sm uppercase tracking-wider text-foreground">
            Instructions
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-primary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-5 pb-5 space-y-4">
            {/* Instruction 1 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Hand className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-display text-sm text-foreground mb-1">Show Your Hands</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Position your hands in front of the camera. The system will track up to 2 hands.
                </p>
              </div>
            </div>

            {/* Instruction 2 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-display text-sm text-foreground mb-1">Pinch to Rotate</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Touch thumb and index finger together, then move your hand to rotate the 3D object.
                </p>
              </div>
            </div>

            {/* Instruction 3 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-display text-sm text-foreground mb-1">Two Hands to Scale</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use both hands and move them apart to enlarge or closer together to shrink the object.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                💡 <span className="text-foreground">Tip:</span> Ensure good lighting and keep your hands clearly visible.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
