import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { BgMesh, FontStyles, Grade, Grain, SceneExit, Vignette } from "./components";
import { Captions } from "./Captions";
import { S1Hook } from "./scenes/S1Hook";
import { S2Story } from "./scenes/S2Story";
import { S3Reveal } from "./scenes/S3Reveal";
import { S4Mask } from "./scenes/S4Mask";
import { S5Demo } from "./scenes/S5Demo";
import { S6Question } from "./scenes/S6Question";
import { S7Cta } from "./scenes/S7Cta";
import type { SceneProps } from "./scenes/types";
import { TOTAL, cabs, segments, wabs } from "./timing";

export { TOTAL };

// Each scene spans one or more VO beats (0-based); the demo covers the reset beat and the latency beat.
const SCENES: { C: React.FC<SceneProps>; beats: [number, number] }[] = [
  { C: S1Hook, beats: [0, 0] },
  { C: S2Story, beats: [1, 1] },
  { C: S3Reveal, beats: [2, 2] },
  { C: S4Mask, beats: [3, 3] },
  { C: S5Demo, beats: [4, 5] },
  { C: S6Question, beats: [6, 6] },
  { C: S7Cta, beats: [7, 7] },
];
const span = (i: number) => {
  const from = segments[SCENES[i].beats[0]].from;
  const end = i + 1 < SCENES.length ? segments[SCENES[i + 1].beats[0]].from : TOTAL;
  return { from, dur: end - from };
};

const SFX = [
  { at: wabs(1, "harness") - 4, src: "pop", vol: 0.35 },
  { at: wabs(1, "فينا") - 2, src: "pop", vol: 0.35 },
  { at: wabs(2, "VeilLLM"), src: "bass", vol: 0.5 },
  { at: wabs(3, "ويبدّلها"), src: "tick", vol: 0.4 },
  { at: cabs(4, 0), src: "bass", vol: 0.55 },
  { at: cabs(5, 0) + 14, src: "pop", vol: 0.4 },
  { at: wabs(7, "اشترك") + 8, src: "pop", vol: 0.4 },
];

// Shorts: 4:5 stage scaled into the safe zone (clear of the top bar and right-side buttons).
export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: "#070B10", direction: "rtl" }}>
    <FontStyles />
    <BgMesh />
    <div style={{ position: "absolute", top: 300, left: 0, width: 1080, height: 1350, transform: "scale(0.9)", transformOrigin: "50% 0%" }}>
      {SCENES.map(({ C }, i) => {
        const { from, dur } = span(i);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            {i === SCENES.length - 1 ? <C dur={dur} from={from} /> : <SceneExit dur={dur}><C dur={dur} from={from} /></SceneExit>}
          </Sequence>
        );
      })}
    </div>
    <Captions layout="short" />
    <Grade />
    <Grain />
    <Vignette />
    <Audio src={staticFile("veilllm/vo.mp3")} />
    <Audio src={staticFile("sfx/pad.wav")} loop volume={(f) => interpolate(f, [0, 20, TOTAL - 30, TOTAL], [0, 0.12, 0.12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    {SCENES.slice(1).map((_, i) => (
      <Sequence key={`w${i}`} from={span(i + 1).from - 4} durationInFrames={30}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} /></Sequence>
    ))}
    {SFX.map((x, i) => (
      <Sequence key={`s${i}`} from={x.at} durationInFrames={30}><Audio src={staticFile(`sfx/${x.src}.wav`)} volume={x.vol} /></Sequence>
    ))}
  </AbsoluteFill>
);
