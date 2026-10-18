import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "./theme";
import { rnd } from "./motion";

const C = theme.colors;

const Halftone: React.FC<{ color?: string; opacity?: number }> = ({ color = C.ink, opacity = 0.06 }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(${color} 2.5px, transparent 3px)`,
      backgroundSize: "26px 26px",
      opacity,
    }}
  />
);

const Blob: React.FC<{ color: string; x: number; y: number; r: number; speed: number }> = ({ color, x, y, r, speed }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        width: r,
        height: r,
        left: x + Math.sin(frame / speed) * 40,
        top: y + Math.cos(frame / (speed * 1.3)) * 30,
        borderRadius: "50%",
        filter: "blur(60px)",
        background: `radial-gradient(circle, ${color}, transparent 65%)`,
      }}
    />
  );
};

// diner interior: cream wall, chrome rail, mint wainscot, checker floor
export const DinerBg: React.FC<{ floorY?: number }> = ({ floorY = 1440 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.cream}, ${C.creamDeep})` }}>
    <Blob color={`${C.mustard}55`} x={-300} y={-200} r={1200} speed={50} />
    <Blob color={`${C.mint}44`} x={400} y={700} r={1000} speed={65} />
    <Halftone />
    <div style={{ position: "absolute", left: 0, right: 0, top: floorY - 240, height: 240, background: C.mint, borderTop: `10px solid ${C.ink}` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: floorY - 262, height: 22, background: "#D9D9D9", borderTop: `6px solid ${C.ink}`, borderBottom: `6px solid ${C.ink}` }} />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: floorY,
        bottom: 0,
        borderTop: `10px solid ${C.ink}`,
        backgroundColor: C.cream,
        backgroundImage: `repeating-conic-gradient(${C.cherry} 0 25%, ${C.cream} 0 50%)`,
        backgroundSize: "120px 120px",
      }}
    />
  </AbsoluteFill>
);

export const NightBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.navyDeep}, ${C.navy} 70%)` }}>
      <Blob color={`${C.neon}33`} x={100} y={500} r={1100} speed={45} />
      {Array.from({ length: 40 }).map((_, i) => {
        const tw = 0.5 + 0.5 * Math.sin(frame / 8 + i * 1.7);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: rnd(`sx${i}`) * 1080,
              top: rnd(`sy${i}`) * 900,
              width: 6,
              height: 6,
              borderRadius: 3,
              background: C.cream,
              opacity: 0.3 + tw * 0.6,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", right: 120, top: 220, width: 150, height: 150, borderRadius: "50%", background: C.cream, boxShadow: `0 0 80px ${C.cream}88`, border: `6px solid ${C.ink}` }} />
      <Halftone color={C.cream} opacity={0.04} />
    </AbsoluteFill>
  );
};

export const DarkBg: React.FC<{ tint?: string }> = ({ tint = C.cherry }) => (
  <AbsoluteFill style={{ background: C.dark }}>
    <Blob color={`${tint}44`} x={-200} y={300} r={1300} speed={40} />
    <Blob color={`${C.navy}aa`} x={300} y={-300} r={1000} speed={55} />
    <Halftone color={C.cream} opacity={0.04} />
  </AbsoluteFill>
);

export const SunburstBg: React.FC<{ color?: string; ray?: string }> = ({ color = C.cherry, ray = "#F25A64" }) => {
  const frame = useCurrentFrame();
  const rot = frame * 0.4;
  return (
    <AbsoluteFill style={{ background: color, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -1000,
          top: -500,
          width: 3080,
          height: 3080,
          transform: `rotate(${rot}deg)`,
          background: `repeating-conic-gradient(from 0deg at 50% 50%, ${ray} 0 7.5deg, transparent 7.5deg 15deg)`,
        }}
      />
      <Halftone opacity={0.07} />
    </AbsoluteFill>
  );
};
