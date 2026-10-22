# The Day I Became a Father — two-camera montage

9:16 Remotion edit of a Toastmasters speech filmed on two phones.

- **Cameras:** A (front-side, master clock) and B (back of room, synced by audio cross-correlation, `B_OFFSET` in `src/edit.ts`). A third "close-up" angle crops camera A and follows the speaker using hand-marked keyframes (`src/track.json`).
- **Pacing:** pauses are shortened (`scripts/cut-pauses.py` picks the gentlest trim rule that reaches the 38 s cut target → `src/segments.json`); every cut lands on a camera change so the jump is hidden. The silent moment before the baby cries is kept.
- **Captions:** word-synced, from `scripts/transcript.txt` force-aligned sentence by sentence against the cleaned voice with Vosk (`scripts/force-align.py` → `scripts/words.aligned.json` → `src/words.json`).
- **Audio:** voice enhanced with Adobe Podcast Enhance (`public/speech_adobe.mp3`, not committed; free fallback: DeepFilterNet3 via `scripts/enhance-voice.py`), light compression; camera B room sound as a faint bed that opens up for laughs and applause (`scripts/room-track.py`); original synthesized piano/strings score kept low and ducked under the voice (`scripts/gen-score.py`), all mixed by `scripts/mix-audio.sh` into `public/mix.wav`.

## Rebuild
Footage and audio aren't committed. Put the transcoded clips in `public/` as `camA_final.mp4` / `camB_final.mp4` (the names `src/components/Footage.tsx` reads): 1080×1920 30fps with `scripts/camA.cube` / `camB.cube` from `scripts/grade.py` applied; camera B also goes through `scripts/upscale.py` with `scripts/b_ranges.json` (see its Usage line). Voice inputs: `public/speech_isolated.mp3` (isolated voice, for pause detection) and the enhanced voice. Then:
```bash
npm install
python3 scripts/cut-pauses.py public/speech_isolated.mp3 1.5 387.3 38 src/reactions.json 276.3 289.3
python3 scripts/cut-voice.py public/speech_adobe.mp3 1.5 public/speech_cut.wav <lag s>
# free fallback instead of Adobe (raw voice, 48 kHz mono, +18 dB):
# <venv>/bin/python scripts/enhance-voice.py speech_raw48_loud.wav public/speech_dfn.wav <DeepFilterNet3 dir> 22
# python3 scripts/cut-voice.py public/speech_dfn.wav 1.5 public/speech_cut.wav 0
python3 scripts/room-track.py <camB source> 11.525 1.5 387.3 src/reactions.json public/room.wav
python3 scripts/cut-voice.py public/room.wav 1.5 public/room_cut.wav   # same cuts as the voice
python3 scripts/gen-score.py src/segments.json 3.5 public/score.wav
scripts/mix-audio.sh 3.5
npm run render
```
