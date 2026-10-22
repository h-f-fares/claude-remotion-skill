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
import { CLAWD_GRID, ClawdModel } from "./Clawd";
import { Grade, Grain, Halftone, PixelClawd, Spark2D, Vignette, Word } from "./ClaudeDance";
import {
  CUTS, FOV, KICKS, SEC, SLOTS_2D, V3, camAt, inMorph, is2D, makeProjector, moonX, rigAt, shakeAt, sinE, speedAt,
} from "./feelitChoreo";
import { BEAT_F, beatPulse, theme } from "./theme";

export { FEELIT_TOTAL_F } from "./feelitChoreo";

const { color } = theme;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PINK = "#FF6FA8";

// disco rig fades up as the morph lands; it is fully on during the cold open
const lightsOn = (f: number) => (f < SEC.pixel[0] ? 1 : interpolate(f, [56, 64], [0, 1], clamp));

/* =================== shared textures =================== */

const useGlowTexture = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,0.35)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

// mirror-ball gobo: scattered light dots projected by a spotlight
const useDotsTexture = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, 512, 512);
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 140; i++) {
      const x = rnd() * 512, y = rnd() * 512, r = 3 + rnd() * 5;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

/* =================== disco set (3D) =================== */

const TILE_COLORS = [color.clawd, PINK, color.cool, color.glow];
const litAt = (beat: number, i: number, j: number) => {
  // a new light pattern every beat: checker → rings → diagonals → cross
  switch (beat % 4) {
    case 0: return (i + j + beat) % 2 === 0;
    case 1: return Math.max(Math.abs(i), Math.abs(j)) % 2 === Math.floor(beat / 4) % 2;
    case 2: return ((i - j) % 3 + 3) % 3 === 0;
    default: return i === 0 || j === 0 || Math.abs(i) === Math.abs(j);
  }
};

const DiscoFloor: React.FC<{ glow: THREE.Texture }> = ({ glow }) => {
  const frame = useCurrentFrame();
  const beat = Math.floor(frame / BEAT_F);
  const pulse = beatPulse(frame, 5);
  const tiles = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) out.push([i, j]);
    return out;
  }, []);
  const morphPhase = frame >= SEC.pixel[0] && frame < 70;
  return (
    <>
      {tiles.map(([i, j]) => {
        // during the morph the floor rises tile by tile, center first
        const rise = morphPhase ? sinE((frame - 54 - Math.hypot(i, j) * 1.3) / 6) : 1;
        if (rise <= 0) return null;
        const on = litAt(beat, i, j) && lightsOn(frame) > 0.5;
        const c = TILE_COLORS[((i * 3 + j * 5 + beat) % 4 + 4) % 4];
        return (
          <group key={`${i}${j}`} position={[i, -0.06 - (1 - rise) * 1.2, j]}>
            <mesh receiveShadow>
              <boxGeometry args={[0.95, 0.1, 0.95]} />
              {/* glossy and slightly see-through so Clawd's reflection shows */}
              <meshStandardMaterial
                color={on ? c : "#1B1A22"}
                emissive={on ? c : "#000000"}
                emissiveIntensity={on ? 0.35 + 0.9 * pulse : 0}
                roughness={0.16}
                metalness={0.25}
                transparent
                opacity={on ? 0.9 : 0.86}
              />
            </mesh>
            {on && (
              <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.7, 1.7]} />
                <meshBasicMaterial map={glow} color={c} transparent opacity={0.22 + 0.3 * pulse} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
};

const BALL: V3 = [-2.3, 5.0, -2.6];
const MirrorBall: React.FC<{ glow: THREE.Texture; dots: THREE.Texture }> = ({ glow, dots }) => {
  const frame = useCurrentFrame();
  const on = lightsOn(frame);
  const target = useMemo(() => new THREE.Object3D(), []);
  // sweeping the target makes the projected dots travel across Clawd and the floor
  target.position.set(Math.sin(frame * 0.03) * 1.6, 0, Math.cos(frame * 0.03) * 1.2);
  target.updateMatrixWorld();
  if (on <= 0) return null;
  return (
    <>
      <group position={BALL} scale={on}>
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 3.2, 6]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh rotation={[0, frame * 0.035, 0]}>
          <icosahedronGeometry args={[0.62, 2]} />
          <meshStandardMaterial color="#E8E6F0" metalness={0.75} roughness={0.12} flatShading emissive="#3a3550" />
        </mesh>
        <sprite scale={[3.2, 3.2, 1]}>
          <spriteMaterial map={glow} color="#ffe9f4" transparent opacity={0.45 + 0.2 * beatPulse(frame, 6)} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </group>
      <primitive object={target} />
      <spotLight
        position={BALL}
        target={target}
        map={dots}
        angle={0.75}
        penumbra={0.2}
        intensity={70 * on}
        distance={14}
        decay={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
};

const Beams: React.FC<{ glow: THREE.Texture }> = ({ glow }) => {
  const frame = useCurrentFrame();
  const on = lightsOn(frame);
  if (on <= 0) return null;
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
              opacity={(0.08 + beatPulse(frame, 6) * 0.07) * on}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <sprite scale={[1.4, 1.4, 1]}>
            <spriteMaterial map={glow} color={b.c} transparent opacity={0.8 * on} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        </group>
      ))}
    </>
  );
};

// dust drifting through the light shafts
const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  const on = lightsOn(frame);
  const base = useMemo(() => {
    let seed = 9;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 260 }, () => [rnd() * 9 - 4.5, rnd() * 6, rnd() * 5 - 3.5, rnd() * 6.28]);
  }, []);
  const positions = new Float32Array(base.length * 3);
  base.forEach(([x, y, z, ph], i) => {
    positions[i * 3] = x + Math.sin(frame * 0.02 + ph) * 0.3;
    positions[i * 3 + 1] = (y + frame * 0.006) % 6;
    positions[i * 3 + 2] = z + Math.cos(frame * 0.017 + ph) * 0.3;
  });
  if (on <= 0) return null;
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#ffffff" transparent opacity={0.55 * on} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

