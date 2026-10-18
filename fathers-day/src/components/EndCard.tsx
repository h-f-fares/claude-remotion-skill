import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FINAL_LINE_T, T_START } from "../edit";
import { theme } from "../theme";
import words from "../words.json";

type W = { t: string; s: number; e: number; l: number };
const lastLine = Math.max(...(words as W[]).map((w) => w.l));
const FINAL = (words as W[]).filter((w) => w.l === lastLine);
const START = FINAL_LINE_T - T_START;

// "That was the night I became a father." — word-synced, big, then hold + fade out
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = START + frame / fps;
  const veil = interpolate(frame, [0, 24], [0, 0.6], { easing: theme.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(frame, [durationInFrames - 45, durationInFrames], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const breathe = 1 + Math.sin(frame / 22) * 0.008;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(20,13,7,${veil * 0.25}) 0%, rgba(20,13,7,${veil * 0.35}) 45%, rgba(20,13,7,${veil}) 70%)` }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1120, transform: `scale(${breathe})` }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 24, rowGap: 6, maxWidth: 900 }}>
          {FINAL.map((w, i) => {
            const p = spring({ frame: frame - Math.round((w.s - START) * fps), fps, config: theme.spring.smooth });
            const hero = /father/i.test(w.t);
            return (
              <span key={i} style={{
                display: "inline-block", fontFamily: theme.fonts.display, fontWeight: hero ? 700 : 600,
                fontStyle: hero ? "italic" : "normal", fontSize: hero ? 150 : 92, lineHeight: 1.1,
                letterSpacing: "-0.02em", color: hero ? theme.colors.primary : theme.colors.text,
                opacity: t >= w.s - 0.1 ? p : 0,
                transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
                textShadow: hero ? `0 0 70px ${theme.colors.glow}` : `0 6px 30px ${theme.colors.shadow}`,
              }}>{w.t}</span>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};
