# Assembles the voice for the output timeline: the kept ranges of the isolated
# speech, butt-joined with 8 ms fades so the pause cuts are click-free.
# Usage: python3 scripts/cut-voice.py <voice file starting at T_START> <T_START> <out.wav> [lag s]
import json, subprocess, sys, wave
import numpy as np

src, T0, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
LAG = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0  # e.g. 0.011 for the mp3 isolator output (encoder delay)
SR = 44100
r = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                   capture_output=True, check=True).stdout
x = np.frombuffer(r, np.int16).astype(np.float32)
fade = np.linspace(0, 1, int(0.008 * SR))
parts = []
for a, b in json.load(open("src/segments.json")):
    i0, i1 = round((a - T0 + LAG) * SR), round((b - T0 + LAG) * SR)
    seg = x[i0:i1].copy()
    seg = np.pad(seg, (0, max(0, (i1 - i0) - len(seg))))
    seg[: len(fade)] *= fade
    seg[-len(fade):] *= fade[::-1]
    parts.append(seg)
y = np.concatenate(parts)
w = wave.open(out, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes(np.clip(y, -32768, 32767).astype(np.int16).tobytes()); w.close()
print(out, round(len(y) / SR, 3), "s")
