import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { B_OFFSET, Cam, FPS, OUT_STARTS, PUSH_SHOTS, REACTIONS, SEGMENTS, SHOTS, T_END } from "../edit";
import { theme } from "../theme";
import track from "../track.json";

const W = 1080, H = 1920;
const CLOSE_SCALE = 1.25;
const FOCUS_Y = 0.43;

// Both clips carry a baked per-camera LUT (scripts/grade.py): each phone is corrected
// to match the other, then the same clean cool look is applied to both. Camera A is
// stabilised (vidstab); camera B is AI-upscaled where it is used (scripts/upscale.py).
const SRC = { A: "camA_final.mp4", B: "camB_final.mp4" } as const;
const DISSOLVE = 12; // frames: incoming shot fades in over the outgoing one, ending on the cut
const JUMP_DISSOLVE = 6; // shorter blend where a pause was removed
const MIN_PIECE = 0.8; // seconds; shorter pieces take the next shot's camera

// speaker x (0..1) on camera A at an A-clock time, from hand-marked keyframes
const speakerX = (t: number) => {
  const k = (track as [number, number][]).findIndex(([kt]) => kt > t);
  if (k <= 0) return k === 0 ? track[0][1] : track[track.length - 1][1];
  const [t0, x0] = track[k - 1], [t1, x1] = track[k];
  const f = interpolate(t, [t0, t1], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return x0 + (x1 - x0) * f;
};

// A piece = a stretch of one camera between two cuts on the output timeline.
type Piece = { cam: Cam; s0: number; s1: number; shot: [number, number]; push: boolean; jump: boolean; seg: number };

// Hide each removed pause behind a camera change, rotating through all three angles
const pickAlt = (prev: Cam, before?: Cam): Cam =>
  (["C", "B", "A"] as Cam[]).find((c) => c !== prev && c !== before) ?? (prev === "C" ? "A" : "C");

// Planned camera changes that fall near a removed pause move onto it, so one cut does both jobs
const SNAP = 2.0;
const snap = (t: number) => {
  for (let k = 1; k < SEGMENTS.length; k++) {
    const gapStart = SEGMENTS[k - 1][1], gapEnd = SEGMENTS[k][0];
    if (t > gapStart - SNAP && t < gapEnd + SNAP) return gapEnd;
  }
  return t;
};

// Cut to the audience for each reaction, then back to whichever camera was planned
const camAt = (t: number) => [...SHOTS].reverse().find(([st]) => st <= t)?.[1] ?? "A";
const withReactions = (): { t: number; cam: Cam; fixed?: boolean }[] => {
  const out: { t: number; cam: Cam; fixed?: boolean }[] = SHOTS.map(([t, cam]) => ({ t, cam }));
  REACTIONS.forEach(({ start, end }) => {
    const a = start - 0.3, b = end + 0.6;
    for (let i = out.length - 1; i >= 0; i--) if (out[i].t > a && out[i].t < b && !out[i].fixed) out.splice(i, 1);
    out.push({ t: a, cam: "B", fixed: true }, { t: b, cam: camAt(b) === "B" ? "C" : camAt(b), fixed: true });
  });
  return out.sort((x, y) => x.t - y.t);
};

const buildPieces = (): Piece[] => {
  const shots = withReactions().map(({ t, cam, fixed }, i) => ({ t: i && !fixed ? snap(t) : t, orig: t, cam }))
    .filter((s, i, all) => !all[i + 1] || all[i + 1].t > s.t); // a later shot snapped onto the same cut wins
  const shotEnd = (i: number) => (i + 1 < shots.length ? shots[i + 1].t : T_END);
  const raw: Piece[] = [];
  SEGMENTS.forEach(([a, b], si) => {
    shots.forEach(({ t, orig, cam }, i) => {
      const s0 = Math.max(a, t), s1 = Math.min(b, shotEnd(i));
      if (s1 - s0 <= 1 / FPS) return;
      // the cold open stays on the slow push-in close-up
      raw.push({ cam: si === 0 ? "C" : cam, s0, s1, shot: si === 0 ? [a, b] : [t, shotEnd(i)], push: si === 0 || PUSH_SHOTS.includes(orig), jump: si > 0 && s0 === a, seg: si });
    });
  });
  // at every removed pause, make sure the camera changes
  raw.forEach((p, i) => {
    const prev = raw[i - 1];
    if (prev && p.jump && p.cam === prev.cam) p.cam = pickAlt(prev.cam, raw[i - 2]?.cam);
  });
  // a sliver takes the next piece's camera (if that still differs from the one before it)
  raw.forEach((p, i) => {
    const prev = raw[i - 1], next = raw[i + 1];
    if (next && p.s1 - p.s0 < MIN_PIECE && (!prev || next.cam !== prev.cam)) p.cam = next.cam;
  });
  // a sliver that is a whole (very short) segment keeps the previous camera: a soft jump
  // cut on the same angle reads better than a camera flash
  raw.forEach((p, i) => {
    if (i && p.seg === 0 === (raw[i - 1].seg === 0) && p.s1 - p.s0 < MIN_PIECE) p.cam = raw[i - 1].cam;
  });
  // merge neighbours that ended up on the same camera
  return raw.reduce<Piece[]>((acc, p) => {
    const last = acc[acc.length - 1];
    if (last && last.cam === p.cam && last.seg === p.seg && (!p.jump || p.s1 - p.s0 < MIN_PIECE)) { last.s1 = p.s1; return acc; }
    acc.push({ ...p });
    return acc;
  }, []);
};

export const PIECES = buildPieces();
const outT = (p: Piece, t: number) => OUT_STARTS[p.seg] + (t - SEGMENTS[p.seg][0]); // pieces never span segments

const progress = (t: number, [a, b]: [number, number]) => Math.min(1, Math.max(0, (t - a) / (b - a)));

const CloseUp: React.FC<{ piece: Piece; t: number; startFrom: number }> = ({ piece, t, startFrom }) => {
  const s = CLOSE_SCALE * (piece.push ? 1 + 0.14 * theme.ease.inOut(progress(t, piece.shot)) : 1);
  const maxX = ((s - 1) * W) / 2, maxY = ((s - 1) * H) / 2;
  const x = Math.max(-maxX, Math.min(maxX, (0.5 - speakerX(t)) * W * s));
  const y = Math.max(-maxY, Math.min(maxY, (0.5 - FOCUS_Y) * H * s));
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s})` }}>
      <OffthreadVideo muted startFrom={startFrom} src={staticFile(SRC.A)} style={{ width: W, height: H }} />
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ piece: Piece; srcStart: number; pre: number }> = ({ piece, srcStart, pre }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = srcStart + frame / fps; // A-clock time of this frame
  const o = pre ? interpolate(frame, [0, pre], [0, 1], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const camT = piece.cam === "B" ? srcStart - B_OFFSET : srcStart;
  const startFrom = Math.max(0, Math.round(camT * fps));
  let body: React.ReactNode;
  if (piece.cam === "C") {
    body = <CloseUp piece={piece} t={t} startFrom={startFrom} />;
  } else {
    // subtle drift on the wides so a held shot never feels frozen
    const drift = 1.02 + 0.03 * theme.ease.inOut(progress(t, piece.shot));
    const s = piece.cam === "B" ? drift * 1.16 : drift; // camera B: gentle punch toward the stage
    const y = piece.cam === "B" ? Math.min(((s - 1) * H) / 2, (0.5 - 0.4) * H * s) : 0;
    body = (
      <AbsoluteFill style={{ transform: `translateY(${y}px) scale(${s})` }}>
        <OffthreadVideo muted startFrom={startFrom} src={staticFile(SRC[piece.cam])} style={{ width: W, height: H }} />
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{ opacity: o }}>{body}</AbsoluteFill>;
};

export const Footage: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      {PIECES.map((p, i) => {
        // hard cut out of the cold open (the title dip covers it)
        const pre = i === 0 || p.seg !== PIECES[i - 1].seg && p.seg === 1 ? 0 : p.jump ? JUMP_DISSOLVE : DISSOLVE;
        const outStart = Math.round(outT(p, p.s0) * fps);
        const from = outStart - pre;
        const len = Math.round(outT(p, p.s1) * fps) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={len} name={`${p.cam} @${p.s0.toFixed(1)}`}>
            <Shot piece={p} srcStart={p.s0 - pre / fps} pre={pre} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
