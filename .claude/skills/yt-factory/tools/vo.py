#!/usr/bin/env python3
"""vo.py - build a voiceover from a script file: one TTS take per line, each line's own pause after it.

    python3 vo.py voice/script.json --scratch     # timing voice: silence of the estimated length, free
    python3 vo.py voice/script.json               # the real voice (Gemini TTS, needs GEMINI_API_KEY)

Run it from the video's project folder. script.json:

    {"voice": "Charon", "model": "gemini-2.5-pro-preview-tts", "lead": 0.3, "tail": 0.9,
     "persona": "Read the transcript ... in natural Egyptian Arabic ...",
     "lines": [{"id": "hook1", "scene": 1, "text": "...", "after": 0.45},
               {"id": "proof2", "scene": 6, "text": "ده اللي انت كتبته.", "after": 1.8}]}

One sentence per line. Optional `say`: what the voice reads when it differs from the caption text,
e.g. a respelling that forces the dialect ("أدْرة" for قادرة, so the ق becomes a glottal stop).
`after` is the silence that follows it: give a line a long one (1-2 s) where
the picture needs time to be read, and put the payoff hit in that pause, not under the next line.
Lines that share a `scene` become one segment. Top-level `speed` (e.g. 1.2) time-stretches every take
without changing pitch: asking the TTS to "speak slowly" overshoots (VeilLLM went from 52 s of speech
to 76 s), so ask for calm, then set the exact pace here. Changing it re-uses the cached takes.

Writes public/vo.mp3 and src/vo.json ({segments, sentences}). With --scratch it also writes
src/words.json from estimated word times, so the whole video can be built and reviewed before any
paid take exists. After the real voice, align the words with
examples/scripts/align-vo-gemini.py <vo.wav> src/vo.json src/words.json.

Takes are cached as voice/takes/<id>-<hash of text>.pcm: editing one line re-generates only that line,
and inserting or splitting lines never shifts the others (the old generator cached by line number).
"""
import base64, hashlib, json, os, subprocess, sys, time, urllib.error, urllib.request
import numpy as np

SR = 24000
args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args: print(__doc__); sys.exit(1)
scratch = "--scratch" in sys.argv
spec = json.load(open(args[0], encoding="utf-8"))
lines = spec["lines"]
takes = os.path.join(os.path.dirname(os.path.abspath(args[0])), "takes")
os.makedirs(takes, exist_ok=True)
arabic = lambda t: sum("؀" <= c <= "ۿ" for c in t) > sum(c.isascii() and c.isalpha() for c in t)

def est_seconds(text):
    # ~2.7 words/s for spoken Egyptian Arabic, ~2.6 for English (150 wpm); punctuation adds a breath
    words = len(text.split())
    return words / (2.7 if arabic(text) else 2.6) + 0.15 * sum(text.count(p) for p in "،,.؟?!:")

def tts(text, path):
    if os.path.exists(path): return
    body = {"contents": [{"parts": [{"text": spec.get("persona", "") + "\n\nTranscript:\n" + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": spec.get("voice", "Charon")}}}}}
    model = os.environ.get("TTS_MODEL", spec.get("model", "gemini-2.5-flash-preview-tts"))
    for attempt in range(5):
        try:
            req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
            r = json.load(urllib.request.urlopen(req, timeout=240))
            open(path, "wb").write(base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])); return
        except (urllib.error.HTTPError, urllib.error.URLError, KeyError, TimeoutError) as e:
            print("  retry", attempt + 1, getattr(e, "code", e)); time.sleep(8 * (attempt + 1))
    sys.exit(f"TTS failed for: {text[:50]}")

def take(line):
    if scratch: return np.zeros(int(est_seconds(line["text"]) * SR), dtype=np.float32)
    said = line.get("say", line["text"])
    h = hashlib.sha1((said + spec.get("voice", "") + spec.get("persona", "") + spec.get("model", "")).encode()).hexdigest()[:8]
    path = os.path.join(takes, f"{line['id']}-{h}.pcm")
    tts(said, path)
    a = np.frombuffer(open(path, "rb").read(), dtype=np.int16).astype(np.float32) / 32768
    loud = np.where(np.abs(a) > 0.012)[0]
    a = a[max(0, loud[0] - 240): loud[-1] + 600] if len(loud) else a
    speed = spec.get("speed", 1.0)
    if speed != 1.0:
        pcm = (a * 32767).astype(np.int16).tobytes()
        out = subprocess.run(["ffmpeg", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", f"atempo={speed}",
                              "-f", "s16le", "-ar", str(SR), "-ac", "1", "-"], input=pcm, capture_output=True, check=True).stdout
        a = np.frombuffer(out, dtype=np.int16).astype(np.float32) / 32768
    return a

t = spec.get("lead", 0.3)
chunks = [np.zeros(int(t * SR), dtype=np.float32)]
sentences, segments, words = [], [], []
for i, line in enumerate(lines):
    a = take(line)
    dur = len(a) / SR
    sentences.append({"beat": line.get("scene", i + 1), "id": line["id"], "text": line["text"], "start": round(t, 3), "end": round(t + dur, 3)})
    if scratch:  # spread the words over the line by length, so captions and word cues have something to hang on
        ws = line["text"].split(" "); total = sum(len(w) + 2 for w in ws); acc = 0
        for w in ws:
            words.append({"w": w, "si": i, "start": round(t + dur * acc / total, 3)}); acc += len(w) + 2
    after = line.get("after", 0.45)
    chunks += [a, np.zeros(int(after * SR), dtype=np.float32)]
    t += dur + after
chunks.append(np.zeros(int(spec.get("tail", 0.9) * SR), dtype=np.float32))
for s in sentences:  # a segment runs from its first line to the next scene's first line
    if not segments or segments[-1]["scene"] != s["beat"]: segments.append({"scene": s["beat"], "start": s["start"]})
for k, seg in enumerate(segments):
    seg["dur"] = round((segments[k + 1]["start"] if k + 1 < len(segments) else t) - seg["start"], 3)

os.makedirs("public", exist_ok=True); os.makedirs("src", exist_ok=True)
pcm = (np.clip(np.concatenate(chunks), -1, 1) * 32767).astype(np.int16).tobytes()
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "voice/vo.wav"], input=pcm, check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "voice/vo.wav", "-b:a", "192k", "public/vo.mp3"], check=True)
json.dump({"segments": segments, "sentences": sentences}, open("src/vo.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
if scratch: json.dump(words, open("src/words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"{'SCRATCH (silent, estimated timing) ' if scratch else ''}{len(lines)} lines, {len(segments)} scenes, {t + spec.get('tail', 0.9):.2f}s"
      f" -> voice/vo.wav, public/vo.mp3, src/vo.json{', src/words.json' if scratch else ''}")
if not scratch: print("next: python3 ../../examples/scripts/align-vo-gemini.py voice/vo.wav src/vo.json src/words.json")
