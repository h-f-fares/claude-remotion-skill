// theme.ts — single source of truth for the v3-portfolio YouTube video (1920x1080).
// Palette follows hfares.com and the article's sketchbook illustrations: warm paper,
// ink lines, teal hero, orange for "me / before", mustard highlights.
import { Easing } from "remotion";

export const theme = {
  colors: {
    paper: "#F4ECDD",
    paperDeep: "#E9DDC7",
    card: "#FFFBF3",
    ink: "#1E2A2E",
    inkSoft: "#5B6668",
    teal: "#0F6B66", // hero — max one glowing element per frame
    tealBright: "#2BB3A3",
    tealSoft: "#CFE8E3",
    orange: "#E8834A",
    orangeSoft: "#F8D9C4",
    mustard: "#E9B949",
    red: "#D9534F",
    green: "#3E9B5B",
    night: "#14201F",
    nightDeep: "#0B1312",
    white: "#FFFFFF",
  },
  stroke: 5,
  radius: 28,
  fonts: {
    // IBM Plex Sans Arabic carries Latin glyphs too, so one stack covers mixed lines
    main: "'IBM Plex Sans Arabic', sans-serif",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 9, stiffness: 180, mass: 0.7 },
    slam: { damping: 12, stiffness: 260, mass: 0.5 },
  },
} as const;
