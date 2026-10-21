import { Easing } from "remotion";

// "Redacted file" look: warm near-black, amber for what VeilLLM protects, red for what leaks.
export const theme = {
  colors: {
    bg: "#0B0907",
    bgAlt: "#18120C",
    card: "#1B1510",
    cardHi: "#241C14",
    line: "rgba(255,236,210,0.08)",
    hero: "#F2A93B",
    heroDeep: "#6B3F0E",
    leak: "#F05252",
    text: "#F6EFE6",
    dim: "#A39582",
    heroGlow: "rgba(242,169,59,0.40)",
    leakGlow: "rgba(240,82,82,0.45)",
  },
  fonts: {
    ar: "'Plex Arabic', 'Plex Sans', system-ui, sans-serif",
    mono: "'Plex Mono', ui-monospace, monospace",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
} as const;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
