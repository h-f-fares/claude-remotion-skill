import React, { createContext, useContext } from "react";
import type { Plane } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { extend } from "@react-three/fiber";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT_F, beatPulse, theme } from "./theme";

extend({ RoundedBoxGeometry });
declare module "@react-three/fiber" {
  interface ThreeElements {
    roundedBoxGeometry: { args?: [number, number, number, number?, number?] };
  }
}

// Clawd, the Claude Code mascot, matched to the 3D-printed figure: a solid matte block,
// two black slit eyes, stubby side arms, four thin legs in front and four behind.
// Pixel grid for the flat 2D version (from the terminal art ▐▛███▜▌ / ▝▜█████▛▘ / ▘▘ ▝▝):
export const CLAWD_GRID = {
  body: [
    [0, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
    [1, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
    [2, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
    [3, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
  ] as [number, number[]][],
  eyes: [5, 12], // row 1
  armsL: [1, 2], // row 2
  armsR: [15, 16],
  legs: [4, 6, 11, 13], // row 4
};

// proportions measured off the reference photos
const W = 2.4; // body width
const H = 1.6; // body height (≈ 0.67 W)
const D = 1.25; // body depth
const LEG_H = 0.42;
const LEG_W = 0.17;
const LEG_X = [-0.82, -0.4, 0.4, 0.82];
const ARM = { out: 0.32, h: 0.4, d: 0.6, y: LEG_H + H * 0.42 };
const EYE = { x: 0.42, y: LEG_H + H * 0.58, w: 0.13, h: 0.32 };

// how this copy of Clawd renders: the hero, a floor reflection, or a motion-smear ghost
type Look = { opacity: number; shadows: boolean; clip?: Plane[]; color?: string; gloss?: boolean };
const LookCtx = createContext<Look>({ opacity: 1, shadows: true });

const Plastic: React.FC = () => {
  const { opacity, clip, color, gloss } = useContext(LookCtx);
  // gloss: a lacquered toy (clearcoat) instead of the matte printed figure
  return gloss ? (
    <meshPhysicalMaterial
      clippingPlanes={clip}
      color={color ?? theme.color.clawd}
      roughness={0.42}
      clearcoat={0.4}
      clearcoatRoughness={0.3}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity >= 1}
    />
  ) : (
    <meshStandardMaterial
      clippingPlanes={clip}
      color={color ?? theme.color.clawd}
      roughness={0.62}
      metalness={0}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity >= 1}
    />
  );
};
const Ink: React.FC = () => {
  const { opacity, clip } = useContext(LookCtx);
  return <meshStandardMaterial clippingPlanes={clip} color="#111111" roughness={0.35} transparent={opacity < 1} opacity={opacity} />;
};

const Block: React.FC<{ size: [number, number, number]; r?: number; position?: [number, number, number] }> = ({
  size, r = 0.035, position,
}) => {
  const { shadows } = useContext(LookCtx);
  return (
    <mesh castShadow={shadows} receiveShadow={shadows} position={position}>
      <roundedBoxGeometry args={[...size, 3, r]} />
      <Plastic />
    </mesh>
  );
};

// "> <" happy squint, built from two thin bars per eye; dir points the tip
const Chevron: React.FC<{ dir: 1 | -1 }> = ({ dir }) => (
  <group>
    {[1, -1].map((s) => (
      <mesh key={s} position={[0, s * 0.072, 0]} rotation={[0, 0, s * dir * -0.62]}>
        <boxGeometry args={[0.22, 0.075, 0.03]} />
        <Ink />
      </mesh>
    ))}
  </group>
);

// Every motion derives from the frame number — no useFrame, no clock.
type Pose = { hop: number; sway: number; tilt: number; twist: number; armL: number; armR: number; legL: number; legR: number };
const lerp = (a: Pose, b: Pose, t: number) => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => (o[k] = a[k] + (b[k] - a[k]) * t));
  return o;
};

// A: hop on every beat, arms pump alternately, legs step side to side
const poseA = (b: number): Pose => {
  const side = Math.sin(Math.PI * b);
  return {
    hop: Math.abs(side) * 0.22,
    sway: side * 0.18,
    tilt: -side * 0.12,
    twist: side * 0.28,
    armL: 0.9 * Math.max(0, side) - 0.2,
    armR: 0.9 * Math.max(0, -side) - 0.2,
    legL: Math.max(0, side),
    legR: Math.max(0, -side),
  };
};
// B: double-time arm flaps, bigger twist
const poseB = (b: number): Pose => {
  const flap = Math.sin(2 * Math.PI * b);
  return {
    hop: Math.abs(Math.sin(Math.PI * b)) * 0.3,
    sway: 0,
    tilt: Math.sin(Math.PI * b) * 0.1,
    twist: Math.sin((Math.PI * b) / 2) * 0.6,
    armL: 0.55 + 0.6 * flap,
    armR: 0.55 + 0.6 * flap,
    legL: Math.max(0, flap) * 0.6,
    legR: Math.max(0, -flap) * 0.6,
  };
};
// C: victory pose — arms up, one side kicked, gentle breathing
const poseC = (t: number): Pose => ({
  hop: 0.02 + Math.sin(t * 2.4) * 0.02,
  sway: 0,
  tilt: 0.1,
  twist: -0.2,
  armL: 1.3 + Math.sin(t * 3) * 0.1,
  armR: 1.3 - Math.sin(t * 3) * 0.1,
  legL: 0,
  legR: 0.6,
});

