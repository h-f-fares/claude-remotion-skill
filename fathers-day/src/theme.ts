// theme.ts — single source of truth. Clean, cool palette matching the footage grade.
import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#080E16",
    primary: "#A8DCFF", // hero ice blue — active caption word / one accent per frame
    accent: "#E6F2FA",
    text: "#FFFFFF",
    textDim: "rgba(255,255,255,0.75)",
    shadow: "rgba(4,8,14,0.6)",
    glow: "rgba(168,220,255,0.45)",
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
