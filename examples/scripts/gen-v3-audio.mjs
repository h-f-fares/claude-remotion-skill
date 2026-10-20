// Synthesizes the original music bed + SFX kit for the v3-portfolio YouTube video.
// Music: warm lo-fi groove at 90 BPM (Fmaj7 → G6 → Em7 → Am7), section changes driven by the
// voiceover timing: full groove for the hook, sparse pad under the mid-video reset, a dark drone
// for "I didn't read the code", groove back for the bill, warm outro. No external assets.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
// usage: node gen-v3-audio.mjs [audio-dir]  (defaults to audio; the 5-minute cut uses audio-v2)
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "videos", "v3-portfolio", process.argv[2] ?? "audio");
mkdirSync(OUT, { recursive: true });
const timing = JSON.parse(readFileSync(join(OUT, "timing.json"), "utf8"));

function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
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
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}

const secs = (s) => Math.round(s * SR);
const TAU = Math.PI * 2;
let seed = 4242;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;
function normalize(buf, peakTo) {
  let peak = 0;
  for (const s of buf) peak = Math.max(peak, Math.abs(s));
  for (let i = 0; i < buf.length; i++) buf[i] = (buf[i] / (peak || 1)) * peakTo;
  return buf;
}
const save = (name, buf, peak = 0.9) => writeFileSync(join(OUT, name), wav(normalize(buf, peak)));
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------------------------------------------------------------- sections from the VO timing
const seg = (b) => timing.segments[b - 1];
const at = (b) => seg(b).start;
const last = seg(timing.segments.length);
const DUR = Math.ceil(last.start + last.dur + 4);
// section boundaries as beat numbers: [groove-end/lite-start, pad, groove, drone, lite, groove, lite]
// (full cut vs the 5-minute cut in audio-v2)
const B = (process.argv[2] ?? "audio") === "audio-v2" ? [4, 18, 19, 21, 25, 26, 29] : [5, 21, 22, 30, 35, 36, 41];
// [from, to, mode]: groove | lite (keys + soft hats) | pad | drone
const SECTIONS = [
  [0, at(B[0]), "groove"],
  [at(B[0]), at(B[1]), "lite"],
  [at(B[1]), at(B[2]), "pad"],
  [at(B[2]), at(B[3]), "groove"],
  [at(B[3]), at(B[4]), "drone"],
  [at(B[4]), at(B[5]), "lite"],
  [at(B[5]), at(B[6]), "groove"],
  [at(B[6]), DUR, "lite"],
];
const modeAt = (t) => (SECTIONS.find(([a, b]) => t >= a && t < b) ?? SECTIONS[SECTIONS.length - 1])[2];

// ---------------------------------------------------------------- instruments
const music = new Float32Array(secs(DUR));
const add = (t, i, v) => {
  const k = secs(t) + i;
  if (k >= 0 && k < music.length) music[k] += v;
};
const kick = (t, g = 1) => {
  const N = secs(0.32);
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    ph += (TAU * (45 + 85 * Math.exp(-x * 30))) / SR;
    add(t, i, Math.sin(ph) * Math.exp(-x * 9) * 0.9 * g);
  }
};
const snare = (t, g = 1) => {
  const N = secs(0.2);
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const n = noise();
    const hp = n - prev;
    prev = n;
    add(t, i, (hp * 0.35 + Math.sin((TAU * 190 * i) / SR) * 0.15) * Math.exp((-i / SR) * 22) * g);
  }
};
const hat = (t, g = 1) => {
  const N = secs(0.04);
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const n = noise();
    add(t, i, (n - prev) * 0.12 * Math.exp((-i / SR) * 90) * g);
    prev = n;
  }
};
// soft electric-piano voice: fundamental + bell partial, slow tremolo
const keys = (t, m, len, g = 1) => {
  const f = midi(m);
  const N = secs(len);
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    const env = Math.min(1, x / 0.015) * Math.exp(-x * 1.6);
    const trem = 1 + 0.15 * Math.sin(TAU * 4.5 * x);
    add(t, i, (Math.sin(TAU * f * x) + 0.25 * Math.sin(TAU * f * 2 * x) * Math.exp(-x * 6) + 0.08 * Math.sin(TAU * f * 3.01 * x)) * env * trem * 0.07 * g);
  }
};
const bass = (t, m, len, g = 1) => {
  const f = midi(m);
  const N = secs(len);
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    const env = Math.min(1, x / 0.01) * Math.exp(-x * 2.2);
    add(t, i, (Math.sin(TAU * f * x) + 0.2 * Math.sin(TAU * f * 2 * x)) * env * 0.28 * g);
  }
};
const pad = (t, ms, len, g = 1) => {
  const N = secs(len);
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    const env = Math.min(1, x / 0.8) * Math.min(1, (len - x) / 0.8);
    let v = 0;
    for (const m of ms) v += Math.sin(TAU * midi(m) * x) + 0.5 * Math.sin(TAU * midi(m) * 1.003 * x);
    add(t, i, v * env * 0.03 * g);
  }
};

