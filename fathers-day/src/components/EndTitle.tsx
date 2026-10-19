import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Closing card after the applause
export const EndTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const bg = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = spring({ frame: frame - 8, fps, config: theme.spring.smooth });
  const sub = spring({ frame: frame - 20, fps, config: theme.spring.smooth });
  const rule = spring({ frame: frame - 16, fps, config: theme.spring.gentle });
  const breathe = 1 + Math.sin(frame / 26) * 0.006;
  return (
    <AbsoluteFill style={{ background: `rgba(8,14,22,${bg})`, justifyContent: "center", alignItems: "center", opacity: out }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${breathe})` }}>
        <div style={{
          fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 104, lineHeight: 1.05, letterSpacing: "-0.03em",
          color: theme.colors.text, textAlign: "center", maxWidth: 900, opacity: t,
          transform: `translateY(${interpolate(t, [0, 1], [40, 0])}px)`,
        }}>
          The Day I Became <span style={{ fontStyle: "italic", color: theme.colors.primary }}>a Father</span>
        </div>
        <div style={{ marginTop: 34, height: 3, width: 260 * rule, background: theme.colors.accent, borderRadius: 2, opacity: 0.8 }} />
        <div style={{
          marginTop: 26, fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 30, letterSpacing: "0.3em",
          textTransform: "uppercase", color: theme.colors.textDim, opacity: sub,
          transform: `translateY(${interpolate(sub, [0, 1], [18, 0])}px)`,
        }}>A Toastmasters speech</div>
      </div>
    </AbsoluteFill>
  );
};
