import { continueRender, delayRender, staticFile } from "remotion";

const FACES: [string, string, string, string][] = [
  ["Playfair Display", "playfair-display-latin-600-normal.woff2", "600", "normal"],
  ["Playfair Display", "playfair-display-latin-700-normal.woff2", "700", "normal"],
  ["Playfair Display", "playfair-display-latin-600-italic.woff2", "600", "italic"],
  ["Playfair Display", "playfair-display-latin-700-italic.woff2", "700", "italic"],
  ["Montserrat", "montserrat-latin-500-normal.woff2", "500", "normal"],
  ["Montserrat", "montserrat-latin-700-normal.woff2", "700", "normal"],
  ["Montserrat", "montserrat-latin-800-normal.woff2", "800", "normal"],
];

const handle = delayRender("fonts", { timeoutInMilliseconds: 120000 });
Promise.all(
  FACES.map(([family, file, weight, style]) => {
    const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight, style });
    return f.load().then(() => document.fonts.add(f));
  }),
).then(
  () => continueRender(handle),
  (err) => { console.error("font load failed", err); continueRender(handle); },
);
