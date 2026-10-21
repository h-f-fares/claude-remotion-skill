import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ClawdModel, ClawdRig, LegRig, restRig } from "./Clawd";
import { Grade, Grain, Halftone, PixelClawd, Spark2D, Vignette, Word } from "./ClaudeDance";
import { BEAT_F, beatPulse, theme } from "./theme";

// 15s disco-funk dance: 30 beats at 120 BPM, every cut on a beat or half beat.
export const FEELIT_TOTAL_F = 450;

const { color } = theme;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PINK = "#FF6FA8";

const SEC = {
  intro: [0, 60],
  groove: [60, 180],
  moon: [180, 270],
  stutter: [270, 300],
  lean: [300, 330],
  kicks: [330, 390],
  finale: [390, 450],
} as const;
const SLOTS_2D = [
  [278, 285],
  [293, 300],
] as const;
const KICKS = [
  { f: 330, side: 1 },
  { f: 345, side: -1 },
  { f: 360, side: 1 },
  { f: 375, side: -1 },
] as const;
const CUTS = [60, 90, 105, 120, 150, 180, 225, 240, 270, 278, 285, 293, 300, 330, 345, 360, 375, 390, 405];

const is2D = (f: number) => f < SEC.groove[0] || SLOTS_2D.some(([a, b]) => f >= a && f < b);
const sinE = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));

/* =================== choreography =================== */

const leg = (lift = 0, tip = 0, slide = 0, kick = 0): LegRig => ({ lift, tip, slide, kick });

const lerpRig = (a: ClawdRig, b: ClawdRig, t: number): ClawdRig => {
  const m = (x: number, y: number) => x + (y - x) * t;
  const ml = (x: LegRig, y: LegRig) => leg(m(x.lift, y.lift), m(x.tip, y.tip), m(x.slide, y.slide), m(x.kick, y.kick));
  return {
    pos: [m(a.pos[0], b.pos[0]), m(a.pos[1], b.pos[1]), m(a.pos[2], b.pos[2])],
    rot: [m(a.rot[0], b.rot[0]), m(a.rot[1], b.rot[1]), m(a.rot[2], b.rot[2])],
    sx: m(a.sx, b.sx), sy: m(a.sy, b.sy), armL: m(a.armL, b.armL), armR: m(a.armR, b.armR),
    legL: ml(a.legL, b.legL), legR: ml(a.legR, b.legR),
    blink: m(a.blink, b.blink), happy: t < 0.5 ? a.happy : b.happy,
  };
};

// groove: hop on every beat, step side to side, arms pump alternately
const grooveRig = (f: number): ClawdRig => {
  const b = f / BEAT_F;
  const side = Math.sin(Math.PI * b);
  const hop = Math.abs(side) * 0.24;
  const land = beatPulse(f, 3);
  return {
    ...restRig(),
    pos: [side * 0.22, hop, 0],
    rot: [0, side * 0.3, -side * 0.12],
    sx: 1 + land * 0.08, sy: 1 - land * 0.12 + hop * 0.2,
    armL: 0.95 * Math.max(0, side) - 0.2,
    armR: 0.95 * Math.max(0, -side) - 0.2,
    legL: leg(Math.max(0, side), -Math.max(0, side) * 0.45),
    legR: leg(Math.max(0, -side), -Math.max(0, -side) * 0.45),
  };
};

// moonwalk: faces screen-right, glides screen-left. The planted pair slides back flat
// while the other pair rides heel-up; they swap every beat.
const moonX = (f: number) =>
  interpolate(f, [180, 270], [2.1, -2.1], { ...clamp, easing: theme.ease.inOut });
const moonRig = (f: number): ClawdRig => {
  const b = f / BEAT_F;
  const u = b % 1;
  const even = Math.floor(b) % 2 === 0;
  const heel = Math.sin(Math.PI * u);
  const active = leg(0.12 + 0.18 * heel, -0.32 * (0.4 + 0.6 * heel), -0.2 + 0.4 * u);
  const planted = leg(0, 0, 0.2 - 0.4 * u);
  const turn = sinE((f - 180) / 8) * (1 - sinE((f - 262) / 8));
  return {
    ...restRig(),
    pos: [moonX(f), 0.03 * Math.sin(2 * Math.PI * b), 0],
    rot: [0, (Math.PI / 2) * turn, 0],
    sx: 1, sy: 1 + 0.015 * Math.sin(2 * Math.PI * b),
    armL: -0.15 + 0.12 * Math.sin(Math.PI * b),
    armR: -0.15 - 0.12 * Math.sin(Math.PI * b),
    legL: even ? active : planted,
    legR: even ? planted : active,
  };
};

