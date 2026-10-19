// Synthesizes the original music bed + SFX kit for the squirrel-burger Short.
// Music: quirky swing diner jazz at 120 BPM (one bar = 2s), drops to a dark
// drone for the hospital/headline beat, sparse for the lesson, swings back
// for the punchline and ends on a button chord. No external assets.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "videos", "squirrel-burger", "audio");
mkdirSync(OUT, { recursive: true });

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

// deterministic noise
let seed = 1337;
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

// ---------------------------------------------------------------- music
const DUR = 36;
const music = new Float32Array(secs(DUR));
let tgt = music; // buffer the instruments write into
const add = (t, i, v) => {
  const k = secs(t) + i;
  if (k >= 0 && k < tgt.length) tgt[k] += v;
};
const BEAT = 0.5;
const swing = (eighth) => Math.floor(eighth / 2) * BEAT + (eighth % 2 ? BEAT * 0.66 : 0);
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

function bass(t, midi, len = 0.45, amp = 0.5) {
  const f = hz(midi);
  for (let i = 0; i < secs(len); i++) {
    const x = i / SR;
    const env = Math.min(1, x * 200) * Math.exp(-x * 4.5);
    add(t, i, amp * env * (Math.sin(TAU * f * x) + 0.35 * Math.sin(TAU * 2 * f * x) + 0.1 * Math.sin(TAU * 3 * f * x)));
  }
}
function keys(t, notes, len = 0.5, amp = 0.12) {
  for (const n of notes) {
    const f = hz(n);
    for (let i = 0; i < secs(len); i++) {
      const x = i / SR;
      const env = Math.min(1, x * 300) * Math.exp(-x * 5);
      // rhodes-ish: fundamental + bell partial with slight tremolo
      add(t, i, amp * env * (Math.sin(TAU * f * x) + 0.25 * Math.sin(TAU * 4 * f * x) * Math.exp(-x * 12)) * (1 + 0.1 * Math.sin(TAU * 5 * x)));
    }
  }
}
function ride(t, amp = 0.05) {
  let hp = 0, prev = 0;
  for (let i = 0; i < secs(0.35); i++) {
    const x = i / SR;
    const n = noise();
    hp = 0.95 * (hp + n - prev);
    prev = n;
    add(t, i, amp * hp * Math.exp(-x * 14) * (1 + 0.4 * Math.sin(TAU * 5200 * x)));
  }
}
function brush(t, amp = 0.06) {
  let lp = 0;
  for (let i = 0; i < secs(0.22); i++) {
    const x = i / SR;
    lp += 0.35 * (noise() - lp);
    add(t, i, amp * lp * Math.min(1, x * 80) * Math.exp(-x * 16));
  }
}
function drone(t0, t1, midis, amp = 0.08) {
  for (let i = 0; i < secs(t1 - t0); i++) {
    const x = i / SR;
    const env = Math.min(1, x / 0.6, (t1 - t0 - x) / 0.8);
    let s = 0;
    for (const m of midis) s += Math.sin(TAU * hz(m) * x) + 0.4 * Math.sin(TAU * hz(m) * 1.003 * x);
    add(t0, i, amp * env * s * (1 + 0.25 * Math.sin(TAU * 0.5 * x)));
  }
}

// ii-V-I-VI in F: Gm7 C7 Fmaj7 D7 (one bar each)
const PROG = [
  { root: 43, walk: [43, 46, 50, 49], comp: [65, 70, 74] },
  { root: 48, walk: [48, 52, 55, 54], comp: [64, 70, 72] },
  { root: 41, walk: [41, 45, 48, 50], comp: [64, 69, 72] },
  { root: 50, walk: [50, 54, 57, 56], comp: [66, 72, 74] },
];
function swingSection(t0, t1, ampScale = 1) {
  for (let bar = 0; t0 + bar * 2 < t1 - 0.01; bar++) {
    const c = PROG[bar % 4];
    const bt = t0 + bar * 2;
    for (let q = 0; q < 4; q++) if (bt + q * BEAT < t1) bass(bt + q * BEAT, c.walk[q], 0.45, 0.45 * ampScale);
    for (const e of [0, 2, 3, 4, 6, 7]) if (bt + swing(e) < t1) ride(bt + swing(e), 0.045 * ampScale);
    for (const q of [1, 3]) if (bt + q * BEAT < t1) brush(bt + q * BEAT, 0.05 * ampScale);
    // Charleston comp: beat 1 and the "and" of 2
    keys(bt, c.comp, 0.4, 0.1 * ampScale);
    if (bt + swing(3) < t1) keys(bt + swing(3), c.comp, 0.35, 0.08 * ampScale);
  }
}