/* =================== pixel → 3D morph =================== */

type Cell = { from: V3; to: V3; s0: V3; s1: V3; k: number; ink?: boolean };
const BODY_D = 1.25;
const morphCells = (): Cell[] => {
  const cx = (c: number) => (c - 8.5) * 0.2;
  const ry = (r: number) => 1.0 + (4 - 2 * r) * 0.2;
  const out: Cell[] = [];
  CLAWD_GRID.body.forEach(([r, cols]) =>
    cols.forEach((c) => out.push({ from: [cx(c), ry(r), 0], to: [cx(c), ry(r), 0], s0: [0.2, 0.4, 0.05], s1: [0.2, 0.4, BODY_D], k: c + r }))
  );
  [...CLAWD_GRID.armsL, ...CLAWD_GRID.armsR].forEach((c) => {
    const side = c < 8 ? -1 : 1;
    const inner = c === 2 || c === 15;
    out.push({ from: [cx(c), ry(2), 0], to: [side * (inner ? 1.27 : 1.45), 1.09, 0], s0: [0.2, 0.4, 0.05], s1: [0.19, 0.4, 0.6], k: c + 2 });
  });
  const legTo = [-0.82, -0.4, 0.4, 0.82];
  CLAWD_GRID.legs.forEach((c, i) =>
    [-1, 1].forEach((z) =>
      out.push({ from: [cx(c), ry(4), 0], to: [legTo[i], 0.21, z * 0.425], s0: [0.2, 0.4, 0.05], s1: [0.17, 0.46, 0.17], k: c + 8 })
    )
  );
  CLAWD_GRID.eyes.forEach((c) => {
    const side = c < 8 ? -1 : 1;
    out.push({ from: [cx(c), ry(1), 0.03], to: [side * 0.42, 1.348, BODY_D / 2 + 0.01], s0: [0.12, 0.32, 0.03], s1: [0.13, 0.32, 0.03], k: c + 2, ink: true });
  });
  return out;
};

