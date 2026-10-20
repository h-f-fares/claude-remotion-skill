// The 5-minute cut: 30 beats on the new voiceover, dark studio stage with per-chapter accents,
// real site footage, music bed and SFX. No burned-in subtitles (an .srt ships for YouTube CC).
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { ACCENT, Accent, Beat, Enter, Finish } from "./kit";
import { BEATS, FPS, TOTAL_F, bEnd, bLen, bStart, cuts, s, w } from "./timing";
import * as A from "./scenes/A";
import * as B from "./scenes/B";

const SCENES: Record<number, React.FC<A.SceneProps>> = {
  1: A.S1, 2: A.S2, 3: A.S3, 4: A.S4, 5: A.S5, 6: A.S6, 7: A.S7, 8: A.S8, 9: A.S9, 10: A.S10, 11: A.S11,
  12: B.S12, 13: B.S13, 14: B.S14, 15: B.S15, 16: B.S16, 17: B.S17, 18: B.S18, 19: B.S19, 20: B.S20,
  21: B.S21, 22: B.S22, 23: B.S23, 24: B.S24, 25: B.S25, 26: B.S26, 27: B.S27, 28: B.S28, 29: B.S29, 30: B.S30,
};
// beats that open a chapter (chapter card + whoosh)
export const CHAPTERS = [4, 8, 12, 19, 21, 26];
const accentOf = (b: number): Accent =>
  b <= 3 ? "hook" : b <= 7 ? "versions" : b <= 11 ? "hours" : b <= 17 ? "prs" : b <= 20 ? "numbers" : b <= 25 ? "code" : b <= 27 ? "bill" : "outro";
// blurred screenshot behind the stage, by section
const behindOf = (b: number) => (b <= 3 ? "v3-home-desk.jpg" : b <= 7 ? "v1-home-desk.jpg" : b >= 12 && b <= 17 ? "v3-blog-desk.jpg" : b >= 28 ? "v3-home-dark.jpg" : undefined);
const enterFor = (b: number): Enter => (b === 1 || CHAPTERS.includes(b) || b === 18 || b === 24 ? "cut" : b % 2 ? "zoom" : "slide");

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
    cuts(b).forEach((k, i) => i > 0 && add(b0 + k - 2, "pop", 0.2));
  }
  add(bStart(1) + s(1, 1) - 2, "boom", 0.5);
  add(bStart(6) + s(6, 1) - 2, "boom", 0.4);
  add(bStart(7) + s(7, 1) - 2, "boom", 0.35);
  add(bStart(18) - 6, "scratch", 0.5);
  add(bStart(18) + s(18, 1) - 2, "boom", 0.6);
  add(bStart(21) + s(21, 2) - 2, "boom", 0.55);
  add(bStart(24) + w(24, "أنا") - 2, "boom", 0.6);
  add(bStart(22) + w(22, "واتصلحوا"), "ding", 0.35);
  add(bStart(26) + s(26, 1), "ding", 0.3);
  add(bStart(25) + w(25, "ولينك") + 22, "click", 0.6);
  add(bStart(30) + s(30, 1) + 22, "click", 0.7);
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

const AUDIO = "videos/v3-portfolio/audio-v2";

export const V3Cut: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1615" }}>
    {Array.from({ length: BEATS }, (_, i) => i + 1).map((b) => {
      const Scene = SCENES[b];
      const len = bLen(b) + (b < BEATS ? 6 : 0);
      return (
        <Sequence key={b} from={bStart(b)} durationInFrames={len} name={`beat ${b}`}>
          <Beat b={b} len={b < BEATS ? len : len + 30} accent={ACCENT[accentOf(b)]} behind={behindOf(b)} enter={enterFor(b)}>
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
