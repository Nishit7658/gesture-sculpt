import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, ContactShadows, MeshTransmissionMaterial } from '@react-three/drei';
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

function ComplexSculpture({ gestureState, previousPinchPosition, previousDistance }: AnimatedObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerTorusRef = useRef<THREE.Mesh>(null);
  const innerIcosahedronRef = useRef<THREE.Mesh>(null);
  const coreSphereRef = useRef<THREE.Mesh>(null);
  
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetScale = useRef(2); // Start larger

  // Color shifting parameters
  const colorShift = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

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
      targetRotation.current.y += delta * 0.2;
      targetRotation.current.x += delta * 0.1;
    }

    // Handle scale via two-hand distance
    if (gestureState.twoHandDistance !== null && gestureState.handsDetected === 2) {
      if (previousDistance.current !== null) {
        const distanceChange = gestureState.twoHandDistance - previousDistance.current;
        targetScale.current += distanceChange * 4;
        targetScale.current = Math.max(0.5, Math.min(5, targetScale.current)); // Allow much larger
      }
      previousDistance.current = gestureState.twoHandDistance;
    } else {
      previousDistance.current = null;
    }

    // Smooth interpolation for main group
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.1;
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.1;
    groupRef.current.scale.setScalar(
      groupRef.current.scale.x + (targetScale.current - groupRef.current.scale.x) * 0.1
    );

    // Individual part animations
    const t = state.clock.elapsedTime;
    colorShift.current = t * 0.2;
    
    if (outerTorusRef.current) {
      outerTorusRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      outerTorusRef.current.rotation.y = t * 0.3;
    }
    
    if (innerIcosahedronRef.current) {
      innerIcosahedronRef.current.rotation.y = -t * 0.5;
      innerIcosahedronRef.current.rotation.z = Math.sin(t * 0.3) * 0.3;
      
      // Update color for inner object to create a shifting effect
      const material = innerIcosahedronRef.current.material as THREE.MeshPhysicalMaterial;
      if (material.color) {
        material.color.setHSL((colorShift.current + 0.3) % 1, 0.8, 0.6);
      }
    }

    if (coreSphereRef.current) {
      // Core pulsing
      const pulse = 1 + Math.sin(t * 2) * 0.1;
      coreSphereRef.current.scale.setScalar(pulse);
      
      const material = coreSphereRef.current.material as THREE.MeshPhysicalMaterial;
      if (material.color) {
        material.color.setHSL(colorShift.current % 1, 1, 0.5);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef}>
        {/* Shape 1: Outer Torus Knot (Glassy/Metallic) */}
        <mesh ref={outerTorusRef}>
          <torusKnotGeometry args={[1.2, 0.15, 128, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={1}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[100, 400]}
            clearcoat={1}
            roughness={0.1}
          />
        </mesh>

        {/* Shape 2: Inner Icosahedron (Color Shifting) */}
        <mesh ref={innerIcosahedronRef}>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshPhysicalMaterial
            roughness={0.2}
            metalness={0.8}
            wireframe={true}
            emissive="#1a1a1a"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Shape 3: Core Sphere (Glowing solid) */}
        <mesh ref={coreSphereRef}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshPhysicalMaterial
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
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
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4338ca" />
        <spotLight
          position={[0, 10, 5]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          color="#818cf8"
        />
        
        <ComplexSculpture
          gestureState={gestureState}
          previousPinchPosition={previousPinchPosition}
          previousDistance={previousDistance}
        />
        
        {/* Adds a nice shadow on the floor for realism */}
        <ContactShadows 
          position={[0, -3, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={4} 
        />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
