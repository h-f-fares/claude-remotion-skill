import vo from "./vo.json";
import aligned from "./words.json";

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
export const sentences = vo.sentences;
export const segments = vo.segments;
const last = segments[segments.length - 1];
export const TOTAL = sec(last.start + last.dur + 0.9);

const strip = (w: string) => w.replace(/[.,،؟?!:]/g, "");
export const words = aligned.map((w) => ({ ...w, w: strip(w.w) }));

// Absolute frame of the nth spoken word equal to `text`, at or after `after` seconds.
// Cues hang off words, not sentence indexes. Whole words only: "زي" must not match "عايزين".
export const at = (text: string, nth = 0, after = 0) => {
  const hits = words.filter((w) => w.w === text && w.start >= after - 0.01);
  if (!hits[nth]) throw new Error(`no spoken word "${text}" #${nth}`);
  return sec(hits[nth].start);
};

// Scene windows in seconds: [start, end). Boundaries sit on VO beats or on a spoken word.
// segments are named by the `scene` field of voice/script.json, so inserting a scene shifts nothing
export const seg = (name: string) => {
  const s = segments.find((x) => x.scene === name);
  if (!s) throw new Error(`no voice segment "${name}"`);
  return s.start;
};
const install = aligned.find((w) => w.w.startsWith("والتركيب"))!.start - 0.15;
export const SCENES = {
  hook: [0, seg("risk")],
  risk: [seg("risk"), seg("friends")],
  friends: [seg("friends"), seg("reveal")],
  reveal: [seg("reveal"), seg("mask")],
  mask: [seg("mask"), seg("reset")],
  reset: [seg("reset"), seg("demo")],
  demo: [seg("demo"), install],
  config: [install, seg("choice")],
  choice: [seg("choice"), seg("cta")],
  cta: [seg("cta"), TOTAL / FPS],
} as const;
export type SceneKey = keyof typeof SCENES;
export const from = (k: SceneKey) => sec(SCENES[k][0]);
export const len = (k: SceneKey) => sec(SCENES[k][1]) - sec(SCENES[k][0]);
