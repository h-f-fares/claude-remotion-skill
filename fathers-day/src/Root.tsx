import { Composition } from "remotion";
import { FathersDay } from "./FathersDay";
import { FPS, OUT_DURATION } from "./edit";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="FathersDay"
    component={FathersDay}
    durationInFrames={Math.round(OUT_DURATION * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
