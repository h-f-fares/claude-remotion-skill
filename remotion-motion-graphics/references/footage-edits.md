# Footage Edits (real camera footage: talks, speeches, multicam)

Lessons from cutting a two-phone Toastmasters speech into a vertical Short.
Read before any "edit / montage my video(s)" request with real footage.

## 1. Intake — inspect first, then ask once
- **Probe the footage before asking about format.** `ffprobe` every clip
  (orientation, fps, bit depth, duration). Two vertical phone clips cannot
  become a clean 16:9 cut; ask about format only after you know this.
- Ask the **editor-level questions in the first round**, not after ten
  revisions: hook (cold open on the climax?), keep audience reactions?,
  music (user track / composed / none), end card text, captions on/off and
  accent colour, grade direction (warm / cool / neutral), pace (cut pauses vs
  speed-up), any illustration or photo for the emotional peak.
- Expect the user to review the transcript (§5) — ask for it early.

## 2. Getting the footage
- Google Photos / Drive links need the hosts on the environment allowlist.
- Drive folder listing: `gdown.download_folder(url, skip_download=True)`.
  Download each file with
  `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`
  (gdown's own redirect to `*.googleusercontent.com` may be blocked).

## 3. Multicam sync
- Cross-correlate **1 ms amplitude envelopes** (16 kHz mono, mean-removed),
  then confirm with sample-level correlation at 3–4 points across the clip.
  Drift under one frame → one constant offset is enough.

## 4. Voice
- Always enhance the **raw** voice; never stack enhancers.
- Best result: Adobe Podcast Enhance (no API). Send the user a full-length,
  untrimmed raw mp3 on the master clock; when it comes back verify lag ≈ 0
  by correlation, then cut it with the same segments as the picture.
- ElevenLabs Voice Isolator: very clean but reads as "processed".
- Free fallback: DeepFilterNet3 (weights on raw.githubusercontent.com; needs
  torch). **Normalise the input first (+18 dB on quiet phone audio)** or it
  treats the voice as noise. Cap suppression (`atten_lim_db≈22`).
- Isolation removes the audience. Put the room back: camera at the back of the
  room, faint bed everywhere, opened up where room level exceeds what the voice
  explains (fit room-vs-voice energy, flag > 7 dB excess for ≥ 0.5 s).

## 5. Captions
- Free ASR (Vosk small) on a noisy room mic is 30 %+ wrong. Write a corrected
  transcript (both mics' ASR + the user's script), then **force-align one
  sentence at a time** (Vosk grammar = that sentence only, on its audio
  window ±1.5 s). Words off by > 1 s drop from dozens to near zero.
- Lead captions by ~0.08 s. If a range plays twice (cold open), generate its
  words once per segment.

## 6. Pacing
- Prefer trimming pauses (> ~0.6 s → ~0.45 s) to a global speed-up; speed-up
  makes gestures look rushed (≤ 5 % if at all, applied in the final export with
  `setpts` + `atempo`, so the render itself stays 1×).
- Protect audience reactions and deliberate silences from pause cuts.
- Hide every pause cut behind a camera change; snap planned camera changes
  within 2 s onto the cut; never leave shots < 0.8 s (camera flashes).

## 7. Colour
- Match the cameras first, look second. Compare the same moment side by side.
- Phone cameras facing windows get **veiling glare** (lifted blacks, flat):
  remove it (`(x - k)/(1 - k)`) before anything else.
- Auto-fit one camera's correction (WB, haze, exposure, gamma, contrast,
  saturation) so its luma percentiles, mean saturation and bright-wall colour
  match the other camera over ~13 sampled moments; then apply one shared look.
  Bake per-camera 3D LUTs into the proxies (`lut3d=…:interp=tetrahedral`).
- Speech footage: no warm overlays, grain or heavy vignettes — clean wins.

## 8. Shots
- Virtual close-up from a 1080-wide clip: crop ≤ 1.25× or it goes soft.
- Speaker tracking: motion and median-background trackers fail with handheld
  footage and a moving audience. Mark x by eye on a gridded contact sheet every
  ~2.5 s and ease between keyframes.
- `vidstab` needs 8-bit input: add `format=yuv420p` for 10-bit phone HDR.
- AI upscale (Real-ESRGAN `realesr-general-x4v3`, weights on GitHub
  releases) on CPU: ~3 s/frame with `channels_last` + bf16 autocast. Upscale
  only the ranges actually used, at 15 fps (reuse each frame once).

## 9. Master-editor checklist (run before calling it final)
- Cold open on the emotional peak, dip to black, then the title.
- Audience laughs/applause audible, with cuts to the audience on them.
- Climax treatment: silence before it, music swell on it, a visual beat
  (push-in, photo or illustration — Gemini image models with a frame of the
  speaker as reference keep the likeness).
- End: final line held big, applause, end card.
- Cameras match, footage stable, captions in sync, voice natural.

## 10. Render and environment pitfalls
- Never call `delayRender` at module top level: idle bundle tabs are
  timer-throttled and abort the render. Load fonts with CSS `@font-face` in a
  `<style>` element pointing at `public/` files via `staticFile` (SKILL.md, Fonts).
- Audio-only changes: remux (`-c:v copy`) instead of re-rendering.
- Jobs over ~2 h: start with `setsid nohup … &` and poll for a done-file.
- `pkill -f <pattern>` also matches your own shell if the pattern is in the
  command line.
