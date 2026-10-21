# Usage: python align-vo-gemini.py <vo.wav> <vo_sents.json> <words.json>   (needs GEMINI_API_KEY)
# Word-level caption timing without Whisper: Gemini aligns the script's words to the audio,
# then each word's start is mapped onto its sentence's measured bounds (Gemini's absolute
# timestamps drift by up to ~0.5s; their relative spacing inside a sentence is good).
import base64, json, os, sys, urllib.request
wav, sents_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
sents = json.load(open(sents_path))["sentences"]
words = [w for s in sents for w in s["text"].split(" ")]
audio = base64.b64encode(open(wav, "rb").read()).decode()
listing = "\n".join(f"{i}: {w}" for i, w in enumerate(words))
prompt = ("Transcribe this voiceover verbatim in field 'transcript'. Then align this numbered word list "
          "to the audio and give each word's start time in seconds (accurate to 0.05s) in field 'starts' "
          "as a list of {i, s}, one per word, in order. Words:\n" + listing)
body = {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": audio}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
r = json.load(urllib.request.urlopen(req, timeout=300))
res = json.loads(r["candidates"][0]["content"]["parts"][0]["text"])
print(res["transcript"])
st = {x["i"]: x["s"] for x in res["starts"]}
out = []; k = 0
for si, s in enumerate(sents):
    ws = s["text"].split(" "); ts = [st[k + j] for j in range(len(ws))]
    g0, g1 = ts[0], max(ts[-1] + 0.3, ts[0] + 0.1); prev = None
    for j, w in enumerate(ws):
        t = s["start"] + (ts[j] - g0) / (g1 - g0) * (s["end"] - s["start"])
        if prev is not None: t = max(t, prev + 0.08)
        prev = t; out.append({"w": w, "si": si, "start": round(t, 3)})
    k += len(ws)
json.dump(out, open(out_path, "w"), ensure_ascii=False, indent=0)
print(len(out), "words")
