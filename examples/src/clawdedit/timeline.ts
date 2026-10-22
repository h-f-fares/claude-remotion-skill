// THE single source of truth for ClawdEdit. The UI canvas, the 3D scene, the camera and the
// sound script (scripts/gen-clawdedit-audio.mjs) all read this file, so a press always lands
// on the frame its sound plays. Plain data only — no imports — so Node can read it too.
//
// Pixels are the API: every position is in "app pixels" of a 1920x1080 fake editor.
// px() turns them into world units for three.js.

export const FPS = 30;
export const BPM = 120;
export const BEAT_S = 60 / BPM; // 0.5 s
export const TOTAL_S = 8;
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
  comp: { x: 380, y: 128, w: 1160, h: 536, title: "Composition: Title" },
  preview: { x: 1560, y: 128, w: 360, h: 170, title: "Preview" },
  effects: { x: 1560, y: 310, w: 360, h: 354, title: "Effects & Presets" },
  timeline: { x: 0, y: 684, w: 1920, h: 396, title: "Timeline" },
};

// Buttons are separate small slabs on top of their panel so they can press down and light up.
export const BUTTONS: Record<string, Rect & { label: string }> = {
  type: { x: 790, y: 60, w: 64, h: 48, label: "T" },
  rect: { x: 866, y: 60, w: 64, h: 48, label: "▭" },
  pen: { x: 942, y: 60, w: 64, h: 48, label: "✒" },
  play: { x: 1700, y: 196, w: 80, h: 64, label: "▶" },
  glow: { x: 1590, y: 420, w: 300, h: 48, label: "Glow" },
};

// Timeline rows (inside the timeline panel), keyframe slots on the Position row.
export const TL = {
  trackX0: 520,
  trackX1: 1880,
  rows: ["Title", "Spark", "Swoosh", "Clawd.png"],
  rowY0: 760,
  rowH: 52,
  posRowY: 1000,
};
export const KEYFRAME_X = [760, 1000, 1240];

// Where Clawd lies as a flat PNG layer before he pops.
export const FLAT_AT = { x: 960, y: 420 };

// Every hop: take-off time t0, landing t1 (on a beat), target in app pixels, apex height in
// world units. A hop must press something — a jump that changes nothing is cut.
export type Hop = { t0: number; t1: number; to: { x: number; y: number }; apex: number; flip?: boolean; press?: string };
export const HOPS: Hop[] = [
  { t0: 1.5, t1: 2.0, to: { x: 822, y: 84 }, apex: 1.4, press: "type" },
  { t0: 2.2, t1: 2.5, to: { x: 898, y: 84 }, apex: 0.45, press: "rect" },
  { t0: 2.7, t1: 3.0, to: { x: 974, y: 84 }, apex: 0.45, press: "pen" },
  { t0: 3.2, t1: 3.75, to: { x: 1700, y: 444 }, apex: 1.1, flip: true, press: "glow" },
  { t0: 4.15, t1: 4.5, to: { x: KEYFRAME_X[0], y: TL.posRowY }, apex: 1.0, press: "key0" },
  { t0: 4.75, t1: 5.0, to: { x: KEYFRAME_X[1], y: TL.posRowY }, apex: 0.45, press: "key1" },
  { t0: 5.25, t1: 5.5, to: { x: KEYFRAME_X[2], y: TL.posRowY }, apex: 0.45, press: "key2" },
  { t0: 5.6, t1: 6.0, to: { x: 1740, y: 228 }, apex: 1.0, press: "play" },
  { t0: 6.1, t1: 6.5, to: { x: 1290, y: 560 }, apex: 0.8 },
];

// Story events (seconds). Each one changes something visible in the comp.
export const EV = {
  knock1: 0.5,
  knock2: 1.0,
  pop: 1.5, // peels off the comp, beat drops
  typeOn: 2.0, // title types on over half a beat
  spark: 2.5,
  swoosh: 3.0,
  glowChip: 3.75, // chip pops up under him
  kick: 4.0, // chip flies into the comp
  glowOn: 4.25,
  keys: [4.5, 5.0, 5.5], // each stamp jumps the title to that pose
  play: 6.0, // comp plays back the keyframes
  powerDown: [6.6, 6.7, 6.8, 6.9, 7.0, 7.1], // panels fall one by one
  wave: 7.0,
};
export const FALL_ORDER = ["preview", "effects", "project", "timeline", "tools", "menu"];

// Title poses stamped by the keyframes (comp pixels: comp panel is 1160x536).
export const POSES = [
  { x: 580, y: 250, s: 1.0, r: 0 }, // before any key
  { x: 580, y: 230, s: 1.18, r: -0.04 },
  { x: 540, y: 250, s: 0.92, r: 0.03 },
  { x: 580, y: 240, s: 1.08, r: 0 },
];

// Camera shots: lerped by the scene with eased weights.
export const CAMERA = {
  wide: { pos: [0, 14, 10], look: [0, 0, 0.4] },
  followOffset: [0, 5.6, 6.4], // relative to the follow target
  followBias: 0.35, // follow target sits this far from Clawd toward the comp, so every press shows its result
  end: { pos: [1.2, 8.4, 4.6], look: [0.7, 0, -1.0] },
  followIn: [1.3, 2.0], // wide → follow
  endIn: [6.3, 7.3], // follow → end
};

// Sound cues, read by the audio script. `t` in seconds.
export const SFX: { t: number; kind: string }[] = [
  { t: EV.knock1, kind: "knock" },
  { t: EV.knock2, kind: "knock" },
  { t: EV.pop - 0.4, kind: "riser" },
  { t: EV.pop, kind: "pop" },
  ...HOPS.map((h) => ({ t: h.t0, kind: h.apex > 0.9 ? "whoosh" : "boing" })),
  ...HOPS.map((h) => ({ t: h.t1, kind: "land" })),
  ...HOPS.filter((h) => h.press).map((h) => ({ t: h.t1, kind: "click" })),
  ...Array.from({ length: 16 }, (_, i) => ({ t: EV.typeOn + i * (BEAT_S / 16), kind: "tap" })),
  { t: EV.spark, kind: "bloop" },
  { t: EV.swoosh, kind: "scribble" },
  { t: EV.glowChip, kind: "blip" },
  { t: EV.kick, kind: "thwack" },
  { t: EV.glowOn, kind: "shimmer" },
  ...EV.keys.map((t, i) => ({ t, kind: `ding${i}` })),
  { t: EV.play, kind: "brass" },
  ...EV.powerDown.map((t) => ({ t, kind: "powerdown" })),
  { t: EV.wave + 0.2, kind: "yay" },
];
