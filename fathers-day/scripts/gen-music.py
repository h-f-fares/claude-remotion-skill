# Synthesizes an original, gentle piano + pad bed for the speech (no samples, deterministic).
# Timeline matches the edit (seconds on camera A's clock). Writes public/music.wav.
import sys, wave
import numpy as np

SR = 44100
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 390.0
OUT = sys.argv[1]
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# 8-second chords, 60 BPM. Major for warmth, minor turn for tension (scene 3).
WARM = [[48, 55, 64, 67], [43, 55, 62, 67], [45, 52, 60, 64], [41, 53, 60, 65]]   # C  G  Am F
TENSE = [[45, 52, 60, 64], [41, 53, 60, 65], [38, 50, 57, 62], [40, 52, 59, 64]]  # Am F  Dm E
LIFT = [[41, 53, 60, 65], [43, 55, 62, 67], [48, 55, 64, 67], [48, 55, 64, 72]]   # F  G  C  C
SECTIONS = [(0, 248, WARM), (248, 280, TENSE), (280, 390, LIFT + WARM)]

def intensity(t):
    pts = [(0, .55), (30, .5), (120, .5), (197, .6), (250, .75), (271, .8), (273, .15),
           (277, .2), (284, 1.0), (300, .9), (313, .6), (360, .6), (378, .85), (384, 1.0), (390, .9)]
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)

def pad(start, dur, notes, amp):
    n0, n = int(start * SR), int(dur * SR)
    n = min(n, N - n0)
    if n <= 0: return
    t = np.arange(n) / SR
    env = np.minimum(1, t / 2.5) * np.minimum(1, (dur - t) / 2.5)
    for k, m in enumerate(notes):
        f = hz(m)
        for det, pan in ((-0.12, .3), (0.12, .7)):
            s = sum(np.sin(2 * np.pi * f * h * (1 + det / 100) * t + rng.uniform(0, 6)) / h ** 1.6 for h in (1, 2, 3))
            s *= env * amp * (0.9 if k == 0 else 0.55)
            L[n0:n0 + n] += s * (1 - pan); R[n0:n0 + n] += s * pan

def piano(start, m, amp, pan):
    n0 = int(start * SR); n = min(int(3.5 * SR), N - n0)
    if n <= 0: return
    t = np.arange(n) / SR
    f = hz(m)
    s = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (1.2 + h * .9)) / h ** 1.3 for h in (1, 2, 3, 4))
    s *= np.minimum(1, t * 400) * amp
    L[n0:n0 + n] += s * (1 - pan); R[n0:n0 + n] += s * pan

ARP = [0, 2, 1, 3, 2, 1]
for s0, s1, prog in SECTIONS:
    t, i = s0, 0
    while t < s1:
        ch = prog[i % len(prog)]
        lvl = float(intensity(t + 4))
        pad(t, 8.6, ch, 0.05 * (0.6 + lvl))
        step = 1.0 if lvl > .45 else 2.0
        for b in np.arange(0, 8, step):
            if t + b >= s1: break
            m = ch[1:][ARP[int(b) % len(ARP)] % 3] + 12
            piano(t + b, m, 0.08 * lvl * (1.15 if b == 0 else 1), 0.35 + 0.3 * rng.random())
        t += 8; i += 1

# soft room reverb: a few decaying taps
for d, g in ((0.031, .35), (0.067, .28), (0.113, .2), (0.171, .14), (0.29, .08)):
    k = int(d * SR)
    L[k:] += R[:-k] * g; R[k:] += L[:-k] * g * .9

fade = np.ones(N); fo = int(4 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
st = (np.stack([L, R], 1) / peak * 0.85 * 32767).astype(np.int16)
w = wave.open(OUT, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close()
print("wrote", OUT, DUR, "s")
