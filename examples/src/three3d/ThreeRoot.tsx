import React from "react";
import { Composition } from "remotion";
import { Orbit3D, ORBIT_TOTAL_S } from "./Orbit3D";

const FPS = 30;

export const ThreeRoot: React.FC = () => (
  <Composition
    id="Orbit3D"
    component={Orbit3D}
    durationInFrames={Math.round(FPS * ORBIT_TOTAL_S)}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
