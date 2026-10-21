import React from "react";
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
import { Figure } from "./Figure";
import { BEAT_F, SHOTS, beatPulse, theme } from "./theme";

const { color } = theme;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// stutter section: 3D and flat-2D shots alternate every half beat
const STUTTER = [
  { from: 90, to: 98, kind: "3d" },
  { from: 98, to: 105, kind: "2d" },
  { from: 105, to: 113, kind: "3d" },
  { from: 113, to: 120, kind: "2d" },
] as const;
const CUTS = [30, 60, 75, 90, 98, 105, 113, 120];
const inRange = (f: number, [a, b]: readonly [number, number]) => f >= a && f < b;
const is2DSlot = (f: number) => STUTTER.some((s) => s.kind === "2d" && f >= s.from && f < s.to);

/* ---------------- 2D pieces ---------------- */

// Claude's starburst, flat: 12 tapered rays of uneven length
const RAYS = [1, 0.74, 0.9, 0.68, 1, 0.8, 0.94, 0.7, 0.98, 0.82, 0.88, 0.72];
const Spark2D: React.FC<{ size: number; fill: string; rot?: number; pulse?: number; style?: React.CSSProperties }> = ({
  size, fill, rot = 0, pulse = 0, style,
}) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={style}>
    <g transform={`rotate(${rot})`}>
      {RAYS.map((l, i) => {
        const len = 30 + 62 * l * (1 + pulse * 0.18 * (i % 2 ? 0.6 : 1));
        return (
          <path
            key={i}
            d={`M -7 -14 L 7 -14 L 2.2 ${-len} Q 0 ${-len - 4} -2.2 ${-len} Z`}
            transform={`rotate(${(i / 12) * 360 + (i % 2) * 3.5})`}
            fill={fill}
          />
        );
      })}
      <circle r={22} fill={fill} />
    </g>
  </svg>
);

