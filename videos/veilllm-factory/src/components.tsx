import React from "react";
import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "./theme";

const C = theme.colors;

// Plain CSS @font-face: no delayRender around FontFace.load(), which hung render tabs.
const font = (f: string) => staticFile(`fonts/${f}`);
export const FontStyles: React.FC = () => (
  <style>{`
    * { box-sizing: border-box; }
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

// Opacity + rise + scale together. A negative delay means "already in" at frame 0.
export const Entrance: React.FC<{ delay?: number; y?: number; config?: keyof typeof theme.spring; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay = 0, y = 40, config = "smooth", style, children }) => {
  const p = useSpring(delay, config);
  return (
    <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px) scale(${interpolate(p, [0, 1], [0.93, 1])})`, ...style }}>
      {children}
    </div>
  );
};

// Faster exit than any entrance, so scenes never hard-cut.
export const SceneExit: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [dur - 9, dur], [0, 1], { ...clamp, easing: theme.ease.in });
  return (
    <AbsoluteFill style={{ opacity: 1 - t, transform: `translateY(${-46 * t}px) scale(${1 - 0.04 * t})`, filter: `blur(${6 * t}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

// Idle micro-motion for anything on screen longer than ~2s.
export const useBreath = (amp = 6, speed = 40, phase = 0) => {
  const frame = useCurrentFrame();
  return Math.sin(frame / speed + phase) * amp;
};

export const BgMesh: React.FC<{ tint?: string }> = ({ tint = C.heroDeep }) => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 60) * 70, d2 = Math.cos(frame / 75) * 55;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bgAlt}, ${C.bg} 65%)` }}>
      <div style={{ position: "absolute", width: 1300, height: 1300, borderRadius: "50%", top: -620, right: -380 + d1, filter: "blur(70px)", background: `radial-gradient(circle, ${tint}66, transparent 62%)` }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", bottom: -520, left: -360 - d2, filter: "blur(80px)", background: `radial-gradient(circle, ${C.hero}14, transparent 65%)` }} />
      {/* faint redaction-bar texture drifting down */}
      <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(180deg, ${C.line} 0 2px, transparent 2px 46px)`, opacity: 0.5, transform: `translateY(${(frame * 0.35) % 46}px)`, maskImage: "radial-gradient(ellipse at 50% 40%, black 15%, transparent 70%)" }} />
    </AbsoluteFill>
  );
};

export const Grade: React.FC<{ color?: string; amount?: number }> = ({ color = C.heroDeep, amount = 0.18 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: color, mixBlendMode: "soft-light", opacity: amount }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25), transparent 22%, transparent 70%, rgba(0,0,0,0.45))" }} />
  </AbsoluteFill>
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.07, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.6) 100%)" }} />
);

// Top-of-frame label inside the 9:16 safe zone.
export const Kicker: React.FC<{ children: React.ReactNode; delay?: number; color?: string }> = ({ children, delay = 0, color = C.hero }) => (
  <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <Entrance delay={delay} y={-24} config="snappy">
      <div style={{ fontFamily: theme.fonts.ar, fontWeight: 700, fontSize: 46, color, padding: "10px 30px", borderRadius: 999, border: `2px solid ${color}55`, background: `${C.card}cc`, direction: "rtl" }}>
        {children}
      </div>
    </Entrance>
  </div>
);

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; glow?: string }> = ({ style, children, glow }) => (
  <div style={{ background: `linear-gradient(180deg, ${C.cardHi}, ${C.card})`, border: `1.5px solid ${C.line}`, borderRadius: 28, boxShadow: `0 30px 80px rgba(0,0,0,0.5)${glow ? `, 0 0 70px ${glow}` : ""}`, ...style }}>
    {children}
  </div>
);

// ---- icons drawn in theme colours (no emoji) ----
export const CloudIcon: React.FC<{ size?: number; color?: string }> = ({ size = 160, color = C.text }) => (
  <svg width={size} height={size * 0.68} viewBox="0 0 100 68" fill="none">
    <path d="M26 62h50a18 18 0 0 0 2-35.9A24 24 0 0 0 32 20 20 20 0 0 0 26 62Z" stroke={color} strokeWidth="5" strokeLinejoin="round" fill={`${color}14`} />
  </svg>
);

export const LockIcon: React.FC<{ size?: number; color?: string; open?: number }> = ({ size = 90, color = C.hero, open = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d={`M30 46V32a20 20 0 0 1 40 0${open > 0.5 ? "v-6" : "v14"}`} stroke={color} strokeWidth="8" strokeLinecap="round" transform={`translate(0 ${-8 * open})`} />
    <rect x="18" y="44" width="64" height="48" rx="10" fill={color} />
    <circle cx="50" cy="66" r="7" fill={C.bg} />
  </svg>
);

export const ShieldIcon: React.FC<{ size?: number; color?: string }> = ({ size = 220, color = C.hero }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115" fill="none">
    <path d="M50 4 92 20v34c0 28-18 48-42 57C26 102 8 82 8 54V20L50 4Z" fill={`${color}22`} stroke={color} strokeWidth="5" strokeLinejoin="round" />
    <path d="M28 52h44M28 64h30M28 76h38" stroke={color} strokeWidth="7" strokeLinecap="round" />
  </svg>
);

export const BubbleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 120, color = C.hero }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M14 18h72a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H44L24 90V74H14a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8Z" fill={`${color}22`} stroke={color} strokeWidth="5" strokeLinejoin="round" />
    <circle cx="32" cy="46" r="5" fill={color} /><circle cx="50" cy="46" r="5" fill={color} /><circle cx="68" cy="46" r="5" fill={color} />
  </svg>
);

export const GithubIcon: React.FC<{ size?: number; color?: string }> = ({ size = 90, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);
