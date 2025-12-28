import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface GestureState {
  isPinching: boolean;
  pinchPosition: { x: number; y: number } | null;
  twoHandDistance: number | null;
  leftHandCenter: { x: number; y: number } | null;
  rightHandCenter: { x: number; y: number } | null;
  handsDetected: number;
}

interface AnimatedObjectProps {
  gestureState: GestureState;
  previousPinchPosition: React.MutableRefObject<{ x: number; y: number } | null>;
  previousDistance: React.MutableRefObject<number | null>;
}

function AnimatedObject({ gestureState, previousPinchPosition, previousDistance }: AnimatedObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Handle rotation via pinch gesture
    if (gestureState.isPinching && gestureState.pinchPosition) {
      if (previousPinchPosition.current) {
        const deltaX = (gestureState.pinchPosition.x - previousPinchPosition.current.x) * 5;
        const deltaY = (gestureState.pinchPosition.y - previousPinchPosition.current.y) * 5;
        targetRotation.current.y -= deltaX;
        targetRotation.current.x += deltaY;
      }
      previousPinchPosition.current = { ...gestureState.pinchPosition };
    } else {
      previousPinchPosition.current = null;
      // Auto-rotate when not pinching
      targetRotation.current.y += delta * 0.3;
    }

    // Handle scale via two-hand distance
    if (gestureState.twoHandDistance !== null && gestureState.handsDetected === 2) {
      if (previousDistance.current !== null) {
        const distanceChange = gestureState.twoHandDistance - previousDistance.current;
        targetScale.current += distanceChange * 3;
        targetScale.current = Math.max(0.3, Math.min(3, targetScale.current));
      }
      previousDistance.current = gestureState.twoHandDistance;
    } else {
      previousDistance.current = null;
    }

    // Smooth interpolation
    meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.1;
    meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.1;
    meshRef.current.scale.setScalar(
      meshRef.current.scale.x + (targetScale.current - meshRef.current.scale.x) * 0.1
    );
  });

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} geometry={geometry}>
        <MeshDistortMaterial
          color="#00ffff"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh ref={meshRef} geometry={geometry} scale={1.02}>
        <meshBasicMaterial
          color="#a855f7"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
}

function GlowRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2, 0.02, 16, 100]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
    </mesh>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesCount = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00ffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

interface Scene3DProps {
  gestureState: GestureState;
}

export function Scene3D({ gestureState }: Scene3DProps) {
  const previousPinchPosition = useRef<{ x: number; y: number } | null>(null);
  const previousDistance = useRef<number | null>(null);

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#00ffff"
        />
        
        <AnimatedObject
          gestureState={gestureState}
          previousPinchPosition={previousPinchPosition}
          previousDistance={previousDistance}
        />
        <GlowRing />
        <ParticleField />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
