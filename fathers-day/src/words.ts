import { OUT_STARTS, SEGMENTS, T_START } from "./edit";
import raw from "./words.json";

// Word timings on the output timeline (words.json is relative to T_START on the A clock).
// A word inside a range that plays twice (the cold open) appears twice.
export type Word = { t: string; s: number; e: number; l: number; seg: number };
// Captions lead the voice slightly: a word that lights up a hair early reads as in sync.
const LEAD = 0.08;
export const WORDS: Word[] = SEGMENTS.flatMap(([a, b], seg) =>
  (raw as Omit<Word, "seg">[])
    .filter((w) => w.s + T_START >= a - 0.05 && w.s + T_START < b)
    .map((w) => ({
      ...w,
      seg,
      s: OUT_STARTS[seg] + Math.max(0, w.s + T_START - a) - LEAD,
      e: OUT_STARTS[seg] + Math.min(b - a, w.e + T_START - a) - LEAD,
    })),
).sort((x, y) => x.s - y.s);
