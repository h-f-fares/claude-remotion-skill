import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Illustrated moment (generated with Gemini from a frame of the speaker), shown over
// "My wife cried. I cried." with a slow Ken Burns push.
export const Cartoon: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [0, 14, durationInFrames - 14, durationInFrames], [0, 1, 1, 0], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, durationInFrames], [10, -20], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: o, background: theme.colors.bg }}>
      <Img src={staticFile("son-cartoon.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translateY(${y}px) scale(${scale})` }} />
    </AbsoluteFill>
  );
};
