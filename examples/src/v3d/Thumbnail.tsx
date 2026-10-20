// Thumbnail (1280x720) for the beginner cut: the V3 blog page, five simple steps, no portrait.
import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../v3/theme";
import { ACCENT, Chip, Finish, Frame, StudioBg, T } from "../v3b/kit";

const C = theme.colors;

export const ThumbnailSimple: React.FC = () => (
  <AbsoluteFill>
    <StudioBg accent={ACCENT.hook} />
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <div style={{ position: "absolute", left: 60, top: 300, transform: "rotate(-4deg)" }}>
        <Frame src="v3-bloglist-grid.jpg" w={980} url="hfares.com/blog" accent={ACCENT.hook} />
      </div>
      <div style={{ position: "absolute", right: 70, top: 70, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        <T size={130}>طوّر موقعك</T>
        <T size={130} color={ACCENT.hook}>من الموبايل</T>
      </div>
      <div style={{ position: "absolute", right: 80, top: 520, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 22 }}>
        <Chip size={64} bg={C.mustard}>5 خطوات بسيطة</Chip>
        <Chip size={56} bg={C.card}>بالـ AI · من غير تعقيد</Chip>
      </div>
    </AbsoluteFill>
    <Finish />
  </AbsoluteFill>
);
