// 15s original disco-funk cue at 120 BPM (A minor), synthesized in code.
// Arrangement follows the ClawdFeelIt sections: intro → groove → moonwalk → stutter → lean/kicks → finale.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const DUR = 15;
const B = 0.5; // one beat
const S16 = B / 4;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "claudedance");
mkdirSync(OUT, { recursive: true });

const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);
const sendL = new Float32Array(N); // reverb send
const sendR = new Float32Array(N);

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

const add = (t0, len, fn, gain = 1, pan = 0, send = 0) => {
  const s0 = Math.round(t0 * SR);
  const n = Math.round(len * SR);
  const gl = gain * (1 - Math.max(0, pan));
  const gr = gain * (1 + Math.min(0, pan));
  for (let i = 0; i < n; i++) {
    const j = s0 + i;
    if (j < 0 || j >= N) continue;
    const v = fn(i / SR, i / n);
    L[j] += v * gl; R[j] += v * gr;
    if (send) { sendL[j] += v * gl * send; sendR[j] += v * gr * send; }
  }
};

/* ---------- instruments ---------- */
const kick = (t, g = 1) => {
  let ph = 0;
  add(t, 0.34, (x) => {
    ph += (2 * Math.PI * (46 + 120 * Math.exp(-x * 30))) / SR;
    return Math.tanh(Math.sin(ph) * 1.8) * Math.exp(-x * 8);
  }, 0.9 * g);
};
const clap = (t, g = 1) => {
  let hp = 0, prev = 0;
  add(t, 0.25, (x) => {
    const n = rnd(); hp = 0.75 * (hp + n - prev); prev = n;
    const flam = x < 0.025 ? 0.5 + 0.5 * Math.cos(x * 400) : 1;
    return hp * flam * Math.exp(-x * 16);
  }, 0.45 * g, 0, 0.25);
};
const hat = (t, open = false, pan = 0.25) => {
  let hp = 0, prev = 0;
  add(t, open ? 0.2 : 0.05, (x) => {
    const n = rnd(); hp = 0.45 * (hp + n - prev); prev = n;
    return hp * Math.exp(-x * (open ? 14 : 80));
  }, open ? 0.22 : 0.2, pan);
};
// slap-ish bass: saw through a decaying lowpass, plus a sub sine
const bass = (t, m, len = 0.11, g = 1) => {
  let ph = 0, lp = 0;
  add(t, len, (x, u) => {
    ph += mtof(m) / SR;
    const saw = 2 * (ph % 1) - 1;
    const cut = 0.02 + 0.25 * Math.exp(-x * 30);
    lp += cut * (saw - lp);
    const sub = Math.sin(2 * Math.PI * ph);
    return Math.tanh((lp * 1.6 + sub * 0.7) * 1.4) * Math.min(1, x * 300) * (1 - u) ** 0.6;
  }, 0.36 * g);
};
// muted funk guitar "chick": short bandpassed noise + pitched blip
const chick = (t, pan) => {
  let bp = 0, lp = 0;
  add(t, 0.05, (x) => {
    const n = rnd(); lp += 0.5 * (n - lp); bp = n - lp;
    return (bp * 0.8 + Math.sin(2 * Math.PI * 1300 * x) * 0.3) * Math.exp(-x * 90);
  }, 0.16, pan);
};
// brass stab: detuned saws, fast swell, short body
const brass = (t, notes, len = 0.22, g = 1) => {
  notes.forEach((m, k) => {
    [-0.08, 0.08].forEach((det, d) => {
      let ph = 0, lp = 0;
      add(t, len + 0.15, (x) => {
        ph += mtof(m + det) / SR;
        const saw = 2 * (ph % 1) - 1;
        const env = Math.min(1, x / 0.018) * (x < len ? 1 - 0.3 * (x / len) : 0.7 * Math.exp(-(x - len) * 30));
        lp += (0.08 + 0.25 * env) * (saw - lp);
        return lp * env;
      }, 0.075 * g, (k % 2 ? 0.35 : -0.35) * (d ? 1 : -1), 0.35);
    });
  });
};
// warm string pad
const pad = (t, notes, len, g = 1) => {
  notes.forEach((m, k) => {
    let ph = 0, ph2 = 0;
    add(t, len, (x, u) => {
      ph += mtof(m) / SR; ph2 += mtof(m + 0.12) / SR;
      const v = Math.sin(2 * Math.PI * ph) + 0.5 * Math.sin(4 * Math.PI * ph2) + 0.25 * Math.sin(6 * Math.PI * ph);
      return v * Math.min(1, u * 6) * Math.min(1, (1 - u) * 5);
    }, 0.035 * g, k % 2 ? 0.5 : -0.5, 0.5);
  });
};
const riser = (t, len, g = 1) => {
  let ph = 0, lp = 0;
  add(t, len, (x, u) => {
    ph += (200 + 1800 * u * u) / SR;
    lp += (0.02 + 0.4 * u) * (rnd() - lp);
    return (Math.sin(2 * Math.PI * ph) * 0.35 + lp * 0.8) * u * u;
  }, 0.4 * g, 0, 0.3);
};
const whoosh = (t, len) => {
  let lp = 0;
  add(t, len, (x, u) => {
    lp += (0.03 + 0.3 * u) * (rnd() - lp);
    return lp * Math.sin(Math.PI * u ** 1.3) ** 2;
  }, 0.85, 0, 0.2);
};
// moonwalk glide: smooth falling sine sweep with vibrato
const glide = (t, len) => {
  let ph = 0;
  add(t, len, (x, u) => {
    ph += (900 - 500 * u + 12 * Math.sin(x * 30)) / SR;
    return Math.sin(2 * Math.PI * ph) * Math.sin(Math.PI * u) * 0.5;
  }, 0.12, 0, 0.6);
};
const impact = (t, g = 1) => {
  kick(t, 1.3 * g);
  let lp = 0;
  add(t, 1.4, (x) => {
    lp += 0.07 * (rnd() - lp);
    return lp * Math.exp(-x * 3);
  }, 1.3 * g, 0, 0.4);
};

