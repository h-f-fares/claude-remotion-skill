// THE single source of truth for ClawdEdit. The UI canvas, the 3D scene, the camera, the sound
// script (scripts/gen-clawdedit-audio.mjs) and the Blender flow (blender/export_timeline.mjs →
// timeline.json → scene.py) all read this file, so a press always lands on the frame its sound
// plays. Plain data only — no imports — so Node can read it too.
//
// Pixels are the API: every position is in "app pixels" of a 1920x1080 fake editor.
// px() turns them into world units for three.js / Blender.

export const FPS = 30;
export const BPM = 120;
export const BEAT_S = 60 / BPM; // 0.5 s
export const TOTAL_S = 12; // 24 beats — the transformation and the ride need the room
export const f = (s: number) => Math.round(s * FPS);

export const APP = { w: 1920, h: 1080, scale: 2 }; // texture drawn at 2x → 3840x2160
export const PX_PER_UNIT = 100;
export const px = (x: number, y: number): [number, number] => [
  (x - APP.w / 2) / PX_PER_UNIT,
  (y - APP.h / 2) / PX_PER_UNIT,
];

// Panels: each one becomes its own slab with its own crop of the UI texture.
export type Rect = { x: number; y: number; w: number; h: number };
export const PANELS: Record<string, Rect & { title: string }> = {
  menu: { x: 0, y: 0, w: 1920, h: 40, title: "" },
  tools: { x: 0, y: 52, w: 1920, h: 64, title: "" },
  project: { x: 0, y: 128, w: 360, h: 536, title: "Project" },
  comp: { x: 380, y: 128, w: 1160, h: 536, title: "Composition: Main Comp" },
  preview: { x: 1560, y: 128, w: 360, h: 170, title: "Preview" },
  effects: { x: 1560, y: 310, w: 360, h: 354, title: "Effects & Presets" },
  timeline: { x: 0, y: 684, w: 1920, h: 396, title: "Main Comp" },
};
// the comp viewer inside its panel (below the 34 px tab, above the 30 px footer)
export const VIEWER: Rect = { x: 380, y: 162, w: 1160, h: 472 };

// Buttons are separate keycap slabs on top of their panel: they press down and light up.
export const BUTTONS: Record<string, Rect & { label: string }> = {
  type: { x: 790, y: 60, w: 64, h: 48, label: "T" },
  rect: { x: 866, y: 60, w: 64, h: 48, label: "rect" },
  pen: { x: 942, y: 60, w: 64, h: 48, label: "pen" },
  play: { x: 1700, y: 196, w: 80, h: 64, label: "play" },
  glow: { x: 1590, y: 420, w: 300, h: 48, label: "Glow" },
};

// Timeline: rows, the Position row with its keyframe slots, the ruler the playhead rides.
export const TL = {
  rulerY: 724,
  trackX0: 520,
  trackX1: 1880,
  rows: ["MADE WITH CLAUDE", "Spark", "Swoosh", "clawd.png"],
  rowY0: 760,
  rowH: 52,
  posRowY: 1000,
};
export const KEYFRAME_X = [760, 960, 1160, 1360];
export const PLAYHEAD = { start: 560, rideEnd: 1500 };

// Where Clawd lies as a flat PNG layer before he peels off.
export const FLAT_AT = { x: 960, y: 420 };

