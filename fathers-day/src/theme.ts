// theme.ts — single source of truth. Warm-premium palette for an emotional speech.
import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#140D07",
    primary: "#F2B45A", // hero amber — active caption word / one accent per frame
    accent: "#F4E9DA",
    text: "#FFFDF8",
    textDim: "rgba(255,253,248,0.72)",
    shadow: "rgba(10,6,2,0.55)",
    glow: "rgba(242,180,90,0.45)",
    gradeWarm: "#E8A33D",
  },
  fonts: {
    display: "Playfair Display",
    body: "Montserrat",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    gentle: { damping: 26, stiffness: 60, mass: 1 },
  },
} as const;
