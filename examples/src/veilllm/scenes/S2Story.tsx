import { Sequence, interpolate, useCurrentFrame } from "remotion";
import { Card, Cloud, Dots, Entrance, Kicker, Shield, useSpring } from "../components";
import { clamp, theme } from "../theme";
import { cabs, wabs } from "../timing";
import type { SceneProps } from "./types";

const FRIENDS = [
  { name: "A", color: "#60A5FA", text: "بقيت مشغّل AI harness بتاعي." },
  { name: "M", color: "#FBBF24", text: "وأنا. local models بس." },
  { name: "K", color: "#F472B6", text: "مفيش داتا عملاء تروح الـ cloud." },
];

const Bubble: React.FC<{ f: (typeof FRIENDS)[number]; delay: number }> = ({ f, delay }) => {
  const p = useSpring(delay, "bouncy");
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})` }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: `${f.color}33`, border: `2px solid ${f.color}`, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plex Sans', sans-serif", fontWeight: 700, fontSize: 30, flexShrink: 0 }}>{f.name}</div>
      <div style={{ background: theme.colors.bgAlt, border: `1px solid ${theme.colors.line}`, borderRadius: 26, padding: "18px 28px", fontFamily: theme.fonts.sans, fontWeight: 500, fontSize: 40, color: theme.colors.text }}>{f.text}</div>
    </div>
  );
};

const Meter: React.FC<{ label: string; value: number; color: string; start: number }> = ({ label, value, color, start }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, start + 24], [0, value], { ...clamp, easing: theme.ease.out });
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontFamily: theme.fonts.sans, fontWeight: 500, fontSize: 30, color: theme.colors.textDim }}>{label}</div>
      <div style={{ marginTop: 10, height: 18, borderRadius: 9, background: theme.colors.line, overflow: "hidden" }}>
        <div style={{ width: `${v * 100}%`, height: "100%", borderRadius: 9, background: color }} />
      </div>
    </div>
  );
};

const Tag: React.FC<{ ok: boolean; text: string; delay: number }> = ({ ok, text, delay }) => {
  const p = useSpring(delay, "bouncy");
  const c = ok ? theme.colors.primary : theme.colors.danger;
  return (
    <div style={{ marginTop: 26, display: "inline-flex", alignItems: "center", gap: 12, color: c, background: `${c}1f`, borderRadius: 999, padding: "10px 22px", fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 32, opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})` }}>
      <svg width="26" height="26" viewBox="0 0 24 24">{ok ? <path d="M5 12l5 5 9-10" stroke={c} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="3.2" strokeLinecap="round" />}</svg>
      {text}
    </div>
  );
};

// Beat 2: friends want local LLMs for privacy, but cloud models are far more capable.
export const S2Story: React.FC<SceneProps> = ({ dur, from }) => {
  const split = cabs(1, 1) - from;
  const at = [0, wabs(1, "harness") - from - 4, wabs(1, "فينا") - from - 2];
  const leaks = wabs(1, "متتسرّبش") - from - split;
  const cloud = cabs(1, 2) - from - split;
  const capable = wabs(1, "قادرة") - from - split;
  const col = { flex: 1, padding: "34px 30px", minHeight: 600 } as const;
  return (
    <>
      <Sequence durationInFrames={split}>
        <Entrance delay={0} y={60} style={{ position: "absolute", top: 120, left: 70, right: 70 }}>
          <Card style={{ padding: "28px 34px 44px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Dots />
              <div style={{ fontFamily: theme.fonts.sans, fontWeight: 500, fontSize: 32, color: theme.colors.textDim }}># صحاب-الـ-AI</div>
            </div>
            <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 30 }}>
              {FRIENDS.map((f, i) => <Bubble key={f.name} f={f} delay={at[i]} />)}
            </div>
          </Card>
        </Entrance>
      </Sequence>
      <Sequence from={split} durationInFrames={dur - split}>
        <Entrance delay={0} style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 72, color: theme.colors.text }}>المعادلة الصعبة</Entrance>
        <div style={{ position: "absolute", top: 210, left: 70, right: 70, display: "flex", gap: 30 }}>
          <Entrance delay={2} y={60} style={{ flex: 1, display: "flex" }}>
            <Card style={col}>
              <Shield size={90} />
              <div style={{ marginTop: 18, fontFamily: "'Plex Sans', sans-serif", fontWeight: 700, fontSize: 48, color: theme.colors.text, direction: "ltr", textAlign: "right" }}>Local LLM</div>
              <Tag ok text="الداتا في أمان" delay={leaks} />
              <Meter label="القدرات" value={0.32} color={theme.colors.textDim} start={capable} />
            </Card>
          </Entrance>
          <Entrance delay={cloud} y={60} style={{ flex: 1, display: "flex" }}>
            <Card style={col}>
              <div style={{ height: 90, display: "flex", alignItems: "center" }}><Cloud size={120} color={theme.colors.text} /></div>
              <div style={{ marginTop: 18, fontFamily: "'Plex Sans', sans-serif", fontWeight: 700, fontSize: 48, color: theme.colors.text, direction: "ltr", textAlign: "right" }}>Cloud LLM</div>
              <Tag ok={false} text="الداتا بتخرج" delay={cloud + 10} />
              <Meter label="القدرات" value={0.95} color={theme.colors.primary} start={capable} />
            </Card>
          </Entrance>
        </div>
        <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Entrance delay={capable + 18}><Kicker>لازم تختار؟</Kicker></Entrance>
        </div>
      </Sequence>
    </>
  );
};
