# 3D Production Pipeline (brief → timeline → gates → measured fixes)

Read this for any 3D or character film longer than a logo sting, and for any video where
a hero "uses" an interface (presses buttons, builds something). It adds the production
system around `3d-motion.md`. Runs on CPU only: Remotion + three.js + `--gl=swangle`.

Worked example: `examples/src/clawdedit/` (8 s: Clawd peels off an editor's comp, builds
a title card by jumping on real buttons, the panels power down and fall away).

## The idea

The model does not generate video. It writes a program that answers one question:
**what does the screen look like at frame N?** That makes fixes cheap: one wrong jump =
one number changed, and only those frames re-rendered.

## 1. Write a brief in six blocks (before any code)

```
BRAND   HERO: the mascot/product as a simple toy shape, exact hex colour
        APP: the software being "used": every panel named, with its state
             (real labels, no real logos)
        RESULT: what the hero builds; every press changes something visible
        SET: where it floats (e.g. dark warm studio)
FORMAT  size, fps, duration, BPM, renderer; one timeline file all parts read
BEATS   second ranges → what happens; each beat lands on the BPM grid
CAMERA  wide open → follows each hop at hero height → ends on the result alone
LOOK    material + light rules (screens as emission, lights out of reflections)
CHECKS  contact sheet first, then 18 half-size stills, then the full render
```
Only BRAND changes between films. Write the brief to `brief.md` in the project.
Do not invent product screens, logos or metrics. A missing real asset means **stop and
ask**, never draw a fake.

## 2. One timeline file drives everything

`src/<film>/timeline.ts` holds plain data only (no imports) so the scene, the camera
**and the Node sound script** all read it:
- FPS, BPM, `BEAT_S = 60 / BPM`, `TOTAL_S`
- the UI layout **in app pixels** + one `px(x, y)` → world-units function
  ("pixels are the API": every button position is known exactly)
- `HOPS`: `{ t0, t1, to, apex, press }`. Landings sit on beats
- `EV`: story events (type-on, spark, keyframes, play, power-down…)
- `CAMERA` shots and blend windows
- `SFX`: `{ t, kind }` cues derived from the hops and events

Rule: **a jump that presses nothing is cut.** Each event must change the result.

Node ≥22.18 imports `.ts` directly: `import { SFX } from "../src/film/timeline.ts"`.

## 3. Interface as slabs (the "fake app" look)

- Draw the whole UI once into a 2D canvas at 2x (3840x2160) → `THREE.CanvasTexture`,
  `colorSpace = SRGBColorSpace`.
- **Each panel is its own slab** with its own crop of that texture
  (`tex.clone()`, `repeat = w/W, h/H`, `offset = x/W, 1-(y+h)/H`), so panels can light up,
  press down and fall one by one. Buttons are smaller slabs standing on their panel.
- Slab = dark box body + a top plane with `emissiveMap` (screen as emission under
  black glass): `meshPhysicalMaterial color #050505, roughness 0.32,
  specularIntensity 0.1, clearcoat 0.35`. Low specular keeps the key light from mirroring
  as white blocks on the glass.
- The **result** (comp) is a second canvas **redrawn every frame from time t**, then
  `tex.needsUpdate = true`. Follow real app logic: stamping a keyframe snaps the result
  to that pose; Play plays the poses back.
- Fonts on canvas: load with `FontFace` behind `delayRender`, draw only after it resolves.
- Pass `flat` to `<ThreeCanvas>` (no tone mapping) when brand colours must stay exact;
  then **measure** the hero colour (step 6).

## 4. Character motion from the hop list

Per frame, find the current hop: in the air → lerp x/z by `u`, `y += apex·4u(1-u)`, arms
up, legs tucked, stretch `sy 1.12`; landed → squash `exp(-framesSince/3)`; 3 frames of
anticipation crouch before each take-off; the button dips 4 frames on landing and stays
lit. Big leaps get a whoosh and optionally a flip. Lying flat ("a PNG layer") = rotate
face-up, then scale world-y to ~0.07; peel = unrotate + inflate over ~0.25 s.

Camera: blend `wide → follow → end` with eased weights. The follow target sits ~35% of the
way from the hero **toward the result**, so every press shows its effect in the same shot.

## 5. Review gates (never render the full film and hope)

```
GATE 1  brief.md + timeline.ts written; real assets listed
GATE 2  18 half-size stills as ONE contact sheet  (≈5 s/still on CPU)
GATE 3  fix the 3 worst defects → re-render only those stills
GATE 4  full render as a PNG sequence → scan for broken frames
GATE 5  sound from the same timeline → loudness + true-peak check
GATE 6  encode + extract frames from the MP4 → final checklist
```