/* ---------- arrangement ---------- */
// original progression: Am9 | D9 per bar (2s), A minor pentatonic bass figure
const CH = { Am9: [57, 60, 64, 67, 71], D9: [50, 57, 60, 62, 66] };
const BASS_A = [45, null, 57, null, null, 43, 45, null, 48, null, 50, null, 52, 50, 48, null];
const BASS_D = [38, null, 50, null, null, 48, 50, null, 45, null, 48, null, 50, 48, 45, null];

const grooveBar = (bar, { drums = true, bassOn = true, gtr = true, hats = true } = {}) => {
  const t0 = bar * 4 * B;
  const amin = bar % 2 === 0;
  const pat = amin ? BASS_A : BASS_D;
  for (let beat = 0; beat < 4; beat++) {
    const t = t0 + beat * B;
    if (drums) kick(t);
    if (drums && beat % 2 === 1) clap(t);
    if (hats) { hat(t + 2 * S16, true); hat(t + S16, false, -0.25); hat(t + 3 * S16, false, -0.25); }
    if (gtr) { chick(t + S16, 0.45); chick(t + 3 * S16, 0.45); if (beat % 2) chick(t + 2 * S16, -0.45); }
  }
  if (bassOn) pat.forEach((m, i) => m && bass(t0 + i * S16, m, i % 4 === 0 ? 0.16 : 0.1));
};

// cold open (0–0.8s): straight into the groove so the first frame already moves
kick(0); kick(0.5); clap(0.5);
brass(0, CH.Am9, 0.18, 1.1); brass(0.25, [64, 67, 71], 0.1);
BASS_A.slice(0, 6).forEach((m, i) => m && bass(i * S16, m));
for (let b = 0; b < 2; b++) { hat(b * B + 2 * S16, true); chick(b * B + S16, 0.45); }
whoosh(0.55, 0.3);

// pixel build (0.8–1.33s): 8-bit square blips climbing as the sprite pops in
const blip = (t, m) => {
  let ph = 0;
  add(t, 0.07, (x) => {
    ph += mtof(m) / SR;
    return (ph % 1 < 0.5 ? 1 : -1) * Math.exp(-x * 30);
  }, 0.07, 0, 0.2);
};
[69, 72, 76, 81, 72, 76, 81, 84].forEach((m, i) => blip(0.8 + i * S16 * 0.5, m));
pad(0.8, CH.Am9, 1.3, 1.2);

