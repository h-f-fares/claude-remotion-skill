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

// Both clips carry a baked per-camera LUT (scripts/match-cameras.py) that brings
// the two phones to one base look; the warm grade is applied on top in Finish.tsx.
const SRC = { A: "camA_matched.mp4", B: "camB_matched.mp4" } as const;
const DISSOLVE = 12; // frames: incoming shot fades in over the outgoing one, ending on the cut

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
      <OffthreadVideo muted startFrom={startFrom} src={staticFile(SRC.A)} style={{ width: W, height: H }} />
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ cam: Cam; start: number; len: number; startFrom: number; push: boolean }> = ({ cam, start, len, startFrom, push }) => {
  const frame = useCurrentFrame();
  // subtle drift on the wides so a held shot never feels frozen
  const drift = interpolate(frame, [0, len], [1.02, 1.05], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (cam === "C") return <CloseUp shotStart={start} len={len} push={push} startFrom={startFrom} />;
  const file = cam === "B" ? SRC.B : SRC.A;
  // camera B: gentle punch toward the stage (less ceiling)
  const s = cam === "B" ? drift * 1.16 : drift;
  const y = cam === "B" ? Math.min(((s - 1) * H) / 2, (0.5 - 0.4) * H * s) : 0;
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px) scale(${s})` }}>
      <OffthreadVideo muted startFrom={startFrom} src={staticFile(file)} style={{ width: W, height: H }} />
    </AbsoluteFill>
  );
};

const Dissolve: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  const o = frames ? interpolate(frame, [0, frames], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const Footage: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      {SHOTS.map(([t, cam], i) => {
        const end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : T_END;
        const pre = i === 0 ? 0 : DISSOLVE;
        const from = sec(t) - pre;
        const len = sec(end) - from;
        const srcT = cam === "B" ? t - B_OFFSET : t;
        return (
          <Sequence key={t} from={from} durationInFrames={len} name={`${cam} @${t}`}>
            <Dissolve frames={pre}>
              <Shot cam={cam} start={t - pre / fps} len={len} startFrom={Math.round(srcT * fps) - pre} push={PUSH_SHOTS.includes(t)} />
            </Dissolve>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
