// Kit for the 5-minute cut: dark "studio" stage with a per-chapter accent glow, browser
// frames for real site footage and screenshots, and text defaults for dark backgrounds.
// Motion primitives, icons and devices come from the first cut's kit.
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../v3/theme";
import { ease, useBob } from "../v3/kit";
import { cuts } from "./timing";

export { Badge, Bubble, Chip, Col, Count, Flash, Icon, Laptop, Phone, Pop, Row, Slam, Strike, ease, rnd, useBob, useShakeAt, useSp } from "../v3/kit";

const C = theme.colors;
export const D = {
  base: "#0B1615",
  baseDeep: "#060D0C",
  text: "#F4F1EA",
  dim: "#9FB3B0",
  glass: "#13211FE6",
  line: "#FFFFFF1F",
};
// one accent per chapter; the stage glow and chapter card take it
export const ACCENT = {
  hook: "#2BB3A3",
  versions: "#E8834A",
  hours: "#2BB3A3",
  prs: "#8B7CF6",
  numbers: "#E9B949",
  code: "#E5484D",
  bill: "#3E9B5B",
  outro: "#2BB3A3",
} as const;
export type Accent = keyof typeof ACCENT;

// ---------------------------------------------------------------- type
export const T: React.FC<{
  size?: number;
  weight?: 500 | 600 | 700;
  color?: string;
  style?: React.CSSProperties;
  ltr?: boolean;
  children: React.ReactNode;
}> = ({ size = 64, weight = 700, color = D.text, style, ltr, children }) => (
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

// marker swipe; the word flips to ink so it stays readable on the highlight
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
          top: "12%",
          bottom: "6%",
          background: color,
          borderRadius: 12,
          transform: `scaleX(${p}) rotate(-1deg)`,
          transformOrigin: "right center",
        }}
      />
      <span style={{ position: "relative", color: p > 0.5 ? C.ink : undefined }}>{children}</span>
    </span>
  );
};

