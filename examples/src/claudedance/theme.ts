import { Easing } from "remotion";

export const FPS = 30;
export const BPM = 120;
export const BEAT_F = (FPS * 60) / BPM; // 15 frames per beat
export const TOTAL_F = FPS * 5;

// shot boundaries — every cut lands on a beat (or half-beat in the stutter section)
export const SHOTS = {
  intro: [0, 30], // 2D logo slam
  wide: [30, 60], // 3D dance, wide
  close: [60, 75], // 3D head close-up
  low: [75, 90], // 3D low angle
  stutter: [90, 120], // 2D/3D cuts every half beat
  outro: [120, 150], // 3D pose + 2D title card
} as const;

export const theme = {
  color: {
    orange: "#D97757",
    clawd: "#E8773A", // the printed-figure orange
    orangeDeep: "#B9573A",
    cream: "#F0EEE6",
    ink: "#141413",
    inkSoft: "#26231F",
    glow: "#FFB38A",
    cool: "#7FB2FF",
  },
  font: { display: "Fredoka, sans-serif" },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
  },
  spring: {
    snappy: { damping: 12, mass: 0.6, stiffness: 180 },
    soft: { damping: 200 },
  },
};

// 1 on the beat, decaying to 0 before the next one
export const beatPulse = (frame: number, decay = 4) => Math.exp(-(((frame % BEAT_F) + BEAT_F) % BEAT_F) / decay);