const MorphSprite: React.FC = () => {
  const frame = useCurrentFrame();
  const cells = useMemo(morphCells, []);
  const u = (frame - SEC.morph[0]) / 16;
  return (
    <group>
      {cells.map((c, i) => {
        // staggered diagonally across the sprite; seams close as the pixels become solid
        const t = sinE(u * 1.5 - c.k * 0.025);
        const pos = c.from.map((v, j) => v + (c.to[j] - v) * t) as V3;
        const gap = c.ink ? 1 : 0.9 + 0.1 * t;
        const size = c.s0.map((v, j) => (v + (c.s1[j] - v) * t) * (j < 2 ? gap : 1)) as V3;
        return (
          <mesh key={i} position={pos} castShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={c.ink ? "#111111" : color.clawd} roughness={0.62} />
          </mesh>
        );
      })}
    </group>
  );
};

/* =================== Clawd + reflection + smear ghosts =================== */

// The reflection may only show where the eye looks *through* the floor: clip it with the four
// planes that pass through the camera and each edge of the 7×7 floor.
const FLOOR_CORNERS = [
  [-3.45, -3.45], [3.45, -3.45], [3.45, 3.45], [-3.45, 3.45],
].map(([x, z]) => new THREE.Vector3(x, 0, z));
const floorClip = (f: number) => {
  const { pos } = camAt(f);
  const s = shakeAt(f);
  const cam = new THREE.Vector3(pos[0] + s, pos[1] + s * 0.6, pos[2]);
  const inside = new THREE.Vector3(0, -0.5, 0);
  return FLOOR_CORNERS.map((a, i) => {
    const plane = new THREE.Plane().setFromCoplanarPoints(cam, a, FLOOR_CORNERS[(i + 1) % 4]);
    if (plane.distanceToPoint(inside) < 0) plane.negate();
    return plane;
  });
};

const Dancer: React.FC = () => {
  const frame = useCurrentFrame();
  if (inMorph(frame)) return <MorphSprite />;
  const rig = rigAt(frame);
  const speed = speedAt(frame);
  const ghost = Math.min(0.32, Math.max(0, (speed - 0.14) * 1.4));
  return (
    <>
      <ClawdModel rig={rig} />
      {ghost > 0.02 && <ClawdModel rig={rigAt(frame - 1.5)} opacity={ghost} shadows={false} />}
      {ghost > 0.02 && <ClawdModel rig={rigAt(frame - 3)} opacity={ghost * 0.45} shadows={false} />}
      {/* faint mirror image under the glossy floor; skipped when the camera sits at floor level */}
      {camAt(frame).pos[1] > 0.9 && (
        <group position={[0, -0.02, 0]} scale={[1, -1, 1]}>
          <ClawdModel rig={rig} opacity={0.38} shadows={false} clip={floorClip(frame)} />
        </group>
      )}
    </>
  );
};

/* =================== cameras =================== */

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const { pos, look } = camAt(frame);
  const s = shakeAt(frame);
  camera.position.set(pos[0] + s, pos[1] + s * 0.6, pos[2]);
  camera.lookAt(...look);
  return null;
};

const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const glow = useGlowTexture();
  const dots = useDotsTexture();
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
      {/* rim from behind to separate the silhouette from the background */}
      <directionalLight position={[0, 3.5, -7]} intensity={2.6} color={color.glow} />
      <pointLight position={[0, 3.5, 2.5]} intensity={(6 + pulse * 18) * Math.max(0.4, lightsOn(frame))} distance={9} color={color.glow} />
      <CameraRig />
      <Beams glow={glow} />
      <Dust />
      <MirrorBall glow={glow} dots={dots} />
      <DiscoFloor glow={glow} />
      <Dancer />
    </>
  );
};

