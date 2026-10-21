import { interpolate, useCurrentFrame } from "remotion";
import { Card, Cloud, Entrance, Shield, useSpring } from "../components";
import { theme } from "../theme";
import { cabs, wabs } from "../timing";
import type { SceneProps } from "./types";

// "وانت؟ تثق في موديلات الـ cloud بداتا عملائك، ولا local بس حتى لو أضعف؟ || قولي في الكومنتات."
export const S6Question: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const a = wabs(6, "cloud") - from;
  const b = wabs(6, "local") - from;
  const c = cabs(6, 1) - from;
  const vs = useSpring(b - 6, "bouncy");
  const choice = (label: string, sub: string, icon: React.ReactNode, delay: number, color: string) => (
    <Entrance delay={delay} config="bouncy" y={70} style={{ flex: 1, display: "flex" }}>
      <Card style={{ flex: 1, padding: "40px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, borderColor: `${color}88`, transform: `translateY(${Math.sin((frame + delay) / 20) * 4}px)` }}>
        <div style={{ height: 130, display: "flex", alignItems: "center" }}>{icon}</div>
        <div style={{ fontFamily: "'Plex Sans', sans-serif", fontWeight: 700, fontSize: 64, color }}>{label}</div>
        <div style={{ fontFamily: theme.fonts.sans, fontWeight: 500, fontSize: 36, color: theme.colors.textDim, textAlign: "center" }}>{sub}</div>
      </Card>
    </Entrance>
  );
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Entrance delay={0} style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 96, color: theme.colors.text }}>وانت؟</Entrance>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, display: "flex", gap: 30, alignItems: "stretch" }}>
        {choice("Cloud", "أقوى… بداتا عملائك", <Cloud size={190} color={theme.colors.primary} />, a, theme.colors.primary)}
        {choice("Local", "أأمن… بس أضعف", <Shield size={130} color="#FBBF24" />, b, "#FBBF24")}
      </div>
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: 110, height: 110, borderRadius: 55, background: theme.colors.bg, border: `3px solid ${theme.colors.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 44, color: theme.colors.text, transform: `scale(${vs})` }}>ولا</div>
      </div>
      <Entrance delay={c} config="bouncy" style={{ position: "absolute", top: 860, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: theme.colors.primary, color: theme.colors.bg, fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 50, borderRadius: 999, padding: "20px 48px", transform: `scale(${1 + Math.max(0, Math.sin((frame - c) / 6)) * 0.04 * (frame > c ? 1 : 0)})` }}>
          <svg width="44" height="44" viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke={theme.colors.bg} strokeWidth="2.4" strokeLinejoin="round" /></svg>
          قولي في الكومنتات
        </div>
      </Entrance>
    </div>
  );
};
