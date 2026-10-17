// Generates the 8 cinematic stills for SolitudeLyrics with Gemini image
// ("Nano Banana") and saves them to public/lyrics/shot-XX.png.
//
// Key: GEMINI_API_KEY (a Vertex AI express-mode key or a Gemini API key).
// Tries Vertex AI first, then the Gemini API. Shot 01 is generated first and
// passed as a reference to every later shot so the man stays the same person.
// Existing shots are skipped (no credits spent twice); pass --force to redo,
// or shot numbers to redo only those: node scripts/gen-lyrics-images.mjs 3 5
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.LYRICS_IMAGE_MODEL ?? "gemini-2.5-flash-image";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "lyrics");
mkdirSync(OUT, { recursive: true });
if (!KEY) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}

const STYLE =
  "Cinematic film still, shot on ARRI Alexa with a 35mm anamorphic lens, night, " +
  "steady rain, wet reflective ground, deep teal shadows with warm sodium-amber " +
  "practical lights, volumetric haze, strong depth with clear foreground, midground " +
  "and background, shallow depth of field, subtle film grain, photorealistic, " +
  "vertical 9:16 composition, the lower third of the frame darker and uncluttered. " +
  "No text, no captions, no watermark, no logos.";
const MAN =
  "a young Egyptian man in his twenties, short dark hair, light beard, dark hooded " +
  "jacket soaked by rain";

// one shot per lyric line, in order
const SHOTS = [
  `Wide shot from behind: ${MAN} walking alone down a long, narrow old Cairo alley, ` +
    "wet stone, lanterns fading into the distance, nobody else around.",
  `The same alley now blocked: fallen wooden scaffolding, rubble and a collapsed cart ` +
    `close to camera, ${MAN} small in the background, stopped, looking at the dead end.`,
  `Almost total darkness: a deep tunnel-like covered passage, one faint amber light ` +
    `far at the end, ${MAN} a dark silhouette in the middle distance, haze in the beam.`,
  `Low angle: a massive closed iron gate fills the frame, rain running down it, ` +
    `${MAN} standing in front of it seen from behind, one hand on the bars.`,
  `Close-up profile of ${MAN}, eyes closed, face wet with rain and tears, ` +
    "amber street light rim-lighting his face, background a blur of bokeh lights.",
  `${MAN} sitting alone on wet stone steps in an empty alley, elbows on knees, ` +
    "head low, talking quietly to himself, mid shot, puddles in the foreground.",
  `Shot over a rain puddle in the foreground: the reflection of ${MAN} looking down ` +
    "at himself in the water, his real figure out of focus at the top of the frame.",
  `High wide crane shot: ${MAN} sitting tiny in the middle of an empty wet street ` +
    "under a single amber streetlight, rain, darkness all around, deep loneliness.",
];

const ENDPOINTS = [
  {
    name: "Vertex AI",
    url: `https://aiplatform.googleapis.com/v1/publishers/google/models/${MODEL}:generateContent?key=${KEY}`,
    headers: {},
  },
  {
    name: "Gemini API",
    url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    headers: { "x-goog-api-key": KEY },
  },
];
let endpoint = null;

const request = async (ep, parts) => {
  const res = await fetch(ep.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...ep.headers },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: "9:16" },
      },
    }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
};

const generate = async (parts) => {
  for (const ep of endpoint ? [endpoint] : ENDPOINTS) {
    const { ok, status, body } = await request(ep, parts);
    if (!ok) {
      console.warn(`  ${ep.name}: ${status} ${body?.error?.message ?? ""}`.trim());
      if (endpoint) throw new Error("generation failed");
      continue;
    }
    endpoint = ep;
    const img = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!img) throw new Error(`no image returned: ${JSON.stringify(body).slice(0, 300)}`);
    return Buffer.from(img.inlineData.data, "base64");
  }
  throw new Error("no endpoint accepted the key");
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => /^\d+$/.test(a)).map(Number);
const file = (i) => join(OUT, `shot-${String(i + 1).padStart(2, "0")}.png`);

for (let i = 0; i < SHOTS.length; i++) {
  const wanted = only.length ? only.includes(i + 1) : force || !existsSync(file(i));
  if (!wanted) continue;
  const parts = [];
  if (i > 0 && existsSync(file(0))) {
    parts.push({ inlineData: { mimeType: "image/png", data: readFileSync(file(0)).toString("base64") } });
    parts.push({ text: "Reference image: keep this exact man (face, hair, beard, jacket) and this color grade." });
  }
  parts.push({ text: `${SHOTS[i]} ${STYLE}` });
  console.log(`shot ${i + 1}/${SHOTS.length}…`);
  writeFileSync(file(i), await generate(parts));
  console.log(`  saved ${file(i)} via ${endpoint.name}`);
}
console.log("done — next: python3 scripts/gen-depth.py");
