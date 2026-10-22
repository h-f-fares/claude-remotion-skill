#!/usr/bin/env node
// Review gate 1: render N stills at reduced scale with ONE bundle, then tile them into a
// contact sheet you read as one image. Cheap enough to run after every fix.
//
//   node stills.mjs <entry> <compId> [--n 18] [--frames 0,45,90] [--scale 0.5]
//                   [--out out/qc] [--gl swangle] [--browser <path>]
//
// Run it from the Remotion project root (needs @remotion/bundler + @remotion/renderer,
// which @remotion/cli already installs). Needs ffmpeg on PATH for the sheet.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

// resolve Remotion from the PROJECT (cwd), not from this script's folder
const req = createRequire(path.join(process.cwd(), "package.json"));
const load = (m) => import(pathToFileURL(req.resolve(m)).href);
const { bundle } = await load("@remotion/bundler");
const { renderStill, selectComposition } = await load("@remotion/renderer");

const [entry, compId, ...rest] = process.argv.slice(2);
if (!entry || !compId) {
  console.error("usage: node stills.mjs <entry> <compId> [--n 18] [--frames a,b,c] [--scale 0.5] [--out out/qc] [--gl swangle] [--browser path]");
  process.exit(1);
}
const opt = (k, d) => {
  const i = rest.indexOf(`--${k}`);
  return i >= 0 ? rest[i + 1] : d;
};
const n = Number(opt("n", 18));
const scale = Number(opt("scale", 0.5));
const out = opt("out", "out/qc");
const gl = opt("gl", "swangle"); // CPU WebGL; use "angle" on a GPU machine
let browser = opt("browser", undefined);
if (!browser && existsSync("/opt/pw-browsers")) {
  const hs = readdirSync("/opt/pw-browsers").find((d) => d.startsWith("chromium_headless_shell"));
  if (hs) browser = path.join("/opt/pw-browsers", hs, "chrome-linux", "headless_shell");
}
mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve(entry) });
const chromiumOptions = { gl };
const composition = await selectComposition({ serveUrl, id: compId, browserExecutable: browser, chromiumOptions });
const last = composition.durationInFrames - 1;
const frames = opt("frames", null)
  ? opt("frames").split(",").map(Number)
  : Array.from({ length: n }, (_, i) => Math.round((i * last) / (n - 1)));

const files = [];
for (const frame of frames) {
  const file = path.join(out, `still_${String(frame).padStart(4, "0")}.png`);
  const t0 = Date.now();
  await renderStill({ serveUrl, composition, frame, output: file, scale, browserExecutable: browser, chromiumOptions, overwrite: true });
  console.log(`frame ${frame} (${(frame / composition.fps).toFixed(2)} s) → ${file}  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  files.push(file);
}

// tile into one sheet with the time burned into each cell
const cols = Math.ceil(Math.sqrt(files.length * 1.2));
const rows = Math.ceil(files.length / cols);
const sheet = path.join(out, "contact_sheet.png");
const inputs = files.flatMap((f) => ["-i", f]);
const labels = files
  .map((f, i) => `[${i}:v]scale=480:-2,drawtext=text='f${frames[i]} ${(frames[i] / composition.fps).toFixed(2)}s':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`)
  .join(";");
const stack = files.map((_, i) => `[v${i}]`).join("");
const layout = files.map((_, i) => `${(i % cols)}_${Math.floor(i / cols)}`).map((s) => {
  const [c, r] = s.split("_").map(Number);
  return `${c ? Array.from({ length: c }, () => "w0").join("+") : 0}_${r ? Array.from({ length: r }, () => "h0").join("+") : 0}`;
}).join("|");
const graph = files.length > 1 ? `${labels};${stack}xstack=inputs=${files.length}:layout=${layout}:fill=black` : labels.replace("[v0]", "");
execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", graph, "-frames:v", "1", sheet]);
console.log(`\ncontact sheet (${cols}x${rows}): ${sheet}`);
