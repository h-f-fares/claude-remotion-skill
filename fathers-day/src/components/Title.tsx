import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Opening title over the first seconds of the speech
export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], { easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const veil = interpolate(frame, [0, 20, durationInFrames - 14, durationInFrames], [0.75, 0.55, 0.55, 0], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lines = [["The", "Day", "I", "Became"], ["a", "Father"]];
  const sub = spring({ frame: frame - 34, fps, config: theme.spring.smooth });
  const rule = spring({ frame: frame - 28, fps, config: theme.spring.gentle });
  const breathe = 1 + Math.sin(frame / 26) * 0.006;
  let k = 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(20,13,7,${veil}) 0%, rgba(20,13,7,${veil * 0.8}) 45%, rgba(20,13,7,${veil * 0.2}) 70%, transparent 100%)` }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 330, opacity: 1 - exit, transform: `translateY(${-40 * exit}px) scale(${breathe})` }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", columnGap: 26, justifyContent: "center" }}>
            {ln.map((w) => {
              const p = spring({ frame: frame - 4 - k++ * 4, fps, config: theme.spring.smooth });
              const hero = w === "Father";
              return (
                <span key={w} style={{
                  display: "inline-block", fontFamily: theme.fonts.display, fontWeight: 700,
                  fontStyle: hero ? "italic" : "normal", fontSize: hero ? 168 : 112, lineHeight: 1.04,
                  letterSpacing: "-0.03em", color: hero ? theme.colors.primary : theme.colors.text,
                  opacity: p, transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
                  textShadow: hero ? `0 0 60px ${theme.colors.glow}` : `0 6px 30px ${theme.colors.shadow}`,
                }}>{w}</span>
              );
            })}
          </div>
        ))}
        <div style={{ marginTop: 34, height: 3, width: 260 * rule, background: theme.colors.accent, borderRadius: 2, opacity: 0.8 }} />
        <div style={{
          marginTop: 26, fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 30, letterSpacing: "0.3em",
          textTransform: "uppercase", color: theme.colors.textDim, opacity: sub,
          transform: `translateY(${interpolate(sub, [0, 1], [18, 0])}px)`,
        }}>A Toastmasters speech</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
