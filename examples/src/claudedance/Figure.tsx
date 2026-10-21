import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT_F, beatPulse, theme } from "./theme";

// Every joint angle comes from the frame number — no useFrame, no clock.

type Pose = {
  hipX: number; hipDip: number; hipTurn: number; spin: number;
  torsoZ: number; torsoY: number; headZ: number;
  armLZ: number; armRZ: number; armLX: number; armRX: number;
  foreL: number; foreR: number;
  thighL: number; thighR: number; shinL: number; shinR: number;
  lean: number;
};

const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => (out[k] = a[k] + (b[k] - a[k]) * t));
  return out;
};

// A: side-step with alternating arm pumps
const poseA = (b: number): Pose => {
  const dip = 1 - Math.abs(Math.sin(Math.PI * b));
  const side = Math.sin(Math.PI * b);
  return {
    hipX: side * 0.18, hipDip: dip, hipTurn: side * 0.15, spin: 0,
    torsoZ: -side * 0.12, torsoY: side * 0.2, headZ: side * 0.22,
    armLZ: 0.35 + 1.7 * Math.sin((Math.PI * b) / 2) ** 2,
    armRZ: 0.35 + 1.7 * Math.cos((Math.PI * b) / 2) ** 2,
    armLX: 0, armRX: 0,
    foreL: 0.5 + 0.6 * Math.cos((Math.PI * b) / 2) ** 2,
    foreR: 0.5 + 0.6 * Math.sin((Math.PI * b) / 2) ** 2,
    thighL: -0.45 * dip + Math.max(0, side) * 0.35, thighR: -0.45 * dip + Math.max(0, -side) * 0.35,
    shinL: 0.9 * dip, shinR: 0.9 * dip,
    lean: 0,
  };
};

// B: arms up, wave, twist
const poseB = (b: number): Pose => {
  const dip = 1 - Math.abs(Math.sin(Math.PI * b));
  const w = Math.sin(2 * Math.PI * b * 0.5);
  return {
    hipX: Math.sin(Math.PI * b * 0.5) * 0.12, hipDip: dip, hipTurn: 0, spin: 0,
    torsoZ: w * 0.18, torsoY: Math.sin((Math.PI * b) / 2) * 0.45, headZ: -w * 0.25,
    armLZ: 2.55 + w * 0.25, armRZ: 2.55 - w * 0.25, armLX: 0, armRX: 0,
    foreL: 0.5 * Math.sin(2 * Math.PI * b * 0.5 + 0.8), foreR: 0.5 * Math.sin(2 * Math.PI * b * 0.5 + 0.8),
    thighL: -0.4 * dip, thighR: -0.4 * dip, shinL: 0.8 * dip, shinR: 0.8 * dip,
    lean: 0,
  };
};

// C: final pose — point to the sky, hand on hip
const poseC = (b: number): Pose => {
  const breathe = Math.sin(b * 1.2) * 0.04;
  return {
    hipX: 0.1, hipDip: 0.25, hipTurn: -0.25, spin: 0,
    torsoZ: -0.12 + breathe, torsoY: -0.2, headZ: 0.18,
    armLZ: 0.9, armRZ: 2.75 - breathe, armLX: 0, armRX: 0.25,
    foreL: -1.9, foreR: 0.05,
    thighL: -0.2, thighR: 0.25, shinL: 0.3, shinR: 0.05,
    lean: 0.08,
  };
};

const Mat: React.FC<{ c: string; gloss?: boolean }> = ({ c, gloss }) =>
  gloss ? (
    <meshPhysicalMaterial color={c} roughness={0.32} clearcoat={1} clearcoatRoughness={0.15} />
  ) : (
    <meshStandardMaterial color={c} roughness={0.55} />
  );

const Limb: React.FC<{ len: number; r: number; color: string }> = ({ len, r, color }) => (
  <mesh castShadow position={[0, -len / 2, 0]}>
    <capsuleGeometry args={[r, len - 2 * r, 8, 16]} />
    <Mat c={color} gloss />
  </mesh>
);