/* =================== 2D layers =================== */

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pulse = beatPulse(frame);
  const cream = is2D(frame) || inMorph(frame);
  const moon = frame >= SEC.moon[0] && frame < SEC.moon[1];
  const kick = KICKS.find((k) => frame >= k.f && frame < k.f + 12);
  // iris wipe from Clawd's center as the disco takes over at the end of the morph
  const iris = inMorph(frame) ? interpolate(frame, [50, 60], [0, Math.hypot(width, height)], { ...clamp, easing: theme.ease.inOut }) : 0;
  const dark = (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, #4A2440 0%, transparent ${58 + pulse * 6}%), radial-gradient(circle at 50% 100%, ${color.orangeDeep}55 0%, transparent 60%)`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Spark2D size={1800} fill={PINK} rot={frame * 0.4} pulse={pulse} style={{ opacity: 0.08 }} />
      </AbsoluteFill>
    </>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: cream ? color.cream : "#120F18" }}>
      {cream ? (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, #ffffff 0%, transparent ${48 + pulse * 6}%)` }} />
      ) : (
        dark
      )}
      {iris > 0 && (
        <AbsoluteFill style={{ backgroundColor: "#120F18", clipPath: `circle(${iris}px at 50% 46%)` }}>{dark}</AbsoluteFill>
      )}
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
      <Halftone tint={cream ? color.clawd : PINK} pulse={pulse} opacity={cream ? 0.22 : 0.18} />
    </AbsoluteFill>
  );
};

/* ---- hand-drawn doodles locked to the 3D action (line boil: redrawn every 3 frames) ---- */

const jit = (i: number, seed: number) => {
  const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return (v - Math.floor(v) - 0.5) * 5;
};
const INK = "#FFF6EC";

