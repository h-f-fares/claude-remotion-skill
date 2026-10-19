// Scene + word timing, measured from the voiceover (public/.../audio/timing.json).
import timing from "../../public/videos/squirrel-burger/audio/timing.json";

export const FPS = 30;
export const TOTAL_F = 36 * FPS;
// incoming scene overlaps the outgoing one by this many frames (scale-through)
export const OVERLAP = 8;

type Word = { text: string; start: number; end: number; scene: number };
export const WORDS: Word[] = timing.words;

// scene start frames; scene 1 opens at frame 0 (VO starts after a 0.5s lead-in)
export const SCENE_START: number[] = timing.segments.map((s, i) =>
  i === 0 ? 0 : Math.round(s.start * FPS),
);
export const sceneEnd = (i: number) =>
  i + 1 < SCENE_START.length ? SCENE_START[i + 1] : TOTAL_F;
export const sceneLen = (i: number) => sceneEnd(i) - SCENE_START[i];

// frame (relative to scene start) at which word `idx` of scene `scene` (1-based) begins
export const wordF = (scene: number, idx: number) => {
  const w = WORDS.filter((x) => x.scene === scene)[idx];
  return Math.round(w.start * FPS) - SCENE_START[scene - 1];
};