// stutter: double-time arm flaps
const flapRig = (f: number): ClawdRig => {
  const b = f / BEAT_F;
  const flap = Math.sin(2 * Math.PI * b);
  const hop = Math.abs(Math.sin(Math.PI * b)) * 0.3;
  return {
    ...restRig(),
    pos: [0, hop, 0],
    rot: [0, Math.sin((Math.PI * b) / 2) * 0.5, Math.sin(Math.PI * b) * 0.1],
    sy: 1 + hop * 0.2,
    armL: 0.55 + 0.6 * flap, armR: 0.55 + 0.6 * flap,
    legL: leg(Math.max(0, flap) * 0.6, -Math.max(0, flap) * 0.3),
    legR: leg(Math.max(0, -flap) * 0.6, -Math.max(0, -flap) * 0.3),
  };
};

// lean: a slow, impossible forward lean pivoting on the feet, held, then released
const leanRig = (f: number): ClawdRig => {
  const l = interpolate(f, [300, 313, 323, 330], [0, 1, 1, 0.2], { ...clamp, easing: theme.ease.inOut });
  return {
    ...restRig(),
    rot: [0.5 * l, 0.15 * l, 0],
    armL: -0.2 - 0.25 * l, armR: -0.2 - 0.25 * l,
  };
};

// kicks: sharp side kick on each beat, body tilts away, the opposite arm points up
const kickRig = (f: number): ClawdRig => {
  const base = grooveRig(f);
  const k = KICKS.reduce(
    (acc, kk) => {
      const v = interpolate(f - kk.f, [0, 3, 10], [0, 1, 0], { ...clamp, easing: theme.ease.out });
      return v > acc.v ? { v, side: kk.side } : acc;
    },
    { v: 0, side: 1 as number }
  );
  const kickLeg = leg(0.5 * k.v, -0.7 * k.v, 0, 1.3 * k.v);
  const r: ClawdRig = {
    ...base,
    pos: [base.pos[0] * 0.4, base.pos[1] * 0.5 + 0.1 * k.v, 0],
    rot: [0, k.side * 0.35 * k.v + base.rot[1] * 0.3, -k.side * 0.2 * k.v],
    armL: k.side > 0 ? -0.2 + 1.7 * k.v : -0.2,
    armR: k.side < 0 ? -0.2 + 1.7 * k.v : -0.2,
    happy: k.v > 0.6,
  };
  if (k.side > 0) r.legR = kickLeg;
  else r.legL = kickLeg;
  return r;
};

// finale: jump, land in a squash, arms-up celebration with happy eyes
const finaleRig = (f: number): ClawdRig => {
  const jt = interpolate(f, [390, 404], [0, 1], clamp);
  const air = Math.sin(Math.PI * jt);
  const land = interpolate(f, [404, 408, 418], [0, 1, 0], clamp);
  const t = (f - 404) / 30;
  const wave = f > 404 ? Math.sin(t * 7) : 0;
  return {
    ...restRig(),
    pos: [0, air * 1.3, 0],
    rot: [0, -0.2 * sinE((f - 404) / 12), 0.08 * wave],
    sx: 1 + land * 0.14, sy: 1 - land * 0.22 + air * 0.1,
    armL: 1.25 + 0.15 * wave, armR: 1.25 - 0.15 * wave,
    legL: leg(air * 0.5, -air * 0.3), legR: leg(air * 0.5, -air * 0.3),
    happy: f >= 404,
  };
};

const rigAt = (f: number): ClawdRig => {
  // section rig with 5-frame crossfades at each boundary
  const order: [number, (f: number) => ClawdRig][] = [
    [SEC.groove[0], grooveRig],
    [SEC.moon[0], moonRig],
    [SEC.stutter[0], flapRig],
    [SEC.lean[0], leanRig],
    [SEC.kicks[0], kickRig],
    [SEC.finale[0], finaleRig],
  ];
  let i = order.length - 1;
  while (i > 0 && f < order[i][0]) i--;
  let rig = order[i][1](f);
  if (i > 0) {
    const t = interpolate(f, [order[i][0], order[i][0] + 5], [0, 1], clamp);
    if (t < 1) rig = lerpRig(order[i - 1][1](f), rig, sinE(t));
  }
  const blink = Math.max(...[75, 160, 250, 318].map((b) => Math.max(0, 1 - Math.abs(f - b) / 2.5)));
  const closeHappy = f >= 97 && f < 105;
  return { ...rig, blink: rig.happy ? 0 : blink, happy: rig.happy || closeHappy };
};