export const Glass: React.FC<{ w?: number; pad?: number; accent?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  w,
  pad = 36,
  accent,
  style,
  children,
}) => (
  <div
    style={{
      width: w,
      padding: pad,
      background: D.glass,
      border: `2px solid ${accent ? accent + "88" : D.line}`,
      borderRadius: 28,
      boxShadow: `0 30px 80px #00000066${accent ? `, 0 0 60px ${accent}22` : ""}`,
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Stage: React.FC<{ children: React.ReactNode; gap?: number; zoom?: number; style?: React.CSSProperties }> = ({ children, gap = 40, zoom = 1, style }) => (
  <AbsoluteFill style={{ top: 70, bottom: 90, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap, transform: `scale(${zoom})` }}>{children}</div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- real footage
const site = (f: string) => staticFile(`videos/v3-portfolio/site/${f}`);

// browser window holding a screenshot (jpg) or a recorded scroll (mp4), with optional 3D tilt
export const Frame: React.FC<{
  src: string;
  w?: number;
  url?: string;
  tilt?: number;
  accent?: string;
  zoom?: [number, number];
  focus?: string;
  from?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ src, w = 1100, url = "hfares.com", tilt = 0, accent, zoom = [1, 1.06], focus = "50% 0%", from = 0, dur = 240, style }) => {
  const frame = useCurrentFrame();
  const k = ease(frame, [from, from + dur], [0, 1], theme.ease.inOut);
  const h = w * 0.625;
  const video = src.endsWith(".mp4");
  return (
    <div style={{ perspective: 2000, ...style }}>
      <div
        style={{
          width: w,
          borderRadius: 18,
          overflow: "hidden",
          background: "#1B2725",
          border: `2px solid ${accent ? accent + "aa" : D.line}`,
          boxShadow: `0 40px 100px #000000aa${accent ? `, 0 0 90px ${accent}33` : ""}`,
          transform: `rotateY(${tilt}deg)`,
        }}
      >
        <div style={{ height: 44, display: "flex", alignItems: "center", gap: 9, padding: "0 16px", direction: "ltr" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
          ))}
          <div style={{ marginLeft: 14, flex: 1, height: 28, borderRadius: 8, background: "#0F1918", color: D.dim, fontFamily: theme.fonts.main, fontSize: 17, display: "flex", alignItems: "center", padding: "0 14px" }}>
            {url}
          </div>
        </div>
        <div style={{ width: w, height: h, overflow: "hidden", background: C.white }}>
          {video ? (
            <Sequence from={from} layout="none">
              <OffthreadVideo src={site(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus }} />
            </Sequence>
          ) : (
            <Img
              src={site(src)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus, transform: `scale(${interpolate(k, [0, 1], zoom)})`, transformOrigin: focus }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// a cropped screenshot panel (Lighthouse etc.) with a label tab
export const Shot: React.FC<{ src: string; w: number; label?: string; accent?: string }> = ({ src, w, label, accent = D.line }) => (
  <div style={{ position: "relative" }}>
    {label && (
      <div style={{ position: "absolute", top: -54, right: 0, fontFamily: theme.fonts.main, fontWeight: 700, fontSize: 34, color: D.text }}>{label}</div>
    )}
    <div style={{ width: w, borderRadius: 16, overflow: "hidden", border: `3px solid ${accent}`, boxShadow: "0 30px 80px #000000aa", background: C.white }}>
      <Img src={site(src)} style={{ width: "100%", display: "block" }} />
    </div>
  </div>
);

// ---------------------------------------------------------------- stage background
// layered depth, all moving slowly: base → accent glows → perspective grid → blurred
// screenshot (optional) → grain + vignette (in Finish)
export const StudioBg: React.FC<{ accent: string; behind?: string }> = ({ accent, behind }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: D.base, overflow: "hidden" }}>
      {behind && (
        <AbsoluteFill style={{ opacity: 0.16, filter: "blur(18px) saturate(0.6)", transform: `scale(${1.15 + Math.sin(t / 6) * 0.02})` }}>
          <Img src={site(behind)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      )}
      <div
        style={{
          position: "absolute",
          left: 1250 + Math.sin(t / 5) * 120,
          top: -380 + Math.cos(t / 6) * 80,
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}55 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -420 + Math.cos(t / 7) * 100,
          top: 420 + Math.sin(t / 5) * 80,
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: "radial-gradient(circle, #0F6B6644 0%, transparent 65%)",
        }}
      />
      {/* perspective floor grid drifting toward the viewer */}
      <div style={{ position: "absolute", left: -600, right: -600, bottom: -200, height: 700, perspective: 600, opacity: 0.5 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: "rotateX(68deg)",
            transformOrigin: "50% 100%",
            backgroundImage: `linear-gradient(${accent}40 2px, transparent 2px), linear-gradient(90deg, ${accent}40 2px, transparent 2px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: `0px ${(frame * 1.2) % 90}px`,
            maskImage: "linear-gradient(to top, black 10%, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to top, black 10%, transparent 85%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 8;
  return (
    <>
      <AbsoluteFill style={{ opacity: 0.07, pointerEvents: "none", mixBlendMode: "screen" }}>
        <svg width="1920" height="1080">
          <filter id={`n${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="1920" height="1080" filter={`url(#n${seed})`} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, #000000aa 100%)", pointerEvents: "none" }} />
    </>
  );
};

// ---------------------------------------------------------------- beat wrapper
const SHOTS = [
  { s: 1.0, x: 0, y: 0, r: 0 },
  { s: 1.04, x: -22, y: -10, r: -0.3 },
  { s: 1.025, x: 18, y: 8, r: 0.25 },
  { s: 1.05, x: 0, y: -12, r: 0 },
];
export type Enter = "zoom" | "slide" | "cut";
// `cutFrames` lets another cut (with its own timing) reuse the wrapper
export const Beat: React.FC<{ b: number; len: number; accent: string; behind?: string; enter?: Enter; cutFrames?: number[]; children: React.ReactNode }> = ({
  b,
  len,
  accent,
  behind,
  enter = "zoom",
  cutFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cf = cutFrames ?? cuts(b);
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
  const enterT = enter === "zoom" ? `scale(${interpolate(inP, [0, 1], [1.1, 1])})` : enter === "slide" ? `translateX(${interpolate(inP, [0, 1], [-240, 0])}px)` : "";
  const outK = ease(frame, [len - 7, len], [0, 1], theme.ease.in);
  const blur = enter === "slide" ? (1 - inP) * 14 : 0;
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, inP * 1.4) * (1 - outK), filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <StudioBg accent={accent} behind={behind} />
      <AbsoluteFill style={{ transform: `${enterT} ${cam} scale(${1 - outK * 0.04})`, transformOrigin: "960px 520px" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// chapter card: full-bleed accent wipe for the first ~1.3 s of a chapter
export const Chapter: React.FC<{ n: number; title: string; accent: string }> = ({ n, title, accent }) => {
  const frame = useCurrentFrame();
  const bob = useBob(10, 4);
  if (frame > 42) return null;
  const wipe = ease(frame, [0, 10], [0, 1]);
  const out = ease(frame, [30, 40], [0, 1], theme.ease.in);
  return (
    <AbsoluteFill style={{ zIndex: 5, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`, opacity: 1 - out, background: D.baseDeep, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 40%, ${accent}55, transparent 60%)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 40, direction: "rtl", transform: `translateY(${bob}px)` }}>
        <div style={{ width: 170, height: 170, borderRadius: 40, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <T size={110} color={C.ink} ltr>{n}</T>
        </div>
        <T size={120}>{title}</T>
      </div>
    </AbsoluteFill>
  );
};
