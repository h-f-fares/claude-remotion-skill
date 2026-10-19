import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Captions } from "./components/Captions";
import { Chapter, CHAPTER_SECONDS } from "./components/Chapter";
import { EndCard } from "./components/EndCard";
import { useFonts } from "./components/Fonts";
import { Footage } from "./components/Footage";
import { Grade } from "./components/Finish";
import { Title } from "./components/Title";
import { CHAPTERS, FINAL_LINE_T, sec } from "./edit";

export const FathersDay: React.FC = () => {
  useFonts();
  const { fps, durationInFrames } = useVideoConfig();
  const endFrom = sec(FINAL_LINE_T) - 6;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Footage />
      <Grade />
      <Sequence from={0} durationInFrames={Math.round(6.2 * fps)} name="Title">
        <Title />
      </Sequence>
      {CHAPTERS.map((c) => (
        <Sequence key={c.t} from={sec(c.t)} durationInFrames={Math.round(CHAPTER_SECONDS * fps)} name={`Chapter ${c.title}`}>
          <Chapter label={c.label} title={c.title} />
        </Sequence>
      ))}
      <Captions />
      <Sequence from={endFrom} durationInFrames={durationInFrames - endFrom} name="End">
        <EndCard />
      </Sequence>
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
