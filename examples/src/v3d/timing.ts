// Beat, sentence and word timing for the beginner cut (public/.../audio-v4/timing.json).
import timing from "../../public/videos/v3-portfolio/audio-v4/timing.json";

export const FPS = 30;
// the end card holds for this long after the last word
const TAIL = 4;

type Word = { text: string; start: number; end: number; beat: number; sent: number };
type Sentence = { beat: number; text: string; start: number; end: number };
type Segment = { scene: number; start: number; dur: number };

export const SEGMENTS: Segment[] = timing.segments;
export const SENTENCES: Sentence[] = timing.sentences;
export const WORDS: Word[] = timing.words;
export const BEATS = SEGMENTS.length;

const last = SEGMENTS[BEATS - 1];
export const TOTAL_F = Math.ceil((last.start + last.dur + TAIL) * FPS);

// beats are 1-based everywhere; beat 1 opens at frame 0 (the VO has a short lead-in)
export const bStart = (b: number) => (b === 1 ? 0 : Math.round(SEGMENTS[b - 1].start * FPS));
export const bEnd = (b: number) => (b < BEATS ? bStart(b + 1) : TOTAL_F);
export const bLen = (b: number) => bEnd(b) - bStart(b);

// relative start frame of each sentence in beat `b`
export const cuts = (b: number) =>
  SENTENCES.filter((x) => x.beat === b).map((x) => Math.max(0, Math.round(x.start * FPS) - bStart(b)));
export const s = (b: number, n: number) => cuts(b)[n];

const norm = (t: string) => t.replace(/[ً-ْٰـ]/g, "").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();

// frame (relative to beat start) where the nth occurrence of `text` is spoken in beat `b`
export const w = (b: number, text: string, nth = 0) => {
  const hits = WORDS.filter((x) => x.beat === b && norm(x.text).includes(norm(text)));
  if (!hits[nth]) throw new Error(`word "${text}" #${nth} not in beat ${b}`);
  return Math.round(hits[nth].start * FPS) - bStart(b);
};