export const Clawd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = frame / BEAT_F;

  const ab = interpolate(frame, [72, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bc = interpolate(frame, [117, 125], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out,
  });
  const p = lerp(lerp(poseA(b), poseB(b), ab), poseC(frame / fps), bc);

  // a full spin during the stutter section, and a big jump into the outro
  const spin = interpolate(frame, [90, 108], [0, Math.PI * 2], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut,
  });
  const jumpT = interpolate(frame, [114, 126], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jump = Math.sin(Math.PI * jumpT) * 0.9;

  // squash on landing (every beat), stretch in the air
  const land = beatPulse(frame, 3) * (1 - bc * 0.8);
  const sx = 1 + land * 0.08;
  const sy = 1 - land * 0.12 + p.hop * 0.2;

  const blink = Math.max(...[44, 100].map((f) => Math.max(0, 1 - Math.abs(frame - f) / 2.5)));
  // happy "> <" face on the close-up's second beat and through the outro pose
  const happy = (frame >= 67 && frame < 75) || frame >= 124;

  return (
    <ClawdModel
      rig={{
        pos: [p.sway, p.hop + jump, 0],
        rot: [0, p.twist + spin, p.tilt],
        sx, sy,
        armL: p.armL, armR: p.armR,
        legL: { lift: p.legL, tip: -p.legL * 0.45, slide: 0, kick: 0 },
        legR: { lift: p.legR, tip: -p.legR * 0.45, slide: 0, kick: 0 },
        blink, happy,
      }}
    />
  );
};

export type LegRig = { lift: number; tip: number; slide: number; kick: number; stretch?: number };
export type ClawdRig = {
  pos: [number, number, number];
  rot: [number, number, number];
  lean?: number; // pitch around the feet in Clawd's own frame (+ = forward)
  sx: number;
  sy: number;
  armL: number; // radians up from resting
  armR: number;
  legL: LegRig; // the two left leg columns (front + back rows)
  legR: LegRig;
  blink: number; // 0 open → 1 shut
  happy: boolean; // "> <" eyes
};

const NO_LEG: LegRig = { lift: 0, tip: 0, slide: 0, kick: 0 };
export const restRig = (): ClawdRig => ({
  pos: [0, 0, 0], rot: [0, 0, 0], sx: 1, sy: 1, armL: -0.2, armR: -0.2,
  legL: { ...NO_LEG }, legR: { ...NO_LEG }, blink: 0, happy: false,
});

// Pure model: draws Clawd from a rig. Origin is between the feet, so lean and squash pivot on the floor.
export const ClawdModel: React.FC<{ rig: ClawdRig; opacity?: number; shadows?: boolean; clip?: Plane[]; color?: string; gloss?: boolean }> = ({
  rig, opacity = 1, shadows = true, clip, color, gloss,
}) => (
  <LookCtx.Provider value={{ opacity, shadows, clip, color, gloss }}>
  <group position={rig.pos} rotation={rig.rot}>
    <group rotation={[rig.lean ?? 0, 0, 0]} scale={[rig.sx, rig.sy, rig.sx]}>
      <Block size={[W, H, D]} r={0.05} position={[0, LEG_H + H / 2, 0]} />
      {/* eyes sit just proud of the front face */}
      {([-1, 1] as const).map((s) =>
        rig.happy ? (
          <group key={s} position={[s * EYE.x, EYE.y, D / 2 + 0.012]}>
            <Chevron dir={s === -1 ? 1 : -1} />
          </group>
        ) : (
          <mesh key={s} position={[s * EYE.x, EYE.y, D / 2 + 0.01]} scale={[1, Math.max(0.12, 1 - rig.blink), 1]}>
            <boxGeometry args={[EYE.w, EYE.h, 0.03]} />
            <Ink />
          </mesh>
        )
      )}
      {/* arms pivot at the body edge */}
      {([[-1, rig.armL], [1, rig.armR]] as const).map(([s, up]) => (
        <group key={s} position={[(s * W) / 2, ARM.y, 0]} rotation={[0, 0, s * up]}>
          <Block size={[ARM.out + 0.06, ARM.h, ARM.d]} r={0.03} position={[s * (ARM.out / 2 - 0.03), 0, 0]} />
        </group>
      ))}
      {/* legs pivot at the hip: lift raises, tip swings fore/aft, slide shifts along z, kick swings outward */}
      {LEG_X.map((x) => {
        const side = x < 0 ? -1 : 1;
        const l = side < 0 ? rig.legL : rig.legR;
        return (
          <group
            key={x}
            position={[x, LEG_H + l.lift * 0.24, l.slide]}
            rotation={[l.tip, 0, side * l.kick]}
            scale={[1, 1 + (l.stretch ?? 0), 1]}
          >
            {[-1, 1].map((z) => (
              <Block key={z} size={[LEG_W, LEG_H + 0.04, LEG_W]} r={0.02} position={[0, -LEG_H / 2, z * (D / 2 - 0.2)]} />
            ))}
          </group>
        );
      })}
    </group>
  </group>
  </LookCtx.Provider>
);
