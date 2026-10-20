// Thumbnail (1280x720) for the beginner cut: face + phone, the author's line, dark base with a strong teal light.
// Layouts to compare: A two big lines, B tilted sticker band, C text on top, D the channel's own style
// (dark + red diagonal, white-outlined face on the right, three short lines with the key one in red).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { theme } from "../v3/theme";
import { Finish } from "../v3b/kit";

const TEAL = "#2BB3A3";
const YELLOW = "#FFD23F";
const INK = "#0B1416";
const site = (f: string) => staticFile(`videos/v3-portfolio/site/${f}`);

const word = (size: number, color: string): React.CSSProperties => ({
  fontFamily: theme.fonts.main,
  fontWeight: 700,
  fontSize: size,
  color,
  lineHeight: 1.1,
  direction: "rtl",
  whiteSpace: "nowrap",
  textShadow: "0 6px 0 #00000088, 0 0 40px #00000099",
});

const Face: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <Img
    src={site("me-cut.png")}
    style={{
      position: "absolute",
      filter: `drop-shadow(0 0 3px ${TEAL}) drop-shadow(0 0 26px ${TEAL}99) contrast(1.08) saturate(1.1)`,
      ...style,
    }}
  />
);

const Phone: React.FC<{ style: React.CSSProperties; w: number; rot: number }> = ({ style, w, rot }) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: w * 2,
      borderRadius: w * 0.16,
      background: "#0d0d0d",
      padding: w * 0.044,
      transform: `rotate(${rot}deg)`,
      boxShadow: `0 0 0 3px #2a2a2a, 0 30px 60px #000000cc, 0 0 70px ${YELLOW}55`,
      ...style,
    }}
  >
    <div style={{ width: "100%", height: "100%", borderRadius: w * 0.12, overflow: "hidden", background: "#fff" }}>
      <Img src={site("v3-post-mob.jpg")} style={{ width: "100%", display: "block" }} />
    </div>
  </div>
);

const Light: React.FC<{ face: string; phone: string }> = ({ face, phone }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${face}, ${TEAL}cc 0%, ${TEAL}55 22%, transparent 48%)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${phone}, ${YELLOW}40 0%, transparent 26%)` }} />
  </>
);

// face + phone on the right
const Right: React.FC = () => (
  <>
    <Light face="76% 46%" phone="58% 60%" />
    <Face style={{ right: -150, bottom: -10, height: 690 }} />
    <Phone w={230} rot={-8} style={{ right: 420, top: 190 }} />
  </>
);

// text block on the left, every line right-aligned to the same edge, centred vertically
const TextLeft: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 40, width: 560, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
    {children}
  </div>
);

export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#071012", overflow: "hidden" }}>
    <Right />
    <TextLeft>
      <div style={word(60, "#ffffff")}>طوّرت مدونتي لتالت مرة</div>
      <div style={{ ...word(100, YELLOW), marginTop: 6 }}>بالموبايل بس</div>
    </TextLeft>
    <Finish />
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#071012", overflow: "hidden" }}>
    <Right />
    <TextLeft>
      <div style={word(84, "#ffffff")}>طوّرت مدونتي</div>
      <div style={word(84, TEAL)}>لتالت مرة</div>
      <div
        style={{
          ...word(84, INK),
          textShadow: "none",
          background: YELLOW,
          padding: "0 30px 10px",
          marginTop: 22,
          transform: "rotate(-4deg)",
          boxShadow: "0 10px 0 #00000066",
        }}
      >
        بالموبايل بس
      </div>
    </TextLeft>
    <Finish />
  </AbsoluteFill>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: "#071012", overflow: "hidden" }}>
    <Light face="58% 78%" phone="40% 80%" />
    <Face style={{ left: 470, bottom: -10, height: 540 }} />
    <Phone w={200} rot={-8} style={{ left: 410, top: 280 }} />
    <div style={{ position: "absolute", top: 40, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={word(70, "#ffffff")}>
        طوّرت مدونتي لتالت مرة <span style={{ color: YELLOW }}>بالموبايل بس</span>
      </div>
    </div>
    <Finish />
  </AbsoluteFill>
);

const RED = "#E0252B";
const outline = (c: string, px: number) =>
  [`${px}px 0`, `-${px}px 0`, `0 ${px}px`, `0 -${px}px`].map((o) => `drop-shadow(${o} 0 ${c})`).join(" ");

export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#151515", overflow: "hidden" }}>
    <AbsoluteFill style={{ background: `linear-gradient(135deg, #ff3b3b, ${RED} 45%, #9e1218)`, clipPath: "polygon(62% 0, 100% 0, 100% 100%, 50% 100%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 80% 45%, #ffffff33 0%, transparent 35%)" }} />
    <Phone w={170} rot={-10} style={{ right: 455, top: 300 }} />
    <Img src={site("me-cut.png")} style={{ position: "absolute", right: -140, bottom: -10, height: 700, filter: `${outline("#fff", 5)} drop-shadow(0 20px 30px #000000aa)` }} />
    <div style={{ position: "absolute", left: 40, width: 540, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
      <div style={word(84, "#ffffff")}>طوّرت مدونتي</div>
      <div style={word(84, "#ffffff")}>لتالت مرة</div>
      <div style={word(104, RED)}>بالموبايل بس</div>
    </div>
    <Finish />
  </AbsoluteFill>
);

export const ThumbnailSimple = ThumbA;
