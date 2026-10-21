import { interpolate, useCurrentFrame } from "remotion";
import { Card, Cloud, Entrance, Kicker, Shield, useSpring } from "../components";
import { clamp, theme } from "../theme";
import { wabs } from "../timing";
import type { SceneProps } from "./types";

// "فعملت VeilLLM، proxy لوكال بيقف بين الـ harness بتاعك والموديل."
export const S3Reveal: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const name = wabs(2, "VeilLLM") - from;
  const flow = wabs(2, "proxy") - from;
  const between = wabs(2, "بين") - from;
  const s = useSpring(name - 6, "bouncy");
  const box = useSpring(flow, "smooth");
  const breathe = 1 + Math.sin(frame / 22) * 0.02;
  const dash = interpolate(frame, [between, between + 30], [0, 1], { ...clamp, easing: theme.ease.out });
  const node = (label: string, delay: number, icon: React.ReactNode, hero = false) => (
    <Entrance delay={delay} config="bouncy" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 240 }}>
      <Card style={{ width: 190, height: 170, display: "flex", alignItems: "center", justifyContent: "center", borderColor: hero ? theme.colors.primary : theme.colors.line, boxShadow: hero ? `0 0 50px ${theme.colors.glow}` : undefined }}>{icon}</Card>
      <div style={{ fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 36, color: hero ? theme.colors.primary : theme.colors.text, textAlign: "center", whiteSpace: "nowrap" }}>{label}</div>
    </Entrance>
  );
  // RTL flow: harness on the right, model on the left, arrows point left.
  const arrow = (delay: number) => (
    <Entrance delay={delay} style={{ marginTop: 66 }}>
      <svg width="64" height="40" viewBox="0 0 70 40" style={{ transform: "scaleX(-1)" }}><path d="M4 20h56M46 8l14 12-14 12" stroke={theme.colors.primary} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </Entrance>
  );
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Entrance delay={0}><Kicker>فعملت</Kicker></Entrance>
      </div>
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, direction: "ltr" }}>
        <div style={{ transform: `scale(${s * breathe}) rotate(${interpolate(s, [0, 1], [-40, 0])}deg)`, filter: `drop-shadow(0 0 40px ${theme.colors.glow})` }}><Shield size={180} /></div>
        <div style={{ display: "flex", fontFamily: "'Plex Sans', sans-serif", fontWeight: 700, fontSize: 160, letterSpacing: -4 }}>
          {"VeilLLM".split("").map((l, i) => (
            <Entrance key={i} delay={name + i * 2} config="snappy" y={60}><span style={{ color: i >= 4 ? theme.colors.primary : theme.colors.text }}>{l}</span></Entrance>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 500, left: 30, right: 30, opacity: box }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 4 }}>
          {node("الـ harness بتاعك", flow, <div style={{ fontFamily: theme.fonts.mono, fontSize: 58, color: theme.colors.text, direction: "ltr" }}>{">_"}</div>)}
          {arrow(flow + 6)}
          {node("VeilLLM", flow + 10, <Shield size={110} />, true)}
          {arrow(flow + 16)}
          {node("الموديل", flow + 20, <Cloud size={140} color={theme.colors.text} />)}
        </div>
        <div style={{ position: "absolute", top: -34, height: 340, width: 600, right: 30, border: `3px dashed ${theme.colors.primary}88`, borderRadius: 32, opacity: dash, transform: `scale(${0.95 + 0.05 * dash})` }}>
          <div style={{ position: "absolute", top: -28, right: 30, background: theme.colors.bg, padding: "0 14px" }}><Kicker color={theme.colors.primary}>جهازك</Kicker></div>
        </div>
      </div>
    </div>
  );
};