// morph (1.33–2s): riser + a rising glide as the pixels extrude
riser(1.2, 0.8);
glide(1.33, 0.6);
whoosh(1.62, 0.4);

// groove (2–6s)
impact(2.0, 0.8);
brass(2.0, CH.Am9, 0.3);
grooveBar(1); grooveBar(2);
brass(3.75, [64, 67, 71], 0.12); brass(5.25, [62, 66, 69], 0.12); brass(5.75, [64, 67, 71], 0.2);
pad(2, CH.Am9, 2, 0.7); pad(4, CH.D9, 2, 0.7);

// moonwalk (6–9s): drums thin out, bass + hats + glide sweeps carry it
grooveBar(3, { drums: false });
for (let b = 0; b < 4; b++) kick(6 + b * B, 0.55);
const t9 = 8; // bar 4 first half (8–9s)
for (let b = 0; b < 2; b++) { kick(t9 + b * B, 0.6); hat(t9 + b * B + 2 * S16, true); }
BASS_D.slice(0, 8).forEach((m, i) => m && bass(t9 + i * S16, m));
[6, 7, 8].forEach((t) => glide(t, 0.95));
pad(6, CH.Am9, 2, 0.9); pad(8, CH.D9, 1, 0.9);

// stutter (9–10s): kick roll + riser into the kicks
for (let i = 0; i < 8; i++) kick(9 + i * S16 * 2, 0.5 + i * 0.06);
riser(9, 1);
whoosh(9.6, 0.42);

// lean + kicks (10–13s): full groove, brass stab on every kick (beats 22–25 = 11.0–12.5s)
impact(10, 0.7);
brass(10, CH.Am9, 0.4);
grooveBar(5); grooveBar(6, { drums: true });
[11, 11.5, 12, 12.5].forEach((t, i) => brass(t, i % 2 ? CH.D9.slice(1) : CH.Am9.slice(1), 0.14, 1.2));
pad(10, CH.Am9, 2, 0.6); pad(12, CH.D9, 1, 0.6);

// finale (13–15s): jump riser, big hit, final chord rings out
riser(12.6, 0.4, 0.6);
impact(13, 1.1);
brass(13, [57, 60, 64, 67, 69, 72], 0.5, 1.3);
for (let b = 2; b < 4; b++) { kick(13 + b * B, 0.8); hat(13 + b * B + 2 * S16, true); }
clap(13.5); clap(14.5);
[45, null, 57, null, null, 43, 45, null].forEach((m, i) => m && bass(14 + i * S16, m));
pad(13, [57, 60, 64, 67, 71, 76], 2, 1.3);
brass(14.75, [57, 60, 64, 69], 0.25, 1.2);

/* ---------- reverb (feedback combs + allpass) on the send bus ---------- */
const reverb = (inp, offs) => {
  const out = new Float32Array(N);
  [1557, 1617, 1491, 1422].forEach((d0) => {
    const d = d0 + offs;
    const buf = new Float32Array(d);
    let lp = 0;
    for (let i = 0, k = 0; i < N; i++, k = (k + 1) % d) {
      const y = buf[k];
      lp = y * 0.7 + lp * 0.3;
      buf[k] = inp[i] + lp * 0.82;
      out[i] += y * 0.25;
    }
  });
  return out;
};
const wl = reverb(sendL, 0);
const wr = reverb(sendR, 23);

/* ---------- master ---------- */
let peak = 0;
for (let i = 0; i < N; i++) {
  const fadeOut = Math.min(1, (N - i) / (SR * 0.3));
  L[i] = Math.tanh((L[i] + wl[i] * 0.5) * 1.15) * fadeOut;
  R[i] = Math.tanh((R[i] + wr[i] * 0.5) * 1.15) * fadeOut;
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
writeFileSync(join(OUT, "feelit.wav"), buf);
console.log("wrote", join(OUT, "feelit.wav"));
