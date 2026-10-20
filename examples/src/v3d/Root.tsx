import React from "react";
import { Composition, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { V3Simple } from "./V3Simple";
import { ThumbA, ThumbB, ThumbC, ThumbD, ThumbnailSimple } from "./Thumbnail";
import { FPS, TOTAL_F } from "./timing";

// IBM Plex Sans Arabic (OFL), bundled in public/fonts so renders work offline
const fontHandle = delayRender("v3d fonts");
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

export const V3SimpleRoot: React.FC = () => (
  <>
    <Composition id="V3PortfolioARSimple" component={V3Simple} durationInFrames={TOTAL_F} fps={FPS} width={1920} height={1080} />
    <Composition id="V3SimpleThumbnail" component={ThumbnailSimple} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="V3SimpleThumbA" component={ThumbA} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="V3SimpleThumbB" component={ThumbB} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="V3SimpleThumbD" component={ThumbD} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="V3SimpleThumbC" component={ThumbC} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