/* =================== disco set (3D) =================== */

const TILE_COLORS = [color.clawd, PINK, color.cool, color.glow];
const DiscoFloor: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = Math.floor(frame / BEAT_F);
  const pulse = beatPulse(frame, 5);
  const tiles = useMemo(() => {
    const out: { x: number; z: number; i: number; j: number }[] = [];
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) out.push({ x: i, z: j, i, j });
    return out;
  }, []);
  // a new light pattern every beat: checker → rings → diagonals → cross
  const lit = (i: number, j: number) => {
    switch (beat % 4) {
      case 0: return (i + j + beat) % 2 === 0;
      case 1: return Math.max(Math.abs(i), Math.abs(j)) % 2 === Math.floor(beat / 4) % 2;
      case 2: return ((i - j) % 3 + 3) % 3 === 0;
      default: return i === 0 || j === 0 || Math.abs(i) === Math.abs(j);
    }
  };
  return (
    <>
      {tiles.map((t) => {
        const on = lit(t.i, t.j);
        const c = TILE_COLORS[((t.i * 3 + t.j * 5 + beat) % 4 + 4) % 4];
        return (
          <mesh key={`${t.i}${t.j}`} receiveShadow position={[t.x, -0.06, t.z]}>
            <boxGeometry args={[0.95, 0.1, 0.95]} />
            <meshStandardMaterial
              color={on ? c : "#1B1A22"}
              emissive={on ? c : "#000000"}
              emissiveIntensity={on ? 0.35 + 0.9 * pulse : 0}
              roughness={0.35}
              metalness={0.1}
            />
          </mesh>
        );
      })}
    </>
  );
};

const MirrorBall: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <group position={[-2.3, 5.0, -2.6]}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 3.2, 6]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh rotation={[0, frame * 0.035, 0]}>
        <icosahedronGeometry args={[0.62, 2]} />
        <meshStandardMaterial color="#E8E6F0" metalness={0.75} roughness={0.12} flatShading emissive="#3a3550" />
      </mesh>
      <pointLight position={[0, -0.9, 0.6]} intensity={6} distance={4} color="#ffffff" />
    </group>
  );
};

