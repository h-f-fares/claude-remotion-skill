# yt-factory test: VeilLLM Short from scratch

The VeilLLM Short rebuilt by following `/yt-factory` from step 0 to step 12, with the user's answers
simulated from the real VeilLLM decisions. The finished cut to compare against is
`examples/videos/veilllm/veilllm-short-ar.mp4`.

## What the factory produced

| Step | Result |
|---|---|
| 1 Intake | Short, Egyptian Arabic, ~60s. The real-story question got the friends story, not the blog post's API-key story |
| 2 Research | WebSearch only (YouTube blocked) |
| 3 Angle | Same angle as the real video |
| 4 Packaging | 10 titles; picked "داتا عملائك بتروح فين لما تكلّم الـ AI؟" (100) |
| 5 Hook | 5 hooks; picked a Reveal hook at 56 (the real video's hook scores 53) |
| 6 Script | 10 lines, ~135 words; adds the one-line install the real video folds into the latency line |
| 7 Voice | Gemini Pro TTS, Charon, reused |
| 8 Look | "Redacted file" style; existing demo recording reused |
| 9 Render | 62s, 1080x1920; checked with 25 stills before the full render |
| 11 Publish | Title, description, tags, pinned comment in `youtube.md` |

## Problems found and fixed in this run

**Scoring tools**
- Egyptian present-tense verbs (بتسرّب, بتخرج) were not recognised as stakes. Fixed: the بـ / هـ / عم prefix is stripped before matching.
- Arabic number words ("سطر واحد") did not count as a number. Fixed in `title.py` and `hookscore.py`.
- English output of every tool is unchanged (checked against the original pack).

**Flow (`yt-factory/SKILL.md`, now updated)**
- Step 2 assumed YouTube is reachable. It is blocked in cloud sessions, so `yt-viral` cannot run. Now: check first, then say so and use WebSearch.
- Step 4: `title.py` does not check facts. A title said "في 20ms" while the source says 20-50 ms. Now: every number in a title must match a source.
- Step 7: three short proof sentences in one TTS call came out in 3.5 s, too fast to read the demo. Now: one line per proof sentence, plus 1-2 s holds, decided before generating.
- Step 8: the reused recording's text is ~27 px on a 1080 wide frame, small on a phone. Now: record at ~40 px or more.
- Step 9: a still pass across the whole video before the full render caught 4 bugs (below) cheaply. Now a required step.

**Remotion bugs caught by the still pass** (now in the remotion skill)
- `<Freeze>` around `<OffthreadVideo>` rendered a blank frame. A still image of that frame works.
- Cards with `padding` overflowed the frame: the theme has no `box-sizing: border-box`.
- Word cues looked up "the first `cloud`" across the whole voiceover, not inside the scene. Search from the scene's start.
- A camera move over a clip can show empty space above it. Clamp the focus point so the clip always covers the frame.

## Added after the run (ideas from cth9191/animate)
- `tools/review.mjs` + `tools/TextCheck.tsx`: measured text, dead-stretch and loudness checks. On this
  video it found what the contact sheets missed: **every caption sat ~60px below the phone-safe line**
  (y 1500). Captions moved up; the review now passes (0 fail; warnings for 30-36px labels).
- `tools/vo.py`: one sentence per line with its own pause, a free silent timing voice (`--scratch`),
  takes cached per line id instead of line number.
- `tools/storyboard.mjs`: one numbered panel per scene, rendered from the real scenes.
- Phone numbers, the "hit in the pause" sound rule and a Learn step in the factory; the four bugs
  above in the remotion skill (`story-videos.md` §7, design-rules checklist).

## Not tested
- Real user choices (simulated from the finished video).
- `yt-viral` outlier ranking (no YouTube access).
- Screen-recording a fresh demo (the existing one was reused).
- Steps 10 and chapters (do not apply to a Short).
