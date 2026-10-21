---
name: yt-factory
description: >-
  Take a raw idea or intent all the way to a finished, rendered YouTube video
  (long-form, Shorts, or both; Arabic, English, or both), one approved step at
  a time: research, angle, packaging, hook, script, voice, visuals, Remotion
  render, Shorts, description. Use for "yt-factory", "make a video from this
  idea", "turn this into a YouTube video", "full video from scratch", or any
  request to go from idea to finished video.
---

# yt-factory

One idea in, one finished and approved video out. This skill does not do the work itself: it runs
the other skills in order and stops at every step for the user to choose.

## How every step runs

The same shape every time, and nothing moves on without an answer:

1. **One or two lines of context.** What this step decides, and anything the research found.
2. **Options with a recommendation.** Use `AskUserQuestion`, 2-4 options, the recommended one first
   and labelled "(Recommended)", each with a one-line reason. Show real drafts in the options, not
   descriptions of drafts.
3. **Wait.** Never pick for the user and never fill a gap with a guess. If an answer is missing, ask.
4. **Log it.** Write the decision to the state file (below) before starting the next step.

Keep messages short. The user reads them on a phone. No recaps of earlier steps unless asked.

Research when a step needs facts: use WebSearch for numbers, claims and what is working in the niche,
and cite the source in the state file. Never invent a number, a result or a quote. If a figure would
help and cannot be found, say so and write the line without it.

## State file: resume anywhere

Every video lives in `videos/<slug>/`, with its own Remotion project (same layout as `fathers-day/`).
Tools live in `tools/` next to this file; run them from the video's folder (paths below are relative
to this skill).
Create `videos/<slug>/FACTORY.md` at step 1 and keep it current:

```markdown
# <working title>
format: long | short | both     language: ar (Egyptian) | en | both     length: ~
## Steps
- [x] 1 Intake: <decision>
- [ ] 2 Research
...
## Decisions
<each approved choice, word for word: the angle, title, hook, script version, voice id, palette>
## Sources
<every fact used in the script, with its link>
```

When this skill starts and a `FACTORY.md` already exists for the idea, read it, say which step is
next in one line, and carry on from there.

## Before step 1

- Read `.claude/youtube/voice.md`. If it is missing, ask whether to build it now from three of the
  user's videos (the `yt-script` skill explains how) or skip it for this video.
- Read the `remotion-motion-graphics` skill (`remotion-motion-graphics/SKILL.md`) and its
  `references/story-videos.md`. Its build, render and verify rules apply in full. Its "ask once,
  then build straight through" rule does **not** apply here: this skill stops at every step.

## The steps

### 1. Intake
Ask in one `AskUserQuestion` call: **format** (long video / Short / both), **language** (Arabic, with
the dialect / English / both), **target length**, and **who it is for** (one specific viewer). Repeat
the idea back as one sentence and ask whether that is it.

Then ask for **the real story**: "what actually made you build / learn / notice this?" Never build
the video on a plausible story drawn from a post or README. On VeilLLM a made-up origin was replaced
twice before the true one came out. If the video is about a product or tool, also ask for its repo
or a running demo (step 8 records it).

### 2. Research
Find what is already working on this topic. Collect 4+ videos from each of 3-6 channels in the niche
(`yt-dlp --flat-playlist -J <channel>` if it is installed, otherwise web search and public pages) and
run `yt-viral` (`swipe.py`). Check first that YouTube is reachable (`curl -sI https://www.youtube.com`);
cloud sessions often block it. If it is blocked, say so in one line, skip the outlier ranking and
rely on WebSearch. Add a quick WebSearch for recent news or data on the topic. Show the top
3 outliers (multiple, title, formula) and the one thing they share. Ask: is this the right niche to
compare against, or should the research look somewhere else?

### 3. Angle
Write 3 angles for the idea, each as **the one sentence the video promises**, each tied to what
the research found. Recommend one. This sentence is the brief for every later step.

### 4. Packaging (before the script)
Run `yt-package`: ten titles through `title.py`, top three shown with scores, and a thumbnail concept
for each (3 words max, the expression or visual, the background). For a Short, the on-screen hook
text replaces the thumbnail. `title.py` does not check facts: every number in a title must match a
source in the state file ("في 20ms" is wrong when the source says 20-50 ms). Package first, because the script has to deliver what the title promises.

### 5. Hook
Run `yt-script` hooks: five off `hooks.json`, scored with `hookscore.py`, top two shown with their
panels. The hook must confirm the chosen title in its first sentence.

### 6. Script
Write the full script with `yt-script`, beat by beat with `[ON SCREEN: ...]` on every beat, at the
pace of the chosen voice (~150 wpm English, ~120 wpm narrated story). For a Short, follow the
structure in `story-videos.md` §3. Fact-check every claim with WebSearch and list the sources. Show
the runtime estimate. Paste the **full script inside the approval question**, never "script OK?"
without it. Ask: approve it, or which beat to change. Loop until approved. The user owns the hook
and the closing comment question: offer options, but use their words when they give them.

For "both languages": approve the first-language script, then write the second as a native
adaptation (not a translation) and approve that separately.

### 7. Voice
Write the approved script as `voice/script.json`, **one sentence per line**, each with the pause that
follows it (`after`). Give a line a long pause (1-2 s) when the picture under it has to be read (a
demo result, a code card). Several short sentences in one TTS call come out rushed (VeilLLM: three
proof lines in 3.5 s). Format and options: `tools/vo.py`.

