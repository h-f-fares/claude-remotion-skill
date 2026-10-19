# Room sound from camera B (back of the room), on camera A's clock starting at T0:
# a faint bed of room tone everywhere, opened up for each audience reaction.
# Usage: room-track.py <camB source> <B_OFFSET> <T0> <T1> <reactions.json> <out.wav>
import json, subprocess, sys, wave
import numpy as np

src, OFF, T0, T1, reac, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5], sys.argv[6]
SR = 44100
BASE, OPEN = 0.12, 1.0  # bed level vs reaction level (relative)
r = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-af", "highpass=f=120,lowpass=f=9000,loudnorm=I=-26:TP=-3",
                    "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(r, np.int16).astype(np.float32)
pad = int((OFF - T0) * SR)                     # camera B starts later than T0
y = np.concatenate([np.zeros(pad, np.float32), x])[: int((T1 - T0) * SR)]
y = np.pad(y, (0, int((T1 - T0) * SR) - len(y)))
t = T0 + np.arange(len(y)) / SR
env = np.full(len(y), BASE, np.float32)
for e in json.load(open(reac)):
    a, b = e["start"] - 0.25, e["end"] + 0.6       # open just before, let the tail ring
    ramp = np.clip(np.minimum((t - a) / 0.25, (b - t) / 0.5), 0, 1)
    env = np.maximum(env, BASE + (OPEN - BASE) * ramp)
y *= env
w = wave.open(out, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes(np.clip(y, -32768, 32767).astype(np.int16).tobytes()); w.close()
print(out, round(len(y) / SR, 2), "s")