const Burst: React.FC<{ x: number; y: number; t: number; r: number; c: string; seed: number }> = ({ x, y, t, r, c, seed }) => {
  if (t < 0 || t > 1) return null;
  const e = theme.ease.out(t);
  const boil = Math.floor(seed + t * 4);
  return (
    <g opacity={1 - t * t}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.3;
        const r0 = r * (0.35 + 0.65 * e);
        const r1 = r0 + r * 0.45 * (1 - e * 0.6);
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r0 + jit(i, boil)}
            y1={y + Math.sin(a) * r0 * 0.6 + jit(i + 9, boil)}
            x2={x + Math.cos(a) * r1 + jit(i + 18, boil)}
            y2={y + Math.sin(a) * r1 * 0.6 + jit(i + 27, boil)}
            stroke={c}
            strokeWidth={9 * (1 - t * 0.5)}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

const Note: React.FC<{ x: number; y: number; t: number; c: string; seed: number }> = ({ x, y, t, c, seed }) => {
  if (t < 0 || t > 1) return null;
  const nx = x + Math.sin(t * 9 + seed) * 22;
  const ny = y - t * 230;
  const s = 1 + 0.2 * Math.sin(t * 20);
  return (
    <g transform={`translate(${nx} ${ny}) scale(${s}) rotate(${Math.sin(t * 6 + seed) * 15})`} opacity={Math.min(1, (1 - t) * 3)}>
      <ellipse cx={0} cy={0} rx={17} ry={12} fill={c} transform="rotate(-20)" />
      <line x1={14} y1={-4} x2={14} y2={-62} stroke={c} strokeWidth={7} strokeLinecap="round" />
      <path d="M14 -62 Q 34 -52 30 -30" stroke={c} strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Puff: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t < 0 || t > 1) return null;
  const e = theme.ease.out(t);
  return (
    <g opacity={(1 - t) * 0.9}>
      {[-1, 0, 1].map((k) => (
        <circle key={k} cx={x + k * 34 * e + 30 * e} cy={y - 12 * e - Math.abs(k) * 6} r={10 + 22 * e} fill="none" stroke={INK} strokeWidth={6} />
      ))}
    </g>
  );
};

const Doodles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (is2D(frame) || inMorph(frame)) return null;
  const P = makeProjector(frame, width, height);
  const items: React.ReactNode[] = [];
  const seed = Math.floor(frame / 3);

  // landing bursts at the feet on every beat while grooving
  for (let bf = 0; bf <= 180; bf += BEAT_F) {
    if (bf >= SEC.pixel[0] && bf < SEC.groove[0]) continue;
    const t = (frame - bf) / 10;
    if (t < 0 || t > 1) continue;
    const r = rigAt(bf);
    const p = P([r.pos[0], 0.05, 0]);
    items.push(<Burst key={`l${bf}`} x={p.x} y={p.y} t={t} r={150} c={(bf / BEAT_F) % 2 ? PINK : INK} seed={seed} />);
  }
  // music notes float off Clawd during the groove
  for (let bf = 60; bf < 180; bf += BEAT_F) {
    const t = (frame - bf) / 32;
    if (t < 0 || t > 1) continue;
    const r = rigAt(bf);
    const side = (bf / BEAT_F) % 2 ? 1 : -1;
    const p = P([r.pos[0] + side * 1.0, 2.3, 0]);
    items.push(<Note key={`n${bf}`} x={p.x} y={p.y} t={t} c={side > 0 ? color.glow : color.cool} seed={bf} />);
  }
  // moonwalk: dust puffs kicked up behind the sliding foot
  for (let bf = 180; bf < 270; bf += BEAT_F) {
    const t = (frame - bf) / 14;
    if (t < 0 || t > 1) continue;
    const p = P([moonX(bf) - 0.35, 0.05, 0]);
    items.push(<Puff key={`p${bf}`} x={p.x} y={p.y} t={t} />);
  }
  // lean: dashed plumb line + angle arc drawn on screen around the feet
  if (frame >= 308 && frame < 329) {
    const r = rigAt(frame);
    const foot = P([r.pos[0], 0, 0]);
    const head = P([r.pos[0], 2.0, 0]);
    const len = foot.y - head.y;
    const ang = r.lean ?? 0;
    const draw = interpolate(frame, [308, 314], [0, 1], clamp);
    const tip = { x: foot.x + Math.sin(ang) * len, y: foot.y - Math.cos(ang) * len };
    items.push(
      <g key="lean" opacity={draw * interpolate(frame, [324, 329], [1, 0], clamp)}>
        <line x1={foot.x + jit(1, seed)} y1={foot.y} x2={foot.x + jit(2, seed)} y2={foot.y - len * draw} stroke={INK} strokeWidth={6} strokeDasharray="18 16" strokeLinecap="round" />
        <path
          d={`M ${foot.x} ${foot.y - len * 0.8} A ${len * 0.8} ${len * 0.8} 0 0 1 ${foot.x + Math.sin(ang) * len * 0.8} ${foot.y - Math.cos(ang) * len * 0.8}`}
          stroke={color.cool}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
        <text x={tip.x + 30} y={tip.y - 10} fontFamily={theme.font.display} fontWeight={700} fontSize={64} fill={color.cool}>
          {Math.round((ang * 180) / Math.PI)}°
        </text>
      </g>
    );
  }
  // kicks: swoosh arc along the leg swing + impact burst at the foot
  for (const k of KICKS) {
    const t = (frame - k.f) / 12;
    if (t < -0.1 || t > 1) continue;
    const sides = k.kind === "split" ? [-1, 1] : [k.kind === "spin" ? 1 : k.side];
    const at = k.kind === "spin" ? k.f + 4 : k.f + 2;
    sides.forEach((s) => {
      const r = rigAt(at);
      const hip = P([r.pos[0] + s * 0.6, r.pos[1] + 0.42, 0]);
      const foot = P([r.pos[0] + s * 1.55, r.pos[1] + 0.35, 0]);
      const tb = (frame - at) / 10;
      items.push(<Burst key={`k${k.f}${s}`} x={foot.x} y={foot.y} t={tb} r={190} c={s > 0 ? color.glow : PINK} seed={seed + s} />);
      const rad = Math.hypot(foot.x - hip.x, foot.y - hip.y) * 1.05;
      const sw = interpolate(frame - k.f, [-1, 3, 10], [0, 1, 0], clamp);
      if (sw > 0) {
        items.push(
          <path
            key={`s${k.f}${s}`}
            d={`M ${hip.x + jit(3, seed)} ${hip.y + rad} A ${rad} ${rad} 0 0 ${s > 0 ? 0 : 1} ${foot.x} ${foot.y}`}
            stroke={INK}
            strokeWidth={14 * sw}
            fill="none"
            strokeLinecap="round"
            opacity={sw}
          />
        );
      }
    });
  }
  // finale landing
  {
    const t = (frame - 404) / 14;
    if (t >= 0 && t <= 1) {
      const p = P([0, 0.05, 0]);
      items.push(<Burst key="land" x={p.x} y={p.y} t={t} r={320} c={color.glow} seed={seed} />);
    }
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.35))" }}>
        {items}
      </svg>
    </AbsoluteFill>
  );
};