// 0–17.1: swing (scenes 1–5), duck to half for the "beef runs out" beat
swingSection(0, 7.4);
swingSection(7.4, 9.1, 0.4);
swingSection(9.1, 17.1);
// 17.1–22.8: dark drone (hospital, headline)
drone(17.1, 22.9, [38, 45, 53], 0.07);
for (const t of [17.15, 19.0]) bass(t, 26, 1.6, 0.6);
// 22.8–28.4: lesson — sparse low keys
for (const [t, n] of [[22.8, [53, 57, 60]], [24.8, [55, 58, 62]], [26.8, [52, 55, 60]]]) keys(t, n, 1.8, 0.09);
drone(22.8, 28.5, [41], 0.05);
// 28.4–34: swing returns for the payoff
swingSection(28.4, 34);
// button chord
bass(34, 41, 1.6, 0.6);
keys(34, [60, 64, 69, 74], 1.8, 0.12);

save("music.wav", music, 0.8);

// ---------------------------------------------------------------- music v2 (2-minute cut)
// Sections follow the v2 voiceover beats (timing2.json scene starts).
function kick(t, amp = 0.5) {
  for (let i = 0; i < secs(0.3); i++) {
    const x = i / SR;
    add(t, i, amp * Math.sin(TAU * (110 * Math.exp(-x * 22) + 45) * x) * Math.exp(-x * 9));
  }
}
function tickHat(t, amp = 0.03) {
  for (let i = 0; i < secs(0.04); i++) add(t, i, amp * noise() * Math.exp(-(i / SR) * 90));
}
// beat start times (s) from the v2 voiceover; T[n] = start of beat n
// LANG=ar builds the Arabic cut's bed from timing-ar.json
const LANG = process.env.LANG_CUT === "ar" ? "ar" : "en";
const timing2 = JSON.parse(readFileSync(join(OUT, LANG === "ar" ? "timing-ar.json" : "timing2.json"), "utf8"));
const T = [0, ...timing2.segments.map((g) => g.start)];
const last = timing2.segments.at(-1);
const END = last.start + last.dur;
const DUR2 = Math.ceil(END + 2.5);
const music2 = new Float32Array(secs(DUR2));
tgt = music2;
// hook + night + last customer: swing from the first frame
swingSection(0, T[4]);
// the beef is gone: music cuts out, one low hit
bass(T[4] + 0.05, 29, 1.4, 0.7);
// the rule + the squirrel: suspense pulse, ticking clock
drone(T[5], T[7] + 0.1, [40, 47], 0.06);
for (let t = T[5]; t < T[7]; t += 0.5) tickHat(t, 0.05);
for (let t = T[5]; t < T[7]; t += 1) kick(t, 0.35);
// the act: swing at full tilt with a kick under it
swingSection(T[7], T[8], 1.1);
for (let t = T[7]; t < T[8]; t += 0.5) kick(t, 0.3);
// hospital + fallout: dark drone
drone(T[8], T[10] + 0.1, [38, 45, 53], 0.07);
for (let t = T[8] + 0.05; t < T[10] - 1; t += 2) bass(t, 26, 1.6, 0.6);
// the legend: sparse, curious keys
for (let t = T[10], i = 0; t < T[11] - 0.2; t += 2, i++) keys(t, [[57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 55, 59]][i % 4], 1.8, 0.08);
drone(T[10], T[11] + 0.1, [45], 0.04);
// tie-in + stakes: building pulse, kick density rises
const span = T[13] - T[11];
for (let t = T[11], i = 0; t < T[13] - 0.1; t += 0.5, i++) {
  const k = (t - T[11]) / span;
  bass(t, [33, 33, 36, 38][Math.floor(i / 8) % 4], 0.4, 0.4 + 0.2 * k);
  if (i % 2 === 0 || k > 0.5) kick(t, 0.3 + 0.2 * k);
  tickHat(t + 0.25, 0.04);
}
// takeaways + close: bright swing, then a button chord
swingSection(T[13], END, 1.05);
bass(END, 41, 1.6, 0.6);
keys(END, [60, 64, 69, 74], 1.8, 0.12);
save(LANG === "ar" ? "music-ar.wav" : "music2.wav", music2, 0.8);
tgt = music;

