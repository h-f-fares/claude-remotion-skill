import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, TOTAL } from "./timing";

export const Root: React.FC = () => (
  <Composition id="VeilFactoryAR" component={Main} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