const Halftone: React.FC<{ tint: string; pulse: number; opacity: number }> = ({ tint, pulse, opacity }) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: `radial-gradient(${tint} ${1.6 + pulse * 1.6}px, transparent ${2.2 + pulse * 1.6}px)`,
      backgroundSize: "34px 34px",
      maskImage: "radial-gradient(ellipse at 50% 55%, black 10%, transparent 70%)",
      WebkitMaskImage: "radial-gradient(ellipse at 50% 55%, black 10%, transparent 70%)",
    }}
  />
);

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const intro = inRange(frame, SHOTS.intro);
  const flat = is2DSlot(frame);
  const bg = intro || flat ? color.orange : color.ink;
  const glow = intro || flat ? color.glow : color.orangeDeep;
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${intro ? 50 : 52}%, ${glow}${intro || flat ? "aa" : "66"} 0%, transparent ${55 + pulse * 6}%)`,
        }}
      />
      {/* giant slow-turning starburst behind the dancer */}
      {!intro && !flat && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Spark2D size={1700} fill={color.orange} rot={frame * 0.6} pulse={pulse} style={{ opacity: 0.13 }} />
        </AbsoluteFill>
      )}
      <Halftone tint={intro || flat ? color.cream : color.orange} pulse={pulse} opacity={intro || flat ? 0.22 : 0.35} />
    </AbsoluteFill>
  );
};

const Word: React.FC<{ text: string; at: number; until: number; top: number; size: number; fill?: string; tilt?: number }> = ({
  text, at, until, top, size, fill = color.cream, tilt = -4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame >= until) return null;
  const s = spring({ frame: frame - at, fps, config: theme.spring.snappy });
  return (
    <AbsoluteFill style={{ alignItems: "center", top }}>
      <div
        style={{
          fontFamily: theme.font.display,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1,
          color: fill,
          letterSpacing: -2,
          opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
          transform: `translateY(${(1 - s) * 60}px) scale(${0.6 + 0.4 * s}) rotate(${tilt * s}deg)`,
          textShadow: "0 10px 40px rgba(0,0,0,0.45)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!inRange(frame, SHOTS.intro)) return null;
  const logo = spring({ frame, fps, config: theme.spring.snappy });
  const letters = "CLAUDE".split("");
  const pulse = beatPulse(frame);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 520, transform: `scale(${logo})` }}>
        <Spark2D size={420} fill={color.cream} rot={(1 - logo) * -120 + frame * 1.5} pulse={pulse} />
      </div>
      <div style={{ position: "absolute", top: 1010, display: "flex", gap: 6 }}>
        {letters.map((l, i) => {
          const s = spring({ frame: frame - 3 - i * 3, fps, config: theme.spring.snappy });
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.font.display,
                fontWeight: 700,
                fontSize: 190,
                color: color.ink,
                display: "inline-block",
                opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                transform: `translateY(${(1 - s) * -120}px) scale(${1.6 - 0.6 * s})`,
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
      <Word text="can dance?" at={15} until={30} top={1260} size={96} fill={color.cream} tilt={-3} />
    </AbsoluteFill>
  );
};

// the flat-2D stutter frames: cream starburst + "2D", ink drop shadow
const FlatSlot: React.FC = () => {
  const frame = useCurrentFrame();
  const slot = STUTTER.find((s) => s.kind === "2d" && frame >= s.from && frame < s.to);
  if (!slot) return null;
  const local = frame - slot.from;
  const k = interpolate(local, [0, 5], [1.25, 1], { ...clamp, easing: theme.ease.out });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `scale(${k}) rotate(${(slot.from === 98 ? -1 : 1) * local * 2}deg)` }}>
        <Spark2D size={760} fill={color.cream} rot={frame * 3} pulse={beatPulse(frame * 2)} style={{ filter: `drop-shadow(16px 16px 0 ${color.ink})` }} />
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!inRange(frame, SHOTS.outro)) return null;
  const s = spring({ frame: frame - 122, fps, config: theme.spring.snappy });
  const sub = spring({ frame: frame - 130, fps, config: theme.spring.soft });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          marginTop: 250,
          padding: "18px 56px 26px",
          borderRadius: 40,
          background: color.cream,
          transform: `scale(${s}) rotate(${(1 - s) * -10 - 3}deg)`,
          boxShadow: `14px 14px 0 ${color.orange}`,
        }}
      >
        <span style={{ fontFamily: theme.font.display, fontWeight: 700, fontSize: 170, color: color.ink, letterSpacing: -4 }}>
          Claude
        </span>
      </div>
      <div
        style={{
          marginTop: 44,
          fontFamily: theme.font.display,
          fontWeight: 700,
          fontSize: 50,
          color: color.cream,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 30}px)`,
          letterSpacing: 1,
        }}
      >
        made with Claude Code × Remotion
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 3D pieces ---------------- */