// Every hop: take-off t0, landing t1 (on a beat), target in app pixels, apex in world units.
// A hop must press something — a jump that changes nothing is cut. `from` overrides the start
// (after the ride, he leaves from wherever the playhead dropped him).
export type Hop = {
  t0: number; t1: number; to: { x: number; y: number }; apex: number;
  flip?: boolean; press?: string; from?: { x: number; y: number };
};
export const HOPS: Hop[] = [
  { t0: 2.1, t1: 2.5, to: { x: 822, y: 84 }, apex: 1.3, press: "type" },
  { t0: 2.75, t1: 3.0, to: { x: 898, y: 84 }, apex: 0.7, press: "rect" },
  { t0: 3.25, t1: 3.5, to: { x: 974, y: 84 }, apex: 0.7, press: "pen" },
  { t0: 3.9, t1: 4.5, to: { x: 1700, y: 444 }, apex: 1.6, flip: true, press: "glow" },
  { t0: 5.55, t1: 6.0, to: { x: KEYFRAME_X[0], y: TL.posRowY }, apex: 1.4, press: "key0" },
  { t0: 6.25, t1: 6.5, to: { x: KEYFRAME_X[1], y: TL.posRowY }, apex: 0.7, press: "key1" },
  { t0: 6.75, t1: 7.0, to: { x: KEYFRAME_X[2], y: TL.posRowY }, apex: 0.7, press: "key2" },
  { t0: 7.25, t1: 7.5, to: { x: KEYFRAME_X[3], y: TL.posRowY }, apex: 0.7, press: "key3" },
  { t0: 7.7, t1: 8.0, to: { x: KEYFRAME_X[3], y: TL.rulerY }, apex: 0.9 }, // onto the playhead
  { t0: 9.65, t1: 10.0, from: { x: PLAYHEAD.rideEnd, y: TL.rulerY }, to: { x: 1740, y: 228 }, apex: 1.0, flip: true, press: "play" },
  { t0: 10.15, t1: 10.5, to: { x: 1300, y: 560 }, apex: 1.0 },
];

// Story events (seconds). Each one changes something visible in the comp.
export const EV = {
  knock1: 0.5,
  knock2: 1.0,
  peel: 1.5, // hinges up off the comp as a flat card
  pop: 2.0, // inflates into 3D, the glass cracks, the beat drops
  typeOn: 2.5, // title types on over half a beat
  spark: 3.0,
  swoosh: 3.5,
  glowChip: 4.5, // chip pops up under him
  kick: 5.0, // chip flies into the comp
  glowOn: 5.25,
  keys: [6.0, 6.5, 7.0, 7.5], // each stamp jumps the title to that pose
  rewind: [8.0, 8.4], // playhead (with Clawd on it) rewinds to 0
  ride: [8.5, 9.6], // he surfs the playhead, the comp plays the keys back
  play: 10.0, // Preview > Play: flash, particles, subtitle
  powerDown: [10.6, 10.7, 10.8, 10.9, 11.0, 11.1], // panels fall one by one
  wave: 11.2,
};
export const FALL_ORDER = ["preview", "effects", "project", "timeline", "tools", "menu"];

// Title poses (viewer pixels: the viewer is 1160x472). POSES[0] is before any key,
// POSES[i+1] is stamped by key i. Real moves, so the ride reads as an animation.
export const POSES = [
  { x: 580, y: 236, s: 1.0, r: 0 },
  { x: 380, y: 300, s: 0.62, r: -0.2 },
  { x: 780, y: 170, s: 0.78, r: 0.16 },
  { x: 560, y: 260, s: 1.16, r: -0.05 },
  { x: 580, y: 220, s: 1.0, r: 0 },
];

