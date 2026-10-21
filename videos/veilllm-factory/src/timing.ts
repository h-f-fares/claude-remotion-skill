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

// Absolute frame of the nth spoken word containing `text`, at or after `after` seconds.
// Cues hang off words, not sentence indexes.
export const at = (text: string, nth = 0, after = 0) => {
  const hits = words.filter((w) => w.w.includes(text) && w.start >= after - 0.01);
  if (!hits[nth]) throw new Error(`no spoken word "${text}" #${nth}`);
  return sec(hits[nth].start);
};

// Scene windows in seconds: [start, end). Boundaries sit on VO beats or on a spoken word.
const seg = (n: number) => segments[n - 1].start;
export const SCENES = {
  hook: [0, seg(2)],
  friends: [seg(2), seg(3)],
  reveal: [seg(3), seg(4)],
  mask: [seg(4), seg(5)],
  reset: [seg(5), seg(6)],
  demo: [seg(6), aligned.find((w) => w.w.startsWith("والتركيب"))!.start - 0.15],
  config: [aligned.find((w) => w.w.startsWith("والتركيب"))!.start - 0.15, seg(9)],
  choice: [seg(9), seg(10)],
  cta: [seg(10), TOTAL / FPS],
} as const;
export type SceneKey = keyof typeof SCENES;
export const from = (k: SceneKey) => sec(SCENES[k][0]);
export const len = (k: SceneKey) => sec(SCENES[k][1]) - sec(SCENES[k][0]);