const BPM = 90;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
// Fmaj7, G6, Em7, Am7 — roots + voicings
const PROG = [
  { r: 41, v: [57, 60, 64, 65] },
  { r: 43, v: [59, 62, 64, 67] },
  { r: 40, v: [55, 59, 62, 64] },
  { r: 45, v: [55, 60, 64, 67] },
];

for (let bar = 0; bar * BAR < DUR; bar++) {
  const t0 = bar * BAR;
  const mode = modeAt(t0);
  const ch = PROG[bar % 4];
  if (mode === "drone") {
    if (bar % 2 === 0) pad(t0, [40, 47, 52], BAR * 2 + 0.6, 1.3);
    kick(t0, 0.35);
    continue;
  }
  if (mode === "pad") {
    pad(t0, ch.v.map((m) => m - 12), BAR + 0.6, 1);
    continue;
  }
  // keys on 1 and the "and" of 2, swung
  ch.v.forEach((m, k) => keys(t0 + k * 0.012, m, BEAT * 2.2, mode === "groove" ? 1 : 0.85));
  ch.v.forEach((m, k) => keys(t0 + BEAT * 2.5 + k * 0.012, m, BEAT * 1.4, 0.6));
  bass(t0, ch.r, BEAT * 1.8, mode === "groove" ? 1 : 0.6);
  bass(t0 + BEAT * 2.5, ch.r + 7, BEAT, mode === "groove" ? 0.8 : 0.4);
  for (let k = 0; k < 8; k++) hat(t0 + k * (BEAT / 2) + (k % 2 ? 0.04 : 0), mode === "groove" ? 1 : 0.5);
  if (mode === "groove") {
    kick(t0);
    kick(t0 + BEAT * 1.75, 0.6);
    kick(t0 + BEAT * 2.5, 0.8);
    snare(t0 + BEAT);
    snare(t0 + BEAT * 3);
  }
}
// button chord at the very end
pad(DUR - 3.5, [53, 57, 60, 64], 3.4, 1.4);
save("music.wav", music, 0.8);

// ---------------------------------------------------------------- SFX kit
const make = (len, fn) => {
  const N = secs(len);
  const b = new Float32Array(N);
  fn(b, N);
  return b;
};
save("whoosh.wav", make(0.5, (b, N) => {
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const x = i / N;
    const cut = 0.04 + 0.5 * Math.sin(Math.PI * x);
    lp += cut * (noise() - lp);
    b[i] = lp * Math.sin(Math.PI * x) ** 2;
  }
}));
save("pop.wav", make(0.12, (b, N) => {
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    ph += (TAU * (900 - 500 * (i / N))) / SR;
    b[i] = Math.sin(ph) * Math.exp(-x * 40);
  }
}), 0.6);
save("click.wav", make(0.05, (b, N) => {
  for (let i = 0; i < N; i++) b[i] = noise() * Math.exp((-i / SR) * 160) + Math.sin((TAU * 2400 * i) / SR) * Math.exp((-i / SR) * 120) * 0.5;
}), 0.6);
save("boom.wav", make(1.4, (b, N) => {
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    ph += (TAU * (38 + 90 * Math.exp(-x * 14))) / SR;
    lp += 0.05 * (noise() - lp);
    b[i] = Math.sin(ph) * Math.exp(-x * 3.2) + lp * Math.exp(-x * 6) * 0.8;
  }
}));
save("riser.wav", make(1.2, (b, N) => {
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const x = i / N;
    lp += (0.02 + x * 0.4) * (noise() - lp);
    b[i] = (lp + Math.sin(TAU * (200 + 900 * x * x) * (i / SR)) * 0.2) * x * x;
  }
}));
save("ding.wav", make(1.3, (b, N) => {
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    b[i] = (Math.sin(TAU * 1568 * x) + 0.6 * Math.sin(TAU * 2093 * x) + 0.3 * Math.sin(TAU * 3136 * x)) * Math.exp(-x * 4);
  }
}), 0.6);
save("tick.wav", make(0.04, (b, N) => {
  for (let i = 0; i < N; i++) b[i] = Math.sin((TAU * 3200 * i) / SR) * Math.exp((-i / SR) * 200);
}), 0.4);
save("scratch.wav", make(0.45, (b, N) => {
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const x = i / N;
    lp += (0.1 + 0.3 * Math.abs(Math.sin(x * 9))) * (noise() - lp);
    b[i] = lp * Math.sin(Math.PI * x);
  }
}));
console.log("music", DUR, "s + 8 sfx ->", OUT);
