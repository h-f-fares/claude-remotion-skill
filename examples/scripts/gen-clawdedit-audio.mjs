// Synthesizes ClawdEdit's whole soundtrack: no samples. Every cue is read from the SAME
// timeline.ts the picture uses, so each click lands on its frame.
//   node scripts/gen-clawdedit-audio.mjs   (Node ≥22.18 reads the .ts timeline directly)
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BEAT_S, EV, SFX, TOTAL_S } from "../src/clawdedit/timeline.ts";

const SR = 44100;
const N = Math.round(TOTAL_S * SR);
const mix = new Float32Array(N);
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "clawdedit");
mkdirSync(OUT, { recursive: true });

// seeded noise: the same file every run
let seed = 7;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (t, len, gain, fn) => {
  const i0 = Math.round(t * SR);
  const n = Math.round(len * SR);
  for (let i = 0; i < n && i0 + i < N; i++) if (i0 + i >= 0) mix[i0 + i] += fn(i / SR, i / n) * gain;
};
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const sine = (f, t) => Math.sin(2 * Math.PI * f * t);

// ---- instruments ----
const kick = (t, g = 0.9) => add(t, 0.35, g, (s, u) => sine(50 + 90 * Math.exp(-s * 30), s) * Math.exp(-u * 6));
const snare = (t) => add(t, 0.2, 0.35, (s, u) => (noise() * 0.8 + sine(190, s) * 0.4) * Math.exp(-u * 8));
const hat = (t, g = 0.12) => {
  let hp = 0, prev = 0;
  add(t, 0.05, g, (s, u) => { const x = noise(); hp = 0.6 * (hp + x - prev); prev = x; return hp * Math.exp(-u * 6); });
};
const bass = (t, m, len) => add(t, len, 0.32, (s, u) => Math.tanh(2.2 * sine(hz(m), s)) * Math.min(1, s * 60) * Math.exp(-u * 1.5));
const pad = (t, notes, len, g = 0.07) =>
  add(t, len, g, (s, u) => notes.reduce((a, m) => a + sine(hz(m) * 1.003, s) + sine(hz(m) * 0.997, s), 0) * Math.sin(Math.PI * u));
const key = (t, m) => add(t, 0.25, 0.1, (s, u) => sine(hz(m) + 3 * sine(hz(m) * 2, s) * 40, s) * Math.exp(-u * 5));

// ---- music: soft before the pop, the beat drops on it ----
const beats = Math.round(TOTAL_S / BEAT_S);
for (let b = 0; b < beats; b++) {
  const t = b * BEAT_S;
  hat(t + BEAT_S / 2, t < EV.pop ? 0.06 : 0.12);
  if (t < EV.pop || t >= EV.play + 1.5) continue;
  kick(t);
  if (b % 2) snare(t);
  hat(t);
  if (b % 2 === 0) key(t + BEAT_S / 2, [72, 74, 76, 79][(b / 2) % 4]);
}
pad(0, [53, 60, 65], EV.pop + 0.2, 0.05); // F pad under the intro
const prog = [41, 43, 45, 48]; // F G Am C, one per bar (2 s)
for (let bar = 0; bar * 2 + EV.pop < EV.play; bar++) {
  const t = EV.pop + bar * 2;
  for (let q = 0; q < 4; q++) bass(t + q * BEAT_S, prog[bar % 4], BEAT_S * 0.9);
}
// sidechain-ish pump: duck the bed right after each kick
// (applied below, before SFX are added, so effects stay on top)
for (let i = 0; i < N; i++) {
  const t = i / SR;
  if (t < EV.pop || t > EV.play + 1.5) continue;
  const since = (t - EV.pop) % BEAT_S;
  mix[i] *= 0.55 + 0.45 * Math.min(1, since / 0.18);
}

