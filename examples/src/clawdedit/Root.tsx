import React from "react";
import { Composition } from "remotion";
import { ClawdEdit } from "./ClawdEdit";
import { ClawdComp, ClawdUI } from "./Assets";
import { APP, FPS, TOTAL_S, VIEWER } from "./timeline";

export const ClawdEditRoot: React.FC = () => (
  <>
    <Composition id="ClawdEdit" component={ClawdEdit} durationInFrames={Math.round(FPS * TOTAL_S)} fps={FPS} width={1920} height={1080} />
    {/* textures for the Blender flow */}
    <Composition id="ClawdUI" component={ClawdUI} durationInFrames={1} fps={FPS} width={APP.w * APP.scale} height={APP.h * APP.scale} />
    <Composition id="ClawdComp" component={ClawdComp} durationInFrames={Math.round(FPS * TOTAL_S)} fps={FPS} width={VIEWER.w * APP.scale} height={VIEWER.h * APP.scale} />
  </>
);
