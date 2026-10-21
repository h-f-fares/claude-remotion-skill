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

### 2. Research
Find what is already working on this topic. Collect 4+ videos from each of 3-6 channels in the niche
(`yt-dlp --flat-playlist -J <channel>` if it is installed, otherwise web search and public pages) and
run `yt-viral` (`swipe.py`). Add a quick WebSearch for recent news or data on the topic. Show the top
3 outliers (multiple, title, formula) and the one thing they share. Ask: is this the right niche to
compare against, or should the research look somewhere else?

### 3. Angle
Write 3 angles for the idea, each as **the one sentence the video promises**, each tied to what
the research found. Recommend one. This sentence is the brief for every later step.

### 4. Packaging (before the script)
Run `yt-package`: ten titles through `title.py`, top three shown with scores, and a thumbnail concept
for each (3 words max, the expression or visual, the background). For a Short, the on-screen hook
text replaces the thumbnail. Package first, because the script has to deliver what the title promises.

### 5. Hook
Run `yt-script` hooks: five off `hooks.json`, scored with `hookscore.py`, top two shown with their
panels. The hook must confirm the chosen title in its first sentence.

### 6. Script
Write the full script with `yt-script`, beat by beat with `[ON SCREEN: ...]` on every beat, at the
pace of the chosen voice (~150 wpm English, ~120 wpm narrated story). For a Short, follow the
structure in `story-videos.md` §3. Fact-check every claim with WebSearch and list the sources. Show
the runtime estimate. Ask: approve it, or which beat to change. Loop until approved.

For "both languages": approve the first-language script, then write the second as a native
adaptation (not a translation) and approve that separately.

### 7. Voice
Check what actually works first (`story-videos.md` §2): the ElevenLabs connector, Gemini TTS if a
key is set, Kokoro offline. Offer 2-3 voices that work, rendered as the **hook line only**, so the
user hears them before choosing. After approval, generate the full voiceover, one call per beat,
and keep the word timings (they drive captions, cuts and chapters).

### 8. Look and storyboard
Offer 2-3 visual directions: a palette from `references/design-rules.md`, a font (for Arabic, a
full font file such as Lalezar), the caption style, and whether to use generated stills or pure
motion graphics. Then a storyboard: one line per beat with what is on screen and the transition.
Render 3-4 key frames with `npx remotion still` and show them. Approve the look before the full build.

### 9. Build and render
Build in `videos/<slug>/` following the remotion skill: theme, five-layer stack, captions synced to
the voice timings, SFX and music. Render, extract a contact sheet (one frame every 4s), fix what is
wrong, and re-render. Then show the user the video and the contact sheet. Ask: approve, or list what
to change (by timestamp). Loop until approved.

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

## The gate

Nothing here uploads or publishes anything. The user uploads to YouTube. The last line of the run is:
**ready to upload, or change something?**
