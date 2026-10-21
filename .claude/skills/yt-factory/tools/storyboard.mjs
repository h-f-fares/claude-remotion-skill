#!/usr/bin/env node
// storyboard.mjs - one numbered panel per scene, rendered from the video's real scenes, on one sheet.
//
//   cd videos/<slug> && node ../../.claude/skills/yt-factory/tools/storyboard.mjs <CompositionId>
//        [--vo src/vo.json] [--at 2.5,9,14.2] [--out out/storyboard.png] [--entry src/index.ts]
//
// Panels: one per segment of src/vo.json (taken at 65% of the segment, after its entrances), or the
// times given with --at. The user approves or rejects by panel number; the panels are the scene code
// itself, so an approved board is never redrawn.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const comp = args.find((a, i) => !a.startsWith("--") && !["--vo", "--at", "--out", "--entry"].includes(args[i - 1]));
if (!comp) { console.log("usage: storyboard.mjs <CompositionId> [--vo src/vo.json] [--at 2.5,9] [--out out/storyboard.png]"); process.exit(2); }
const out = resolve(opt("--out", "out/storyboard.png"));
mkdirSync(dirname(out), { recursive: true });

let panels;
if (opt("--at")) panels = opt("--at").split(",").map((t, i) => ({ t: +t, label: `${i + 1}` }));
else {
  const vo = JSON.parse(readFileSync(opt("--vo", "src/vo.json"), "utf8"));
  panels = vo.segments.map((s, i) => ({ t: s.start + 0.65 * s.dur, label: `${i + 1}` }));
}

const req = createRequire(join(process.cwd(), "package.json"));
const { bundle } = req("@remotion/bundler");
const { openBrowser, renderStill, selectComposition } = req("@remotion/renderer");
const shells = existsSync("/opt/pw-browsers") ? readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")) : [];
const browserExecutable = shells.length ? `/opt/pw-browsers/${shells[0]}/chrome-linux/headless_shell` : null;
const serveUrl = await bundle({ entryPoint: resolve(opt("--entry", "src/index.ts")) });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser, browserExecutable });
for (const p of panels) {
  p.file = join(dirname(out), `board_${p.label}.png`);
  p.frame = Math.min(composition.durationInFrames - 1, Math.round(p.t * composition.fps));
  await renderStill({ serveUrl, composition, frame: p.frame, output: p.file, puppeteerInstance: browser, browserExecutable });
}
await browser.close({ silent: true });

// tile with numbers + times (Pillow), 5 panels per row
const spec = join(dirname(out), "board.json");
writeFileSync(spec, JSON.stringify({ out, panels: panels.map((p) => ({ file: p.file, label: p.label, t: p.t.toFixed(1) })) }));
const tiler = join(dirname(fileURLToPath(import.meta.url)), "tile.py");
const r = spawnSync("python3", ["-I", tiler, spec], { stdio: "inherit" });
process.exit(r.status ?? 1);
