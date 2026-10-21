import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Card, Cloud, Entrance, Kicker, Shield } from "../components";
import { theme } from "../theme";
import { cabs } from "../timing";
import type { SceneProps } from "./types";

// "إزاي تستخدم أقوى موديلات الـ cloud، من غير ما داتا عملائك تخرج من جهازك؟ || استنى للآخر، هوريك بالظبط إيه اللي بيوصل للموديل."
export const S1Hook: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const tease = cabs(0, 1) - from;
  // Open loop: the real demo result, blurred, revealed at the end of the video.
  const blur = interpolate(frame, [tease, tease + 20], [26, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lock = 1 + Math.sin(frame / 10) * 0.04;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Frame 0 is the thumbnail, so the headline is already in. */}
      <Entrance delay={-30} style={{ position: "absolute", top: 60, left: 50, right: 50, textAlign: "center", fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 78, lineHeight: 1.25, color: theme.colors.text }}>
        أقوى موديلات الـ <span style={{ color: theme.colors.primary }}>cloud</span>
        <br />
        من غير ما <span style={{ color: theme.colors.danger }}>داتاك تخرج</span>
      </Entrance>
      <Entrance delay={-30} y={60} style={{ position: "absolute", top: 330, left: 90, right: 90, display: "flex", alignItems: "center", justifyContent: "space-between", direction: "ltr" }}>
        <Card style={{ width: 200, height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fonts.mono, fontSize: 56, color: theme.colors.text }}>{">_"}</Card>
        <div style={{ filter: `drop-shadow(0 0 40px ${theme.colors.glow})` }}><Shield size={150} /></div>
        <Cloud size={210} color={theme.colors.text} />
      </Entrance>
      <Entrance delay={tease} y={70} style={{ position: "absolute", top: 560, left: 110, right: 110 }}>
        <Card style={{ position: "relative", height: 380, overflow: "hidden" }}>
          <Img src={staticFile("veilllm/clips/demo-result.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 45%", filter: `blur(${blur}px)`, opacity: 0.7 }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <svg width="90" height="90" viewBox="0 0 24 24" style={{ transform: `scale(${lock})` }}><rect x="5" y="10" width="14" height="10" rx="2" fill={`${theme.colors.primary}33`} stroke={theme.colors.primary} strokeWidth="1.8" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={theme.colors.primary} strokeWidth="1.8" fill="none" /></svg>
            <Kicker color={theme.colors.text}>اللي بيوصل للموديل… في الآخر</Kicker>
          </div>
        </Card>
      </Entrance>
    </div>
  );
};
