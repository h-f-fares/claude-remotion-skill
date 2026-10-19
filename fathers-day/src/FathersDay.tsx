import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions } from "./components/Captions";
import { Cartoon } from "./components/Cartoon";
import { Chapter, CHAPTER_SECONDS } from "./components/Chapter";
import { EndCard } from "./components/EndCard";
import { EndTitle } from "./components/EndTitle";
import { useFonts } from "./components/Fonts";
import { Footage } from "./components/Footage";
import { Grade } from "./components/Finish";
import { Title } from "./components/Title";
import { CARTOON, CHAPTERS, END_CARD_SECONDS, FINAL_LINE_T, HOOK_SECONDS, OUT_DURATION, sec } from "./edit";

// Dip to black between the cold open and the start of the speech
const HookDip: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, 14, 26], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#000", opacity: o }} />;
};

export const FathersDay: React.FC = () => {
  useFonts();
  const { fps } = useVideoConfig();
  const hookEnd = Math.round(HOOK_SECONDS * fps);
  const bodyEnd = Math.round(OUT_DURATION * fps);
  const endFrom = sec(FINAL_LINE_T) - 6;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Footage />
      <Grade />
      <Sequence from={sec(CARTOON[0])} durationInFrames={sec(CARTOON[1]) - sec(CARTOON[0])} name="Cartoon">
        <Cartoon />
      </Sequence>
      <Sequence from={hookEnd} durationInFrames={Math.round(6.2 * fps)} name="Title">
        <Title />
      </Sequence>
      {CHAPTERS.map((c) => (
        <Sequence key={c.t} from={sec(c.t)} durationInFrames={Math.round(CHAPTER_SECONDS * fps)} name={`Chapter ${c.title}`}>
          <Chapter label={c.label} title={c.title} />
        </Sequence>
      ))}
      <Captions />
      <Sequence from={endFrom} durationInFrames={bodyEnd - endFrom} name="Final line">
        <EndCard />
      </Sequence>
      <Sequence from={hookEnd - 8} durationInFrames={26} name="Hook dip">
        <HookDip />
      </Sequence>
      <Sequence from={bodyEnd - 6} durationInFrames={Math.round(END_CARD_SECONDS * fps) + 6} name="End title">
        <EndTitle />
      </Sequence>
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
