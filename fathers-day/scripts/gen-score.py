# Original score for the edit, synthesised (piano + strings + reverb), timed to the story.
# Cue times are on camera A's clock and mapped onto the output timeline via segments.json
# (segment 0 = cold open). Usage: gen-score.py <segments.json> <end_card_s> <out.wav>
import json, sys, wave
import numpy as np

SEGS = json.load(open(sys.argv[1])); END_CARD = float(sys.argv[2]); OUT = sys.argv[3]
SR = 44100
starts = np.cumsum([0] + [b - a for a, b in SEGS[:-1]])
BODY = float(starts[-1] + SEGS[-1][1] - SEGS[-1][0])
DUR = BODY + END_CARD + 1.0
HOOK = SEGS[0][1] - SEGS[0][0]

def M(t):  # A-clock time -> output seconds in the main body
    for (a, b), o in list(zip(SEGS, starts))[1:]:
        if t < a: return float(o)
        if t <= b: return float(o + t - a)
    return BODY

N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def put(start, sig, pan=0.5):
    i0 = int(start * SR)
    if i0 >= N or i0 + len(sig) <= 0: return
    s = sig[max(0, -i0): N - i0] if i0 < 0 else sig[: N - i0]
    i0 = max(0, i0)
    L[i0:i0 + len(s)] += s * np.sqrt(1 - pan); R[i0:i0 + len(s)] += s * np.sqrt(pan)

def piano(start, m, vel=0.5, dur=4.0, pan=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m); B = 0.0004
    s = np.zeros(n)
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 12000: break
        decay = 0.9 + 0.55 * k + f / 600
        s += np.sin(2 * np.pi * fk * t + rng.uniform(0, 6)) * np.exp(-t * decay) / k ** (1.6 - 0.5 * vel)
    s += rng.standard_normal(n) * np.exp(-t * 90) * 0.02 * vel          # hammer
    s *= np.minimum(1, t * 600) * np.minimum(1, (dur - t) * 8) * vel * 0.16
    put(start, s, pan)

def strings(start, dur, notes, vel=0.5, attack=2.5, release=2.5):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.clip(np.minimum(t / attack, (dur - t) / release), 0, 1) ** 1.5 * vel * 0.035
    for m in notes:
        for det, pan in ((-0.07, 0.3), (0.06, 0.7), (0.0, 0.5)):
            f = hz(m) * (1 + det / 100) * (1 + 0.0025 * np.sin(2 * np.pi * 5.2 * t + rng.uniform(0, 6)))
            ph = 2 * np.pi * np.cumsum(f) / SR
            saw = sum(np.sin(k * ph) / k for k in range(1, 7))            # soft, band-limited saw
            put(start, saw * env, pan)

# ---- story map (output seconds) ----
C, G, Am, F, Dm, E, Em = [48, 55, 64, 67], [43, 55, 62, 71], [45, 57, 60, 64], [41, 53, 60, 65], [38, 50, 57, 65], [40, 52, 59, 68], [40, 52, 55, 64]
CRY = HOOK * (288.2 - SEGS[0][0]) / HOOK

def section(t0, t1, prog, bar, vel, motion, string_vel, lead=None):
    t, i = t0, 0
    while t < t1 - 0.5:
        ch = prog[i % len(prog)]; d = min(bar, t1 - t)
        piano(t, ch[0], vel * 0.9, d + 1.5, 0.45)
        if string_vel: strings(t, d + 0.6, [c + 12 for c in ch[1:]], string_vel, attack=min(2.5, d / 2), release=min(2.5, d / 2))
        step = bar / motion
        pat = [1, 2, 3, 2, 3, 1, 2, 3]
        for k in range(int(motion)):
            if t + k * step >= t1: break
            piano(t + k * step, ch[pat[k % 8]] + 12, vel * (0.75 + 0.25 * (k == 0)), 3.0, 0.35 + 0.3 * rng.random())
        if lead is not None and i < len(lead) and lead[i]:
            piano(t, lead[i] + 24, vel * 1.1, 4.0, 0.55)
        t += bar; i += 1

# Cold open: sparse, held breath, swell on the cry, cut at the hook end
section(0.0, CRY - 0.2, [Am, F], 4.0, 0.35, 2, 0.0)
strings(CRY - 0.1, HOOK - CRY + 2.0, [64 + 12, 67 + 12, 72 + 12], 0.9, attack=0.8, release=1.6)
piano(CRY, 48, 0.8, 5.0); piano(CRY + 0.02, 72, 0.7, 5.0); piano(CRY + 0.04, 76, 0.6, 5.0)

MAIN = HOOK + 0.4
theme_lead = [76, 74, 72, 72, 76, 79, 77, 76]
section(MAIN, M(124.7), [C, G, Am, F], 4.0, 0.42, 4, 0.25, theme_lead)          # opening + background + scene 1
section(M(124.7), M(197.4), [F, C, G, Am], 4.0, 0.42, 4, 0.3)                   # delivery morning
section(M(197.4), M(251.2), [Am, F, C, G], 4.0, 0.48, 8, 0.4)                   # ops time: more motion
section(M(251.2), M(272.0), [Am, F, Dm, E], 2.0, 0.55, 8, 0.6)                  # tension rising
# M(272) -> cry: silence ("everything went so quiet")
cry = M(288.2)
strings(cry - 0.15, 22.0, [60, 64, 67, 72], 1.0, attack=1.2, release=4.0)
piano(cry, 36, 0.9, 6.0); piano(cry + 0.03, 60, 0.75, 6.0); piano(cry + 0.06, 76, 0.7, 6.0)
section(cry + 4.0, M(313.9), [F, G, C, Am], 4.0, 0.5, 4, 0.55, [79, 77, 76, 76, 74, 72])  # joy
section(M(313.9), M(367.4), [C, Am, F, G], 4.0, 0.4, 4, 0.3)                    # final scene
section(M(367.4), M(380.9), [F, G, Em, Am], 4.0, 0.5, 8, 0.55)                  # closure build
father = M(383.0)
section(M(380.9), father, [F, G], 1.2, 0.5, 4, 0.6)
strings(father - 0.1, BODY - father + END_CARD + 0.8, [60, 64, 67, 72, 76], 1.0, attack=0.6, release=3.0)
for k, m in enumerate([36, 48, 60, 64, 67, 72, 76]): piano(father + 0.025 * k, m, 0.85, 7.0, 0.3 + 0.07 * k)

# ---- reverb (synthetic stereo hall) ----
irn = int(2.6 * SR); ti = np.arange(irn) / SR
def ir(seed):
    g = np.random.default_rng(seed).standard_normal(irn) * np.exp(-ti * 2.6)
    g[: int(0.012 * SR)] = 0
    return g / np.sqrt((g ** 2).sum())
def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[: len(x)]
wet = 0.32
L2 = L * (1 - wet) + conv(L, ir(1)) * wet * 2.2
R2 = R * (1 - wet) + conv(R, ir(2)) * wet * 2.2
fade = np.ones(N); fo = int(1.5 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2
st = np.stack([L2 * fade, R2 * fade], 1)
st = st / np.abs(st).max() * 0.89
w = wave.open(OUT, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
print(OUT, round(DUR, 2), "s; hook", round(HOOK, 1), "cry(out)", round(cry, 1), "father(out)", round(father, 1))
