#!/usr/bin/env python3
"""pron.py - have Gemini listen to a voiceover and list every word a native listener would hear as wrong.

    python3 pron.py voice/vo.wav voice/script.json [--dialect "Egyptian Arabic (Cairo)"]

Run it on every new voice before the user hears it, then fix what it finds with a `say` respelling
on that line in script.json and re-generate only those lines (tools/vo.py caches the rest).
It is a second ear, not the judge: it misses things and its pace verdict can disagree with the user
(on VeilLLM it called a voice "slightly slow" that the user found too fast). The user's ear wins.
"""
import base64, json, os, sys, urllib.request

args = [a for a in sys.argv[1:] if not a.startswith("--")]
if len(args) < 2: print(__doc__); sys.exit(1)
wav, script = args
dialect = sys.argv[sys.argv.index("--dialect") + 1] if "--dialect" in sys.argv else "Egyptian Arabic (Cairo)"
spec = json.load(open(script, encoding="utf-8"))
text = "\n".join(l["text"] for l in spec["lines"])
prompt = (f"You are a native {dialect} dialect coach reviewing a TTS voiceover for a YouTube Short. The intended script is below. "
          "Listen carefully and list EVERY word or phrase a native listener would hear as wrong: a wrong vowel or consonant, a formal (MSA) "
          "or other-dialect pronunciation (for Egyptian: ق as q instead of a glottal stop, ج as j instead of g, ث/ذ as th/dh), wrong stress, "
          "a mangled English tech term, skipped or added words, or unnatural rhythm. Be strict. For each give the script word, what you heard "
          "(Arabic letters + Latin transliteration), the time in seconds, why it is wrong, and a respelling a TTS would read correctly "
          "(Arabic letters, tashkeel where it helps). Also give the pace in words per second. Answer as JSON: "
          '{"issues":[{"word":"","heard":"","t":0,"why":"","respell":""}],"pace":{"wps":0,"verdict":""}}\n\nScript:\n' + text)
body = {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": base64.b64encode(open(wav, "rb").read()).decode()}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
res = json.loads(json.load(urllib.request.urlopen(req, timeout=300))["candidates"][0]["content"]["parts"][0]["text"])
for i in res.get("issues", []):
    print(f"  {i.get('t', '?'):>5}s  {i.get('word')}  heard {i.get('heard')}  ->  say: {i.get('respell', '?')}\n          {i.get('why', '')}")
if not res.get("issues"): print("  no pronunciation issues heard")
p = res.get("pace", {})
print(f"\n  pace: {p.get('wps')} words/s. {p.get('verdict', '')}")
