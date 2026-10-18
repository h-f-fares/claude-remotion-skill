import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { BEATS, OVERLAP, TOTAL_F, bEnd, bStart, cuts, w } from "./timing";
import { B1, B2, B3, B4, B5, B6 } from "./scenesA";
import { B7, B8, B9, B10, B11, B12 } from "./scenesB";
import { B13, B14, B15, B16, B17 } from "./scenesC";
import { Captions } from "./Captions";

const SCENES = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12, B13, B14, B15, B16, B17];
const A = (f: string) => staticFile(`videos/squirrel-burger/audio/${f}`);

// absolute frames
const W = (b: number, word: string, nth = 0) => bStart(b) + w(b, word, nth);
const S = (b: number, n: number) => bStart(b) + cuts(b)[n];
const B = (b: number, off = 0) => bStart(b) + off;

// SFX land 2–3 frames before the visual they belong to
const CUES: [string, number, number][] = [
  ["pop", 8, 0.5],
  ["whoosh", W(1, "got") - 3, 0.5],
  ["boom", W(1, "squirrel") - 2, 0.6],
  ["pop", W(1, "software"), 0.5],
  ["scratch", B(2), 0.5],
  ["pop", S(2, 1), 0.5],
  ["ding", S(2, 3), 0.35],
  ["tick", S(2, 4), 0.6],
  ["pop", S(2, 5), 0.4],
  ["whoosh", B(3), 0.4],
  ["pop", W(3, "nobody", 0), 0.4],
  ["boom", W(3, "nobody", 1) - 2, 0.8],
  ["whoosh", W(4, "fridge"), 0.4],
  ["thud", W(4, "gone", 1) - 2, 0.9],
  ["crickets", W(4, "gone", 1) + 10, 0.5],
  ["pop", W(5, "option", 0), 0.4],
  ["pop", W(5, "sorry"), 0.5],
  ["riser", W(5, "option", 1) - 10, 0.4],
  ["boom", W(6, "squirrel") - 2, 0.6],
  ["pop", S(7, 0) + 10, 0.4],
  ["sizzle", S(7, 1), 0.55],
  ["thud", S(7, 2) + 2, 0.8],
  ["whoosh", S(7, 3) - 3, 0.5],
  ["bite", W(7, "bite") - 1, 0.9],
  ["whoosh", B(8), 0.5],
  ["siren", S(8, 1), 0.35],
  ["whoosh", B(9), 0.6],
  ["crack", W(9, "whole") + 4, 0.7],
  ["scratch", B(10), 0.7],
  ["pop", W(10, "ken"), 0.4],
  ["pop", S(10, 2), 0.4],
  ["ding", S(10, 4), 0.5],
  ["pop", W(10, "every"), 0.4],
  ["pop", W(10, "every") + 8, 0.4],
  ["pop", W(10, "every") + 16, 0.4],
  ["whoosh", B(11), 0.4],
  ["pop", S(11, 1), 0.4],
  ["whoosh", S(11, 4) + 6, 0.5],
  ["pop", S(11, 5), 0.4],
  ["pop", S(11, 6) + 4, 0.5],
  ["boom", B(12, 2), 0.6],
  ["thud", S(12, 1) - 2, 0.6],
  ["thud", S(12, 2) - 2, 0.6],
  ["thud", S(12, 3) - 2, 0.6],
  ["riser", S(13, 1) - 40, 0.4],
  ["boom", S(13, 1) - 2, 0.7],
  ["ding", B(14), 0.5],
  ["pop", S(14, 1), 0.4],
  ["whoosh", S(14, 2) + 6, 0.4],
  ["thud", S(14, 3) + 2, 0.6],
  ["ding", B(15), 0.5],
  ["pop", S(15, 1) + 4, 0.4],
  ["pop", W(15, "beats"), 0.5],
  ["ding", B(16), 0.5],
  ["pop", W(16, "speak"), 0.4],
  ["thud", S(16, 3) + 2, 0.6],
  ["scratch", W(17, "cut"), 0.4],
  ["riser", W(17, "serve") - 45, 0.45],
  ["boom", W(17, "serve") - 2, 0.8],
  ["pop", W(17, "serve") + 30, 0.5],
  ["whoosh", TOTAL_F - 42, 0.5],
];

const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.mustard, mixBlendMode: "soft-light", opacity: 0.14 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.14), transparent 25%, transparent 75%, rgba(0,0,0,0.2))" }} />
  </AbsoluteFill>
);

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.07,
        mixBlendMode: "multiply",
      }}
    />
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.28) 100%)" }} />
);

export const SquirrelLong: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.cream }}>
    {SCENES.map((Scene, i) => {
      const b = i + 1;
      return (
        <Sequence key={b} from={bStart(b)} durationInFrames={Math.min(TOTAL_F, bEnd(b) + (b < BEATS ? OVERLAP : 0)) - bStart(b)}>
          <Scene />
        </Sequence>
      );
    })}
    <Grade />
    <Captions hideFrom={W(17, "never")} />
    <Grain />
    <Vignette />
    <Audio src={A("vo2.wav")} />
    <Audio src={A("music2.wav")} volume={0.2} />
    {CUES.map(([name, from, vol], i) => (
      <Sequence key={i} from={Math.max(0, from)} layout="none">
        <Audio src={A(`${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
