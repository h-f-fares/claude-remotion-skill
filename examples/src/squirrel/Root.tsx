import React from "react";
import { Composition, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { SquirrelBurger } from "./SquirrelBurger";
import { theme } from "./theme";
import { FPS, TOTAL_F } from "./timing";

// fonts bundled in public/fonts (OFL) so renders work offline
const fontHandle = delayRender("squirrel fonts");
const faces = [
  new FontFace(theme.fonts.display, `url(${staticFile("fonts/LilitaOne.woff2")}) format("woff2")`),
  new FontFace(theme.fonts.body, `url(${staticFile("fonts/Fredoka-Bold.woff2")}) format("woff2")`, { weight: "700" }),
];
Promise.all(faces.map((f) => f.load()))
  .then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
    continueRender(fontHandle);
  })
  .catch((err) => cancelRender(err));

export const SquirrelRoot: React.FC = () => (
  <Composition id="SquirrelBurger" component={SquirrelBurger} durationInFrames={TOTAL_F} fps={FPS} width={1080} height={1920} />
);
