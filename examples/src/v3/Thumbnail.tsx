// YouTube thumbnail (1280x720): closed laptop crossed out, glowing phone, one bold claim.
import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import { Bubble, Chip, Finish, Icon, Laptop, PaperBg, Phone, T } from "./kit";

const C = theme.colors;

export const Thumbnail: React.FC = () => (
  <AbsoluteFill>
    <PaperBg />
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <div style={{ position: "absolute", right: 90, top: 110, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        <T size={150} style={{ textAlign: "right" }}>بنيت موقعي</T>
        <T size={150} color={C.teal} style={{ textAlign: "right" }}>من الموبايل</T>
        <div style={{ display: "flex", gap: 24, marginTop: 30, direction: "rtl" }}>
          <Chip bg={C.mustard} size={64}>ساعتين بس</Chip>
          <Chip bg={C.ink} color={C.paper} size={64} ltr>0 diff</Chip>
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 480, transform: "rotate(-4deg)" }}>
        <div style={{ position: "relative" }}>
          <Laptop w={520} asleep />
          <div style={{ position: "absolute", inset: -30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={340} color={C.red} sw={11} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 560, top: 150, transform: "rotate(6deg)" }}>
        <Phone w={300} glow>
          <Bubble at={-30} me size={28}>ابني موقعي من جديد</Bubble>
          <Bubble at={-30} size={28}>تمام، شغال عليه</Bubble>
        </Phone>
      </div>
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip bg={C.teal} color={C.white} size={90} ltr>V3</Chip>
      </div>
    </AbsoluteFill>
    <Finish />
  </AbsoluteFill>
);
