import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const CHAPTER_SECONDS = 4.2;

export const Chapter: React.FC<{ label?: string; title: string }> = ({ label, title }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exitStart = durationInFrames - Math.round(0.4 * fps);
  const exit = interpolate(frame, [exitStart, durationInFrames], [0, 1], { easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const band = spring({ frame, fps, config: theme.spring.smooth });
  const line = spring({ frame: frame - 6, fps, config: theme.spring.gentle });
  const lab = spring({ frame: frame - 4, fps, config: theme.spring.snappy });
  const words = title.split(" ");
  const breathe = Math.sin(frame / 24) * 2;
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-30 * exit}px)` }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(8,14,22,${0.72 * band}) 0%, rgba(8,14,22,${0.45 * band}) 22%, transparent 36%)` }} />
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${breathe}px)` }}>
        {label && (
          <div style={{
            fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.32em",
            textTransform: "uppercase", color: theme.colors.accent, opacity: lab * 0.9,
            transform: `translateY(${interpolate(lab, [0, 1], [16, 0])}px)`, marginBottom: 18,
          }}>{label}</div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 22, maxWidth: 940 }}>
          {words.map((w, i) => {
            const p = spring({ frame: frame - 8 - i * 4, fps, config: theme.spring.smooth });
            return (
              <span key={i} style={{
                display: "inline-block", fontFamily: theme.fonts.display, fontStyle: "italic", fontWeight: 600,
                fontSize: label ? 84 : 104, lineHeight: 1.08, letterSpacing: "-0.02em", color: theme.colors.text,
                opacity: p, transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.95, 1])})`,
                textShadow: `0 6px 30px ${theme.colors.shadow}`,
              }}>{w}</span>
            );
          })}
        </div>
        <div style={{ marginTop: 26, height: 3, width: 220 * line, borderRadius: 2, background: theme.colors.accent, opacity: 0.85 }} />
      </div>
    </AbsoluteFill>
  );
};