// Playhead x (app px) at time t: parks on the last stamped key, rewinds, then rides.
export const playheadX = (t: number) => {
  const ease = (u: number) => { const k = Math.min(1, Math.max(0, u)); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  if (t < EV.keys[0]) return PLAYHEAD.start;
  if (t < EV.rewind[0]) return KEYFRAME_X[EV.keys.filter((k) => t >= k).length - 1];
  if (t < EV.ride[0]) return KEYFRAME_X[3] + (PLAYHEAD.start - KEYFRAME_X[3]) * ease((t - EV.rewind[0]) / (EV.rewind[1] - EV.rewind[0]));
  const u = Math.min(1, Math.max(0, (t - EV.ride[0]) / (EV.ride[1] - EV.ride[0])));
  return PLAYHEAD.start + (PLAYHEAD.rideEnd - PLAYHEAD.start) * u; // linear: a playhead plays at constant speed
};

// Camera shot list, one key per story beat. The camera orbits a target (Clawd's body or the
// viewer centre): az = yaw in degrees (0 = from the front/bottom of the UI), el = elevation,
// dist in world units (Clawd is ~0.6 tall), roll = Dutch angle in degrees. Keys close together
// = whip. Rules: hero 18-28% of frame height while he acts, elevation 8-25°, cant alternates
// sign per act, the camera never stands still.
export type Shot = { t: number; target: "clawd" | "viewer" | "flat"; az: number; el: number; dist: number; roll: number; fov: number };
export const SHOTS: Shot[] = [
  { t: 0.0, target: "viewer", az: -8, el: 34, dist: 13.5, roll: -6, fov: 40 }, // the whole workspace
  { t: 1.4, target: "flat", az: 0, el: 52, dist: 4.4, roll: -2, fov: 40 }, // push in on the PNG layer
  { t: 1.95, target: "flat", az: 6, el: 16, dist: 3.4, roll: 3, fov: 42 }, // drop low for the peel
  { t: 2.15, target: "clawd", az: 10, el: 14, dist: 3.2, roll: 5, fov: 42 }, // pop
  { t: 2.45, target: "clawd", az: -18, el: 13, dist: 3.1, roll: 11, fov: 42 }, // whip to the toolbar
  { t: 3.6, target: "clawd", az: 16, el: 15, dist: 3.2, roll: 13, fov: 42 },
  { t: 4.1, target: "clawd", az: 40, el: 28, dist: 4.6, roll: -4, fov: 42 }, // the big leap
  { t: 4.5, target: "clawd", az: 38, el: 18, dist: 3.3, roll: -15, fov: 42 }, // Glow
  { t: 4.95, target: "clawd", az: 30, el: 16, dist: 3.2, roll: -17, fov: 42 },
  { t: 5.2, target: "viewer", az: 4, el: 26, dist: 7.6, roll: -6, fov: 40 }, // whip to the comp: glow on
  { t: 5.55, target: "viewer", az: 0, el: 24, dist: 7.2, roll: -4, fov: 40 },
  { t: 5.9, target: "clawd", az: -24, el: 13, dist: 3.2, roll: -9, fov: 42 }, // timeline act
  { t: 7.6, target: "clawd", az: 22, el: 12, dist: 3.3, roll: -12, fov: 42 },
  { t: 8.3, target: "clawd", az: 68, el: 14, dist: 3.4, roll: -8, fov: 42 }, // side-on: the playhead is a diagonal
  { t: 9.5, target: "clawd", az: 48, el: 15, dist: 3.4, roll: -5, fov: 42 },
  { t: 10.0, target: "clawd", az: -12, el: 20, dist: 3.0, roll: 7, fov: 42 }, // Play
  { t: 10.45, target: "viewer", az: 6, el: 30, dist: 9.8, roll: 4, fov: 40 }, // whip reveal
  { t: 12.0, target: "viewer", az: 10, el: 33, dist: 9.2, roll: 2, fov: 40 }, // slow drift on the poster
];

// Sound cues, read by the audio script. `t` in seconds.
export const SFX: { t: number; kind: string }[] = [
  { t: EV.knock1, kind: "knock" },
  { t: EV.knock2, kind: "knock" },
  { t: EV.peel, kind: "peel" },
  { t: EV.pop - 0.45, kind: "riser" },
  { t: EV.pop, kind: "pop" },
  ...HOPS.map((h) => ({ t: h.t0, kind: h.apex > 1.0 ? "whoosh" : "boing" })),
  ...HOPS.map((h) => ({ t: h.t1, kind: "land" })),
  ...HOPS.filter((h) => h.press).map((h) => ({ t: h.t1, kind: "click" })),
  ...Array.from({ length: 16 }, (_, i) => ({ t: EV.typeOn + i * (BEAT_S / 16), kind: "tap" })),
  { t: EV.spark, kind: "bloop" },
  { t: EV.swoosh, kind: "scribble" },
  { t: EV.glowChip, kind: "blip" },
  { t: EV.kick, kind: "thwack" },
  { t: EV.glowOn, kind: "shimmer" },
  ...EV.keys.map((t, i) => ({ t, kind: `ding${i}` })),
  { t: EV.rewind[0], kind: "rewind" },
  { t: EV.ride[0], kind: "skate" },
  { t: EV.play, kind: "brass" },
  ...EV.powerDown.map((t) => ({ t, kind: "powerdown" })),
  { t: EV.wave + 0.1, kind: "yay" },
];
