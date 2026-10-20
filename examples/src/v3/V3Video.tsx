// The full v3-portfolio YouTube video: 42 beats on the voiceover, subtitles, music bed and SFX.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { Beat, Enter, Finish } from "./kit";
import { Captions } from "./Captions";
import { BEATS, FPS, TOTAL_F, bEnd, bLen, bStart, cuts, s, w } from "./timing";
import * as A from "./scenes/A";
import * as B from "./scenes/B";
import * as Cc from "./scenes/C";

const SCENES: Record<number, React.FC<A.SceneProps>> = {
  1: A.S1, 2: A.S2, 3: A.S3, 4: A.S4, 5: A.S5, 6: A.S6, 7: A.S7, 8: A.S8, 9: A.S9, 10: A.S10, 11: A.S11,
  12: B.S12, 13: B.S13, 14: B.S14, 15: B.S15, 16: B.S16, 17: B.S17, 18: B.S18, 19: B.S19, 20: B.S20,
  21: B.S21, 22: B.S22, 23: B.S23, 24: B.S24, 25: B.S25, 26: B.S26,
  27: Cc.S27, 28: Cc.S28, 29: Cc.S29, 30: Cc.S30, 31: Cc.S31, 32: Cc.S32, 33: Cc.S33, 34: Cc.S34,
  35: Cc.S35, 36: Cc.S36, 37: Cc.S37, 38: Cc.S38, 39: Cc.S39, 40: Cc.S40, 41: Cc.S41, 42: Cc.S42,
};
// beats that open a chapter (chapter card + whoosh)
export const CHAPTERS = [5, 7, 12, 17, 22, 27, 30, 36, 39];
const DARK = new Set([21, 30, 34]);
const enterFor = (b: number): Enter => (b === 1 ? "cut" : CHAPTERS.includes(b) || DARK.has(b) ? "cut" : b % 2 ? "zoom" : "slide");

type Cue = { f: number; src: string; vol: number };
const sfx = (): Cue[] => {
  const c: Cue[] = [];
  const add = (f: number, src: string, vol: number) => c.push({ f: Math.max(0, f), src, vol });
  for (let b = 1; b <= BEATS; b++) {
    const b0 = bStart(b);
    if (CHAPTERS.includes(b)) {
      add(b0 - 30, "riser", 0.18);
      add(b0 - 2, "whoosh", 0.5);
    } else if (b > 1) add(b0 - 3, "whoosh", 0.22);
    // a soft pop as each sentence's visual lands
    cuts(b).forEach((k, i) => i > 0 && add(b0 + k - 2, "pop", 0.22));
  }
  add(bStart(1) + w(1, "التالتة") - 2, "boom", 0.55);
  add(bStart(2) + s(2, 0), "pop", 0.4);
  add(bStart(11) + s(11, 3) - 2, "boom", 0.4);
  add(bStart(21) - 6, "scratch", 0.5);
  add(bStart(21) + s(21, 1) - 2, "boom", 0.6);
  add(bStart(30) + s(30, 2) - 2, "boom", 0.55);
  add(bStart(34) + w(34, "أنا") - 2, "boom", 0.6);
  add(bStart(32) + s(32, 2), "ding", 0.35);
  add(bStart(36) + s(36, 1), "ding", 0.35);
  add(bStart(37) + s(37, 1), "ding", 0.3);
  add(bStart(28) + s(28, 1) + 26, "click", 0.6);
  add(bStart(35) + s(35, 5) + 24, "click", 0.6);
  add(bStart(42) + s(42, 1) + 22, "click", 0.7);
  return c;
};
const CUES = sfx();

// music ducks under the voice and swells in the gaps between beats
const musicVol = (f: number) => {
  const t = f / FPS;
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [TOTAL_F - 60, TOTAL_F], [1, 0], { extrapolateLeft: "clamp" });
  const tail = t > bEnd(BEATS - 1) / FPS ? 0.2 : 0.12;
  return tail * fadeIn * fadeOut;
};

export const V3Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#F4ECDD" }}>
    {Array.from({ length: BEATS }, (_, i) => i + 1).map((b) => {
      const Scene = SCENES[b];
      // each beat overlaps the next by a few frames so transitions cross
      const len = bLen(b) + (b < BEATS ? 6 : 0);
      return (
        <Sequence key={b} from={bStart(b)} durationInFrames={len} name={`beat ${b}`}>
          <Beat b={b} len={b < BEATS ? len : len + 30} enter={enterFor(b)} dark={DARK.has(b)}>
            <Scene b={b} len={len} />
          </Beat>
        </Sequence>
      );
    })}
    <Captions />
    <Finish />
    <Audio src={staticFile("videos/v3-portfolio/audio/vo.mp3")} />
    <Audio src={staticFile("videos/v3-portfolio/audio/music.wav")} volume={musicVol} />
    {CUES.map((q, i) => (
      <Sequence key={i} from={q.f} durationInFrames={60} layout="none">
        <Audio src={staticFile(`videos/v3-portfolio/audio/${q.src}.wav`)} volume={q.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
