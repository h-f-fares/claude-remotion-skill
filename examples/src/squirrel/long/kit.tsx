// Editing kit for the long cut: camera punch-ins, transitions, impacts, kinetic type.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Display, ease, useSp } from "../motion";
import { isAr, num } from "./timing";

const C = theme.colors;

// camera framings cycled on every cut; scale always leaves margin for the offset
const SHOTS = [
  { s: 1.0, x: 0, y: 0, r: 0 },
  { s: 1.12, x: -30, y: -16, r: -1 },
  { s: 1.07, x: 26, y: 18, r: 0.8 },
  { s: 1.15, x: 0, y: -22, r: 0 },
];

const useCamera = (cutFrames: number[], focusY = 620) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let i = 0;
  cutFrames.forEach((c, k) => {
    if (frame >= c) i = k;
  });
  const from = SHOTS[(i + SHOTS.length - 1) % SHOTS.length];
  const to = SHOTS[i % SHOTS.length];
  const p = i === 0 ? 1 : spring({ frame: frame - cutFrames[i], fps, config: { damping: 18, stiffness: 260, mass: 0.6 } });
  const drift = Math.min(frame - (cutFrames[i] ?? 0), 120) * 0.0004;
  const sc = interpolate(p, [0, 1], [from.s, to.s]) + drift;
  const x = interpolate(p, [0, 1], [from.x, to.x]);
  const y = interpolate(p, [0, 1], [from.y, to.y]);
  const r = interpolate(p, [0, 1], [from.r, to.r]);
  return { transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${sc})`, transformOrigin: `540px ${focusY}px` };
};

// decaying screen shake at each `hits` frame
export const useShakeAt = (hits: number[], amp = 22, len = 12) => {
  const frame = useCurrentFrame();
  let x = 0, y = 0;
  for (const h of hits) {
    const k = frame - h;
    if (k >= 0 && k <= len) {
      const d = 1 - k / len;
      x += Math.sin(k * 2.7) * amp * d;
      y += Math.cos(k * 3.3) * amp * 0.6 * d;
    }
  }
  return { x, y };
};

export const Flash: React.FC<{ at: number; color?: string; peak?: number }> = ({ at, color = C.white, peak = 0.75 }) => {
  const frame = useCurrentFrame();
  const o = frame < at ? 0 : ease(frame, [at, at + 6], [peak, 0], theme.ease.out);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} /> : null;
};

// radial speed lines for impact moments
export const SpeedLines: React.FC<{ at: number; len?: number; color?: string }> = ({ at, len = 14, color = C.ink }) => {
  const frame = useCurrentFrame();
  const k = frame - at;
  if (k < 0 || k > len) return null;
  const o = 1 - k / len;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o * 0.5 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {Array.from({ length: 28 }).map((_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const r1 = 520 + (i % 3) * 60 - k * 10;
          return (
            <line key={i} x1={540 + Math.cos(a) * r1} y1={900 + Math.sin(a) * r1} x2={540 + Math.cos(a) * 1400} y2={900 + Math.sin(a) * 1400} stroke={color} strokeWidth={i % 2 ? 10 : 18} strokeLinecap="round" />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export type Enter = "whip" | "zoom" | "cut";

// Beat wrapper: entrance transition + camera that punches in on every sentence cut.
export const Shot: React.FC<{
  cuts: number[];
  enter?: Enter;
  focusY?: number;
  hits?: number[];
  first?: boolean;
  children: React.ReactNode;
}> = ({ cuts, enter = "whip", focusY, hits = [], first, children }) => {
  const frame = useCurrentFrame();
  const cam = useCamera(cuts, focusY);
  const shake = useShakeAt(hits);
  let style: React.CSSProperties = {};
  if (!first) {
    if (enter === "whip") {
      const x = ease(frame, [0, 7], [1080, 0], theme.ease.out);
      style = { transform: `translateX(${x}px)`, filter: frame < 7 ? `blur(${ease(frame, [0, 7], [18, 0])}px)` : undefined };
    } else if (enter === "zoom") {
      style = { transform: `scale(${ease(frame, [0, 8], [1.5, 1])})`, opacity: ease(frame, [0, 4], [0, 1]) };
    }
  }
  return (
    <AbsoluteFill style={{ ...style, overflow: "hidden" }}>
      <AbsoluteFill style={{ ...cam, translate: `${shake.x}px ${shake.y}px` }}>{children}</AbsoluteFill>
      {!first && enter !== "whip" && <Flash at={0} peak={enter === "zoom" ? 0.6 : 0.35} />}
    </AbsoluteFill>
  );
};

// kinetic title: words slam in one after another
export const Slam: React.FC<{
  at: number;
  words: string[];
  size?: number;
  colors?: string[];
  top: number;
  per?: number;
  rotate?: number;
}> = ({ at, words, size = 140, colors = [], top, per = 4, rotate = -3 }) => (
  <div style={{ position: "absolute", left: 50, right: 90, top, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.25, rowGap: 4, direction: isAr() ? "rtl" : "ltr", transform: `rotate(${rotate}deg)` }}>
    {words.map((wd, i) => (
      <SlamWord key={i} delay={at + i * per} size={size} color={colors[i] ?? C.cream}>
        {wd}
      </SlamWord>
    ))}
  </div>
);

const SlamWord: React.FC<{ delay: number; size: number; color: string; children: React.ReactNode }> = ({ delay, size, color, children }) => {
  const p = useSp(delay, { damping: 10, stiffness: 220, mass: 0.6 });
  return (
    <div style={{ transform: `scale(${interpolate(p, [0, 1], [2.2, 1])})`, opacity: p > 0.02 ? Math.min(1, p * 3) : 0 }}>
      <Display size={size} color={color}>
        {children}
      </Display>
    </div>
  );
};

// big numbered badge for the takeaways
export const NumberBadge: React.FC<{ at: number; n: number; top?: number }> = ({ at, n, top = 380 }) => {
  const p = useSp(at, theme.spring.bouncy);
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: C.cherry,
          border: `10px solid ${C.ink}`,
          boxShadow: `0 14px 0 ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${p}) rotate(${(1 - p) * -180 + Math.sin(frame / 12) * 3}deg)`,
        }}
      >
        <Display size={150} color={C.cream} stroke={10}>
          {num(n)}
        </Display>
      </div>
    </div>
  );
};

// chunky label card used for kinetic headlines
export const Card: React.FC<{ bg?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ bg = C.cream, children, style }) => (
  <div style={{ direction: isAr() ? "rtl" : "ltr", background: bg, border: `8px solid ${C.ink}`, borderRadius: 28, boxShadow: `0 12px 0 ${C.ink}`, padding: "18px 34px", ...style }}>{children}</div>
);
