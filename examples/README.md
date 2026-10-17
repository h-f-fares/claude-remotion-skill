# Examples

Four videos built with the remotion-motion-graphics skill, in one Remotion project. Claude Code produced each one by following the skill: theme object, five-layer scene stack, spring entrances, staggered timing, and the mandatory render, extract frames, inspect, fix, re-render loop. The audio comes from the scripts in `scripts/`, which synthesize every sound as a WAV; there are no asset downloads.

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
npm run studio           # browse all four in Remotion Studio
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