// translucent light shafts sweeping from the rig above
const Beams: React.FC = () => {
  const frame = useCurrentFrame();
  const beams = [
    { x: -3.2, c: PINK, ph: 0 },
    { x: 3.2, c: color.cool, ph: 1.7 },
    { x: -1.2, c: color.glow, ph: 3.1 },
    { x: 1.2, c: color.clawd, ph: 4.4 },
  ];
  return (
    <>
      {beams.map((b) => (
        <group key={b.x} position={[b.x, 7, -2.5]} rotation={[0.35, 0, Math.sin(frame * 0.05 + b.ph) * 0.45]}>
          <mesh position={[0, -4, 0]}>
            <coneGeometry args={[1.1, 8, 24, 1, true]} />
            <meshBasicMaterial
              color={b.c}
              transparent
              opacity={0.07 + beatPulse(frame, 6) * 0.06}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </>
  );
};

/* =================== cameras =================== */

type V3 = [number, number, number];
const shot = (f: number, a: number, b: number, from: V3, to: V3, look: V3) => {
  const e = theme.ease.out(Math.min(1, Math.max(0, (f - a) / (b - a))));
  return { pos: from.map((v, i) => v + (to[i] - v) * e) as V3, look };
};
const orbit = (f: number, a: number, b: number, a0: number, a1: number, r0: number, r1: number, y: number, look: V3) => {
  const t = theme.ease.out(Math.min(1, Math.max(0, (f - a) / (b - a))));
  const ang = a0 + (a1 - a0) * t;
  const r = r0 + (r1 - r0) * t;
  return { pos: [Math.sin(ang) * r, y, Math.cos(ang) * r] as V3, look };
};

const camAt = (f: number): { pos: V3; look: V3 } => {
  const mx = moonX(Math.min(270, Math.max(180, f)));
  if (f < 90) return shot(f, 60, 90, [0, 2.6, 10.8], [0.6, 2.2, 9.2], [0, 1.15, 0]);
  if (f < 105) return shot(f, 90, 105, [0.45, 1.6, 5.4], [0.2, 1.55, 4.8], [0, 1.3, 0]);
  if (f < 120) return shot(f, 105, 120, [0.6, 9.5, 4.2], [0, 9, 3.6], [0, 0, 0]);
  if (f < 150) return shot(f, 120, 150, [-3.2, 0.3, 7.8], [-2.5, 0.4, 7.0], [0, 1.8, 0]);
  if (f < 180) return orbit(f, 150, 180, 0.9, -0.6, 9.4, 9.0, 2.4, [0, 1.2, 0]);
  if (f < 225) return { pos: [mx * 0.75, 1.4, 9.6], look: [mx * 0.9, 1.1, 0] };
  if (f < 240) return { pos: [mx + 1.4, 0.4, 6.2], look: [mx, 0.6, 0] };
  if (f < 270) return shot(f, 240, 270, [1.5, 5.2, 12.5], [0.5, 4.6, 11.5], [mx * 0.5, 0.9, 0]);
  if (f < 285) return shot(f, 270, 278, [7.4, 1.7, 3.2], [6.8, 1.6, 3.6], [0, 1.2, 0]);
  if (f < 300) return shot(f, 285, 293, [0.5, 7.8, 4.4], [0, 7.2, 4.0], [0, 0.6, 0]);
  if (f < 330) return shot(f, 300, 330, [7.4, 1.0, 3.8], [6.6, 1.2, 3.4], [0, 1.3, 0]);
  if (f < 345) return shot(f, 330, 345, [0, 1.9, 9.6], [0, 1.8, 9.0], [0, 1.2, 0]);
  if (f < 360) return shot(f, 345, 360, [-6.6, 1.7, 7.0], [-6.0, 1.6, 6.6], [0, 1.2, 0]);
  if (f < 375) return shot(f, 360, 375, [6.6, 1.7, 7.0], [6.0, 1.6, 6.6], [0, 1.2, 0]);
  if (f < 390) return shot(f, 375, 390, [0, 2.6, 11.5], [0, 2.1, 9.8], [0, 1.2, 0]);
  if (f < 405) return { pos: [0, 0.3, 8.6], look: [0, 2.2, 0] };
  return orbit(f, 405, 450, 0.5, -0.15, 9.0, 10.4, 2.3, [0, 2.9, 0]);
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const { pos, look } = camAt(frame);
  const shake = beatPulse(frame, 2.5) * 0.025;
  camera.position.set(pos[0] + shake, pos[1] + shake * 0.6, pos[2]);
  camera.lookAt(...look);
  return null;
};

const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  return (
    <>
      <hemisphereLight args={[color.cool, color.ink, 0.5]} />
      <directionalLight
        castShadow
        position={[3, 8, 6]}
        intensity={2.3}
        color="#fff0e2"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-5, 3, -5]} intensity={1.8} color={PINK} />
      <directionalLight position={[5, 2, -4]} intensity={1.4} color={color.cool} />
      <pointLight position={[0, 3.5, 2.5]} intensity={6 + pulse * 18} distance={9} color={color.glow} />
      <CameraRig />
      <Beams />
      <MirrorBall />
      <DiscoFloor />
      <ClawdModel rig={rigAt(frame)} />
    </>
  );
};

