# Story Videos (Shorts / Reels told by a narrator)

Lessons from building a narrated cartoon story Short end to end. Read before
starting any "make an animated short about this story/post" request.

## 1. Intake — ask once, then deliver
Ask everything in ONE round of multiple-choice questions, then build straight
through to the final render. No mid-way approval stops unless you are blocked
(missing credentials, a choice only the user can make). Ask:
- Language / dialect, voice gender and feel.
- Length. Default **~2 minutes** for a story that has a lesson. 30–45s only
  fits a single joke; it rushes setup and the lesson never lands.
- Bar: assume **viral-grade** (see §4), not a calm explainer.
- Story fidelity: get the FULL story text. A fetch tool that returns only a
  summary is not enough: ask the user to paste it or confirm the beats.
  Never invent plot points (extra characters, motives); if a beat must be
  dramatized, flag it in the question round.
- Content tone for dark beats (e.g. off-screen / silhouette vs shown).

## 2. Preflight the environment before offering options
Check what actually works BEFORE presenting choices, so the user never picks
something that fails:
- **Voice.** Default free option: **Kokoro-82M** via `kokoro-onnx`
  (Apache-2.0, commercial OK). Model files are on GitHub releases
  (`thewh1teagle/kokoro-onnx`, `model-files-v1.0`) when Hugging Face is
  blocked. Good narrator: `am_michael`, speed ~1.05. Paid APIs (ElevenLabs,
  Gemini TTS) may be blocked on free tiers or out of credits: test with one
  tiny request first. Avoid Piper `ryan` for monetized videos (CC BY-NC-SA).
  If `espeakng_loader` errors on a hard-coded `/home/runner/...phontab` path,
  symlink that path to the package's bundled `espeak-ng-data`.
- **Fonts.** Headless Chrome may reject a proxy's TLS cert for
  fonts.gstatic.com even when curl works. Download the woff2 with curl into
  `public/fonts/` and load via `FontFace` + `staticFile` + `delayRender`.
- **Captions timing.** If Whisper/model hosts are unreachable, synthesize the
  voice **one sentence at a time**, record each sentence's start/end, then
  split words inside each sentence by silence detection + word length. Good
  enough for 1–2 word captions.
- **Chromium.** Use `--browser-executable` with a `headless_shell` binary.

## 3. Script structure (~2 min, ~120 wpm narration)
1. **Hook (0–3s):** the most absurd moment first, then an open loop
   ("…and somehow this is taught to teams worldwide").
2. **Setup:** who, where, when, in concrete sensory beats.
3. **Pressure → problem → the choice** (one beat each, short punchy lines:
   "Not low. Gone.").
4. **The act + consequence.**
5. **Mid-video reset (~50%):** pattern interrupt ("Wait. Is this real?").
6. **Meaning / tie-in → stakes.**
7. **3 numbered takeaways.**
8. **Callback punchline** that loops visually to frame 0.

## 4. Viral-grade edit checklist
- New visual every sentence: camera punch-in/offset on each sentence cut
  (spring, scale 1.0→1.15, slight rotate), never a static shot >2s.
- Transitions: whip (translate + blur), zoom-through + white flash, hard cuts.
- Impacts on key words: screen shake, radial speed lines, flash, SFX boom.
- Kinetic "slam" titles for 1–3 word punch lines (scale 2.2→1, stagger).
- Captions: 1–2 words per page, heavy display font, thick stroke, slam-in with
  random tilt, active word in accent, key nouns in the hero color. Hide them
  when a full-screen title says the same thing.
- Music follows the story: drop out at the problem, tick/pulse during the
  choice, dark at the consequence, build into the lesson, button at the end.
  Drive section times from the timing JSON, not hard-coded seconds.
- Word-synced everything: look up frames by spoken word
  (`w(beat, "word", nth)`), never by sentence index (quotes and ellipses
  merge or split sentences unpredictably).
- Keep top text below ~y=330 and captions above ~y=1500 (9:16 safe zones);
  give camera transforms a high `transformOrigin` so punch-ins don't push
  top text out of frame.

## 5. Arabic versions
- **Ask first whether the user already has a TTS setup** and reuse it. Known-good Egyptian setup:
  Gemini TTS, model `gemini-2.5-flash-preview-tts`, voice `Charon`, persona prompt: warm Cairo man in
  his 30s sending a voice note to a close friend, conversational, "Arabic → Egyptian only, never MSA or
  Gulf". Prepend the persona to the transcript; one call per beat keeps the delivery natural.
