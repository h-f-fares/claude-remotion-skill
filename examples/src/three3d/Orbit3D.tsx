import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const ORBIT_TOTAL_S = 5;

// Remotion rule: never use r3f's useFrame — every transform derives from useCurrentFrame,
// so any frame renders identically in isolation.

const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, mass: 0.9 } });
  const t = frame / fps;
  return (
    <mesh
      castShadow
      scale={pop * 0.95}
      rotation={[t * 0.6, t * 0.9, 0]}
      position={[0, 0.35 + Math.sin(t * 1.6) * 0.08, 0]}
    >
      <torusKnotGeometry args={[1, 0.32, 256, 48]} />
      <meshPhysicalMaterial
        color="#ff6a3d"
        metalness={0.25}
        roughness={0.18}
        clearcoat={1}
        clearcoatRoughness={0.08}
      />
    </mesh>
  );
};

const Satellites: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        r: 2.6 + (i % 3) * 0.35,
        phase: (i / 9) * Math.PI * 2,
        y: ((i % 4) - 1.5) * 0.45,
        size: 0.1 + (i % 3) * 0.05,
        color: ["#7ad7ff", "#ffd36b", "#c59bff"][i % 3],
      })),
    []
  );
  const t = frame / fps;
  return (
    <group rotation={[0.35, 0, 0]}>
      {items.map((s, i) => {
        // staggered entrance: 3 frames apart
        const p = spring({ frame: frame - 8 - i * 3, fps, config: { damping: 12 } });
        const a = s.phase + t * 0.7;
        return (
          <mesh key={i} castShadow position={[Math.cos(a) * s.r, s.y, Math.sin(a) * s.r]} scale={p}>
            <sphereGeometry args={[s.size, 32, 16]} />
            <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.35} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// The camera follows the timeline too: slow eased push-in plus a small truck.
const CameraDriver: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const z = interpolate(frame, [0, durationInFrames], [9, 7.6], {
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });
  const x = interpolate(frame, [0, durationInFrames], [-0.6, 0.6]);
  camera.position.set(x, 0.8, z);
  camera.lookAt(0, -0.2, 0);
  return null;
};

const Scene: React.FC = () => (
  <>
    <color attach="background" args={["#0b0d14"]} />
    <fog attach="fog" args={["#0b0d14", 7, 14]} />
    {/* three-point rig: warm key, cool rim, low hemisphere fill */}
    <hemisphereLight args={["#9fb4ff", "#1a1020", 0.5]} />
    <directionalLight
      castShadow
      position={[4, 6, 5]}
      intensity={2.4}
      color="#ffe2c4"
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-5, 2, -4]} intensity={1.6} color="#6fb8ff" />
    <pointLight position={[0, -2, 3]} intensity={6} distance={8} color="#ff4f7a" />
    <CameraDriver />
    <Hero />
    <Satellites />
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
      <circleGeometry args={[9, 64]} />
      <meshStandardMaterial color="#141826" roughness={0.9} />
    </mesh>
  </>
);

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
      <div
        style={{
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 800,
          fontSize: 84,
          textShadow: "0 6px 30px rgba(0,0,0,0.6)",
          letterSpacing: -2,
          color: "#f4f1ea",
          opacity: p,
          transform: `translateY(${(1 - p) * 40}px)`,
        }}
      >
        Remotion × three.js
      </div>
    </AbsoluteFill>
  );
};

export const Orbit3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d14" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{ fov: 40, position: [0, 0.8, 8.5] }}
        gl={{ antialias: true }}
      >
        <Scene />
      </ThreeCanvas>
      <Title />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />
    </AbsoluteFill>
  );
};
