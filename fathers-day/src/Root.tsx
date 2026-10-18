import { Composition } from "remotion";
import { FathersDay } from "./FathersDay";
import { FPS, T_END, T_START } from "./edit";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="FathersDay"
    component={FathersDay}
    durationInFrames={Math.round((T_END - T_START) * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