- **Lock the dialect from the audience, not from what a free voice can pronounce.** Free Arabic voices
  (Piper ar_JO etc.) read MSA only and sound robotic; users reject them.
- **Sentence breaks in per-beat audio:** pick the pauses whose midpoints best match each sentence's share
  of characters (DP), not simply the longest pauses — comma pauses are often longer than sentence ends.
- **Fonts:** use a FULL Arabic display font file (e.g. Lalezar TTF from google/fonts on GitHub) placed in
  the theme's font stack (`'Lilita One', Lalezar`). Subset files miss `؟`, `،` and Arabic digits and
  Chrome then shapes the whole run in a thin fallback font. `unicode-range` faces under the Latin family
  name did not fall back reliably. Test a line with `؟` and ٠١٢ before rendering.
- RTL: `direction: rtl` on caption and title rows, word-level animation only, Arabic digits via a helper,
  strip tashkeel for display (keep it in the TTS text).
- Map every word-anchored cue to the Arabic word spoken at the same moment, and keep the same sentence
  count per beat as the source language so sentence-indexed cuts still line up.
- **Mixed Arabic + English captions:** merge consecutive English words into one token rendered
  `direction: ltr; unicode-bidi: isolate`, or "API key" reads "key API" in the RTL row. Drop caption
  punctuation; a period or `،` next to an English word lands on the wrong side. Never letter-space
  Arabic text (it breaks the joining), so uppercase/tracked label styles need an Arabic variant.
- Keep code, emails and URLs in `direction: ltr` cards inside the RTL stage; flip directional
  graphics (flow arrows, packets moving harness → model) to run right to left.

## 6. Multi-part Shorts
- Split long stories into ~60–90s parts: Part 1 = hook → story → cliffhanger, Part 2 = 5–8s recap →
  rest → save-worthy summary card + comment question.
- **Confirm the split point in one line before rendering** (where Part 1 ends / Part 2 begins). It is a
  story decision and a wrong guess costs a full re-render.
- Build parts as offset `<Sequence from={-start}>` windows over the long composition plus new
  recap/cliffhanger segments; no scene code is duplicated.

## 7. Product and tool videos (lessons from the VeilLLM Short)
- **The script's story must be the author's real one.** A plausible story built from the post
  (here: "I almost pasted an API key") was replaced twice before the author gave the true origin
  (friends who wanted local LLMs but needed cloud quality). Ask "what actually made you build
  this?" before writing the first script, and paste the full script into the approval question:
  never ask "script OK?" without the script.
- **Show the real tool.** Run the project's demo and screen-record it with Playwright
  (`recordVideo`; for a vertical frame, a narrow viewport plus `document.body.style.zoom = "2"`
  stacks the layout and keeps text sharp). Warm the app up first, cut slow waits with ffmpeg
  (`trim` + `setpts` + `tpad` to hold the result), and move a camera over the clip (scale +
  translate keyframes) to the part the line is about. Check that numbers on screen match the
  voiceover; here the demo's "23.8ms" proved the "20–50 ms" line.
- **Frame 0 is the thumbnail**: start the hook scene fully composed (entrances with negative delays).
- **Fonts: no module-level `delayRender` around `FontFace.load()`.** It hung random render tabs
  until timeout, even with data URLs and a `setTimeout` fallback. Plain CSS `@font-face` in a
  `<style>` element (files from `public/` via `staticFile`) rendered reliably.
- Caption word timing without Whisper: `examples/scripts/align-vo-gemini.py` has Gemini align
  the script's words, then maps them onto the measured sentence bounds.
- Normalize the master to about -14 LUFS (`loudnorm=I=-14:TP=-1.5`); raw TTS mixes came out near -17.5.

- **Bugs a still pass catches cheaply** (from the yt-factory rebuild of VeilLLM). Render one still per
  scene plus every word-cued moment before the full render:
  - `<Freeze>` around `<OffthreadVideo>` rendered a blank frame. Hold a frame with an `<Img>` of it
    (`ffmpeg -ss <t> -frames:v 1`) instead.
  - Cards with `padding` overflowed the frame: add `* { box-sizing: border-box; }` to the global style.
  - Word cues found "the first `cloud`" in the whole voiceover, not in the scene. Look words up from
    the scene's start time.
  - A camera move over a clip showed empty space above it. Clamp the focus point so the clip always
    covers the view.

## 8. Delivery
- Render, extract a 1-frame-per-4s contact sheet, fix, re-render.
- GitHub rejects files >100 MB: commit a CRF ~24 re-encode, send the
  full-quality file to the user directly.
- Final message: the video, what changed, known limits.
