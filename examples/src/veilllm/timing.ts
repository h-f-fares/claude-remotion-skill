import vo from "./vo.json";

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
export const segments = vo.segments.map((s, i) => ({ ...s, from: i === 0 ? 0 : sec(s.start) }));
export const sentences = vo.sentences;
export const TOTAL = sec(vo.segments[vo.segments.length - 1].start + vo.segments[vo.segments.length - 1].dur + 0.8);
export const sceneDur = (i: number) => (i + 1 < segments.length ? segments[i + 1].from : TOTAL) - segments[i].from;
// Frame (relative to scene i) where the n-th sentence of that beat starts.
export const cue = (i: number, n = 0) => sec(sentences.filter((s) => s.beat === i + 1)[n].start) - segments[i].from;
import aligned from "./words.json";
// Frame (relative to scene i) where the first word of beat i+1 containing `text` starts.
export const wcue = (i: number, text: string) => {
  const beatSents = sentences.map((s, si) => ({ s, si })).filter(({ s }) => s.beat === i + 1).map(({ si }) => si);
  const w = aligned.find((a) => beatSents.includes(a.si) && a.w.includes(text));
  if (!w) throw new Error(`no word ${text} in beat ${i + 1}`);
  return sec(w.start) - segments[i].from;
};
// Absolute frames: a word of beat i+1, or the n-th sentence of beat i+1.
export const wabs = (i: number, text: string) => wcue(i, text) + segments[i].from;
export const cabs = (i: number, n = 0) => cue(i, n) + segments[i].from;
