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
