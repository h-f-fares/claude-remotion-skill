import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

type SpringCfg = (typeof theme.spring)[keyof typeof theme.spring];

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

// entrance: fade + rise + scale
export const Pop: React.FC<{
  delay?: number;
  from?: number;
  config?: SpringCfg;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, from = 60, config = theme.spring.bouncy, style, children }) => {
  const p = useSp(delay, config);
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.5),
        transform: `translateY(${interpolate(p, [0, 1], [from, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// idle micro-motion for anything on screen >2s
export const useBob = (speed = 20, amp = 6, phase = 0) => {
  const frame = useCurrentFrame();
  return Math.sin(frame / speed + phase) * amp;
};

// scene wrapper: 8-frame scale-through entrance over the outgoing scene
export const SceneShell: React.FC<{ children: React.ReactNode; first?: boolean }> = ({ children, first }) => {
  const frame = useCurrentFrame();
  const o = first ? 1 : ease(frame, [0, 8], [0, 1]);
  const s = first ? 1 : ease(frame, [0, 10], [1.08, 1]);
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>{children}</AbsoluteFill>;
};

// big ink-outlined display text
export const Display: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  stroke?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 120, color = theme.colors.cream, stroke = 12, style }) => (
  <div
    style={{
      fontFamily: theme.fonts.display,
      fontSize: size,
      lineHeight: 1,
      color,
      WebkitTextStroke: `${stroke}px ${theme.colors.ink}`,
      paintOrder: "stroke fill",
      textShadow: `0 ${size * 0.06}px 0 ${theme.colors.ink}`,
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

// deterministic scatter helper
export const rnd = (seed: string) => random(seed);
