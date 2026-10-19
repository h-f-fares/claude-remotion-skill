// Beat, sentence and word timing for the 2-minute cut, measured from vo2.wav.
import timing from "../../../public/videos/squirrel-burger/audio/timing2.json";

export const FPS = 30;
const LAST = timing.segments[timing.segments.length - 1];
// voiceover end + room for the button chord and loop wipe
export const TOTAL_F = Math.ceil(LAST.start + LAST.dur + 2.5) * FPS;
export const OVERLAP = 8;

type Word = { text: string; start: number; end: number; scene: number };
type Sentence = { beat: number; text: string; start: number; end: number };
export const WORDS: Word[] = timing.words;
const SENTS: Sentence[] = timing.sentences;
export const BEATS = timing.segments.length;

const START = timing.segments.map((s, i) => (i === 0 ? 0 : Math.round(s.start * FPS)));
// beats are 1-based everywhere
export const bStart = (b: number) => START[b - 1];
export const bEnd = (b: number) => (b < BEATS ? START[b] : TOTAL_F);
export const bLen = (b: number) => bEnd(b) - bStart(b);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");

// frame (relative to beat start) where the nth occurrence of `text` is spoken in beat `b`
export const w = (b: number, text: string, nth = 0) => {
  const hits = WORDS.filter((x) => x.scene === b && norm(x.text) === norm(text));
  if (!hits[nth]) throw new Error(`word "${text}" #${nth} not in beat ${b}`);
  return Math.round(hits[nth].start * FPS) - bStart(b);
};
// relative start frame of each sentence in beat `b`
export const cuts = (b: number) => SENTS.filter((s) => s.beat === b).map((s) => Math.max(0, Math.round(s.start * FPS) - bStart(b)));
export const s = (b: number, n: number) => cuts(b)[n];
