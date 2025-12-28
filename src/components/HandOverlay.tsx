import { useRef, useEffect } from 'react';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandData {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
}

interface HandOverlayProps {
  hands: HandData[];
  videoWidth: number;
  videoHeight: number;
}

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17], // Palm
];

export function HandOverlay({ hands, videoWidth, videoHeight }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each hand
    hands.forEach((hand) => {
      const { landmarks } = hand;
      const isLeft = hand.handedness === 'Left';
      
      // Set colors based on hand
      const primaryColor = isLeft ? '#00ffff' : '#a855f7';
      const secondaryColor = isLeft ? 'rgba(0, 255, 255, 0.3)' : 'rgba(168, 85, 247, 0.3)';

      // Draw connections
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      HAND_CONNECTIONS.forEach(([start, end]) => {
        const startLandmark = landmarks[start];
        const endLandmark = landmarks[end];

        ctx.beginPath();
        ctx.moveTo(
          (1 - startLandmark.x) * videoWidth,
          startLandmark.y * videoHeight
        );
        ctx.lineTo(
          (1 - endLandmark.x) * videoWidth,
          endLandmark.y * videoHeight
        );
        ctx.stroke();
      });

      // Draw landmarks
      landmarks.forEach((landmark, index) => {
        const x = (1 - landmark.x) * videoWidth;
        const y = landmark.y * videoHeight;

        // Glow effect
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = secondaryColor;
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        // Highlight fingertips
        if ([4, 8, 12, 16, 20].includes(index)) {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw pinch indicator if thumb and index are close
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const pinchDistance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) +
        Math.pow(thumbTip.y - indexTip.y, 2)
      );

      if (pinchDistance < 0.08) {
        const centerX = (1 - (thumbTip.x + indexTip.x) / 2) * videoWidth;
        const centerY = ((thumbTip.y + indexTip.y) / 2) * videoHeight;

        // Glowing pinch circle
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
        gradient.addColorStop(0, pinchDistance < 0.05 ? 'rgba(0, 255, 255, 0.8)' : 'rgba(0, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        if (pinchDistance < 0.05) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    });

    // Draw line between hands if both detected
    if (hands.length === 2) {
      const hand1Center = getHandCenter(hands[0].landmarks);
      const hand2Center = getHandCenter(hands[1].landmarks);

      const x1 = (1 - hand1Center.x) * videoWidth;
      const y1 = hand1Center.y * videoHeight;
      const x2 = (1 - hand2Center.x) * videoWidth;
      const y2 = hand2Center.y * videoHeight;

      // Dashed line between hands
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Distance indicator
      const distance = Math.sqrt(
        Math.pow(hand1Center.x - hand2Center.x, 2) +
        Math.pow(hand1Center.y - hand2Center.y, 2)
      );
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      ctx.font = '14px Orbitron';
      ctx.fillStyle = '#00ffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${(distance * 100).toFixed(0)}%`, midX, midY - 20);
    }
  }, [hands, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute inset-0 pointer-events-none"
      style={{ transform: 'scaleX(1)' }}
    />
  );
}

function getHandCenter(landmarks: HandLandmark[]): { x: number; y: number } {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  return {
    x: (wrist.x + middleMcp.x) / 2,
    y: (wrist.y + middleMcp.y) / 2,
  };
}
