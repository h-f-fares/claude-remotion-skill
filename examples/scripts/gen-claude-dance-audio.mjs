// 5s, 120 BPM dance loop synthesized in code: kick, clap, hats, sub bass, stabs,
// riser, whooshes and an outro impact — all aligned to the video's beat grid.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const DUR = 5;
const BEAT = 0.5;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "claudedance");
mkdirSync(OUT, { recursive: true });

const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

const add = (t0, len, fn, gain = 1, pan = 0) => {
  const s0 = Math.round(t0 * SR);
  const n = Math.round(len * SR);
  for (let i = 0; i < n && s0 + i < N; i++) {
    if (s0 + i < 0) continue;
    const v = fn(i / SR, i / n) * gain;
    L[s0 + i] += v * (1 - Math.max(0, pan));
    R[s0 + i] += v * (1 + Math.min(0, pan));
  }
};

const kick = (t0, g = 1) => {
  let ph = 0;
  add(t0, 0.32, (t) => {
    const f = 48 + 110 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    return Math.tanh(Math.sin(ph) * 1.6) * Math.exp(-t * 9);
  }, 0.95 * g);
};
const clap = (t0) => {
  let hp = 0, prev = 0;
  add(t0, 0.22, (t) => {
    const x = rnd();
    hp = 0.7 * (hp + x - prev); prev = x;
    const burst = t < 0.03 ? 1 - ((t * 100) % 1) * 0.6 : 1;
    return hp * burst * Math.exp(-t * 18);
  }, 0.5);
};
const hat = (t0, pan) => {
  let hp = 0, prev = 0;
  add(t0, 0.06, (t) => {
    const x = rnd();
    hp = 0.5 * (hp + x - prev); prev = x;
    return hp * Math.exp(-t * 70);
  }, 0.28, pan);
};
const note = (m) => 440 * Math.pow(2, (m - 69) / 12);
const bass = (t0, m, len) => {
  let ph = 0;
  add(t0, len, (t, u) => {
    ph += (2 * Math.PI * note(m)) / SR;
    return Math.tanh(Math.sin(ph) * 2 + Math.sin(ph * 2) * 0.3) * Math.min(1, t * 200) * (1 - u) ** 0.5;
  }, 0.38);
};
const stab = (t0, ms) => {
  for (const [k, m] of ms.entries()) {
    let ph = 0;
    add(t0, 0.18, (t) => {
      ph += (2 * Math.PI * note(m)) / SR;
      const saw = ((ph / Math.PI) % 2) - 1;
      return saw * Math.exp(-t * 16);
    }, 0.09, k % 2 ? 0.4 : -0.4);
  }
};
const whoosh = (t0, len) => {
  let lp = 0;
  add(t0, len, (t, u) => {
    lp += (0.03 + 0.3 * u) * (rnd() - lp);
    return lp * Math.sin(Math.PI * u ** 1.4) ** 2;
  }, 0.9);
};
const riser = (t0, len) => {
  let ph = 0;
  add(t0, len, (t, u) => {
    ph += (2 * Math.PI * (300 + 1500 * u * u)) / SR;
    return (Math.sin(ph) * 0.4 + rnd() * 0.25 * u) * u * u;
  }, 0.35);
};
const impact = (t0) => {
  kick(t0, 1.2);
  let lp = 0;
  add(t0, 1.0, (t) => {
    lp += 0.08 * (rnd() - lp);
    return lp * Math.exp(-t * 4);
  }, 1.4);
};

// intro (beats 0–1): kick + stabs only, then a whoosh into the drop
kick(0); stab(0, [62, 65, 69]);
kick(0.5); stab(0.5, [62, 65, 69]);
whoosh(0.6, 0.45);

// drop (beats 2–9): full groove
const roots = [38, 38, 41, 43, 38, 38, 41, 36];
for (let b = 2; b < 10; b++) {
  const t = b * BEAT;
  if (b < 8) kick(t);
  if (b % 2 === 1 && b < 8) clap(t);
  hat(t + 0.25, 0.3); hat(t + 0.375, -0.3);
  bass(t, roots[b - 2], 0.22);
  bass(t + 0.25, roots[b - 2] + 12, 0.18);
  if (b === 4 || b === 6) stab(t + 0.25, [62, 65, 69, 72]);
}
// stutter section (beats 6–7): extra half-beat kicks under the fast cuts
kick(3.25, 0.7); kick(3.75, 0.7);
riser(3.0, 1.0);
whoosh(3.6, 0.42);
impact(4.0);
stab(4.0, [50, 57, 62, 65, 69]);

// master: soft clip + normalize
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.1); R[i] = Math.tanh(R[i] * 1.1);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4);
}
writeFileSync(join(OUT, "track.wav"), buf);
console.log("wrote", join(OUT, "track.wav"));
