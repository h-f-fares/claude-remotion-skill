import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { clamp } from "./theme";
import { at, from, len, SCENES, TOTAL, type SceneKey } from "./timing";
import { BgMesh, FontStyles, Grade, Grain, SceneExit, Vignette } from "./components";
import { ChoiceScene, Config, Cta, Demo, Friends, Hook, Mask, Reset, Reveal } from "./scenes";
import { Captions } from "./Captions";
import { TextCheck } from "./TextCheck";

const SCENE_COMPONENTS: Record<SceneKey, React.FC> = {
  hook: Hook, friends: Friends, reveal: Reveal, mask: Mask, reset: Reset, demo: Demo, config: Config, choice: ChoiceScene, cta: Cta,
};

const sfx = (f: string) => staticFile(`sfx/${f}`);
const Sfx: React.FC<{ at: number; file: string; volume?: number }> = ({ at: f, file, volume = 0.4 }) => (
  <Sequence from={Math.max(0, f)} durationInFrames={60} layout="none"><Audio src={sfx(file)} volume={volume} /></Sequence>
);

export const Main: React.FC = () => {
  const reset: [number, number] = [from("reset"), from("reset") + len("reset")];
  const keys = Object.keys(SCENES) as SceneKey[];
  return (
    <AbsoluteFill style={{ background: "#0B0907" }}>
      <FontStyles />
      <BgMesh />
      {keys.map((k) => {
        const C = SCENE_COMPONENTS[k];
        return (
          <Sequence key={k} from={from(k)} durationInFrames={len(k)}>
            {k === "cta" ? <C /> : <SceneExit dur={len(k)}><C /></SceneExit>}
          </Sequence>
        );
      })}
      <Grade />
      <Grain />
      <Vignette />
      <Captions hide={[reset]} />
      <TextCheck />
      <Audio src={staticFile("vo.mp3")} />
      {/* music bed: drops out for the reset beat, then comes back */}
      <Audio src={sfx("pad19.wav")} loop volume={(f) => 0.13 * interpolate(f, [reset[0] - 6, reset[0], reset[1] + 10, reset[1] + 30, TOTAL - 30, TOTAL], [1, 0, 0, 1, 1, 0], clamp)} />
      {keys.slice(1).map((k) => <Sfx key={k} at={from(k) - 4} file="whoosh.wav" volume={0.3} />)}
      <Sfx at={at("بتخرج")} file="whoosh.wav" volume={0.35} />
      <Sfx at={at("VeilLLM")} file="bass.wav" volume={0.55} />
      <Sfx at={reset[0]} file="bass.wav" volume={0.6} />
      {[0, 5, 10].map((d) => <Sfx key={d} at={at("ويبدّلها") + d} file="pop.wav" volume={0.3} />)}
      {[0, 5, 10].map((d) => <Sfx key={`u${d}`} at={at("بيرجّع") + d} file="pop.wav" volume={0.3} />)}
      <Sfx at={at("20", 0, SCENES.demo[0])} file="tick.wav" volume={0.35} />
      <Sfx at={at("قولي")} file="pop.wav" volume={0.35} />
    </AbsoluteFill>
  );
};
