import React from "react";
import { Composition, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { V3Cut } from "./V3Cut";
import { ThumbnailCut } from "./Thumbnail";
import { FPS, TOTAL_F } from "./timing";

// IBM Plex Sans Arabic (OFL), bundled in public/fonts so renders work offline
const fontHandle = delayRender("v3b fonts");
const faces = [500, 600, 700].map(
  (wt) =>
    new FontFace("IBM Plex Sans Arabic", `url(${staticFile(`fonts/IBMPlexSansArabic-${{ 500: "Medium", 600: "SemiBold", 700: "Bold" }[wt]}.ttf`)}) format("truetype")`, {
      weight: String(wt),
    }),
);
Promise.all(faces.map((f) => f.load()))
  .then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
    continueRender(fontHandle);
  })
  .catch((err) => cancelRender(err));

export const V3CutRoot: React.FC = () => (
  <>
    <Composition id="V3PortfolioARCut" component={V3Cut} durationInFrames={TOTAL_F} fps={FPS} width={1920} height={1080} />
    <Composition id="V3CutThumbnail" component={ThumbnailCut} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
