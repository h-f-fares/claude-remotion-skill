# Finds audience reactions (laughs, applause): moments where the room mic (camera B,
# back of the room) is much louder than the clean voice explains.
# Usage: find-reactions.py <camB source> <B_OFFSET> <clean voice starting at T0> <T0> <T1> <out.json>
import json, subprocess, sys
import numpy as np

camB, OFF, voice, T0, T1, out = sys.argv[1], float(sys.argv[2]), sys.argv[3], float(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
SR, HOP = 16000, 1600  # 100 ms frames

def load(path, ss, dur, af="anull"):
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(ss), "-t", str(dur), "-i", path, "-af", af, "-ac", "1",
                        "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(r, np.int16).astype(np.float32) / 32768
    n = len(x) // HOP
    return 10 * np.log10((x[: n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-10)

t0 = max(T0, OFF)  # camera B starts at A-clock OFF
room = load(camB, t0 - OFF, T1 - t0, "highpass=f=250,lowpass=f=6000")
vox = load(voice, t0 - T0, T1 - t0)
n = min(len(room), len(vox)); room, vox = room[:n], vox[:n]
speech = vox > np.percentile(vox, 60)
a, b = np.polyfit(vox[speech], room[speech], 1)          # room level explained by the voice
excess = room - np.maximum(a * vox + b, np.percentile(room, 20))
smooth = np.convolve(excess, np.ones(5) / 5, "same")
hot = smooth > 7
events, i = [], 0
while i < n:
    if hot[i]:
        j = i
        while j < n and hot[j]: j += 1
        if j - i >= 5:  # >= 0.5 s
            events.append({"start": round(t0 + i * 0.1, 2), "end": round(t0 + j * 0.1, 2),
                           "peak_db": round(float(smooth[i:j].max()), 1)})
        i = j
    else:
        i += 1
json.dump(events, open(out, "w"), indent=1)
for e in events: print(e)
