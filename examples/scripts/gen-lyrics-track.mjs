// Synthesizes the bed for the Arabic lyric video (SolitudeLyrics): slow D-minor
// pad (Dm -> Bb -> Gm -> A, one chord per two lines), soft piano plucks on each
// line, low-passed rain, a reverse swell into every line, booms on the
// "rejected" line and the final line. Timing mirrors src/lyrics/timing.ts.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const INTRO = 1.2;
const LINE = 4.2;
const LINES = 8;
const OUTRO = 3.0;
const DUR = INTRO + LINE * LINES + OUTRO;

const SR = 44100;
const N = Math.floor(SR * DUR);
const out = new Float32Array(N);
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx");
mkdirSync(OUT, { recursive: true });

const add = (start, dur, fn) => {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n && s0 + i < N; i++) out[s0 + i] += fn(i / SR, i / n);
};
let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647 - 0.5;
};
const lineAt = (i) => INTRO + i * LINE;

// pad: detuned sines, slow crossfade between chords
const chords = [
  [73.42, 146.83, 174.61, 220.0], // Dm
  [58.27, 116.54, 146.83, 174.61], // Bb
  [49.0, 98.0, 116.54, 146.83], // Gm
  [55.0, 110.0, 138.59, 164.81], // A
];
for (let c = 0; c < 4; c++) {
  const start = c === 0 ? 0 : lineAt(c * 2) - 0.8;
  const end = c === 3 ? DUR : lineAt(c * 2 + 2) + 0.8;
  const len = end - start;
  add(start, len, (ts) => {
    const env = Math.min(1, ts / 1.6) * Math.min(1, (len - ts) / 1.6);
    let s = 0;
    for (const f of chords[c])
      s += Math.sin(2 * Math.PI * f * ts) + Math.sin(2 * Math.PI * f * 1.004 * ts) * 0.6;
    return s * 0.03 * env;
  });
}

// piano-ish pluck: a few harmonics, exponential decay
const pluck = (t, f, amp = 0.22) =>
  add(t, 2.6, (ts) => {
    const env = Math.min(1, ts * 200) * Math.exp(-ts * 2.2);
    return (
      (Math.sin(2 * Math.PI * f * ts) +
        Math.sin(2 * Math.PI * f * 2 * ts) * 0.35 +
        Math.sin(2 * Math.PI * f * 3 * ts) * 0.12) *
      env *
      amp
    );
  });
// one short motif per line (D minor), descending toward the end
const motifs = [
  [293.66, 349.23, 440.0],
  [293.66, 349.23, 392.0],
  [233.08, 293.66, 349.23],
  [233.08, 261.63, 293.66],
  [196.0, 233.08, 293.66],
  [196.0, 233.08, 261.63],
  [220.0, 277.18, 329.63],
  [220.0, 293.66],
];
motifs.forEach((m, i) => m.forEach((f, k) => pluck(lineAt(i) + k * 0.55, f)));
pluck(DUR - OUTRO + 0.3, 146.83, 0.18);

// rain: one-pole low-passed noise, swells on the crying line (index 4)
let lp = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  lp += 0.08 * (rnd() * 2 - lp);
  const fade = Math.min(1, t / 2) * Math.min(1, (DUR - t) / 2);
  const cry = t > lineAt(4) && t < lineAt(6) ? 1.8 : 1;
  out[i] += lp * 0.22 * fade * cry;
}

// reverse swell into every line
for (let i = 0; i < LINES; i++)
  add(lineAt(i) - 0.45, 0.45, (ts, p) => rnd() * 2 * p * p * 0.12);

// low booms
const boom = (t, amp) =>
  add(t, 1.6, (ts, p) => {
    const f = 55 - 20 * Math.min(1, ts * 2);
    return Math.sin(2 * Math.PI * f * ts) * Math.exp(-p * 4) * amp;
  });
boom(lineAt(3), 0.7);
boom(lineAt(7), 0.8);

let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
const g = 0.9 / peak;
const buf = Buffer.alloc(44 + N * 2);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 2, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++)
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * g)) * 32767), 44 + i * 2);
writeFileSync(join(OUT, "lyrics-bed.wav"), buf);
console.log("lyrics-bed.wav written,", DUR.toFixed(1) + "s");
