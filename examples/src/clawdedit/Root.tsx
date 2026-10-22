import React from "react";
import { Composition } from "remotion";
import { ClawdEdit } from "./ClawdEdit";
import { FPS, TOTAL_S } from "./timeline";

export const ClawdEditRoot: React.FC = () => (
  <Composition id="ClawdEdit" component={ClawdEdit} durationInFrames={Math.round(FPS * TOTAL_S)} fps={FPS} width={1920} height={1080} />
);
