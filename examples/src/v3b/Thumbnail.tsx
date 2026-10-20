// YouTube thumbnail (1280x720) for the 5-minute cut: real V1 → V3 screenshots + one bold claim.
import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../v3/theme";
import { ACCENT, Chip, Finish, Frame, StudioBg, T } from "./kit";

const C = theme.colors;

export const ThumbnailCut: React.FC = () => (
  <AbsoluteFill>
    <StudioBg accent={ACCENT.hook} />
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <div style={{ position: "absolute", left: 70, top: 420, transform: "rotate(-5deg)", filter: "saturate(0.4) brightness(0.8)" }}>
        <Frame src="v1-home-desk.jpg" w={720} url="V1 · 2025" />
      </div>
      <div style={{ position: "absolute", left: 640, top: 330, transform: "rotate(3deg)" }}>
        <Frame src="v3-home-desk.jpg" w={900} url="V3 · 2026" accent={ACCENT.hook} />
      </div>
      <div style={{ position: "absolute", right: 70, top: 50, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <T size={140}>
          بنيت موقعي <span style={{ color: ACCENT.hook }}>من الموبايل</span>
        </T>
      </div>
      <div style={{ position: "absolute", left: 80, top: 960, display: "flex", gap: 24, transform: "translateY(-100%)" }}>
        <Chip bg={C.mustard} size={70}>ساعتين</Chip>
        <Chip bg={C.red} color={C.white} size={70} ltr>0 diff</Chip>
      </div>
    </AbsoluteFill>
    <Finish />
  </AbsoluteFill>
);
