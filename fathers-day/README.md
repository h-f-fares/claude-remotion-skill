# The Day I Became a Father — two-camera montage

9:16 Remotion edit of a Toastmasters speech filmed on two phones.

- **Cameras:** A (front-side, master clock) and B (back of room, synced by audio cross-correlation, `B_OFFSET` in `src/edit.ts`). A third "close-up" angle crops camera A and follows the speaker using hand-marked keyframes (`src/track.json`).
- **Captions:** word-synced, from `scripts/transcript.txt` aligned to offline speech-recognition timings (`scripts/words.aligned.json` → `src/words.json`).
- **Audio:** voice cleaned with ElevenLabs Voice Isolator, then EQ/compression; original synthesized piano/pad bed kept low and ducked under the voice (`scripts/gen-music.py`, `scripts/mix-audio.sh`).

## Rebuild
Footage and audio aren't committed. Put the transcoded clips in `public/` (`camA.mp4` 1080×1920 30fps, `camB.mp4` upscaled to 1080×1920), then:
```bash
npm install
python3 scripts/gen-music.py public/music_raw.wav 390
scripts/mix-audio.sh 1.5 387.3   # needs public/speech_isolated.mp3
npm run render
```