// Claude's starburst as the head: tapered rays radiating from a disc, pulsing on the beat
const SparkHead: React.FC<{ pulse: number; spin: number; blink: number }> = ({ pulse, spin, blink }) => {
  const rays = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        a: (i / 12) * Math.PI * 2 + (i % 2) * 0.06,
        len: [0.5, 0.38, 0.46, 0.34, 0.52, 0.4, 0.48, 0.36, 0.5, 0.42, 0.45, 0.37][i],
      })),
    []
  );
  return (
    <group>
      <group rotation={[0, 0, spin]}>
        {rays.map((r, i) => {
          const len = r.len * (1 + 0.28 * pulse * (i % 2 ? 0.6 : 1));
          return (
            <group key={i} rotation={[0, 0, r.a]}>
              <mesh castShadow position={[0, 0.26 + len / 2, 0]}>
                <coneGeometry args={[0.085, len, 12]} />
                <Mat c={theme.color.orange} gloss />
              </mesh>
            </group>
          );
        })}
      </group>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.24, 40]} />
        <Mat c={theme.color.orange} gloss />
      </mesh>
      {/* face plate + eyes */}
      <mesh position={[0, 0, 0.121]}>
        <circleGeometry args={[0.27, 40]} />
        <meshStandardMaterial color={theme.color.cream} roughness={0.4} />
      </mesh>
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 0.03, 0.13]} scale={[1, Math.max(0.12, 1 - blink), 1]}>
          <capsuleGeometry args={[0.032, 0.06, 4, 10]} />
          <meshStandardMaterial color={theme.color.ink} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, -0.09, 0.13]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.06, 0.016, 8, 20, Math.PI]} />
        <meshStandardMaterial color={theme.color.ink} />
      </mesh>
    </group>
  );
};

export const Figure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = frame / BEAT_F;

  // crossfade between dance sections (6-frame blends)
  const ab = interpolate(frame, [72, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bc = interpolate(frame, [117, 125], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out,
  });
  const p = lerpPose(lerpPose(poseA(b), poseB(b), ab), poseC(frame / fps), bc);

  // a full spin during the stutter section, eased
  const spin = interpolate(frame, [90, 108], [0, Math.PI * 2], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut,
  });
  const pulse = beatPulse(frame, 4.5);
  const blinkF = [44, 100, 136].map((f) => Math.max(0, 1 - Math.abs(frame - f) / 2.5));
  const blink = Math.max(...blinkF);

  const O = theme.color.orange;
  const C = theme.color.cream;
  const D = theme.color.inkSoft;

  return (
    <group position={[p.hipX, 1.12 - p.hipDip * 0.14, 0]} rotation={[0, p.hipTurn + spin, p.lean]}>
      {/* pelvis */}
      <mesh castShadow scale={[1.05, 0.7, 0.85]}>
        <sphereGeometry args={[0.3, 24, 16]} />
        <Mat c={D} />
      </mesh>
      {/* legs */}
      {([[-0.17, p.thighL, p.shinL], [0.17, p.thighR, p.shinR]] as const).map(([x, th, sh]) => (
        <group key={x} position={[x, -0.08, 0]} rotation={[th, 0, 0]}>
          <Limb len={0.5} r={0.12} color={D} />
          <group position={[0, -0.5, 0]} rotation={[sh, 0, 0]}>
            <Limb len={0.46} r={0.11} color={D} />
            <mesh castShadow position={[0, -0.48, 0.07]} scale={[1, 0.55, 1.5]}>
              <sphereGeometry args={[0.13, 16, 12]} />
              <Mat c={O} gloss />
            </mesh>
          </group>
        </group>
      ))}
      {/* torso */}
      <group position={[0, 0.12, 0]} rotation={[0, p.torsoY, p.torsoZ]}>
        <mesh castShadow position={[0, 0.42, 0]}>
          <capsuleGeometry args={[0.36, 0.42, 10, 24]} />
          <Mat c={O} gloss />
        </mesh>
        {/* belly badge */}
        <mesh position={[0, 0.38, 0.33]} scale={[1, 1.2, 0.35]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color={C} roughness={0.4} emissive={theme.color.glow} emissiveIntensity={0.25 * pulse} />
        </mesh>
        {/* arms */}
        {([[-1, p.armLZ, p.armLX, p.foreL], [1, p.armRZ, p.armRX, p.foreR]] as const).map(([s, z, x, fo]) => (
          <group key={s} position={[s * 0.44, 0.74, 0]} rotation={[x, 0, s * z]}>
            <mesh castShadow>
              <sphereGeometry args={[0.13, 16, 12]} />
              <Mat c={O} gloss />
            </mesh>
            <Limb len={0.42} r={0.1} color={O} />
            <group position={[0, -0.42, 0]} rotation={[0, 0, s * fo]}>
              <Limb len={0.38} r={0.09} color={O} />
              <mesh castShadow position={[0, -0.42, 0]}>
                <sphereGeometry args={[0.12, 16, 12]} />
                <Mat c={C} />
              </mesh>
            </group>
          </group>
        ))}
        {/* neck + head */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.16, 12]} />
          <Mat c={D} />
        </mesh>
        <group position={[0, 1.28, 0]} rotation={[0, 0, p.headZ]}>
          <SparkHead pulse={pulse} spin={frame * 0.02} blink={blink} />
        </group>
      </group>
    </group>
  );
};