// soft haze in front of the stage
const Haze: React.FC = () => {
  const frame = useCurrentFrame();
  if (is2D(frame) || inMorph(frame)) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.16, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 30% at ${40 + Math.sin(frame * 0.02) * 15}% 55%, ${PINK}, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 25% at ${60 + Math.cos(frame * 0.017) * 15}% 35%, ${color.cool}, transparent 70%)` }} />
    </AbsoluteFill>
  );
};

const Glints: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (is2D(frame) || inMorph(frame)) return null;
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

// cold open title: letters slam over the dancing Clawd
const ColdTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= SEC.cold[1]) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ marginTop: 190, display: "flex", gap: 4 }}>
        {"CLAUDE".split("").map((l, i) => {
          const s = spring({ frame: frame - 1 - i * 2, fps, config: theme.spring.snappy });
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.font.display, fontWeight: 700, fontSize: 170, color: color.cream, display: "inline-block",
                opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                transform: `translateY(${(1 - s) * -140}px) scale(${1.7 - 0.7 * s}) rotate(${(i % 2 ? 1 : -1) * 4 * s}deg)`,
                textShadow: `8px 8px 0 ${color.clawd}`,
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// the flat pixel sprite builds in, then the morph takes over at the exact same screen spot
const PixelIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < SEC.pixel[0] || frame >= SEC.pixel[1]) return null;
  const build = spring({ frame: frame - SEC.pixel[0], fps, config: theme.spring.snappy });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 342, top: 860 - 190 }}>
        <PixelClawd px={38} fill={color.clawd} build={build} shadow={color.ink} />
      </div>
      <Word text="feel the beat" at={28} until={40} top={1180} size={96} fill={color.clawd} tilt={-3} />
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
      <PixelIntro />
      <FlatSlot />
      {/* canvas stays mounted so the GL context survives cuts; hidden on 2D frames */}
      <AbsoluteFill style={{ opacity: is2D(frame) ? 0 : 1 }}>
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          camera={{ fov: FOV }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true;
          }}
        >
          <Scene3D />
        </ThreeCanvas>
      </AbsoluteFill>
      <Haze />
      <Glints />
      <Doodles />
      <ColdTitle />
      <Word text="FEEL" at={60} until={68} top={240} size={170} />
      <Word text="THE" at={68} until={75} top={240} size={170} tilt={4} />
      <Word text="BEAT" at={75} until={90} top={240} size={170} fill={color.clawd} />
      <Word text="GET UP" at={120} until={150} top={240} size={150} />
      <Word text="SHIMMY" at={150} until={180} top={240} size={150} fill={color.clawd} tilt={4} />
      <Word text="MOON" at={180} until={195} top={240} size={190} fill={color.cool} />
      <Word text="WALK" at={195} until={225} top={240} size={190} fill={color.cream} tilt={4} />
      <Word text="3D" at={270} until={278} top={1450} size={240} fill={color.clawd} />
      <Word text="2D" at={278} until={285} top={300} size={240} fill={color.ink} tilt={6} />
      <Word text="3D" at={285} until={293} top={1450} size={240} fill={color.clawd} />
      <Word text="2D" at={293} until={300} top={300} size={240} fill={color.ink} tilt={6} />
      <Word text="LEAN" at={300} until={330} top={240} size={190} fill={color.cool} />
      <Word text="KICK!" at={330} until={345} top={240} size={180} fill={color.clawd} />
      <Word text="KICK!" at={345} until={360} top={240} size={180} fill={PINK} tilt={6} />
      <Word text="SPLIT!" at={360} until={375} top={240} size={180} fill={color.glow} />
      <Word text="SPIN!" at={375} until={390} top={240} size={180} fill={PINK} tilt={6} />
      <Confetti />
      <Outro />
      <Flash />
      <Grade />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
