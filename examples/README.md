# Examples

Videos built with the remotion-motion-graphics skill, in one Remotion project. Claude Code produced each one by following the skill: theme object, five-layer scene stack, spring entrances, staggered timing, and the mandatory render, extract frames, inspect, fix, re-render loop. FocusCatPromo, SelfFix and CodeEdit get their audio from the scripts in `scripts/`, which synthesize every sound as a WAV; there are no asset downloads (HaidrrrryPromo is silent). The other compositions are documented further down.

| Composition | What it is |
|---|---|
| `HaidrrrryPromo` | 12s profile promo: spark logo sting, word reveals, staggered cards, glow CTA |
| `FocusCatPromo` | 15.5s app promo: pixel-art mascot drawn in code (2-frame walk cycle), animated focus ring, synthesized SFX, warm ambient pad |
| `SelfFix` | 18.5s "watch this video fix itself": one scene opens deliberately bad (linear easing, flat background, no stagger, no grade) and upgrades live as each rule stamps in |
| `CodeEdit` | 20s beat-synced code edit: camera inside a syntax-glow code world, zoom punches on beats, RGB-split glitch pass, 3D code-shatter finale, original 120 BPM track |

Preview of `FocusCatPromo`. Click it for the MP4 with sound:

[![Focus Cat promo](videos/focus-cat.gif)](https://github.com/haidrrrry/claude-remotion-skill/raw/main/examples/videos/focus-cat-promo.mp4)

## Run

```bash
npm install
npm run audio            # writes deterministic 16-bit WAVs into public/sfx/
npm run studio           # Remotion Studio for src/index.ts (other entries: npx remotion studio src/<dir>/index.ts)
npm run render:focuscat  # or render:selffix / render:codeedit / render:profile
```

Verify the way the skill demands, by looking at extracted stills:

```bash
npx remotion still src/index.ts SelfFix out/check_300.png --frame 300 --overwrite
```

## Notes

- `src/theme.ts` (dark tech) and `src/focuscat/theme2.ts` (warm editorial) are the two palettes from `references/design-rules.md`.
- `src/focuscat/PixelCat.tsx` draws the mascot as a CSS pixel grid; swap the sprite strings to make your own.

## SolitudeLyrics (Arabic lyric video, 9:16)

Set to the opening verse of Cairokee's "Wahdy". Cinematic stills from Gemini image,
turned into 3D camera moves with a depth map (parallax occlusion, depth fog,
depth-of-field, rain between the layers in a WebGL shader). The man is cut out
and drawn as his own layer over a clean plate, so the camera moves around him
without warping his body. Every word rises on
the beat it is sung: word times come from an ElevenLabs Scribe transcript and
live in `LYRICS[].at` (song seconds). The stills, depth maps and song clip are
committed, so `npm run render:lyrics` works as-is.

```bash
export GEMINI_API_KEY=...        # Vertex AI express key or Gemini API key
npm run lyrics:images            # 8 stills -> public/lyrics/shot-XX.png (skips existing)
npm run lyrics:images -- --plates  # same stills with the man removed -> shot-XX-plate.png
curl -L -o models/midas-small.onnx \
  https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx
pip install onnxruntime pillow numpy "rembg[cpu]"
npm run lyrics:depth             # plate depth, man cutout (shot-XX-fg.png), layers.json
npm run render:lyrics
```

## WahdyShort (viral 9:16 Short, 17s loop)

The chorus of "Wahdy" cut to exactly 32 beats, so it loops seamlessly on TikTok,
Reels and Shorts. Built for retention: it opens on the first sung word, keeps a
caption hook and a song credit on screen the whole time, and keeps all text inside
the platform safe area.

- **Kinetic lyrics:** each word crashes in when sung and the sung word lights up.
  «خايف» shivers with a red/cyan split, «عارف» glows, «البطولة» gets a gold sweep.
- **Beat sync:** the picture punches on every beat, and each line opens on a
  downbeat with a hard cut, a flash and a light streak.
- **Graphics:** embers drifting up, and rings on the hero words.
- **The man moves:** he is his own layer, so he breathes, sways, shivers, and in
  shot 5 walks toward the camera with a step on every beat.

```bash
npm run lyrics:images -- --set chorus          # chorus-XX.png
npm run lyrics:images -- --set chorus --plates # chorus-XX-plate.png
npm run lyrics:depth
npx remotion render src/lyrics/index.ts WahdyShort out/wahdy-short.mp4 --gl=angle
```

## VeilLLMShortAR (Egyptian Arabic YouTube Short, 9:16, 60s)

A Short about [VeilLLM](https://github.com/h-f-fares/VeilLLM), a local DLP proxy, built from the
author's blog post and the real story behind it. It follows the skill's explainer structure in
Short form: direct-question hook with an open loop ("I'll show you what reaches the model, at the
end"), the story, a dark "does it actually work?" reset, real proof, a two-choice comment question,
GitHub, subscribe.

The proof is a screen recording of the project's own Gradio playground masking a real message.
It shows "4 entity(s) found in 23.8ms", which backs up the latency line in the voiceover. The
playground rebuilds its analyzer on every click (about 6s), so the cut jumps from the click to
the result.

Arabic RTL details: the whole stage is `direction: rtl`, code cards stay `ltr`, and in captions
consecutive English words are merged into one LTR token so "AI harness" doesn't read
"harness AI". Captions drop punctuation, which otherwise lands on the wrong side of English words.

```bash
npm run audio                         # sfx (shared with the other examples)
npm run render:veilllm                # VO, demo clip and fonts are committed in public/veilllm/

# Regenerate the voiceover and caption timing (needs GEMINI_API_KEY):
TTS_MODEL=gemini-2.5-pro-preview-tts python3 scripts/gen-veilllm-vo-ar-gemini.py /tmp/vo videos/veilllm/vo-ar.txt x
python3 scripts/align-vo-gemini.py /tmp/vo/vo2_raw.wav /tmp/vo/vo2_sents.json src/veilllm/words.json
cp /tmp/vo/vo2_sents.json src/veilllm/vo.json && ffmpeg -i /tmp/vo/vo2_raw.wav -b:a 192k public/veilllm/vo.mp3

# Re-record the demo (VeilLLM playground running on :7860):
node scripts/record-veilllm-demo.mjs
ffmpeg -i vid/<recording>.webm -filter_complex "[0:v]trim=1.6:9.3,setpts=(PTS-STARTPTS)/4,crop=1200:1540:0:380,fps=30[a];[0:v]trim=15.0:17.3,setpts=PTS-STARTPTS,crop=1200:1540:0:380,fps=30,tpad=stop_mode=clone:stop_duration=6[b];[a][b]concat=n=2:v=1:a=0,format=yuv420p[v]" -map "[v]" -c:v libx264 -crf 16 -an public/veilllm/clips/demo.mp4
```

Finished video: [`videos/veilllm/veilllm-short-ar.mp4`](videos/veilllm/veilllm-short-ar.mp4). Titles, description and tags: [`videos/veilllm/youtube.md`](videos/veilllm/youtube.md).

## Other compositions

Scripts are from `package.json` (`npm run <script>`). The audio scripts regenerate audio that is already committed in `public/`.

| Composition | Scripts | Notes |
|---|---|---|
| `SkillPromo` | no render script: `npx remotion render src/index.ts SkillPromo` | |
| `SquirrelBurger` | `audio:squirrel`, `render:squirrel` | The squirrel-burger Short (`src/squirrel/`) |
| `SquirrelBurgerLong` | `audio:squirrel`, `render:squirrel-long` | |
| `SquirrelBurgerLongAR` | `audio:squirrel-ar`, `render:squirrel-long-ar` | |
| `SquirrelPart1AR`, `SquirrelPart2AR` | `audio:squirrel-ar`; no render script: `npx remotion render src/squirrel/index.ts <id>` | Two-part Shorts cut of the long video (Arabic) |
| `Orbit3D` | `render:orbit3d` | 3D test composition built with the threejs-skills, renders offline |
| `ClaudeDance` | `audio:claudedance`, `render:claudedance` | 2D + 3D dance short, fully offline (local font, synthesized audio) |
| `ClawdFeelIt` | `audio:feelit`, `render:feelit` | |

Font loading: SquirrelBurger, SolitudeLyrics and ClaudeDance/ClawdFeelIt predate the skill's font rule and use a module-level `delayRender` + `FontFace.load()`. Copy the `@font-face` `<style>` pattern in `src/veilllm/components.tsx` instead.
