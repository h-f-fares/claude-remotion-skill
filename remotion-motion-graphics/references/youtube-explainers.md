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
5. **Close on a comment question** with two clear choices, then link + subscribe,
   then a callback line that loops back to the hook visual.
- **Every re-cut keeps this structure.** Simplifying or shortening a script once
  dropped the before/after hook, the open loop, the mid-video reset and the
  subscribe + callback close, and the user had to point it out again. Before
  writing each new script version, tick off: hook visual in the first second,
  open loop, its payoff, mid-video reset, two-choice question, link,
  subscribe, callback.
- **Ask who the audience is before writing the hook.** For practitioners, a
  "look what I did" hook ("0 diffs read", "2 hours", "$20 instead of $72") reads
  as bragging. Frame it as a showcase: a short personal story, then numbered
  steps the viewer can repeat, then honest lessons and risks. Build the steps
  from real artifacts (PR descriptions, their Checks sections, CLAUDE.md), and
  say when a rule was written after the fact.
- For a wide audience, explain each term once in plain words ("a helper
  programmer you talk to", "a link with a test copy of the site") and move the
  technical steps into the article; the video points there. Ask the audience
  level (non-technical vs beginner) before rewriting.
- Don't show the person's portrait or home page unless they ask; the content
  pages (blog list, articles) carry the story better.
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
- Stills don't catch hook-order bugs: `renderStill` mounts each frame fresh, but
  a full render re-renders the same component frame after frame. A hook after
  an early `return null` (e.g. `if (frame > 42) return null; useBob()`) passes
  every still and then crashes the render minutes in (React error #300). Call
  all hooks before any early return.

## 6. Render and deliver
- 12k frames at 1080p on 4 cores ≈ 30 min. Make the thumbnail composition,
  YouTube copy and brief while it renders.
- Master is ~220 MB at CRF 18. Send that to the user; commit a CRF 28 copy
  (~40 MB) to stay under GitHub's 100 MB limit.
- Deliver: video, 1280×720 thumbnail, 3 title options, description with
  chapters, tags.
- Thumbnail (rejected as "worse than a basic Canva one" when it was a small
  browser screenshot + 4 lines of text on a flat dark stage): one focal point,
  at most 3 words, readable at phone size. Ask face or no face first. Recipe
  that worked: face cut out with `rembg` (`isnet-general-use`, alpha matting),
  big on one side with a coloured rim light (`drop-shadow` glow) and a strong
  radial key light behind; a phone showing the real page; 2 lines of huge text
  (second word in yellow, slight tilt). Build it at native 1280×720 and check
  that nothing overlaps.
- Before designing, ask for (or look at) the channel's existing thumbnails and
  match its style (here: dark + red diagonal, white-outlined face on the right,
  three short stacked lines with the key line in red). Use the author's own
  words for the text; Arabic text goes on the left, right-aligned to one edge.
  Render 3–4 layouts side by side and let the author pick.

## 7. Shell gotcha
- `pkill -f <pattern>` AND `pgrep -f <pattern>` match the shell running the
  command (its command line contains the pattern) and kill it. Anchor the
  pattern to the process start: `pgrep -f "^python3 scripts/<name>"`.

## 8. Real footage beats illustration (feedback on the first cut)
- A "story of my site/app" video needs PROOF on screen: screenshots and scroll
  recordings of each version, real PRs, real reports. Drawn cards alone read as
  generic.
- Old versions are in git: `git fetch --unshallow`, `git worktree add` each
  version's commit, `npm ci`, run it (dev server, or the static build served
  with `python3 -m http.server`), then Playwright: screenshots at 1440×900 and
  390×844, click the cookie "Accept" button first, and `recordVideo` while
  scrolling with an eased `scrollTo` loop. Trim the load time with
  `ffmpeg -sseof -8.4`. Fall back to web.archive.org or the PR preview links.
- Private repo pages can't be screenshotted: rebuild a GitHub-style row from
  the PR data (title, +/− lines, merged badge) via the GitHub tools.
- Re-running a benchmark (Lighthouse) gives slightly different numbers than the
  article. Show the real report and phrase the VO so both are true ("+20
  points", "hit 100").
- Inside a browser frame, wrap `<OffthreadVideo>` in `<Sequence from={appearFrame}>`
  so the recording starts when the frame appears, not mid-scroll.

## 9. Backgrounds and subtitles
- A light flat background for 5+ minutes reads as cheap. Use a dark base with
  slow accent glows (one accent colour per chapter), a faint perspective grid,
  and a heavily blurred screenshot of the current version behind for depth;
  keep cards light or glass so they pop.
- Don't burn subtitles into long-form YouTube videos: ship an `.srt` (one cue per
  sentence from `timing.json`) and upload it as CC.