// ---------------------------------------------------------------- sfx
function make(len, fn) {
  const N = secs(len);
  const b = new Float32Array(N);
  fn(b, N);
  return b;
}

save("whoosh.wav", make(0.45, (b, N) => {
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const p = i / N;
    lp += (0.04 + 0.25 * Math.sin(Math.PI * p)) * (noise() - lp);
    b[i] = lp * Math.sin(Math.PI * p) ** 2;
  }
}));

save("pop.wav", make(0.14, (b, N) => {
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    ph += TAU * (900 * Math.exp(-x * 30) + 180) / SR;
    b[i] = Math.sin(ph) * Math.exp(-x * 28);
  }
}), 0.7);

save("sizzle.wav", make(1.4, (b, N) => {
  let hp = 0, prev = 0;
  for (let i = 0; i < N; i++) {
    const p = i / N;
    const n = noise();
    hp = 0.9 * (hp + n - prev);
    prev = n;
    const crackle = rnd() < 0.004 ? noise() * 3 : 0;
    b[i] = (hp * 0.5 + crackle) * Math.min(1, p * 10, (1 - p) * 4);
  }
}), 0.6);

save("siren.wav", make(2.0, (b, N) => {
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    const f = Math.floor(x / 0.5) % 2 ? 660 : 880;
    ph += TAU * f / SR;
    b[i] = (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * Math.min(1, x * 8, (2 - x) * 3);
  }
}), 0.45);

save("crack.wav", make(0.6, (b, N) => {
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    lp += 0.6 * (noise() - lp);
    b[i] = lp * Math.exp(-x * 25) + 0.8 * Math.sin(TAU * 60 * x) * Math.exp(-x * 9);
  }
}));

save("ding.wav", make(1.2, (b, N) => {
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    b[i] = (Math.sin(TAU * 1320 * x) + 0.5 * Math.sin(TAU * 1320 * 2.76 * x) * Math.exp(-x * 6)) * Math.exp(-x * 4);
  }
}), 0.6);

save("bite.wav", make(0.35, (b, N) => {
  for (const t0 of [0, 0.06, 0.13]) {
    let lp = 0;
    for (let i = 0; i < secs(0.08); i++) {
      lp += 0.5 * (noise() - lp);
      const k = secs(t0) + i;
      if (k < N) b[k] += lp * Math.exp(-i / SR * 50);
    }
  }
}), 0.7);

save("crickets.wav", make(1.8, (b, N) => {
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    const chirp = (x % 0.6) < 0.18 ? Math.max(0, Math.sin(TAU * 28 * x)) : 0;
    b[i] = Math.sin(TAU * 4400 * x) * chirp * Math.min(1, x * 4, (1.8 - x) * 3);
  }
}), 0.3);

save("thud.wav", make(0.4, (b, N) => {
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    b[i] = Math.sin(TAU * (90 * Math.exp(-x * 6) + 40) * x) * Math.exp(-x * 10);
  }
}));

save("riser.wav", make(1.5, (b, N) => {
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const p = i / N;
    lp += (0.02 + 0.5 * p * p) * (noise() - lp);
    b[i] = lp * p * p + 0.3 * Math.sin(TAU * (200 + 900 * p * p) * (i / SR)) * p;
  }
}), 0.7);

save("scratch.wav", make(0.5, (b, N) => {
  let ph = 0, lp = 0;
  for (let i = 0; i < N; i++) {
    const p = i / N;
    ph += TAU * (300 + 1200 * Math.abs(Math.sin(p * Math.PI * 3))) / SR;
    lp += 0.3 * (noise() - lp);
    b[i] = (Math.sin(ph) * 0.6 + lp * 0.6) * Math.min(1, p * 20, (1 - p) * 6);
  }
}), 0.6);

save("boom.wav", make(1.6, (b, N) => {
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const x = i / SR;
    lp += 0.05 * (noise() - lp);
    b[i] = Math.sin(TAU * (60 * Math.exp(-x * 2) + 30) * x) * Math.exp(-x * 2.5) + lp * 2 * Math.exp(-x * 4);
  }
}));

save("tick.wav", make(0.08, (b, N) => {
  for (let i = 0; i < N; i++) b[i] = Math.sin(TAU * 2400 * (i / SR)) * Math.exp(-(i / SR) * 80);
}), 0.5);

console.log("wrote music + sfx to", OUT);
