// Editing kit for the v3-portfolio video: motion helpers, paper background, finishing
// layers, sketchbook cards/chips, counters and a small ink icon set.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { cuts } from "./timing";

const C = theme.colors;
type SpringCfg = (typeof theme.spring)[keyof typeof theme.spring];

// ---------------------------------------------------------------- motion
export const useSp = (delay = 0, config: SpringCfg = theme.spring.snappy) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

// eased, clamped interpolate — never linear
export const ease = (
  frame: number,
  range: [number, number],
  out: [number, number],
  easing: (t: number) => number = theme.ease.out,
) => interpolate(frame, range, out, { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const useBob = (speed = 24, amp = 6, phase = 0) => Math.sin(useCurrentFrame() / speed + phase) * amp;

// entrance: fade + rise + scale; optional fast exit at `out`
export const Pop: React.FC<{
  at?: number;
  out?: number;
  from?: number;
  x?: number;
  config?: SpringCfg;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at = 0, out, from = 50, x = 0, config = theme.spring.bouncy, style, children }) => {
  const frame = useCurrentFrame();
  const p = useSp(at, config);
  const e = out === undefined ? 0 : ease(frame, [out, out + 9], [0, 1], theme.ease.in);
  if (frame < at) return null;
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.6) * (1 - e),
        transform: `translate(${interpolate(p, [0, 1], [x, 0])}px, ${interpolate(p, [0, 1], [from, 0]) + e * 30}px) scale(${interpolate(p, [0, 1], [0.6, 1]) - e * 0.1})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// big 1–4 word punch: scale 1.8 → 1 with a slight tilt settle
export const Slam: React.FC<{ at?: number; out?: number; tilt?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at = 0,
  out,
  tilt = -2,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = useSp(at, theme.spring.slam);
  const e = out === undefined ? 0 : ease(frame, [out, out + 8], [0, 1], theme.ease.in);
  if (frame < at) return null;
  return (
    <div
      style={{
        opacity: Math.min(1, p * 3) * (1 - e),
        transform: `scale(${interpolate(p, [0, 1], [1.8, 1]) - e * 0.15}) rotate(${interpolate(p, [0, 1], [tilt * 3, tilt])}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- type
export const T: React.FC<{
  size?: number;
  weight?: 500 | 600 | 700;
  color?: string;
  style?: React.CSSProperties;
  ltr?: boolean;
  children: React.ReactNode;
}> = ({ size = 64, weight = 700, color = C.ink, style, ltr, children }) => (
  <div
    style={{
      fontFamily: theme.fonts.main,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.3,
      direction: ltr ? "ltr" : "rtl",
      textAlign: "center",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// marker swipe behind a word, drawn `at` frames in
export const Mark: React.FC<{ at?: number; color?: string; children: React.ReactNode }> = ({ at = 0, color = C.mustard, children }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, [at, at + 12], [0, 1]);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 14px" }}>
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "8%",
          height: "42%",
          background: color,
          opacity: 0.85,
          borderRadius: 10,
          transform: `scaleX(${p}) rotate(-1deg)`,
          transformOrigin: "right center",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

// animated strike-through line over its children
export const Strike: React.FC<{ at: number; color?: string; children: React.ReactNode }> = ({ at, color = C.red, children }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, [at, at + 10], [0, 1]);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span
        style={{
          position: "absolute",
          left: -10,
          right: -10,
          top: "52%",
          height: 9,
          borderRadius: 6,
          background: color,
          transform: `scaleX(${p}) rotate(-4deg)`,
          transformOrigin: "right center",
        }}
      />
    </span>
  );
};

// number counter with eased ramp
export const Count: React.FC<{
  from?: number;
  to: number;
  at?: number;
  dur?: number;
  fmt?: (n: number) => string;
}> = ({ from = 0, to, at = 0, dur = 30, fmt = (n) => Math.round(n).toLocaleString("en-US") }) => {
  const frame = useCurrentFrame();
  const v = ease(frame, [at, at + dur], [from, to], theme.ease.out);
  return <span style={{ fontVariantNumeric: "tabular-nums", direction: "ltr", display: "inline-block" }}>{fmt(v)}</span>;
};

// ---------------------------------------------------------------- surfaces
export const Card: React.FC<{
  w?: number;
  h?: number;
  pad?: number;
  bg?: string;
  border?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ w, h, pad = 36, bg = C.card, border = C.ink, style, children }) => (
  <div
    style={{
      width: w,
      height: h,
      padding: pad,
      background: bg,
      border: `${theme.stroke}px solid ${border}`,
      borderRadius: theme.radius,
      boxShadow: `10px 10px 0 ${C.ink}`,
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ bg?: string; color?: string; size?: number; ltr?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({
  bg = C.card,
  color = C.ink,
  size = 44,
  ltr,
  children,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: `${size * 0.28}px ${size * 0.7}px`,
      background: bg,
      color,
      border: `4px solid ${C.ink}`,
      borderRadius: 999,
      boxShadow: `6px 6px 0 ${C.ink}`,
      fontFamily: theme.fonts.main,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.25,
      direction: ltr ? "ltr" : "rtl",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Row: React.FC<{ gap?: number; style?: React.CSSProperties; children: React.ReactNode; ltr?: boolean }> = ({ gap = 40, style, children, ltr }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap, direction: ltr ? "ltr" : "rtl", ...style }}>{children}</div>
);
export const Col: React.FC<{ gap?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ gap = 30, style, children }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap, ...style }}>{children}</div>
);
// centred stage that keeps content above the subtitle band; `zoom` enlarges narrow layouts
export const Stage: React.FC<{ children: React.ReactNode; gap?: number; top?: number; zoom?: number; style?: React.CSSProperties }> = ({
  children,
  gap = 40,
  top = 60,
  zoom = 1.12,
  style,
}) => (
  <AbsoluteFill style={{ top, bottom: 240, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap, transform: `scale(${zoom})` }}>{children}</div>
  </AbsoluteFill>
);

// article illustration in a sketchbook frame with Ken Burns
export const Illus: React.FC<{ n: number; w?: number; zoom?: [number, number]; pan?: [number, number]; dur?: number; tilt?: number }> = ({
  n,
  w = 1120,
  zoom = [1, 1.1],
  pan = [0, -30],
  dur = 240,
  tilt = -1.2,
}) => {
  const frame = useCurrentFrame();
  const k = ease(frame, [0, dur], [0, 1], theme.ease.inOut);
  const bob = useBob(40, 3);
  return (
    <div
      style={{
        width: w,
        height: (w * 768) / 1344,
        borderRadius: theme.radius,
        border: `${theme.stroke}px solid ${C.ink}`,
        boxShadow: `12px 12px 0 ${C.ink}`,
        overflow: "hidden",
        transform: `rotate(${tilt + bob * 0.1}deg)`,
        background: C.paper,
      }}
    >
      <Img
        src={staticFile(`videos/v3-portfolio/img/${n}.webp`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${interpolate(k, [0, 1], zoom)}) translateX(${interpolate(k, [0, 1], pan)}px)`,
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------- finishing layers
export const PaperBg: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const frame = useCurrentFrame();
  const blobs = [
    { x: 300, y: 260, r: 520, c: dark ? C.teal : C.tealSoft, sp: 260 },
    { x: 1600, y: 820, r: 600, c: dark ? "#1F3A36" : C.orangeSoft, sp: 300 },
    { x: 1500, y: 160, r: 380, c: dark ? "#203230" : "#F1E3B8", sp: 220 },
  ];
  return (
    <AbsoluteFill style={{ background: dark ? C.night : C.paper, overflow: "hidden" }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - b.r + Math.sin(frame / b.sp + i) * 60,
            top: b.y - b.r + Math.cos(frame / b.sp + i * 2) * 50,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.c} 0%, transparent 68%)`,
            opacity: dark ? 0.55 : 0.75,
          }}
        />
      ))}
      {/* faint notebook dot grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${dark ? "#ffffff14" : "#1E2A2E14"} 2.5px, transparent 2.5px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: `${(frame * 0.15) % 48}px 0px`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 8;
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #ffd9a010 0%, transparent 40%, #1E2A2E10 100%)", mixBlendMode: "multiply", pointerEvents: "none" }} />
      <AbsoluteFill style={{ opacity: 0.08, pointerEvents: "none", mixBlendMode: "multiply" }}>
        <svg width="1920" height="1080">
          <filter id={`g${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="1920" height="1080" filter={`url(#g${seed})`} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 58%, #1E2A2E38 100%)", pointerEvents: "none" }} />
    </>
  );
};

// ---------------------------------------------------------------- camera + transitions
const SHOTS = [
  { s: 1.0, x: 0, y: 0, r: 0 },
  { s: 1.05, x: -24, y: -10, r: -0.4 },
  { s: 1.03, x: 20, y: 8, r: 0.3 },
  { s: 1.06, x: 0, y: -14, r: 0 },
];

// beat wrapper: entrance transition + gentle punch-in on every sentence cut + fast exit
export type Enter = "zoom" | "slide" | "cut";
export const Beat: React.FC<{ b: number; len: number; enter?: Enter; dark?: boolean; children: React.ReactNode }> = ({
  b,
  len,
  enter = "zoom",
  dark,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cf = cuts(b);
  let i = 0;
  cf.forEach((c, k) => {
    if (frame >= c) i = k;
  });
  const from = SHOTS[(i + SHOTS.length - 1) % SHOTS.length];
  const to = SHOTS[i % SHOTS.length];
  const p = i === 0 ? 1 : spring({ frame: frame - cf[i], fps, config: { damping: 20, stiffness: 200, mass: 0.7 } });
  const drift = Math.min(frame - (cf[i] ?? 0), 150) * 0.00015;
  const cam = `translate(${interpolate(p, [0, 1], [from.x, to.x])}px, ${interpolate(p, [0, 1], [from.y, to.y])}px) rotate(${interpolate(p, [0, 1], [from.r, to.r])}deg) scale(${interpolate(p, [0, 1], [from.s, to.s]) + drift})`;

  const inP = enter === "cut" ? 1 : ease(frame, [0, 12], [0, 1]);
  const enterT =
    enter === "zoom" ? `scale(${interpolate(inP, [0, 1], [1.12, 1])})` : enter === "slide" ? `translateX(${interpolate(inP, [0, 1], [-260, 0])}px)` : "";
  const outK = ease(frame, [len - 7, len], [0, 1], theme.ease.in);
  const blur = enter === "slide" ? (1 - inP) * 14 : 0;
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, inP * 1.4) * (1 - outK), filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <PaperBg dark={dark} />
      <AbsoluteFill style={{ transform: `${enterT} ${cam} scale(${1 - outK * 0.04})`, transformOrigin: "960px 470px" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{ at: number; color?: string; peak?: number }> = ({ at, color = C.white, peak = 0.7 }) => {
  const frame = useCurrentFrame();
  const o = frame < at ? 0 : ease(frame, [at, at + 7], [peak, 0]);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} /> : null;
};

export const useShakeAt = (hits: number[], amp = 14, len = 10) => {
  const frame = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const k = frame - h;
    if (k >= 0 && k <= len) {
      const d = 1 - k / len;
      x += Math.sin(k * 2.7) * amp * d;
      y += Math.cos(k * 3.3) * amp * 0.6 * d;
    }
  }
  return `translate(${x}px, ${y}px)`;
};

// ---------------------------------------------------------------- icons (ink line art)
type IconName =
  | "phone" | "laptop" | "cloud" | "check" | "x" | "clock" | "eye" | "robot" | "code" | "file" | "cursor"
  | "cookie" | "chart" | "bolt" | "chat" | "keyboard" | "link" | "server" | "brush" | "image" | "question"
  | "search" | "lock" | "calendar" | "dollar" | "merge" | "moon" | "sun" | "comment" | "play" | "bell";

const ICONS: Record<IconName, React.ReactNode> = {
  phone: (<><rect x="30" y="8" width="40" height="84" rx="8" /><line x1="44" y1="80" x2="56" y2="80" /></>),
  laptop: (<><rect x="18" y="22" width="64" height="44" rx="5" /><path d="M8 78 h84 l-6 -10 h-72 z" /></>),
  cloud: (<path d="M28 74 h46 a16 16 0 0 0 0 -32 a22 22 0 0 0 -42 -6 a18 18 0 0 0 -4 38 z" />),
  check: (<path d="M20 52 l20 20 l40 -44" />),
  x: (<><line x1="24" y1="24" x2="76" y2="76" /><line x1="76" y1="24" x2="24" y2="76" /></>),
  clock: (<><circle cx="50" cy="50" r="38" /><path d="M50 26 v26 l16 10" /></>),
  eye: (<><path d="M8 50 q42 -40 84 0 q-42 40 -84 0 z" /><circle cx="50" cy="50" r="12" /></>),
  robot: (<><rect x="22" y="32" width="56" height="44" rx="10" /><circle cx="40" cy="54" r="5" /><circle cx="60" cy="54" r="5" /><line x1="50" y1="32" x2="50" y2="18" /><circle cx="50" cy="14" r="4" /><line x1="22" y1="54" x2="12" y2="54" /><line x1="78" y1="54" x2="88" y2="54" /></>),
  code: (<><path d="M36 30 l-20 20 l20 20" /><path d="M64 30 l20 20 l-20 20" /><line x1="56" y1="22" x2="44" y2="78" /></>),
  file: (<><path d="M26 10 h34 l16 16 v64 h-50 z" /><path d="M60 10 v16 h16" /><line x1="36" y1="48" x2="66" y2="48" /><line x1="36" y1="62" x2="66" y2="62" /></>),
  cursor: (<path d="M28 14 l0 66 l16 -16 l12 26 l10 -5 l-12 -25 l22 0 z" />),
  cookie: (<><circle cx="50" cy="50" r="38" /><circle cx="38" cy="40" r="4" /><circle cx="60" cy="58" r="4" /><circle cx="44" cy="64" r="3" /><circle cx="62" cy="36" r="3" /></>),
  chart: (<><path d="M14 84 h74" /><path d="M20 70 l20 -18 l16 10 l28 -32" /><path d="M74 30 h10 v10" /></>),
  bolt: (<path d="M56 8 l-30 48 h22 l-6 36 l32 -50 h-22 z" />),
  chat: (<><path d="M14 22 h72 v44 h-40 l-18 16 v-16 h-14 z" /><line x1="30" y1="38" x2="70" y2="38" /><line x1="30" y1="50" x2="58" y2="50" /></>),
  keyboard: (<><rect x="10" y="28" width="80" height="44" rx="6" /><line x1="24" y1="42" x2="28" y2="42" /><line x1="40" y1="42" x2="44" y2="42" /><line x1="56" y1="42" x2="60" y2="42" /><line x1="72" y1="42" x2="76" y2="42" /><line x1="30" y1="58" x2="70" y2="58" /></>),
  link: (<><path d="M42 58 l16 -16" /><path d="M36 48 l-10 10 a12 12 0 0 0 17 17 l10 -10" /><path d="M64 52 l10 -10 a12 12 0 0 0 -17 -17 l-10 10" /></>),
  server: (<><rect x="18" y="16" width="64" height="28" rx="5" /><rect x="18" y="56" width="64" height="28" rx="5" /><circle cx="32" cy="30" r="3" /><circle cx="32" cy="70" r="3" /></>),
  brush: (<><path d="M70 12 l18 18 l-34 34 l-18 -18 z" /><path d="M36 46 q-20 4 -22 30 q22 0 30 -14" /></>),
  image: (<><rect x="12" y="20" width="76" height="60" rx="6" /><circle cx="34" cy="40" r="7" /><path d="M14 74 l24 -22 l16 14 l12 -10 l20 18" /></>),
  question: (<><path d="M34 34 a16 16 0 1 1 22 15 q-6 3 -6 11 v6" /><circle cx="50" cy="80" r="2" /></>),
  search: (<><circle cx="42" cy="42" r="26" /><line x1="62" y1="62" x2="86" y2="86" /></>),
  lock: (<><rect x="22" y="44" width="56" height="42" rx="6" /><path d="M34 44 v-12 a16 16 0 0 1 32 0 v12" /></>),
  calendar: (<><rect x="14" y="20" width="72" height="66" rx="6" /><line x1="14" y1="38" x2="86" y2="38" /><line x1="34" y1="12" x2="34" y2="26" /><line x1="66" y1="12" x2="66" y2="26" /></>),
  dollar: (<><path d="M64 30 q-6 -10 -16 -10 q-16 0 -16 13 q0 11 18 15 q18 4 18 16 q0 14 -18 14 q-12 0 -18 -10" /><line x1="50" y1="10" x2="50" y2="90" /></>),
  merge: (<><circle cx="30" cy="20" r="8" /><circle cx="30" cy="80" r="8" /><circle cx="72" cy="50" r="8" /><path d="M30 28 v44" /><path d="M30 34 q0 16 34 16" /></>),
  moon: (<path d="M64 14 a36 36 0 1 0 22 52 a30 30 0 0 1 -22 -52 z" />),
  sun: (<><circle cx="50" cy="50" r="18" /><path d="M50 10 v10 M50 80 v10 M10 50 h10 M80 50 h10 M22 22 l7 7 M71 71 l7 7 M22 78 l7 -7 M71 29 l7 -7" /></>),
  comment: (<><path d="M14 18 h72 v50 h-44 l-20 16 v-16 h-8 z" /><circle cx="36" cy="44" r="3" /><circle cx="50" cy="44" r="3" /><circle cx="64" cy="44" r="3" /></>),
  play: (<><rect x="10" y="22" width="80" height="56" rx="14" /><path d="M42 36 l22 14 l-22 14 z" /></>),
  bell: (<><path d="M26 70 v-24 a24 24 0 0 1 48 0 v24 l6 8 h-60 z" /><path d="M42 84 a8 8 0 0 0 16 0" /></>),
};

export const Icon: React.FC<{ name: IconName; size?: number; color?: string; fill?: string; draw?: number; sw?: number }> = ({
  name,
  size = 120,
  color = C.ink,
  fill = "none",
  draw,
  sw = 6,
}) => {
  const frame = useCurrentFrame();
  // optional hand-drawn stroke reveal starting at `draw`
  const dash = draw === undefined ? undefined : ease(frame, [draw, draw + 18], [400, 0]);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <g
        fill={fill}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash === undefined ? undefined : 400}
        strokeDashoffset={dash}
      >
        {ICONS[name]}
      </g>
    </svg>
  );
};

// icon in a round sticker
export const Badge: React.FC<{ name: IconName; bg?: string; color?: string; size?: number }> = ({ name, bg = C.card, color = C.ink, size = 150 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      border: `${theme.stroke}px solid ${C.ink}`,
      boxShadow: `7px 7px 0 ${C.ink}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Icon name={name} size={size * 0.62} color={color} />
  </div>
);

// ---------------------------------------------------------------- devices
export const Phone: React.FC<{ w?: number; glow?: boolean; off?: boolean; children?: React.ReactNode }> = ({ w = 360, glow, off, children }) => (
  <div
    style={{
      width: w,
      height: w * 2.05,
      borderRadius: w * 0.14,
      background: C.ink,
      padding: w * 0.045,
      boxSizing: "border-box",
      boxShadow: glow ? `0 0 70px ${C.tealBright}88, 12px 12px 0 #00000030` : "12px 12px 0 #00000030",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: w * 0.1,
        background: off ? "#0d1514" : C.card,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: 22,
        boxSizing: "border-box",
      }}
    >
      {!off && children}
    </div>
  </div>
);

export const Bubble: React.FC<{ me?: boolean; at: number; children: React.ReactNode; size?: number }> = ({ me, at, children, size = 26 }) => (
  <Pop at={at} from={20} config={theme.spring.snappy} style={{ alignSelf: me ? "flex-start" : "flex-end", maxWidth: "88%" }}>
    <div
      style={{
        background: me ? C.teal : C.paperDeep,
        color: me ? C.white : C.ink,
        borderRadius: 18,
        padding: "10px 16px",
        fontFamily: theme.fonts.main,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.35,
        direction: "rtl",
      }}
    >
      {children}
    </div>
  </Pop>
);

export const Laptop: React.FC<{ w?: number; asleep?: boolean }> = ({ w = 520, asleep }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: w }}>
      <div
        style={{
          width: w * 0.82,
          height: w * 0.52,
          margin: "0 auto",
          background: asleep ? "#26302f" : C.card,
          border: `${theme.stroke}px solid ${C.ink}`,
          borderRadius: "18px 18px 4px 4px",
        }}
      />
      <div style={{ width: w, height: w * 0.05, background: C.paperDeep, border: `${theme.stroke}px solid ${C.ink}`, borderRadius: "4px 4px 18px 18px", boxSizing: "border-box" }} />
      {asleep &&
        [0, 1, 2].map((i) => {
          const t = (frame + i * 20) % 60;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                right: w * 0.06 - t * 0.8,
                top: -20 - t * 1.6,
                fontFamily: theme.fonts.main,
                fontWeight: 700,
                fontSize: 40 + i * 10,
                color: C.inkSoft,
                opacity: interpolate(t, [0, 10, 50, 60], [0, 1, 1, 0]),
              }}
            >
              z
            </div>
          );
        })}
    </div>
  );
};

// window-style card with a title bar (browser, PR, receipt)
export const Win: React.FC<{ w?: number; title?: string; bar?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({
  w = 760,
  title,
  bar = C.paperDeep,
  children,
  style,
}) => (
  <div style={{ width: w, background: C.card, border: `${theme.stroke}px solid ${C.ink}`, borderRadius: 22, boxShadow: `10px 10px 0 ${C.ink}`, overflow: "hidden", ...style }}>
    <div style={{ height: 56, background: bar, borderBottom: `${theme.stroke}px solid ${C.ink}`, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", direction: "ltr" }}>
      {[C.red, C.mustard, C.green].map((c) => (
        <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c, border: `3px solid ${C.ink}` }} />
      ))}
      {title && (
        <div style={{ marginLeft: 16, fontFamily: theme.fonts.main, fontWeight: 600, fontSize: 26, color: C.ink, direction: "ltr" }}>{title}</div>
      )}
    </div>
    <div style={{ padding: 30 }}>{children}</div>
  </div>
);

// deterministic scatter helper
export const rnd = (seed: string) => random(seed);
