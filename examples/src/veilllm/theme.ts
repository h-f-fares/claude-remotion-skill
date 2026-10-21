import { Easing } from "remotion";
import { t } from "./lang";

export const theme = {
  colors: {
    bg: "#070B10",
    bgAlt: "#0E151C",
    card: "#111A22",
    line: "rgba(255,255,255,0.09)",
    primary: "#5EEAD4", // teal hero
    primaryDeep: "#0F6B66",
    danger: "#FB7185",
    text: "#F2F5F7",
    textDim: "#8A99A6",
    glow: "rgba(94,234,212,0.35)",
    dangerGlow: "rgba(251,113,133,0.35)",
  },
  fonts: {
    sans: t("'Plex Sans', system-ui, sans-serif", "'Plex Arabic', 'Plex Sans', system-ui, sans-serif"),
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
