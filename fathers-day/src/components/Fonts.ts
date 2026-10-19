import { useEffect, useState } from "react";
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

// Inject @font-face rules (data URLs) once, from inside the rendered component, so
// idle pages that only import the bundle never hold an open delayRender.
let injected: Promise<unknown> | null = null;
const loadFonts = () => {
  if (!injected) {
    const tag = document.createElement("style");
    tag.textContent = FACES.map(([family, url, weight, style]) =>
      `@font-face{font-family:"${family}";src:url(${url}) format("woff2");font-weight:${weight};font-style:${style};font-display:block}`).join("\n");
    document.head.appendChild(tag);
    injected = Promise.all(FACES.map(([family, , weight, style]) => document.fonts.load(`${style} ${weight} 40px "${family}"`)));
  }
  return injected;
};

export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle), () => continueRender(handle));
  }, [handle]);
};
