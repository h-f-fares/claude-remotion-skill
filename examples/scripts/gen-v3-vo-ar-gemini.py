# Usage: python gen-v3-vo-ar-gemini.py <workdir> videos/v3-portfolio/vo-ar.txt x   (needs GEMINI_API_KEY)
# Egyptian YouTube voiceover for the v3-portfolio video: Gemini TTS (Charon + tech-YouTuber persona),
# one call per beat. Writes <workdir>/vo2_raw.wav and <workdir>/vo2_sents.json like the squirrel script.
# Sentence boundaries inside a beat = the pauses that best match each sentence's length share.
import json, os, re, sys, time, base64, subprocess, urllib.request, urllib.error
import numpy as np
SP, src, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
MODEL, VOICE, SR = "gemini-2.5-flash-preview-tts", "Charon", 24000
PERSONA = ("Read the Arabic transcript below exactly as written, word for word, in natural Egyptian Arabic "
           "with a Cairo accent, never MSA or Gulf. You are an Egyptian tech YouTuber from Cairo in his thirties, "
           "telling your viewers about something you just built: warm, energetic, confident, conversational, "
           "talking to friends, not reading. Say English tech words (pull request, merge, Claude, token) in English. "
           "Keep short natural pauses between sentences. Do not add or skip any words.\n\nTranscript:\n")
# some lines keep ending with finishReason OTHER under the full persona; this shorter one passes them
PERSONA_LITE = ("Read the Arabic transcript below exactly as written, word for word, in natural Egyptian Arabic "
                "with a Cairo accent, never MSA or Gulf. You are an Egyptian tech YouTuber from Cairo in his thirties, "
                "telling your viewers about something you just built: warm, energetic, confident, conversational. "
                "Keep short natural pauses between sentences.\n\nTranscript:\n")
beats = [l.strip() for l in open(src, encoding="utf-8") if l.strip()]
os.makedirs(f"{SP}/gem", exist_ok=True)

def tts(text, path):
    if os.path.exists(path): return
    body = {"contents": [{"parts": [{"text": PERSONA + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}}
    for attempt in range(10):  # flash TTS sometimes ends with finishReason OTHER; retry, then fall back to the lite persona
        if attempt == 3:
            body["contents"][0]["parts"][0]["text"] = PERSONA_LITE + text
        try:
            req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
            r = json.load(urllib.request.urlopen(req, timeout=240))
            pcm = base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
            open(path, "wb").write(pcm); return
        except (urllib.error.HTTPError, KeyError, TimeoutError) as e:
            print("retry", attempt, getattr(e, "code", e)); time.sleep(8 * (attempt + 1))
    raise SystemExit(f"failed: {text[:40]}")

def pauses(a, min_len=0.12, thr=0.012):
    # (start, end) of quiet stretches, in seconds
    win = int(0.02 * SR); env = np.array([np.abs(a[i:i+win]).max() for i in range(0, len(a), win)])
    quiet = env < thr; out = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * 0.02 >= min_len: out.append((i * 0.02, j * 0.02))
            i = j
        else: i += 1
    return out

def pick_cuts(cands, parts, dur):
    # choose len(parts)-1 pauses, in order, whose midpoints best match where each
    # sentence should end by character share; longer pauses win ties
    n = len(parts) - 1
    if n == 0 or not cands: return []
    lens = [len(re.sub(r"\W", "", p)) + 3 for p in parts]
    exp = [dur * sum(lens[: k + 1]) / sum(lens) for k in range(n)]
    INF = 1e9
    best = [[(INF, None)] * len(cands) for _ in range(n)]
    for k in range(n):
        for j, (a0, a1) in enumerate(cands):
            cost = abs((a0 + a1) / 2 - exp[k]) - 0.8 * (a1 - a0)
            if k == 0: best[k][j] = (cost, None)
            else:
                prev = min(((best[k-1][i][0], i) for i in range(j)), default=(INF, None))
                if prev[1] is not None: best[k][j] = (prev[0] + cost, prev[1])
    j = min(range(len(cands)), key=lambda j: best[n-1][j][0])
    if best[n-1][j][0] >= INF: return sorted(sorted(cands, key=lambda p: p[0] - p[1])[:n])
    out = []
    for k in range(n - 1, -1, -1):
        out.append(cands[j]); j = best[k][j][1]
    return out[::-1]

LEAD, BEAT_GAP = 0.3, 0.45
chunks = [np.zeros(int(LEAD * SR), dtype=np.float32)]; t = LEAD; segs = []; sents = []
for bi, beat in enumerate(beats):
    parts = [p.strip() for p in beat.split("||") if p.strip()]
    path = f"{SP}/gem/b{bi+1:02d}.pcm"
    tts(" ".join(parts), path)
    a = np.frombuffer(open(path, "rb").read(), dtype=np.int16).astype(np.float32) / 32768
    idx = np.where(np.abs(a) > 0.012)[0]; a = a[max(0, idx[0] - 240): idx[-1] + 600]
    dur = len(a) / SR
    inner = [p for p in pauses(a) if p[0] > 0.15 and p[1] < dur - 0.15]
    cuts = pick_cuts(inner, parts, dur)
    if len(cuts) < len(parts) - 1: print(f"beat {bi+1}: only {len(cuts)} pauses for {len(parts)} sentences")
    bounds = [0.0] + [(p[0] + p[1]) / 2 for p in cuts] + [dur]
    speech = [(0.0, cuts[0][0] if cuts else dur)] + [(cuts[k][1], cuts[k+1][0] if k + 1 < len(cuts) else dur) for k in range(len(cuts))]
    for k, p in enumerate(parts):
        s0, s1 = speech[k] if k < len(speech) else (bounds[-2], dur)
        sents.append({"beat": bi + 1, "text": p, "start": round(t + s0, 3), "end": round(t + s1, 3)})
    segs.append({"scene": bi + 1, "start": round(t, 3), "dur": round(dur + BEAT_GAP, 3)})
    chunks += [a, np.zeros(int(BEAT_GAP * SR), dtype=np.float32)]; t += dur + BEAT_GAP
full = np.concatenate(chunks)
pcm = (np.clip(full, -1, 1) * 32767).astype(np.int16).tobytes()
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", f"{SP}/vo2_raw.wav"], input=pcm, check=True)
json.dump({"segments": segs, "sentences": sents}, open(f"{SP}/vo2_sents.json", "w"), indent=1, ensure_ascii=False)
print("total", round(t, 2), "sentences", len(sents))
