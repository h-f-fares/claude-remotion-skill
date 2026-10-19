# Forced alignment of the corrected transcript, one sentence at a time: Vosk decodes
# each line's audio window with a grammar containing only that line, so every
# in-vocabulary word gets an acoustic timestamp. Out-of-vocabulary words are
# interpolated inside their line. Writes the same format as words.aligned.json.
# Usage: force-align.py <vosk model> <16 kHz mono wav starting at T0> <T0> <transcript> <rough.json> [<rough2.json>] <out.json>
import difflib, json, re, sys, wave
import numpy as np
from vosk import KaldiRecognizer, Model, SetLogLevel

SetLogLevel(-1)
model_dir, wav_path, T0, transcript = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
roughs, out_path = sys.argv[5:-1], sys.argv[-1]
lines = [l.strip() for l in open(transcript) if l.strip()]
rough = [json.load(open(p)) for p in roughs]
norm = lambda w: re.sub(r"[^a-z0-9' ]", "", w.lower().replace("-", " ")).strip()
NUM = {"2021": "twenty twenty one"}

w = wave.open(wav_path); SR = w.getframerate()
audio = np.frombuffer(w.readframes(w.getnframes()), np.int16)
model = Model(model_dir)

def decode(text, a, b):
    rec = KaldiRecognizer(model, SR, json.dumps([text, "[unk]"]))
    rec.SetWords(True)
    seg = audio[int(max(0, a - T0) * SR): int((b - T0) * SR)].tobytes()
    res = []
    for k in range(0, len(seg), 16000):
        if rec.AcceptWaveform(seg[k:k + 16000]): res += json.loads(rec.Result()).get("result", [])
    res += json.loads(rec.FinalResult()).get("result", [])
    return [dict(r, start=r["start"] + a, end=r["end"] + a) for r in res if r["word"] != "[unk]"]

out, prev_end = [], T0
for li, line in enumerate(lines):
    toks = line.split()
    spans = [[x for x in r if x["line"] == li] for r in rough]
    a = min(s[0]["start"] for s in spans) - 1.5
    b = max(s[-1]["end"] for s in spans) + 1.5
    a = max(a, prev_end - 0.3)
    spoken = " ".join(NUM.get(norm(t), norm(t)) for t in toks)
    res = decode(spoken, a, b)
    # map recognised words back onto the line's tokens (in order)
    tnorm = [NUM.get(norm(t), norm(t)).split()[0] for t in toks]
    sm = difflib.SequenceMatcher(None, tnorm, [r["word"] for r in res], autojunk=False)
    times = [None] * len(toks)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): times[blk.a + k] = (res[blk.b + k]["start"], res[blk.b + k]["end"])
    hits = sum(t is not None for t in times)
    if hits < max(2, len(toks) * 0.4):  # alignment failed: fall back to the rough timing
        times = [(x["start"], x["end"]) for x in spans[0]]
    # interpolate gaps by character weight
    known = [i for i, t in enumerate(times) if t]
    for i in range(len(toks)):
        if times[i]: continue
        lo = max([k for k in known if k < i], default=None); hi = min([k for k in known if k > i], default=None)
        t0 = times[lo][1] if lo is not None else (times[hi][0] - 0.35 * (hi - i) if hi is not None else a)
        t1 = times[hi][0] if hi is not None else t0 + 0.35 * (i - lo)
        run = range((lo + 1) if lo is not None else 0, hi if hi is not None else len(toks))
        wts = [len(toks[k]) + 2 for k in run]; acc = t0
        for k, wt in zip(run, wts):
            d = (t1 - t0) * wt / sum(wts); times[k] = (acc, acc + d); acc += d
        known = sorted(set(known) | set(run))
    for t, (s, e) in zip(toks, times):
        out.append({"text": t, "line": li, "start": round(s, 3), "end": round(e, 3)})
    prev_end = times[-1][1]
    print(f"{times[0][0]:7.2f} {hits:2d}/{len(toks):2d}  {line[:60]}")
json.dump(out, open(out_path, "w"), indent=0)
