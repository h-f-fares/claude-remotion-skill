# v3-portfolio — Brief

Source: https://hfares.com/blog/v3-portfolio/ ("Version Three: I Rebuilt My Site From My Phone")

## Choices
- Format: YouTube landscape, 1920x1080, 30 fps, H.264 + AAC
- Language: Egyptian Arabic voice and on-screen text; tech terms (PR, merge, token) kept in English
- Voice: Gemini TTS `gemini-2.5-flash-preview-tts`, voice `Charon`, Egyptian tech-YouTuber persona, one call per beat
  (`scripts/gen-v3-vo-ar-gemini.py`; falls back to a shorter persona when a line keeps ending with finishReason OTHER)
- Length: 6:52 (42 beats, 136 sentences, ~890 words)
- Music + SFX: synthesized in code (`scripts/gen-v3-audio.mjs`), royalty-free; sections follow the VO timing

## Script
`vo-ar.txt` — one beat per line, `||` between sentences. Structure: hook (built from the phone, never read
the code, bill teaser) → intro → 9 chapters following the article → comment question → end card.
All numbers come from the article (V1 $15/3 days, V2 37M tokens/$0.87, 10:03→20:36, 2h vs 10.5h,
845 KB bundle, 198.5→16.3 MB, Lighthouse 50→74 / 87→100 / 85→100, LCP 11.3→5.1 s, 2,070→1,122 KB,
15 review findings, 1M tokens vs ~400 lines, $20 Pro vs ~$72 API, PostHog live 15:06).

## Style
- Sketchbook look matching the article's illustrations and hfares.com: warm paper `#F4ECDD`, ink `#1E2A2E`,
  teal hero `#0F6B66`, orange for "me / before", mustard highlights
- IBM Plex Sans Arabic (site font), bundled in `public/fonts`
- Ink-outlined cards and chips with offset shadows, line icons drawn in SVG, the article's 10 illustrations
  as B-roll with Ken Burns
- Every sentence lands a new visual; gentle camera punch-in on each sentence cut; chapter cards
  with whoosh; slams + flash + shake on the big beats ("V3", "أرقام", "0 diff", "أنا كنت الحد ده")
- Subtitles: 2–5 word pages, active word teal, numbers mustard
- Dark beats: mid-video reset (21), "I didn't read the code" (30), "I was that someone" (34)

## Build
```bash
npm run vo:v3       # Gemini TTS (needs GEMINI_API_KEY) + timing.json + vo.mp3
npm run audio:v3    # music + SFX
npm run render:v3   # out/v3-portfolio-ar.mp4
npm run thumb:v3    # thumbnail PNG
```

## 5-minute cut (`src/v3b`, `vo-ar-v2.txt`, `audio-v2/`)
Feedback on the first cut: background too light and flat, no real screenshots of the three versions,
too long, subtitles burned in.
- Hook: real V1 (2025) recording, then V3 (2026) slides in beside it
- Real footage in `public/videos/v3-portfolio/site/`: V1 (commit 3f4dcb1, Oct 2025), V2 (9f49b6b, before PR #5)
  and V3 (main) run locally, screenshotted and scroll-recorded with Playwright; Lighthouse 12 mobile run on
  the V2 and V3 static builds (47→71, 87→100, 85→100, LCP 12.3→5.1 s, 2,051→1,154 KiB); PR titles and
  line counts for #5–#8 and the Cloudflare preview comment from GitHub
- Lighthouse scores vary per run (article: 50→74), so the VO says "+20 points" and "accessibility and SEO hit 100"
- Stage: dark base, two slow accent glows (one accent per chapter), perspective grid, blurred screenshot of the
  section's version behind, grain + vignette; real footage in browser frames with 3D tilt
- No burned-in subtitles; `v3-portfolio-ar-cut.srt` for YouTube CC
- 30 beats, 80 sentences, 585 words, 4:22

## Showcase cut (`src/v3c`, `vo-ar-v3.txt`, `audio-v3/`)
Feedback on the 4-minute cut: focus on blog pages, not the home page or the portrait; the audience is
people in the field who dislike showing off; frame it as a personal story whose point is that the viewer
understands how it was done and can repeat it.
- Structure: short story (V1→V2→V3 blog pages, article page before/after) → 7 numbered steps → lessons →
  cost (plain, no API comparison) → recap → comment question
- Steps come from the PRs (#5–#8 bodies, the Checks section of #8, the Cloudflare preview comment) and
  CLAUDE.md. The preview and Lighthouse rules were added to CLAUDE.md at the end of that day (PRs #9/#11),
  so the VO presents them as "what I added afterwards"
- Tone: "I didn't review line by line, and that's a risk" instead of "0 diff"; no time/cost bragging
- Footage: blog list (V1/V2/V3, Arabic, dark), article pages (V2 vs V3), a 390px mobile recording for the
  preview step; no home page, no portrait
- 23 beats, 57 sentences, 509 words, ~3:40

## Beginner cut (`src/v3d`, `vo-ar-v4.txt`, `audio-v4/`)
Feedback on the showcase cut: still too technical; simplify for a wide audience (beginners in the field),
move technical steps to the blog post.
- Article: new section 10 "Step by Step, If You Want to Try It" (EN + AR) in Personal-website PR #14, with
  the eight technical steps from the PRs and CLAUDE.md; the video points there
- Video: every term explained once in plain words (Claude Code = "a helper programmer you talk to"; the
  CLAUDE.md = "a file that briefs it like a new colleague"; preview = "a link with a test copy of the site");
  no PR, diff, CLAUDE.md, artifacts or Lighthouse jargon on screen except one labelled report
- 16 beats, 44 sentences, 347 words, ~2:32
