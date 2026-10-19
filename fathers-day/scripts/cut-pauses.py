# Finds long pauses in the isolated voice and shortens them, writing the kept
# source ranges (camera A clock) to src/segments.json.
# Usage: python3 scripts/cut-pauses.py <clean voice> <T_START> <T_END> <target_cut_s> <reactions.json> <hook_a> <hook_b>
# Audience reactions are protected (never cut); the hook range is prepended as a cold open.
import json, subprocess, sys
import numpy as np

src, T0, T1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
TARGET = float(sys.argv[4])
PROTECT = [(268.0, 290.0), (378.0, 1e9)]  # A clock: the silent moment before the baby cries; the ending
PROTECT += [(e["start"] - 0.4, e["end"] + 0.6) for e in json.load(open(sys.argv[5]))]
HOOK = [float(sys.argv[6]), float(sys.argv[7])]
ISO_OFFSET = T0  # speech_isolated.mp3 t=0 is A clock T_START

r = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                   capture_output=True, check=True).stdout
x = np.frombuffer(r, np.int16).astype(np.float32) / 32768
hop = 160
n = len(x) // hop
e = 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
sp = np.convolve((e > -48).astype(float), np.ones(9), "same") > 0  # 40 ms hangover
pauses, i = [], 0
while i < n:
    if not sp[i]:
        j = i
        while j < n and not sp[j]: j += 1
        a, b = i / 100 + ISO_OFFSET, j / 100 + ISO_OFFSET
        if a > T0 + 2 and not any(p0 < b and a < p1 for p0, p1 in PROTECT):
            pauses.append((a, b))
        i = j
    else:
        i += 1

def removal(mn, keep):
    return sum((b - a) - keep for a, b in pauses if b - a > mn)

# pick the gentlest rule (longest kept pause) that reaches the target
best = None
for keep in np.arange(0.9, 0.39, -0.05):
    for mn in np.arange(1.6, keep + 0.1, -0.05):
        if removal(mn, keep) >= TARGET:
            best = (mn, keep); break
    if best: break
mn, keep = best
cuts = [(a + keep / 2, b - keep / 2) for a, b in pauses if b - a > mn]
segs, t = [], T0
for a, b in cuts:
    segs.append([round(t, 3), round(a, 3)]); t = b
segs.append([round(t, 3), T1])
out = sum(b - a for a, b in segs)
json.dump([HOOK] + segs, open("src/segments.json", "w"))
print(f"pauses > {mn:.2f}s shortened to {keep:.2f}s: {len(cuts)} cuts, removed {T1 - T0 - out:.1f}s, "
      f"main {out:.1f}s + hook {HOOK[1] - HOOK[0]:.1f}s")
