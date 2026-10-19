import { T_START, toOut } from "./edit";
import raw from "./words.json";

// Word timings on the output timeline (words.json is relative to T_START on the A clock)
export type Word = { t: string; s: number; e: number; l: number };
export const WORDS: Word[] = (raw as Word[]).map((w) => ({ ...w, s: toOut(w.s + T_START), e: toOut(w.e + T_START) }));
