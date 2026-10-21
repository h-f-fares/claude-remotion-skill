import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "./theme";

// @font-face from public/ files: CSS fonts need no delayRender (a module-level
// delayRender around FontFace.load() stalled render tabs and timed out renders).
const font = (f: string) => staticFile(`veilllm/fonts/${f}`);
export const FontStyles: React.FC = () => (
  <style>{`
    @font-face { font-family: "Plex Sans"; font-weight: 500; src: url(${font("sans500.woff2")}) format("woff2"); font-display: block; }
    @font-face { font-family: "Plex Sans"; font-weight: 700; src: url(${font("sans700.woff2")}) format("woff2"); font-display: block; }
    @font-face { font-family: "Plex Arabic"; font-weight: 500; src: url(${font("ar-Medium.ttf")}) format("truetype"); font-display: block; }
    @font-face { font-family: "Plex Arabic"; font-weight: 700; src: url(${font("ar-Bold.ttf")}) format("truetype"); font-display: block; }
    @font-face { font-family: "Plex Mono"; font-weight: 500; src: url(${font("mono.woff2")}) format("woff2"); font-display: block; }
  `}</style>
);

export const useSpring = (delay = 0, config: keyof typeof theme.spring = "smooth") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: theme.spring[config] });
};

export const Entrance: React.FC<{ delay?: number; y?: number; config?: keyof typeof theme.spring; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay = 0, y = 40, config = "smooth", style, children }) => {
  const p = useSpring(delay, config);
  return (
    <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`, ...style }}>
      {children}
    </div>
  );
};

// Wraps a scene: fast exit at the end, so nothing hard-cuts.
export const SceneExit: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [dur - 10, dur], [0, 1], { ...clamp, easing: theme.ease.in });
  return (
    <AbsoluteFill style={{ opacity: 1 - t, transform: `translateY(${-50 * t}px) scale(${1 - 0.04 * t})`, filter: `blur(${6 * t}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const BgMesh: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 60, d2 = Math.cos(frame / 70) * 50;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${theme.colors.bgAlt}, ${theme.colors.bg} 70%)` }}>
      <div style={{ position: "absolute", width: 1300, height: 1300, borderRadius: "50%", top: -600, left: -350 + d1, filter: "blur(60px)", background: `radial-gradient(circle, ${theme.colors.primaryDeep}55, transparent 62%)` }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", bottom: -500, right: -350 - d2, filter: "blur(80px)", background: `radial-gradient(circle, ${theme.colors.primary}18, transparent 65%)` }} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${theme.colors.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.line} 1px, transparent 1px)`, backgroundSize: "60px 60px", opacity: 0.35, maskImage: "radial-gradient(ellipse at 50% 35%, black 20%, transparent 70%)", transform: `translateY(${(frame * 0.4) % 60}px)` }} />
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.primaryDeep, mixBlendMode: "soft-light", opacity: 0.2 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15), transparent 25%, transparent 70%, rgba(0,0,0,0.35))" }} />
  </AbsoluteFill>
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return <AbsoluteFill style={{ pointerEvents: "none", backgroundImage: noise, backgroundSize: "220px", backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`, opacity: 0.07, mixBlendMode: "overlay" }} />;
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
);

export const KenBurns: React.FC<{ src: string; dur: number; zoomTo?: number; position?: string }> = ({ src, dur, zoomTo = 1.1, position = "center" }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, dur], [1, zoomTo], { ...clamp, easing: theme.ease.inOut });
  const pan = interpolate(frame, [0, dur], [0, -25], { ...clamp, easing: theme.ease.inOut });
  return <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, transform: `scale(${scale}) translateX(${pan}px)` }} />;
};

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: `linear-gradient(180deg, ${theme.colors.card}, ${theme.colors.bgAlt})`, border: `1px solid ${theme.colors.line}`, borderRadius: 28, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7)", ...style }}>
    {children}
  </div>
);

// Window chrome dots for terminal-style cards.
export const Dots: React.FC = () => (
  <div style={{ display: "flex", gap: 10 }}>
    {["#FB7185", "#FBBF24", "#34D399"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.8 }} />)}
  </div>
);

export const Shield: React.FC<{ size: number; color?: string }> = ({ size, color = theme.colors.primary }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 6 L88 20 V48 C88 72 71 88 50 95 C29 88 12 72 12 48 V20 Z" fill={`${color}22`} stroke={color} strokeWidth="5" strokeLinejoin="round" />
    <path d="M32 50 L45 63 L69 37" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Cloud: React.FC<{ size: number; color?: string }> = ({ size, color = theme.colors.textDim }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 100 65">
    <path d="M26 58 C12 58 4 49 4 39 C4 29 12 21 23 21 C27 10 37 4 48 4 C62 4 73 14 75 27 C87 27 96 36 96 46 C96 53 90 58 82 58 Z" fill={`${color}18`} stroke={color} strokeWidth="4" strokeLinejoin="round" />
  </svg>
);

export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = theme.colors.textDim }) => (
  // Arabic labels: sans font, no letter-spacing (spacing breaks Arabic letter joining).
  <div style={{ fontFamily: theme.fonts.sans, fontWeight: 500, fontSize: 34, color }}>{children}</div>
);
