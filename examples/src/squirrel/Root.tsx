import React from "react";
import { Composition, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { SquirrelBurger } from "./SquirrelBurger";
import { SquirrelLong } from "./long/SquirrelLong";
import { totalFor } from "./long/timing";
import { FPS, TOTAL_F } from "./timing";

// fonts bundled in public/fonts (OFL) so renders work offline
const fontHandle = delayRender("squirrel fonts");
const faces = [
  new FontFace("Lilita One", `url(${staticFile("fonts/LilitaOne.woff2")}) format("woff2")`),
  new FontFace("Fredoka", `url(${staticFile("fonts/Fredoka-Bold.woff2")}) format("woff2")`, { weight: "700" }),
  // Arabic display font, reached through the theme's font stacks
  new FontFace("Lalezar", `url(${staticFile("fonts/Lalezar-Regular.ttf")}) format("truetype")`, { weight: "100 900" }),
];
Promise.all(faces.map((f) => f.load()))
  .then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
    continueRender(fontHandle);
  })
  .catch((err) => cancelRender(err));

export const SquirrelRoot: React.FC = () => (
  <>
    <Composition id="SquirrelBurger" component={SquirrelBurger} durationInFrames={TOTAL_F} fps={FPS} width={1080} height={1920} />
    <Composition id="SquirrelBurgerLong" component={SquirrelLong} defaultProps={{ lang: "en" as const }} durationInFrames={totalFor("en")} fps={FPS} width={1080} height={1920} />
    <Composition id="SquirrelBurgerLongAR" component={SquirrelLong} defaultProps={{ lang: "ar" as const }} durationInFrames={totalFor("ar")} fps={FPS} width={1080} height={1920} />
  </>
);
