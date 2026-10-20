# Usage: python v3-timing.py <workdir> [audio-dir]   (after gen-v3-vo-ar-gemini.py; audio-dir defaults to audio)
# Turns <workdir>/vo2_raw.wav + vo2_sents.json into the video's audio/vo.mp3 (-16 LUFS, 48 kHz)
# and audio/timing.json with word timings. Words inside a sentence are placed on the speech
# envelope: voiced stretches are split at short dips, then words are spread by letter count.
import json, re, subprocess, sys, os
import numpy as np

SP = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "videos", "v3-portfolio", sys.argv[2] if len(sys.argv) > 2 else "audio")
os.makedirs(OUT, exist_ok=True)
SR = 24000
raw = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{SP}/vo2_raw.wav", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                                   capture_output=True, check=True).stdout, dtype=np.int16).astype(np.float32) / 32768
data = json.load(open(f"{SP}/vo2_sents.json", encoding="utf-8"))
segs, sents = data["segments"], data["sentences"]

# repair beats whose pause detection failed (all sentences squashed): spread them by letter share
for sg in segs:
    ss = [s for s in sents if s["beat"] == sg["scene"]]
    if len(ss) < 2:
        continue
    starts = [s["start"] for s in ss]
    if len(set(starts)) == len(starts) and all(s["end"] > s["start"] + 0.2 for s in ss):
        continue
    t0, t1 = sg["start"], sg["start"] + sg["dur"] - 0.45
    lens = [len(re.sub(r"\W", "", s["text"])) + 3 for s in ss]
    acc = t0
    for s, L in zip(ss, lens):
        d = (t1 - t0) * L / sum(lens)
        s["start"], s["end"] = round(acc, 3), round(acc + d - 0.15, 3)
        acc += d
    print("repaired beat", sg["scene"])

win = int(0.01 * SR)
env = np.array([np.abs(raw[i:i + win]).max() for i in range(0, len(raw), win)])

words = []
for si, s in enumerate(sents):
    toks = s["text"].split()
    a, b = int(s["start"] * 100), max(int(s["start"] * 100) + 1, int(s["end"] * 100))
    e = env[a:b]
    voiced = e > 0.02
    # time axis of voiced frames only, so silent gaps inside the sentence take no word time
    vt = np.where(voiced)[0]
    if len(vt) < len(toks):
        vt = np.arange(len(e))
    lens = np.array([len(re.sub(r"\W", "", t)) + 1.5 for t in toks], dtype=float)
    edges = np.concatenate([[0], np.cumsum(lens) / lens.sum()])
    for k, t in enumerate(toks):
        i0 = vt[min(len(vt) - 1, int(edges[k] * len(vt)))]
        i1 = vt[min(len(vt) - 1, max(int(edges[k + 1] * len(vt)) - 1, 0))]
        words.append({"text": t, "start": round((a + i0) / 100, 3), "end": round((a + i1 + 1) / 100, 3), "beat": s["beat"], "sent": si})

json.dump({"segments": segs, "sentences": sents, "words": words}, open(f"{OUT}/timing.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
# committed as mp3 (the wav is ~40 MB); 192 kbps is transparent for speech
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{SP}/vo2_raw.wav", "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", "48000", "-ac", "1", "-b:a", "192k", f"{OUT}/vo.mp3"], check=True)
# YouTube captions: one cue per sentence, next to the script
def ts(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
srt = [f"{i}\n{ts(x['start'])} --> {ts(x['end'] + 0.25)}\n{x['text'].strip()}\n" for i, x in enumerate(sents, 1)]
name = {"audio-v2": "v3-portfolio-ar-cut.srt", "audio-v3": "v3-portfolio-ar-show.srt", "audio-v4": "v3-portfolio-ar-simple.srt"}.get(os.path.basename(OUT), "v3-portfolio-ar.srt")
open(os.path.join(os.path.dirname(__file__), "..", "videos", "v3-portfolio", name), "w", encoding="utf-8").write("\n".join(srt))
print("beats", len(segs), "sentences", len(sents), "words", len(words), "dur", round(segs[-1]["start"] + segs[-1]["dur"], 1))
