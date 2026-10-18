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

## Stage 3 — produced (awaiting approval)
- public/videos/squirrel-burger/audio/vo.wav (33.6s, -16 LUFS, 0.5s lead-in)
- timing.json: scene starts + word timings (silence-detected phrases, words weighted by length; Whisper not reachable)
- music.wav + SFX: scripts/gen-squirrel-audio.mjs (original, synthesized)
- Total video length: 36s (1080 frames @30fps)
- Scene starts (s): 1:0.5 2:3.05 3:7.4 4:9.12 5:13.1 6:17.14 7:19.02 8:22.78 9:28.45 10:32.2