Contact sheet (bundles once, renders stills, tiles them with time labels):
```bash
node <skill>/scripts/stills.mjs src/film/index.ts FilmId --n 18 --scale 0.5
node <skill>/scripts/stills.mjs src/film/index.ts FilmId --frames 105,127,183
```
Critique prompt to give yourself on every sheet:
> Judge only the rendered frames, not what you meant to make. Name the three largest
> defects, each with a timestamp, the evidence, and an exact local fix. Patch only those,
> re-render only those frames.

Read each sheet for: text readable at phone size and inside frame · buttons/playhead/
keyframes where they belong · hero colour vs brand hex · screens blown out by
reflections · the result visible when each press happens · hero cropped at frame
edges (worst at the end of a camera move) · the last frame strong enough to be a poster.

Write fixes as numbers, never "make it better":

| Saw | Fix |
|---|---|
| Opening almost black | fog far (22) was shorter than the wide camera distance → fog 15–36 |
| Result built off-screen | follow target biased 35% toward the comp |
| Hero half off the right edge at the end | land at x 1290 not 1450; end camera right and back |
| Play flash blows the comp out | flash alpha 0.5 → 0.22 |
| Spark reads as hairlines | rays twice as wide |
| Hero measured #B14F24 vs #E8773A (dE 18.9, too dark) | soft fill point light that follows the hero, intensity 3 → dE 6.2 |

## 6. Measure, don't guess

```bash
python3 <skill>/scripts/qc.py color out/qc/still_0225.png 1088 822 "#D97757"  # hero vs hex
python3 <skill>/scripts/qc.py loudness public/film/sound.wav   # LUFS per 0.5 s + true peak
python3 <skill>/scripts/qc.py frames out/film/frames            # blank/broken frames
```
- Colour: lit surfaces drift (tone mapping, light colour). Over dE ~10 → lower light
  intensity/exposure or darken the base colour, then measure again.
- Loudness shape: quiet before the drop (≈ −28…−21), loud from the drop (≈ −17…−12),
  softer on the fade. If the intro is as loud as the drop, the drop does not hit.
- True peak ≤ −1.0 dBTP (synth sounds overshoot between samples): one-pole low-pass
  roll-off + soft clip + −1.5 dBFS ceiling. A sample-peak limiter alone is not enough.

## 7. Render on CPU, re-render only what broke

```bash
# full film as a PNG sequence (every frame stands alone)
npx remotion render src/film/index.ts FilmId out/film/frames --sequence --image-format=png \
  --gl=swangle --concurrency=3
# re-render only a broken range into the same folder
npx remotion render src/film/index.ts FilmId out/film/frames --sequence --image-format=png \
  --gl=swangle --frames=105-145
# encode + mux sound (soft vignette, high-profile H.264, AAC 320k)
ffmpeg -framerate 30 -i out/film/frames/element-%03d.png -i public/film/sound.wav \
  -vf "vignette=angle=PI/6" -c:v libx264 -profile:v high -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 320k -movflags +faststart -shortest out/film.mp4
```
Sequence filenames follow the frame count width (`element-000.png` for <1000 frames);
check with `ls` before encoding.

Cost on 4 CPU cores at 1080p (ClawdEdit): ~5 s per half-size still, ~1.4 s per full
frame with `--concurrency=3`. The 8 s film (240 frames) rendered in 5.5 min.

## 8. Variants

A 9:16 cut is a **separate composition** reading the same timeline: bigger type, fewer
elements, a different camera path. Never crop the 16:9 render.

## Troubleshooting

| Problem | Fix |
|---|---|
| Wide shot dark / UI invisible | fog far distance < camera distance; push fog out |
| White blocks on glass panels | lower `specularIntensity`/clearcoat on UI slabs; move the key light so its mirror angle misses the camera; no bright env map |
| Brand colour washed out or salmon | tone mapping shifts it: `flat`, or lower light intensity; measure with `qc.py color` |
| Children land in the wrong place | compute world positions from `px()` directly; don't rely on parent transforms you haven't updated |
| Canvas text in the default font | draw only after `FontFace.load()` resolved (behind `delayRender`) |
| Frames differ between renders | something reads a clock or `Math.random()`; use frame time + seeded noise |
| Black render | missing `--gl=swangle` (CPU) / `--gl=angle` (GPU) |
| Audio clips on phones | true-peak ceiling −1 dBTP, not just sample peak |
