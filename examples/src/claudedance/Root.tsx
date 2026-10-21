import React from "react";
import { Composition, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { ClaudeDance } from "./ClaudeDance";
import { FPS, TOTAL_F } from "./theme";

// font bundled in public/fonts (OFL) so renders work offline
const fontHandle = delayRender("claude dance font");
new FontFace("Fredoka", `url(${staticFile("fonts/Fredoka-Bold.woff2")}) format("woff2")`, { weight: "700" })
  .load()
  .then((f) => {
    document.fonts.add(f);
    continueRender(fontHandle);
  })
  .catch((err) => cancelRender(err));

export const ClaudeDanceRoot: React.FC = () => (
  <Composition id="ClaudeDance" component={ClaudeDance} durationInFrames={TOTAL_F} fps={FPS} width={1080} height={1920} />
);
