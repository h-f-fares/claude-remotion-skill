import React from "react";
import { Composition, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { V3Video } from "./V3Video";
import { Thumbnail } from "./Thumbnail";
import { FPS, TOTAL_F } from "./timing";

// IBM Plex Sans Arabic (OFL), bundled in public/fonts so renders work offline
const fontHandle = delayRender("v3 fonts");
const faces = [
  new FontFace("IBM Plex Sans Arabic", `url(${staticFile("fonts/IBMPlexSansArabic-Medium.ttf")}) format("truetype")`, { weight: "500" }),
  new FontFace("IBM Plex Sans Arabic", `url(${staticFile("fonts/IBMPlexSansArabic-SemiBold.ttf")}) format("truetype")`, { weight: "600" }),
  new FontFace("IBM Plex Sans Arabic", `url(${staticFile("fonts/IBMPlexSansArabic-Bold.ttf")}) format("truetype")`, { weight: "700" }),
];
Promise.all(faces.map((f) => f.load()))
  .then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
    continueRender(fontHandle);
  })
  .catch((err) => cancelRender(err));

export const V3Root: React.FC = () => (
  <>
    <Composition id="V3PortfolioAR" component={V3Video} durationInFrames={TOTAL_F} fps={FPS} width={1920} height={1080} />
    <Composition id="V3Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
