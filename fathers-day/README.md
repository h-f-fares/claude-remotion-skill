# The Day I Became a Father — two-camera montage

9:16 Remotion edit of a Toastmasters speech filmed on two phones.

- **Cameras:** A (front-side, master clock) and B (back of room, synced by audio cross-correlation, `B_OFFSET` in `src/edit.ts`). A third "close-up" angle crops camera A and follows the speaker using hand-marked keyframes (`src/track.json`).
- **Pacing:** pauses longer than ~1 s are shortened (`scripts/cut-pauses.py` → `src/segments.json`); every cut lands on a camera change so the jump is hidden. The silent moment before the baby cries is kept.
- **Captions:** word-synced, from `scripts/transcript.txt` force-aligned sentence by sentence against the cleaned voice with Vosk (`scripts/force-align.py` → `scripts/words.aligned.json` → `src/words.json`).
- **Audio:** voice enhanced with Adobe Podcast Enhance (`public/speech_adobe.mp3`, not committed; free fallback: DeepFilterNet3 via `scripts/enhance-voice.py`), light compression; original synthesized piano/pad bed kept low and ducked under the voice (`scripts/gen-music.py`, `scripts/mix-audio.sh`).

## Rebuild
Footage and audio aren't committed. Put the transcoded clips in `public/` (`camA_matched.mp4` / `camB_matched.mp4`: 1080×1920 30fps with `scripts/camA.cube` / `camB.cube` applied), then:
```bash
npm install
python3 scripts/cut-pauses.py public/speech_isolated.mp3 1.5 387.3 38
<venv>/bin/python scripts/enhance-voice.py speech_raw48_loud.wav public/speech_dfn.wav <DeepFilterNet3 dir> 22
python3 scripts/cut-voice.py public/speech_dfn.wav 1.5 public/speech_cut.wav 0
python3 scripts/gen-music.py public/music_out.wav 347.3 src/segments.json 1.5
scripts/mix-audio.sh
npm run render
```
