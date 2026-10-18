# Squirrel Burger — Brief

Source: https://hfares.com/blog/the-squirrel-burger-story/

## Stage 1 — approved
- Language: English
- Story: Ray's squirrel burger (original Ken Schwaber legend)
- Tone: dark-funny
- Length: 30–45s
- Format: 1080x1920, 30fps, H.264 MP4 + AAC (defaults)

## Stage 2 — script approved
See script.md

## Stage 3 — audio choices
- Voice: Piper TTS offline, en_US ryan-high (ElevenLabs free tier blocked; Gemini out of credits)
  - LICENSE: ryan voice is CC BY-NC-SA 4.0 — non-commercial use only
- Music: quirky diner jazz, generated in code, royalty-free; darker at hospital scene
- SFX: yes (sizzle, whoosh, siren, paper spin, pops), generated in code
- Captions: word-by-word highlight, lower-middle

## Stage 3 — audio approved
- public/videos/squirrel-burger/audio/vo.wav (33.6s, -16 LUFS, 0.5s lead-in)
- timing.json: scene starts + word timings (silence-detected phrases, words weighted by length; Whisper not reachable)
- music.wav + SFX: scripts/gen-squirrel-audio.mjs (original, synthesized)
- Total video length: 36s (1080 frames @30fps)
- Scene starts (s): 1:0.5 2:3.05 3:7.4 4:9.12 5:13.1 6:17.14 7:19.02 8:22.78 9:28.45 10:32.2

## Stage 4 — style guide: Retro diner cartoon
- Palette: cream #FFF3DC (bg), cherry #E63946 (hero, max 1 element/frame), mint #7FD8BE, mustard #F4B942,
  ink #2B2118 (all outlines, 6px), squirrel brown #A0603A, night navy #1D2B4F, dark #14161F
- Fonts: Lilita One (display, signs, titles), Fredoka 700 (captions)
- Shapes: flat 2D SVG, thick rounded ink outlines, chunky rounded rects, halftone-dot texture
- Backgrounds: diner interior (cream wall, mint wainscot, red/cream checker floor), night exterior, dark drama
- Motion: springs (snappy/bouncy) for pops, bezier out for slides; entrances = fade+rise+scale; 3–5 frame staggers;
  idle bob/breathe on everything >2s; squash & stretch on landings
- Transitions: 8-frame scale-through overlaps between scenes, whoosh on big cuts
- Captions: word-by-word, 1–3 words/page, cream with ink stroke, active word mustard + pop, y≈1360
- Layers: bg + mesh blobs → art → type → warm grade → grain → vignette
- Fonts bundled: public/fonts/LilitaOne.woff2, Fredoka-Bold.woff2 (OFL; Chrome here rejects the proxy cert for gstatic)
- Source: src/squirrel/ (separate entry src/squirrel/index.ts), comp id SquirrelBurger, 1080 frames

## Stage 4 — keyframes rendered (awaiting approval): videos/squirrel-burger/keyframes/
