import { continueRender, delayRender } from "remotion";
// Fonts are bundled as data URLs (webpack asset/inline) so every render tab has them
// instantly, without competing with the video streams for the static server.
import pf600 from "../../public/fonts/playfair-display-latin-600-normal.woff2";
import pf700 from "../../public/fonts/playfair-display-latin-700-normal.woff2";
import pf600i from "../../public/fonts/playfair-display-latin-600-italic.woff2";
import pf700i from "../../public/fonts/playfair-display-latin-700-italic.woff2";
import ms500 from "../../public/fonts/montserrat-latin-500-normal.woff2";
import ms700 from "../../public/fonts/montserrat-latin-700-normal.woff2";
import ms800 from "../../public/fonts/montserrat-latin-800-normal.woff2";

const FACES: [string, string, string, string][] = [
  ["Playfair Display", pf600, "600", "normal"],
  ["Playfair Display", pf700, "700", "normal"],
  ["Playfair Display", pf600i, "600", "italic"],
  ["Playfair Display", pf700i, "700", "italic"],
  ["Montserrat", ms500, "500", "normal"],
  ["Montserrat", ms700, "700", "normal"],
  ["Montserrat", ms800, "800", "normal"],
];

const handle = delayRender("fonts");
Promise.all(
  FACES.map(([family, url, weight, style]) => {
    const f = new FontFace(family, `url(${url}) format("woff2")`, { weight, style });
    return f.load().then(() => document.fonts.add(f));
  }),
).then(
  () => continueRender(handle),
  (err) => { console.error("font load failed", err); continueRender(handle); },
);
