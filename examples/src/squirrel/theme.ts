// theme.ts — single source of truth for the squirrel-burger Short.
import { Easing } from "remotion";

export const theme = {
  colors: {
    cream: "#FFF3DC",
    creamDeep: "#F6E2BC",
    cherry: "#E63946", // hero — max one element per frame
    mint: "#7FD8BE",
    mintDeep: "#4E9C86",
    mustard: "#F4B942",
    ink: "#2B2118",
    brown: "#A0603A",
    brownDark: "#6E3B1F",
    skin: "#F2C29B",
    skinShade: "#E8A07A",
    sick: "#A8C97F",
    navy: "#1D2B4F",
    navyDeep: "#101935",
    dark: "#14161F",
    white: "#FFFFFF",
    lettuce: "#6CC24A",
    cheese: "#FFC93C",
    patty: "#5A3220",
    bun: "#E9A15B",
    bunShade: "#C97B3A",
    neon: "#FF5FA2",
    siren: "#2F6BFF",
  },
  stroke: 6,
  fonts: {
    display: "Lilita One",
    body: "Fredoka",
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
  },
} as const;
