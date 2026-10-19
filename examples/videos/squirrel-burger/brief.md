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
- Keyframes approved.

## Stage 5/6 — rendered + reviewed
- videos/squirrel-burger/squirrel-burger.mp4 (1080x1920, 30fps, 36s, H.264+AAC, -15.8 LUFS)
- Cover: videos/squirrel-burger/squirrel-burger-cover.png (frame 85)
- Review fixes: squirrel hidden until the reveal (clip + patty swap), caption word spacing, ✓/✗ as SVG
- Loop: last frame = empty diner counter = frame 0
- Re-render: npm run render:squirrel (add --browser-executable in sandboxes)

## Post copy
Title: He Ordered a Burger. He Got a Squirrel. 🐿️🍔
Description: The weirdest lesson in Agile, in 36 seconds. When the deadline is impossible, cut scope, never quality. Story via Ken Schwaber's Scrum legend. Full story: hfares.com/blog/the-squirrel-burger-story/
Hashtags: #agile #scrum #softwareengineering #productmanagement #techdebt #shorts

## v2 — long cut (2:03), "viral grade" pass
- Feedback on v1: edit not standing out; story too fast → expand to ~2 min
- Voice: Kokoro-82M (Apache-2.0, commercial OK), voice am_michael, speed 1.05; model from github.com/thewh1teagle/kokoro-onnx releases
- Script: script-v2.md (17 beats). Beats 2–7 retold per user: Ray alone at closing, one last old customer, no ground beef, manager rule "never turn a customer away", dead squirrel seen out back earlier, skinned (off-screen) + ground + grilled
- Audio: vo2.wav, timing2.json (sentence-level synthesis + silence-based word alignment), music2.wav (sections follow beats), new SFX riser/scratch/boom/tick
- Edit: camera punch-in on every sentence, whip/zoom/flash transitions, impact shakes + speed lines, kinetic slam titles, 1–2 word captions (Lilita, key words cherry)
- Source: src/squirrel/long/, comp SquirrelBurgerLong (3720 frames); npm run render:squirrel-long
- Output: videos/squirrel-burger/squirrel-burger-long.mp4 (-16.6 LUFS), cover squirrel-burger-long-cover.png

## v4 — Arabic cut (SquirrelBurgerLongAR, ~2:18)
- Voice: user asked for a free Arabic voice understood in Egypt, the Gulf and the Levant → simplified MSA script (vo-ar.txt, fully diacritized for TTS)
- TTS: Piper ar_JO-SA_miro-high via sherpa-onnx (model from k2-fsa/sherpa-onnx GitHub releases; Edge TTS, Hugging Face and Gemini were unreachable or out of credits; ElevenLabs needs a paid plan)
- Same 17 beats and sentence counts as English; scenes share code, language set via composition prop (setLang), English anchor words mapped to Arabic in long/timing.ts
- Captions RTL, tashkeel stripped for display; all on-screen titles translated (tr()); Arabic digits in badges
- Font: Lalezar (OFL, full TTF from google/fonts on GitHub) as fallback in the theme font stacks
- Audio: vo-ar.wav, timing-ar.json, music-ar.wav (LANG_CUT=ar node scripts/gen-squirrel-audio.mjs)
- Render: npm run render:squirrel-long-ar

## v5 — Arabic cut re-voiced in Egyptian (user's Gemini setup)
- User feedback: Piper Arabic voice "very bad"; asked for a well-reviewed free voice. Edge TTS / Hugging Face blocked by the
  environment network policy, Google Cloud TTS not enabled on the key; user then shared their own setup:
  Gemini TTS, model gemini-2.5-flash-preview-tts, voice Charon, persona: warm Cairo man in his 30s sending a voice note,
  conversational, Arabic → Egyptian dialect only
- Script: Egyptian (vo-ar.txt, "||" marks sentence breaks; same 17 beats / sentence counts as English)
- One Gemini call per beat for natural flow; sentence breaks = pauses that best match sentence length share (DP), then word timing by phrase pauses
- On-screen titles + caption key words switched to Egyptian; anchor words remapped in long/timing.ts

## v6 — two-part Shorts (Arabic), from the research pass
- Research: completion rate drives Shorts distribution; entertainment does best under ~90s; first-second hook decides swipe-away
- Part 1 (SquirrelPart1AR, ~65s): hook = burger on screen at frame 0 with the tail poking out + open question title
  "ليه السنجاب ده بيتدرّس للمبرمجين؟"; story to the bite; ending per user: the old man loved it and ate it all ("يمّ!"), then cliffhanger
- Part 2 (SquirrelPart2AR, ~97s): recap (he loved it… "بس…"), then per user it opens on the hospital → headline → legend → lessons, then a save-worthy
  lessons card (٣ دروس) + comment question
- Extra Gemini lines (Charon + persona): audio/seg-ar-{p1end,p2intro,p2cta}.wav, segments-ar.json
- Source: src/squirrel/long/Parts.tsx (reuses the long cut via offset Sequences)
