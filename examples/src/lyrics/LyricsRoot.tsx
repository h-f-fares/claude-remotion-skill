import React from "react";
import { Composition } from "remotion";
import { SolitudeLyrics, SOL_TOTAL_S } from "./SolitudeLyrics";
import { WahdyShort, WAHDY_TOTAL_S } from "./WahdyShort";

const FPS = 30;

export const LyricsRoot: React.FC = () => (
  <>
    <Composition
      id="SolitudeLyrics"
      component={SolitudeLyrics}
      durationInFrames={Math.round(FPS * SOL_TOTAL_S)}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="WahdyShort"
      component={WahdyShort}
      durationInFrames={Math.round(FPS * WAHDY_TOTAL_S)}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
