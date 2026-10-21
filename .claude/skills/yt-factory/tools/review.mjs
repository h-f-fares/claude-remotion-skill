#!/usr/bin/env node
// review.mjs - measured checks on a finished Remotion video, so "done" is a number, not a feeling.
//
//   cd videos/<slug> && node ../../.claude/skills/yt-factory/tools/review.mjs <CompositionId> [video.mp4]
//        [--entry src/index.ts] [--every 1] [--dead 3] [--json]
//
// TEXT   (needs src/TextCheck.tsx mounted in the composition) one still every --every seconds:
//        CUT (text past the frame edge), UNSAFE (outside the phone-safe area), SMALL (<40px), OVERLAP
// DEAD   stretches longer than --dead seconds where nothing on screen changes much
// SOUND  integrated loudness (target -14 LUFS +/-1) and true peak (<= -1 dBTP)
//
// Exit code 1 when anything FAILs. Run it from the video's project folder: Remotion is loaded from there.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const flagged = new Set(["--entry", "--every", "--dead"]);
const pos = args.filter((a, i) => !a.startsWith("--") && !flagged.has(args[i - 1]));
const [comp, video] = pos;
if (!comp) { console.log("usage: review.mjs <CompositionId> [video.mp4] [--entry src/index.ts] [--every 1] [--dead 3] [--json]"); process.exit(2); }
const entry = resolve(opt("--entry", "src/index.ts"));
const every = parseFloat(opt("--every", "1"));
const deadMax = parseFloat(opt("--dead", "3"));
const report = { text: [], dead: [], sound: {}, fails: 0, warns: 0 };
const fail = (m) => { report.fails++; console.log(`  FAIL  ${m}`); };
const warn = (m) => { report.warns++; console.log(`  warn  ${m}`); };

// ---------- TEXT ----------
const req = createRequire(join(process.cwd(), "package.json"));
const { bundle } = req("@remotion/bundler");
const { openBrowser, renderStill, selectComposition } = req("@remotion/renderer");
const shells = existsSync("/opt/pw-browsers") ? readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")) : [];
const browserExecutable = shells.length ? `/opt/pw-browsers/${shells[0]}/chrome-linux/headless_shell` : null;

console.log(`\nTEXT  (one still every ${every}s)`);
const serveUrl = await bundle({ entryPoint: entry });
const browser = await openBrowser("chrome", { browserExecutable });
const inputProps = { textcheck: true };
const composition = await selectComposition({ serveUrl, id: comp, inputProps, puppeteerInstance: browser, browserExecutable });
const out = mkdtempSync(join(tmpdir(), "review-"));
let seen = 0;
const byKey = new Map();
for (let f = 0; f < composition.durationInFrames; f += Math.max(1, Math.round(every * composition.fps))) {
  await renderStill({
    serveUrl, composition, frame: f, inputProps, output: join(out, `f${f}.png`), puppeteerInstance: browser, browserExecutable,
    onBrowserLog: (log) => {
      const m = /TEXTCHECK (\{.*\})/.exec(log.text);
      if (!m) return;
      seen++;
      const r = JSON.parse(m[1]);
      for (const i of r.issues) {
        // one finding per problem: the same text across consecutive frames, or, for position
        // problems, the same screen row anywhere in the video. Captions that all sit too low become one line, not fifty.
        const row = /box (-?\d+),(-?\d+)-(-?\d+),(-?\d+)/.exec(i.detail);
        const key = row && i.kind !== "SMALL" ? `${i.kind}|y${Math.round(+row[2] / 60)}-${Math.round(+row[4] / 60)}` : `${i.kind}|${i.text}`;
        const t = +(r.frame / composition.fps).toFixed(1);
        const prev = byKey.get(key);
        if (prev && (row || t - prev.to <= every + 0.01)) { prev.to = t; prev.n++; if (prev.samples.length < 3 && !prev.samples.includes(i.text)) prev.samples.push(i.text); }
        else { const e = { ...i, from: t, to: t, n: 1, samples: [i.text] }; byKey.set(key, e); report.text.push(e); }
      }
    },
  });
}
await browser.close({ silent: true });
if (!seen) fail("no TEXTCHECK output: copy tools/TextCheck.tsx into src/ and render <TextCheck /> in the composition");
for (const e of report.text) {
  const what = e.n > 1 ? `${e.n} texts, e.g. "${e.samples.join('", "')}"` : `"${e.text}"`;
  const msg = `${e.kind.padEnd(7)} ${e.from}s-${e.to}s  ${what}  ${e.detail}`;
  e.kind === "SMALL" ? warn(msg) : fail(msg);
}
if (seen && !report.text.length) console.log("  ok    no text problems");

// ---------- DEAD + SOUND (need the rendered file) ----------
if (video && existsSync(video)) {
  console.log(`\nDEAD  (nothing new for more than ${deadMax}s)`);
  const FPS = 6, w = 96, h = 170;
  const raw = spawnSync("ffmpeg", ["-v", "error", "-i", video, "-vf", `fps=${FPS},scale=${w}:${h},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 }).stdout;
  const n = Math.floor(raw.length / (w * h));
  // an "event" is a frame that differs clearly from the one before (an entrance, a cut, a word slam);
  // idle breathing and grain stay under the threshold
  const EVENT = 1.2;
  let lastEvent = 0;
  for (let i = 1; i < n; i++) {
    let d = 0;
    for (let p = 0; p < w * h; p++) d += Math.abs(raw[i * w * h + p] - raw[(i - 1) * w * h + p]);
    d /= w * h;
    if (d > EVENT || i === n - 1) {
      const gap = (i - lastEvent) / FPS;
      if (gap > deadMax) { report.dead.push({ from: +(lastEvent / FPS).toFixed(1), to: +(i / FPS).toFixed(1) }); warn(`dead stretch ${(lastEvent / FPS).toFixed(1)}s-${(i / FPS).toFixed(1)}s (${gap.toFixed(1)}s)`); }
      lastEvent = i;
    }
  }
  if (!report.dead.length) console.log("  ok    something new at least every " + deadMax + "s");

  console.log("\nSOUND");
  const e = spawnSync("ffmpeg", ["-nostats", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const I = parseFloat(/I:\s+(-?[\d.]+) LUFS/.exec(e.slice(e.lastIndexOf("Summary")))?.[1]);
  const TP = parseFloat(/Peak:\s+(-?[\d.]+) dBFS/.exec(e.slice(e.lastIndexOf("Summary")))?.[1]);
  report.sound = { lufs: I, truePeak: TP };
  Math.abs(I + 14) <= 1 ? console.log(`  ok    ${I} LUFS`) : fail(`${I} LUFS (target -14 +/-1): loudnorm=I=-14:TP=-2, two passes`);
  TP <= -1 ? console.log(`  ok    true peak ${TP} dBTP`) : fail(`true peak ${TP} dBTP (max -1)`);
} else if (video) fail(`video not found: ${video}`);

console.log(`\n${report.fails ? "FAIL" : "PASS"}: ${report.fails} fail, ${report.warns} warn\n`);
if (args.includes("--json")) console.log(JSON.stringify(report, null, 1));
process.exit(report.fails ? 1 : 0);