/* =================== 2D layers =================== */

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const flat = is2D(frame);
  const moon = frame >= SEC.moon[0] && frame < SEC.moon[1];
  const kick = KICKS.find((k) => frame >= k.f && frame < k.f + 12);
  return (
    <AbsoluteFill style={{ backgroundColor: flat ? color.cream : "#120F18" }}>
      <AbsoluteFill
        style={{
          background: flat
            ? `radial-gradient(circle at 50% 46%, #ffffff 0%, transparent ${48 + pulse * 6}%)`
            : `radial-gradient(circle at 50% 40%, #4A2440 0%, transparent ${58 + pulse * 6}%), radial-gradient(circle at 50% 100%, ${color.orangeDeep}55 0%, transparent 60%)`,
        }}
      />
      {!flat && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Spark2D size={1800} fill={PINK} rot={frame * 0.4} pulse={pulse} style={{ opacity: 0.08 }} />
        </AbsoluteFill>
      )}
      {/* moonwalk speed lines streaming opposite the glide */}
      {moon &&
        Array.from({ length: 14 }, (_, i) => {
          const y = 300 + ((i * 197) % 1300);
          const x = ((frame * (26 + (i % 4) * 9) + i * 311) % 1700) - 300;
          return (
            <div
              key={i}
              style={{
                position: "absolute", top: y, left: x, width: 220 + (i % 3) * 120, height: 6, borderRadius: 3,
                background: `linear-gradient(90deg, transparent, ${i % 2 ? color.cool : PINK})`, opacity: 0.55,
              }}
            />
          );
        })}
      {/* kick burst */}
      {kick && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Spark2D
            size={500 + (frame - kick.f) * 120}
            fill={kick.side > 0 ? color.clawd : PINK}
            rot={kick.side * (frame - kick.f) * 4}
            style={{ opacity: interpolate(frame - kick.f, [0, 12], [0.9, 0], clamp) }}
          />
        </AbsoluteFill>
      )}
      <Halftone tint={flat ? color.clawd : PINK} pulse={pulse} opacity={flat ? 0.22 : 0.18} />
    </AbsoluteFill>
  );
};

// mirror-ball reflections: four-point glints circling the frame
const Glints: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (is2D(frame)) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: 34 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180 + frame * 0.012;
        const r = 260 + ((i * 71) % 760);
        const x = width / 2 + Math.cos(a) * r * 0.75;
        const y = height * 0.42 + Math.sin(a) * r;
        const tw = 0.5 + 0.5 * Math.sin(frame * 0.35 + i * 1.7);
        const s = 10 + (i % 4) * 6;
        return (
          <svg key={i} width={s * 2} height={s * 2} viewBox="-1 -1 2 2" style={{ position: "absolute", left: x - s, top: y - s, opacity: tw * 0.8 }}>
            <path d="M0 -1 L0.14 -0.14 L1 0 L0.14 0.14 L0 1 L-0.14 0.14 L-1 0 L-0.14 -0.14 Z" fill={i % 3 ? "#ffffff" : color.glow} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= SEC.intro[1]) return null;
  const build = spring({ frame, fps, config: theme.spring.snappy });
  const exit = interpolate(frame, [52, 60], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const pulse = beatPulse(frame);
  // the pixel sprite slides back across the spotlight — a 2D moonwalk teaser
  const slide = interpolate(frame, [16, 50], [90, -90], { ...clamp, easing: theme.ease.inOut });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${1 + exit * 1.6})`, opacity: 1 - exit }}>
      <div
        style={{
          position: "absolute", top: 470, width: 760, height: 760, borderRadius: "50%",
          background: `radial-gradient(circle, ${color.glow}88 0%, transparent 65%)`, transform: `scale(${0.9 + pulse * 0.08})`,
        }}
      />
      <div style={{ position: "absolute", top: 600, transform: `translateX(${slide}px) translateY(${-pulse * 20}px)` }}>
        <PixelClawd px={38} fill={color.clawd} build={build} armsUp={Math.floor(frame / 7.5) % 2 === 1} shadow={color.ink} />
      </div>
      <div style={{ position: "absolute", top: 1060, display: "flex", gap: 6 }}>
        {"CLAUDE".split("").map((l, i) => {
          const s = spring({ frame: frame - 10 - i * 3, fps, config: theme.spring.snappy });
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.font.display, fontWeight: 700, fontSize: 180, color: color.ink, display: "inline-block",
                opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                transform: `translateY(${(1 - s) * -120}px) scale(${1.6 - 0.6 * s})`,
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
      <Word text="feel the beat" at={30} until={60} top={1300} size={92} fill={color.clawd} tilt={-3} />
    </AbsoluteFill>
  );
};

const FlatSlot: React.FC = () => {
  const frame = useCurrentFrame();
  const slot = SLOTS_2D.find(([a, b]) => frame >= a && frame < b);
  if (!slot) return null;
  const local = frame - slot[0];
  const k = interpolate(local, [0, 5], [1.25, 1], { ...clamp, easing: theme.ease.out });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `scale(${k}) rotate(${(slot[0] === 278 ? -1 : 1) * local * 2}deg)` }}>
        <PixelClawd px={46} fill={color.clawd} armsUp={Math.floor(frame / 4) % 2 === 0} shadow={color.ink} />
      </div>
    </AbsoluteFill>
  );
};

const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame - 404;
  if (t < 0) return null;
  const COLS = [color.clawd, PINK, color.cool, color.cream, color.glow];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 70 }, (_, i) => {
        const x0 = ((i * 97) % 100) / 100;
        const vx = (((i * 53) % 21) - 10) * 1.6;
        const vy = -18 - ((i * 31) % 14);
        const x = width / 2 + (x0 - 0.5) * 300 + vx * t;
        const y = height * 0.62 + vy * t + 0.55 * t * t;
        if (y > height + 40) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x, top: y, width: 18, height: 30, background: COLS[i % COLS.length],
              transform: `rotate(${i * 40 + t * (8 + (i % 5) * 3)}deg) scaleY(${Math.cos(t * 0.3 + i)})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < 405) return null;
  const s = spring({ frame: frame - 408, fps, config: theme.spring.snappy });
  const sub = spring({ frame: frame - 416, fps, config: theme.spring.soft });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          marginTop: 250, padding: "18px 56px 26px", borderRadius: 40, background: color.cream,
          transform: `scale(${s}) rotate(${(1 - s) * -10 - 3}deg)`, boxShadow: `14px 14px 0 ${color.clawd}`,
        }}
      >
        <span style={{ fontFamily: theme.font.display, fontWeight: 700, fontSize: 170, color: color.ink, letterSpacing: -4 }}>Claude</span>
      </div>
      <div
        style={{
          marginTop: 44, fontFamily: theme.font.display, fontWeight: 700, fontSize: 50, color: color.cream,
          opacity: sub, transform: `translateY(${(1 - sub) * 30}px)`, letterSpacing: 1,
        }}
      >
        made with Claude Code × Remotion
      </div>
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const since = Math.min(...CUTS.map((c) => (frame >= c ? frame - c : 99)));
  const o = interpolate(since, [0, 4], [0.5, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: color.cream, opacity: o, mixBlendMode: "screen" }} />;
};

