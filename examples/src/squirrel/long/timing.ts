// Beat, sentence and word timing for the 2-minute cut, measured from the voiceover.
// Two languages share every scene; the composition calls setLang() before rendering.
import en from "../../../public/videos/squirrel-burger/audio/timing2.json";
import ar from "../../../public/videos/squirrel-burger/audio/timing-ar.json";

export type Lang = "en" | "ar";
export const FPS = 30;
export const OVERLAP = 8;

type Word = { text: string; start: number; end: number; scene: number };
type Sentence = { beat: number; text: string; start: number; end: number };
type Timing = { segments: { scene: number; start: number; dur: number }[]; sentences: Sentence[]; words: Word[] };
const DATA: Record<Lang, Timing> = { en, ar };

let LANG: Lang = "en";
export const setLang = (l: Lang) => {
  LANG = l;
};
export const lang = () => LANG;
export const isAr = () => LANG === "ar";
// pick the string for the current language
export const tr = (enText: string, arText: string) => (LANG === "ar" ? arText : enText);
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const num = (n: number | string) => (LANG === "ar" ? String(n).replace(/\d/g, (d) => AR_DIGITS[+d]) : String(n));

const D = () => DATA[LANG];
export const words = () => D().words;
export const BEATS = 17;

// voiceover end + room for the button chord and loop wipe
export const totalFor = (l: Lang) => {
  const last = DATA[l].segments[DATA[l].segments.length - 1];
  return Math.ceil(last.start + last.dur + 2.5) * FPS;
};
export const totalF = () => totalFor(LANG);

// beats are 1-based everywhere
export const bStart = (b: number) => (b === 1 ? 0 : Math.round(D().segments[b - 1].start * FPS));
export const bEnd = (b: number) => (b < BEATS ? bStart(b + 1) : totalF());
export const bLen = (b: number) => bEnd(b) - bStart(b);

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْٰ]/g, "")
    .replace(/[^a-z0-9'؀-ۿ]/g, "")
    .replace(/[،؛؟]/g, "");

// English anchor word → the Egyptian Arabic word spoken at the same story moment
const AR_ANCHOR: Record<string, [string, number]> = {
  "1:got": ["جاله", 0],
  "1:squirrel": ["سنجاب", 0],
  "1:software": ["لفرق", 0],
  "2:alone": ["لوحده", 0],
  "2:close": ["هيقفل", 0],
  "3:hot": ["سخن", 0],
  "4:fridge": ["التلاجة", 0],
  "4:no": ["مفيش", 0],
  "4:not": ["مش", 0],
  "4:gone": ["خلصانة", 0],
  "5:rule": ["قاعدة", 0],
  "5:never:1": ["أبدا", 0],
  "5:gets": ["قرر", 0],
  "5:creative": ["يتصرف", 0],
  "6:dead": ["ميت", 0],
  "6:trash": ["الزبالة", 0],
  "7:bite": ["قضمة", 0],
  "9:ray": ["راي", 0],
  "9:sign": ["اسم", 0],
  "9:whole": ["والبراند", 0],
  "10:ken": ["كين", 0],
  "10:every": ["كل", 0],
  "14:not": ["مش", 0],
  "15:full": ["صينية", 0],
  "15:beats": ["أحسن", 0],
  "16:low": ["تخلص", 0],
  "16:speak": ["الكلام", 0],
  "17:cut": ["تقلل", 0],
  "17:never": ["عمرك", 0],
  "17:serve": ["تقدم", 0],
};

// frame (relative to beat start) where the nth occurrence of `text` is spoken in beat `b`
export const w = (b: number, text: string, nth = 0) => {
  let word = text;
  let n = nth;
  if (LANG === "ar") {
    const hit = AR_ANCHOR[`${b}:${text.toLowerCase()}${nth ? `:${nth}` : ""}`];
    if (!hit) throw new Error(`no Arabic anchor for "${text}" #${nth} in beat ${b}`);
    [word, n] = hit;
  }
  const hits = D().words.filter((x) => x.scene === b && norm(x.text) === norm(word));
  if (!hits[n]) throw new Error(`word "${word}" #${n} not in beat ${b}`);
  return Math.round(hits[n].start * FPS) - bStart(b);
};
// relative start frame of each sentence in beat `b`
export const cuts = (b: number) =>
  D()
    .sentences.filter((s) => s.beat === b)
    .map((s) => Math.max(0, Math.round(s.start * FPS) - bStart(b)));
export const s = (b: number, n: number) => cuts(b)[n];
