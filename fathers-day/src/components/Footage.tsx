import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { B_OFFSET, Cam, PUSH_SHOTS, SHOTS, T_END, sec } from "../edit";
import { theme } from "../theme";
import track from "../track.json";

const W = 1080, H = 1920;
const CLOSE_SCALE = 1.38;
const FOCUS_Y = 0.43;

// speaker x (0..1) on camera A at an A-clock time, from hand-marked keyframes
const speakerX = (t: number) => {
  const k = (track as [number, number][]).findIndex(([kt]) => kt > t);
  if (k <= 0) return k === 0 ? track[0][1] : track[track.length - 1][1];
  const [t0, x0] = track[k - 1], [t1, x1] = track[k];
  const f = interpolate(t, [t0, t1], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return x0 + (x1 - x0) * f;
};

// per-camera correction so the two phones match before the global grade
const CAM_FILTER: Record<"A" | "B", string> = {
  A: "contrast(1.12) saturate(1.18) brightness(1.06) sepia(0.05)",
  B: "contrast(1.08) saturate(1.05) brightness(0.98) sepia(0.08)",
};

const CloseUp: React.FC<{ shotStart: number; len: number; push: boolean; startFrom: number }> = ({ shotStart, len, push, startFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = shotStart + frame / fps;
  const s = CLOSE_SCALE * (push
    ? interpolate(frame, [0, len], [1, 1.14], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1);
  const maxX = ((s - 1) * W) / 2, maxY = ((s - 1) * H) / 2;
  const x = Math.max(-maxX, Math.min(maxX, (0.5 - speakerX(t)) * W * s));
  const y = Math.max(-maxY, Math.min(maxY, (0.5 - FOCUS_Y) * H * s));
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s})` }}>
      <OffthreadVideo muted startFrom={startFrom} src={staticFile("camA.mp4")} style={{ width: W, height: H, filter: CAM_FILTER.A }} />
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ cam: Cam; start: number; len: number; startFrom: number }> = ({ cam, start, len, startFrom }) => {
  const frame = useCurrentFrame();
  // subtle drift on the wides so a held shot never feels frozen
  const drift = interpolate(frame, [0, len], [1.02, 1.05], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (cam === "C") return <CloseUp shotStart={start} len={len} push={PUSH_SHOTS.includes(start)} startFrom={startFrom} />;
  const file = cam === "B" ? "camB.mp4" : "camA.mp4";
  // camera B: gentle punch toward the stage (less ceiling)
  const s = cam === "B" ? drift * 1.16 : drift;
  const y = cam === "B" ? Math.min(((s - 1) * H) / 2, (0.5 - 0.4) * H * s) : 0;
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px) scale(${s})` }}>
      <OffthreadVideo muted startFrom={startFrom} src={staticFile(file)} style={{ width: W, height: H, filter: CAM_FILTER[cam === "B" ? "B" : "A"] }} />
    </AbsoluteFill>
  );
};

export const Footage: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      {SHOTS.map(([t, cam], i) => {
        const end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : T_END;
        const from = sec(t);
        const len = sec(end) - from;
        const srcT = cam === "B" ? t - B_OFFSET : t;
        return (
          <Sequence key={t} from={from} durationInFrames={len} name={`${cam} @${t}`}>
            <Shot cam={cam} start={t} len={len} startFrom={Math.round(srcT * fps)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