1. **Timing voice first, free:** `python3 tools/vo.py voice/script.json --scratch` writes a silent
   track with estimated timings, plus `src/vo.json` and `src/words.json`. Build and review the whole
   video (steps 8-9) against it. Script edits now cost nothing.
2. **The real voice:** ask whether the user already has a voice setup and reuse it (for Egyptian
   Arabic, the known-good one is Gemini TTS, voice Charon, `story-videos.md` §5). Otherwise check
   what works (`story-videos.md` §2): the ElevenLabs connector, Gemini TTS if a key is set. Offer 2-3
   voices, rendered as the **hook line only** (one take each). Say what the full run costs before
   running it.
3. `python3 tools/vo.py voice/script.json`, then align the words
   (`examples/scripts/align-vo-gemini.py`). Takes are cached per line id and text, so re-doing one
   line re-generates only that line.
4. **Check the pronunciation before the user hears it:** `python3 tools/pron.py voice/vo.wav
   voice/script.json`. Fix each finding with a `say` respelling on that line (the caption keeps the
   normal spelling) and re-generate. For Egyptian, put the dialect's sounds in the persona too
   (ق = glottal stop, ج = g, ث = s/t) and ask for a calm pace: Gemini read VeilLLM too fast and with
   formal ق/ج/ث until it was told. Gemini Pro TTS allows 50 requests a day: count the lines first. Scenes cued from the words move with the new timing; re-check
   the cues on any changed line.

### 8. Look and storyboard
Offer 2-3 visual directions: a palette from `references/design-rules.md`, a font (for Arabic, a
full font file such as Lalezar), the caption style, and whether to use generated stills or pure
motion graphics. Render 2-4 style frames of the most different beats and approve the look first.

For a product or tool video, **show the real tool**: run its demo, screen-record it with Playwright
and cut it as `story-videos.md` §7 describes, and check that numbers on screen match the voiceover.

Then draw every scene in the approved look and render the board:
`node tools/storyboard.mjs <CompositionId>` gives one numbered panel per scene of `src/vo.json`.
Ask for thumbs up or down **by panel number**, redraw the rejected ones, repeat. The panels are the
video's own scenes, so nothing is redrawn later.

**Phone rules** (9:16, 1080x1920; `tools/review.mjs` measures them):
- Everything that matters sits inside x 60-1020, y 250-1500. The platform UI covers the rest. The
  caption line must end above y 1500.
- Text is at least 40 px (captions at least 50 px); anything that must be seen is at least ~100 px.
  Screen recordings count too: record at a zoom where their text stays at 40 px or more.
- Something new on screen at least every 3 s.

### 9. Build and render
Build in `videos/<slug>/` following the remotion skill: theme, five-layer stack, captions synced to
the voice timings, SFX and music. For a Short, frame 0 is the thumbnail: the hook scene starts fully
composed.

**Sound:** with a voice, the voice is the clock. Put the big hit (bass, slam) in the **pause before**
the line that names it, not under speech, where the voice masks it. Drop the music for about a second
before the turn. Normalise the master to -14 LUFS (`loudnorm=I=-14:TP=-2`, two passes; AAC overshoots a -1.5 target past -1 dBTP).

**Review is measured, not eyeballed.** Copy `tools/TextCheck.tsx` into `src/` and render
`<TextCheck />` as the last child of the composition (it does nothing in a normal render). Then:
1. While building: `node tools/review.mjs <CompositionId>` checks the text on a still every second
   (cut off, outside the safe area, too small, overlapping). Much cheaper than a full render.
2. After the render: `node tools/review.mjs <CompositionId> <video.mp4>` adds dead stretches and
   loudness. It must PASS (warnings are allowed when you can say why).
3. Look at a contact sheet too (one frame every 4 s): the review can't judge taste.

Show the user the video, the contact sheet and the review numbers. Ask: approve, or list what to
change (by timestamp). Loop until approved.

### 10. Shorts (when the format is long or both)
Run `yt-shorts` on the voiceover transcript. Show the top 3-5 candidates with timecodes and the new
first line for each. Build the chosen ones as vertical compositions over the same scenes (offset
`<Sequence>` windows, `story-videos.md` §6), render, verify, and approve each one.

### 11. Publish pack
- **Thumbnail:** render the approved concept as a 1280x720 `remotion still`, check it at feed size,
  and show it with 2 alternatives.
- **Description and tags:** `yt-seo`, with the three search queries it should win.
- **Chapters** (long form): write an `.srt` from the voice timings and run `yt-chapters`
  (`chapters.py`), then retitle each chapter in the user's voice.
- **Shorts:** a title and description for each.
Approve each item.

### 12. Final approval
One message: the video file(s), thumbnail, title, description, chapters, and Shorts, each with its
path. Ask for a final approval. After it: commit `videos/<slug>/` (re-encode at CRF ~24 if any file is
over 100 MB and send the full-quality file directly), push, and mark `FACTORY.md` done.

### 13. Learn
Append a `## Log` to `FACTORY.md`: what went wrong, what the review caught, and the weakest scene
with what would fix it. If something new went wrong or worked, propose a one-line rule for this
skill, the `yt-*` skills or the remotion skill, and add it when the user agrees.

## The gate

Nothing here uploads or publishes anything. The user uploads to YouTube. The last line of the run is:
**ready to upload, or change something?**
