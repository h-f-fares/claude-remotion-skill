// Thumbnail (1280x720) for the beginner cut: face + phone, one line in the user's words, dark base with a strong teal light.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { theme } from "../v3/theme";
import { Finish } from "../v3b/kit";

const TEAL = "#2BB3A3";
const YELLOW = "#FFD23F";
const site = (f: string) => staticFile(`videos/v3-portfolio/site/${f}`);

const word = (size: number, color: string): React.CSSProperties => ({
  fontFamily: theme.fonts.main,
  fontWeight: 700,
  fontSize: size,
  color,
  lineHeight: 1.05,
  direction: "rtl",
  whiteSpace: "nowrap",
  textShadow: "0 6px 0 #00000088, 0 0 40px #00000099",
});

export const ThumbnailSimple: React.FC = () => (
  <AbsoluteFill style={{ background: "#071012", overflow: "hidden" }}>
    {/* key light behind the face, second glow behind the phone */}
    <AbsoluteFill style={{ background: `radial-gradient(circle at 74% 46%, ${TEAL}cc 0%, ${TEAL}55 22%, transparent 48%)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 56% 62%, ${YELLOW}40 0%, transparent 26%)` }} />

    {/* face, cut out, rim-lit */}
    <Img
      src={site("me-cut.png")}
      style={{
        position: "absolute",
        right: -150,
        bottom: -10,
        height: 690,
        filter: `drop-shadow(0 0 3px ${TEAL}) drop-shadow(0 0 26px ${TEAL}99) contrast(1.08) saturate(1.1)`,
      }}
    />

    {/* phone with the article on screen */}
    <div
      style={{
        position: "absolute",
        right: 430,
        top: 170,
        width: 250,
        height: 500,
        borderRadius: 40,
        background: "#0d0d0d",
        padding: 11,
        transform: "rotate(-8deg)",
        boxShadow: `0 0 0 3px #2a2a2a, 0 30px 60px #000000cc, 0 0 70px ${YELLOW}55`,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 30, overflow: "hidden", background: "#fff" }}>
        <Img src={site("v3-post-mob.jpg")} style={{ width: "100%", display: "block" }} />
      </div>
    </div>

    {/* the line, in the user's words */}
    <div style={{ position: "absolute", left: 36, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 4 }}>
      <div style={word(86, "#ffffff")}>طوّرت مدونتي</div>
      <div style={word(86, TEAL)}>لتالت مرة</div>
      <div style={{ ...word(96, YELLOW), transform: "rotate(-3deg)", marginTop: 14 }}>بالموبايل بس</div>
    </div>

    <Finish />
  </AbsoluteFill>
);
