import { useCurrentFrame } from "remotion";
import { Card, Entrance, Shield, useSpring } from "../components";
import { theme } from "../theme";
import { cabs, wabs } from "../timing";
import type { SceneProps } from "./types";

// "الـ repo open source، دوّر على VeilLLM على GitHub. || ولو عايز حاجات زي دي، اشترك."
export const S7Cta: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const search = wabs(7, "دوّر") - from;
  const sub = wabs(7, "اشترك") - from;
  const s = useSpring(0, "bouncy");
  const press = frame >= sub + 8 && frame < sub + 14 ? 0.92 : 1;
  const subscribed = frame >= sub + 12;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ transform: `scale(${s})`, filter: `drop-shadow(0 0 40px ${theme.colors.glow})` }}><Shield size={140} /></div>
        <Entrance delay={4} style={{ fontFamily: "'Plex Sans', sans-serif", fontWeight: 700, fontSize: 96, color: theme.colors.text, direction: "ltr" }}>Open source.</Entrance>
      </div>
      <Entrance delay={8} y={60} style={{ position: "absolute", top: 380, left: 100, right: 100, direction: "ltr" }}>
        <Card style={{ padding: "30px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="54" height="54" viewBox="0 0 16 16"><path fill={theme.colors.text} d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
            <div style={{ fontFamily: theme.fonts.mono, fontSize: 42, color: theme.colors.text }}>h-f-fares / <span style={{ color: theme.colors.primary }}>VeilLLM</span></div>
          </div>
          <div style={{ marginTop: 18, fontFamily: "'Plex Sans', sans-serif", fontSize: 30, color: theme.colors.textDim }}>A local DLP reverse proxy for LLM traffic.</div>
          <div style={{ marginTop: 18, display: "flex", gap: 14 }}>
            {["Python", "Apache-2.0", "pip install veil-llm"].map((t) => (
              <div key={t} style={{ fontFamily: theme.fonts.mono, fontSize: 24, color: theme.colors.text, border: `1px solid ${theme.colors.line}`, borderRadius: 999, padding: "6px 16px" }}>{t}</div>
            ))}
          </div>
        </Card>
      </Entrance>
      <Entrance delay={search} config="bouncy" style={{ position: "absolute", top: 700, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: theme.colors.primary, color: theme.colors.bg, fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 46, borderRadius: 999, padding: "20px 44px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" stroke={theme.colors.bg} strokeWidth="3" fill="none" /><path d="M15 15l5.5 5.5" stroke={theme.colors.bg} strokeWidth="3" strokeLinecap="round" /></svg>
          دوّر على VeilLLM على GitHub
        </div>
      </Entrance>
      <Entrance delay={sub - 4} config="bouncy" style={{ position: "absolute", top: 860, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${press})`, background: subscribed ? theme.colors.card : "#E5322D", border: `2px solid ${subscribed ? theme.colors.line : "#E5322D"}`, color: subscribed ? theme.colors.textDim : "#fff", fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 46, borderRadius: 999, padding: "18px 56px" }}>
          {subscribed ? "تم الاشتراك" : "اشترك"}
        </div>
      </Entrance>
    </div>
  );
};
