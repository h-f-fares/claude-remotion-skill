# Long-form YouTube Explainers (article → 5–10 min landscape video)

Lessons from turning a blog post into a 7-minute Egyptian Arabic YouTube video
(`examples/src/v3`). Read with `story-videos.md`, which covers voice, fonts and
Arabic basics.

## 1. Intake
- Ask in one round: language/dialect, voice (reuse the user's TTS setup), length,
  where it goes (YouTube first, then embedded in the post is common).
- Read the FULL article from the repo when it's there, both language versions:
  the translated article already has the right terms for the dialect script.
- Script length: Egyptian Arabic TTS runs at ~2.2 words/s, so ~900 words ≈ 7 min.

## 2. Script structure
1. **Hook (0–30s):** the boldest claim + a second shock ("and I didn't read one
   line of code") + an open loop paid off late ("at the end I'll tell you what it
   cost").
2. **One beat per TTS call, `||` between sentences**, 2–5 sentences per beat.
3. **Chapters = article sections.** Show a chapter card AND list the same
   chapters in the YouTube description; compute timestamps from `timing.json`.
4. **Mid-video reset (~45%):** dark scene, "nice words… but is it actually
   faster?" before the numbers.
5. **Close on a comment question** with two clear choices, then link + subscribe.
- Only use numbers that are in the article. If a TTS workaround forces a
  rewording, check it still matches the article, and tell the user if it doesn't.

## 3. Gemini TTS in practice
- Some lines keep ending with `finishReason: OTHER` (no audio) under a long
  persona prompt, every retry. Fix: retry 3×, then fall back to a shorter persona;
  if that still fails, reword the line. Also expect occasional 429s.
- Per-beat pause detection sometimes finds 0 pauses for a 3-sentence beat. Delete
  that beat's cached pcm and regenerate, and have the timing script spread
  sentences by letter share as a fallback.
- Generate VO in the background (~10 min for 42 beats) and build the kit and
  scenes meanwhile.
- Commit the VO as 192 kbps mp3, not wav (~40 MB for 7 min). Gitignore music/SFX
  wavs that a script regenerates.

## 4. Landscape layout
- At 1920×1080, sizes that look fine in code look EMPTY in frames. Wrap each
  scene in a `Stage` with a `zoom` (~1.12) and lower it per scene for wide
  layouts (timelines, bar rows).
- Reserve the bottom ~240px for subtitles; zoomed content grows past its box and
  collides with the subtitle pill. Check every scene for this.
- `whiteSpace: nowrap` on display text by default. Mixed Arabic + Latin
  ("2,070 KB", "Claude Pro", "الـ agent") wraps badly otherwise.
- Every sentence needs a visual from its first frame. A chapter card over the
  first second, followed by nothing until sentence 2, leaves a blank frame.
- Phones and laptops drawn as devices need content on screen. An empty white
  phone reads as a bug.
- The article's own illustrations make good B-roll (Ken Burns in a framed card)
  and keep the style consistent with the post.

## 5. Verify fast
- `remotion still` re-bundles every call. For a contact sheet, bundle once with
  `@remotion/bundler` and loop `renderStill` (scale 0.5) over one frame per
  sentence (last frame before the next sentence starts): 136 frames in ~2 min.
- Tile 12 per sheet, read the sheets, fix, re-render the sheets, then do the full
  render. After the render, pull frames from the mp4 with ffmpeg and measure
  loudness with `ebur128` (aim for about -16 to -14 LUFS).

## 6. Render and deliver
- 12k frames at 1080p on 4 cores ≈ 30 min. Make the thumbnail composition,
  YouTube copy and brief while it renders.
- Master is ~220 MB at CRF 18. Send that to the user; commit a CRF 28 copy
  (~40 MB) to stay under GitHub's 100 MB limit.
- Deliver: video, 1280×720 thumbnail (one bold claim, a crossed-out "before"
  object, the hero device), 3 title options, description with chapters, tags.

## 7. Shell gotcha
- `pkill -f <script-name>` also matches the shell running the command and kills
  it. Use `pgrep -f "python3 scripts/<name>"`, then `kill <pid>`.