export const ClawdFeelIt: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: color.ink }}>
      <Audio src={staticFile("claudedance/feelit.wav")} />
      <Background />
      <Intro />
      <FlatSlot />
      {/* canvas stays mounted so the GL context survives cuts; hidden on 2D frames */}
      <AbsoluteFill style={{ opacity: is2D(frame) ? 0 : 1 }}>
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 46 }} gl={{ antialias: true, alpha: true }}>
          <Scene3D />
        </ThreeCanvas>
      </AbsoluteFill>
      <Glints />
      <Word text="FEEL" at={60} until={68} top={240} size={170} />
      <Word text="THE" at={68} until={75} top={240} size={170} tilt={4} />
      <Word text="BEAT" at={75} until={90} top={240} size={170} fill={color.clawd} />
      <Word text="GET UP" at={120} until={150} top={240} size={150} />
      <Word text="GROOVE" at={150} until={180} top={240} size={150} fill={color.clawd} tilt={4} />
      <Word text="MOON" at={180} until={195} top={260} size={190} fill={color.cool} />
      <Word text="WALK" at={195} until={225} top={260} size={190} fill={color.cream} tilt={4} />
      <Word text="3D" at={270} until={278} top={1450} size={240} fill={color.clawd} />
      <Word text="2D" at={278} until={285} top={300} size={240} fill={color.ink} tilt={6} />
      <Word text="3D" at={285} until={293} top={1450} size={240} fill={color.clawd} />
      <Word text="2D" at={293} until={300} top={300} size={240} fill={color.ink} tilt={6} />
      <Word text="LEAN" at={300} until={330} top={240} size={190} fill={color.cool} />
      <Word text="KICK!" at={330} until={345} top={240} size={180} fill={color.clawd} />
      <Word text="KICK!" at={345} until={360} top={240} size={180} fill={PINK} tilt={6} />
      <Word text="KICK!" at={360} until={375} top={240} size={180} fill={color.clawd} />
      <Word text="KICK!" at={375} until={390} top={240} size={180} fill={PINK} tilt={6} />
      <Confetti />
      <Outro />
      <Flash />
      <Grade />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
