import { Composition } from "remotion";
import { FathersDay } from "./FathersDay";
import { END_CARD_SECONDS, FPS, OUT_DURATION } from "./edit";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="FathersDay"
    component={FathersDay}
    durationInFrames={Math.round((OUT_DURATION + END_CARD_SECONDS) * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