// ---- effects, one per timeline cue ----
const FX = {
  knock: (t) => add(t, 0.12, 0.6, (s, u) => (sine(1400, s) * 0.5 + sine(2300, s) * 0.3 + noise() * 0.2) * Math.exp(-u * 12)),
  riser: (t) => add(t, 0.4, 0.25, (s, u) => noise() * u * u),
  pop: (t) => {
    add(t, 0.15, 0.7, (s, u) => sine(700 - 400 * u, s) * Math.exp(-u * 8));
    add(t, 0.5, 0.25, (s, u) => noise() * Math.exp(-u * 7) * (0.5 + 0.5 * sine(5200, s))); // breaking glass
    kick(t, 1.0); // sub boom
  },
  boing: (t) => add(t, 0.2, 0.3, (s, u) => sine(300 + 500 * u + 40 * sine(18, s), s) * Math.exp(-u * 4)),
  whoosh: (t) => { let lp = 0; add(t, 0.4, 0.45, (s, u) => { lp += (0.05 + 0.25 * Math.sin(Math.PI * u)) * (noise() - lp); return lp * Math.sin(Math.PI * u ** 0.7) ** 2; }); },
  land: (t) => add(t, 0.12, 0.45, (s, u) => sine(120 - 50 * u, s) * Math.exp(-u * 10)),
  click: (t) => add(t, 0.04, 0.5, (s, u) => (noise() * 0.6 + sine(3000, s) * 0.4) * Math.exp(-u * 14)),
  tap: (t) => add(t, 0.025, 0.18, (s, u) => noise() * Math.exp(-u * 16)),
  bloop: (t) => add(t, 0.2, 0.35, (s, u) => sine(400 + 600 * u * u, s) * Math.exp(-u * 4)),
  scribble: (t) => add(t, 0.4, 0.12, (s, u) => noise() * (0.5 + 0.5 * sine(23, s)) * Math.sin(Math.PI * u)),
  blip: (t) => add(t, 0.08, 0.3, (s, u) => sine(1800, s) * Math.exp(-u * 6)),
  thwack: (t) => add(t, 0.15, 0.6, (s, u) => (noise() * 0.7 + sine(180, s) * 0.5) * Math.exp(-u * 10)),
  shimmer: (t) => [84, 88, 91, 96].forEach((m, i) => add(t + i * 0.06, 0.6, 0.1, (s, u) => sine(hz(m), s) * Math.exp(-u * 4))),
  ding0: (t) => add(t, 0.5, 0.28, (s, u) => (sine(hz(84), s) + 0.4 * sine(hz(84) * 2.76, s)) * Math.exp(-u * 5)),
  ding1: (t) => add(t, 0.5, 0.28, (s, u) => (sine(hz(88), s) + 0.4 * sine(hz(88) * 2.76, s)) * Math.exp(-u * 5)),
  ding2: (t) => add(t, 0.5, 0.28, (s, u) => (sine(hz(91), s) + 0.4 * sine(hz(91) * 2.76, s)) * Math.exp(-u * 5)),
  brass: (t) => add(t, TOTAL_S - t, 0.16, (s, u) =>
    [60, 64, 67, 72].reduce((a, m) => a + Math.tanh(3 * sine(hz(m), s)), 0) * Math.min(1, s * 30) * Math.exp(-u * 2.2)),
  powerdown: (t) => add(t, 0.3, 0.22, (s, u) => sine(600 * (1 - u * 0.85), s) * (1 - u)),
  yay: (t) => [0, 0.12].forEach((d, i) => add(t + d, 0.15, 0.2, (s, u) => sine(1200 + i * 300 + 600 * u, s) * Math.sin(Math.PI * u))),
};
for (const c of SFX) FX[c.kind]?.(c.t);

// ---- master: gentle roll-off (tames inter-sample overshoot), soft clip, -1.5 dBFS ceiling, fade ----
let lp = 0;
for (let i = 0; i < N; i++) {
  lp += 0.55 * (mix[i] - lp); // ~ 10 kHz one-pole low-pass
  mix[i] = Math.tanh(lp * 1.2);
  const tail = TOTAL_S - i / SR;
  if (tail < 0.5) mix[i] *= tail / 0.5;
}
const peak = mix.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const g = 10 ** (-1.5 / 20) / peak;

const buf = Buffer.alloc(44 + N * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i] * g)) * 32767), 44 + i * 2);
writeFileSync(join(OUT, "sound.wav"), buf);
console.log(`wrote public/clawdedit/sound.wav  ${TOTAL_S}s, ${SFX.length} cues`);
