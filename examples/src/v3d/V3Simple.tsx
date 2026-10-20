// Beginner cut: a plain-words story plus five simple steps; technical detail lives in the article.
// Real blog footage, dark stage, no burned-in subtitles.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { ACCENT, Beat, Enter, Finish } from "../v3b/kit";
import { BEATS, FPS, TOTAL_F, bEnd, bLen, bStart, cuts, s } from "./timing";
import * as A from "./scenes/S";

const SCENES: Record<number, React.FC<A.SceneProps>> = {
  1: A.S1, 2: A.S2, 3: A.S3, 4: A.S4, 5: A.S5, 6: A.S6, 7: A.S7, 8: A.S8,
  9: A.S9, 10: A.S10, 11: A.S11, 12: A.S12, 13: A.S13, 14: A.S14, 15: A.S15, 16: A.S16, 17: A.S17,
};
// beats that open one of the five steps (step card + whoosh)
export const STEPS_AT = [6, 7, 8, 9, 11];
const accentOf = (b: number) => (b <= 4 ? ACCENT.hook : b <= 11 ? A.STEP : b <= 13 ? ACCENT.numbers : ACCENT.outro);
const behindOf = (b: number) => (b <= 3 ? "v3-bloglist.jpg" : b === 10 ? "v3-arblog.jpg" : b === 15 ? "v3-post.jpg" : undefined);
const enterFor = (b: number): Enter => (b === 1 || STEPS_AT.includes(b) ? "cut" : b % 2 ? "zoom" : "slide");

type Cue = { f: number; src: string; vol: number };
const sfx = (): Cue[] => {
  const c: Cue[] = [];
  const add = (f: number, src: string, vol: number) => c.push({ f: Math.max(0, f), src, vol });
  for (let b = 1; b <= BEATS; b++) {
    const b0 = bStart(b);
    if (STEPS_AT.includes(b)) {
      add(b0 - 30, "riser", 0.15);
      add(b0 - 2, "whoosh", 0.45);
    } else if (b > 1) add(b0 - 3, "whoosh", 0.2);
    cuts(b).forEach((k, i) => i > 0 && add(b0 + k - 2, "pop", 0.18));
  }
  add(bStart(3) + s(3, 1) - 2, "boom", 0.3);
  return c;
};
const CUES = sfx();

const musicVol = (f: number) => {
  const t = f / FPS;
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [TOTAL_F - 60, TOTAL_F], [1, 0], { extrapolateLeft: "clamp" });
  const tail = t > bEnd(BEATS - 1) / FPS ? 0.2 : 0.12;
  return tail * fadeIn * fadeOut;
};

const AUDIO = "videos/v3-portfolio/audio-v4";

export const V3Simple: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1615" }}>
    {Array.from({ length: BEATS }, (_, i) => i + 1).map((b) => {
      const Scene = SCENES[b];
      const len = bLen(b) + (b < BEATS ? 6 : 0);
      return (
        <Sequence key={b} from={bStart(b)} durationInFrames={len} name={`beat ${b}`}>
          <Beat b={b} len={b < BEATS ? len : len + 30} accent={accentOf(b)} behind={behindOf(b)} enter={enterFor(b)} cutFrames={cuts(b)}>
            <Scene b={b} len={len} />
          </Beat>
        </Sequence>
      );
    })}
    <Finish />
    <Audio src={staticFile(`${AUDIO}/vo.mp3`)} />
    <Audio src={staticFile(`${AUDIO}/music.wav`)} volume={musicVol} />
    {CUES.map((q, i) => (
      <Sequence key={i} from={q.f} durationInFrames={60} layout="none">
        <Audio src={staticFile(`${AUDIO}/${q.src}.wav`)} volume={q.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