type Cam = { from: [number, number, number]; to: [number, number, number]; look: [number, number, number] };
const camFor = (f: number): { cam: Cam; t: number } => {
  const shot = (a: number, b: number, cam: Cam) => ({ cam, t: (f - a) / (b - a) });
  if (f < 60) return shot(30, 60, { from: [0, 2.1, 8.6], to: [0.7, 1.9, 7.2], look: [0, 1.55, 0] });
  if (f < 75) return shot(60, 75, { from: [0.45, 2.75, 2.7], to: [0.2, 2.7, 2.3], look: [0, 2.55, 0] });
  if (f < 90) return shot(75, 90, { from: [-3.4, 0.4, 6.6], to: [-2.6, 0.5, 6.0], look: [0, 1.9, 0] });
  if (f < 98) return shot(90, 98, { from: [5.2, 1.7, 2.2], to: [4.6, 1.6, 2.6], look: [0, 1.5, 0] });
  if (f < 113) return shot(105, 113, { from: [0.4, 7.2, 3.4], to: [0, 6.6, 3.0], look: [0, 1.2, 0] });
  // outro: slow orbit pull-back, dancer framed low under the title card
  const a = interpolate(f, [120, 150], [0.55, -0.12], { ...clamp, easing: theme.ease.out });
  const r = interpolate(f, [120, 150], [5.2, 6.3], { ...clamp, easing: theme.ease.out });
  return { cam: { from: [Math.sin(a) * r, 1.9, Math.cos(a) * r], to: [Math.sin(a) * r, 1.9, Math.cos(a) * r], look: [0, 2.2, 0] }, t: 0 };
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const { cam, t } = camFor(frame);
  const e = theme.ease.out(Math.min(1, Math.max(0, t)));
  const p = cam.from.map((v, i) => v + (cam.to[i] - v) * e);
  // kick-drum shake, tiny
  const shake = beatPulse(frame, 2.5) * 0.03;
  camera.position.set(p[0] + shake, p[1] + shake * 0.6, p[2]);
  camera.lookAt(...cam.look);
  return null;
};

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const ringT = ((frame % BEAT_F) + BEAT_F) % BEAT_F / BEAT_F;
  return (
    <>
      {/* transparent shadow catcher: the 2D background shows through */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.45} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.6, 64]} />
        <meshStandardMaterial color={color.inkSoft} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[1.6, 0.035, 12, 96]} />
        <meshStandardMaterial color={color.orange} emissive={color.orange} emissiveIntensity={0.6 + pulse * 2.2} />
      </mesh>
      {/* beat ring expanding across the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={1 + ringT * 1.6}>
        <torusGeometry args={[1.6, 0.02, 8, 96]} />
        <meshBasicMaterial color={color.glow} transparent opacity={(1 - ringT) * 0.7} />
      </mesh>
    </>
  );
};

const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  return (
    <>
      <hemisphereLight args={[color.cool, color.ink, 0.55]} />
      <directionalLight
        castShadow
        position={[3, 7, 5]}
        intensity={2.6}
        color="#ffe6cf"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={5}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[-4, 3, -5]} intensity={2.2} color={color.cool} />
      <pointLight position={[0, 4.2, 1.5]} intensity={8 + pulse * 22} distance={9} color={color.glow} />
      <CameraRig />
      <Stage />
      <Figure />
    </>
  );
};

/* ---------------- finishing layers ---------------- */

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const since = Math.min(...CUTS.map((c) => (frame >= c ? frame - c : 99)));
  const o = interpolate(since, [0, 4], [0.55, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: color.cream, opacity: o, mixBlendMode: "screen" }} />;
};

const Grade: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,170,120,0.10), rgba(40,20,60,0.14))", mixBlendMode: "soft-light" }} />
);

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 30} />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
);

export const ClaudeDance: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const show3D = frame >= SHOTS.wide[0] && !is2DSlot(frame);
  return (
    <AbsoluteFill style={{ backgroundColor: color.ink }}>
      <Audio src={staticFile("claudedance/track.wav")} />
      <Background />
      <Intro />
      <FlatSlot />
      {/* keep the canvas mounted so the GL context survives cuts; hide it on 2D frames */}
      <AbsoluteFill style={{ opacity: show3D ? 1 : 0 }}>
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 46 }} gl={{ antialias: true, alpha: true }}>
          <Scene3D />
        </ThreeCanvas>
      </AbsoluteFill>
      <Word text="WRITE IT" at={30} until={45} top={250} size={150} />
      <Word text="SHIP IT" at={45} until={60} top={250} size={150} tilt={4} />
      <Word text="FEEL IT" at={75} until={90} top={250} size={150} />
      <Word text="3D" at={90} until={98} top={1450} size={260} fill={color.orange} />
      <Word text="2D" at={98} until={105} top={300} size={260} fill={color.ink} tilt={6} />
      <Word text="3D" at={105} until={113} top={1450} size={260} fill={color.orange} />
      <Word text="2D" at={113} until={120} top={300} size={260} fill={color.ink} tilt={6} />
      <Outro />
      <Flash />
      <Grade />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
