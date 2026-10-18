import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "./theme";
import { OVERLAP, SCENE_START, TOTAL_F, sceneEnd, wordF } from "./timing";
import { S1, S10, S2, S3, S4, S5, S6, S7, S8, S9 } from "./scenes";
import { Captions } from "./Captions";

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
const A = (f: string) => staticFile(`videos/squirrel-burger/audio/${f}`);

// absolute frame of word `idx` in scene `scene`
const at = (scene: number, idx: number) => SCENE_START[scene - 1] + wordF(scene, idx);
const sc = (scene: number, off = 0) => SCENE_START[scene - 1] + off;

// SFX land 2–3 frames before the visual they belong to
const CUES: [string, number, number][] = [
  ["pop", 8, 0.6],
  ["whoosh", at(1, 5) - 3, 0.5],
  ["pop", at(1, 7) - 2, 0.7],
  ["whoosh", sc(2) - 2, 0.4],
  ["ding", at(2, 0), 0.25],
  ["pop", at(2, 7), 0.4],
  ["crickets", at(3, 1), 0.6],
  ["thud", at(3, 3) - 2, 0.8],
  ["pop", at(4, 1) - 2, 0.5],
  ["whoosh", at(4, 6), 0.3],
  ["pop", sceneEnd(3) - 24, 0.6],
  ["sizzle", sc(5), 0.55],
  ["thud", at(5, 1) + 2, 0.8],
  ["whoosh", at(5, 2) - 3, 0.5],
  ["bite", at(5, 9) - 1, 0.9],
  ["siren", at(6, 2) - 4, 0.35],
  ["whoosh", sc(7), 0.6],
  ["crack", at(7, 7) + 3, 0.7],
  ["crack", at(8, 0), 0.4],
  ["thud", at(8, 11) - 2, 0.6],
  ["thud", at(8, 12) - 2, 0.6],
  ["thud", at(8, 13) - 2, 0.6],
  ["whoosh", at(9, 5) - 2, 0.4],
  ["ding", at(9, 7) - 2, 0.5],
  ["pop", sc(10, 4), 0.6],
  ["whoosh", sceneEnd(9) - 36, 0.5],
];

const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.mustard, mixBlendMode: "soft-light", opacity: 0.12 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.12), transparent 25%, transparent 75%, rgba(0,0,0,0.18))" }} />
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
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.25) 100%)" }} />
);

export const SquirrelBurger: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.cream }}>
    {SCENES.map((Scene, i) => (
      <Sequence key={i} from={SCENE_START[i]} durationInFrames={Math.min(TOTAL_F, sceneEnd(i) + OVERLAP) - SCENE_START[i]}>
        <Scene />
      </Sequence>
    ))}
    <Grade />
    <Captions />
    <Grain />
    <Vignette />
    <Audio src={A("vo.wav")} />
    <Audio src={A("music.wav")} volume={0.22} />
    {CUES.map(([name, from, vol], i) => (
      <Sequence key={i} from={Math.max(0, from)} layout="none">
        <Audio src={A(`${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
