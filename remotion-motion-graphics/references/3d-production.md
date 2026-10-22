# 3D Production Pipeline (brief → timeline → shot list → look → gates → measured fixes)

Read this for any 3D or character film longer than a logo sting, and for any video where
a hero "uses" an interface (presses buttons, builds something). It adds the production
system around `3d-motion.md`. Default renderer: Remotion + three.js on CPU (`--gl=swangle`).
Optional second renderer: Blender (Cycles/EEVEE) on any GPU machine, e.g. an M-series Mac,
baked from the same timeline — see §9.

Worked example: `examples/src/clawdedit/` (12 s: Clawd peels off an editor's comp, builds a
title card by jumping on real buttons, stamps keyframes, surfs the playhead, the panels
power down and fall away). Blender version of the same film: `blender/`.

## The idea

The model does not generate video. It writes a program that answers one question:
**what does the screen look like at frame N?** That makes fixes cheap: one wrong jump =
one number changed, and only those frames re-rendered.

**What makes it stand out is direction, not the GPU.** A first version of the example was
compared frame by frame against a GPU Blender reference. ~90% of the gap was craft that
costs nothing on CPU: the camera (far, high, locked → hero at 10% of frame), a black void
instead of a lit set, no tone mapping/bloom, no depth of field, an 8 s template that
crushed the story, a sparse UI, a quiet mix. The rules below exist to prevent each one.

## 1. Write a brief in six blocks (before any code) → `brief.md`

```
BRAND   HERO: the mascot/product as ONE smooth toy (bevel ≈10% of height), exact hex
        APP: the software being "used": every panel named, with its state
             (real labels, real icons, no real logos)
        RESULT: what the hero builds; every press changes something visible
        SET: where it floats — a lit room (warm wall + table), never a black void
FORMAT  1920x1080 30 fps, 12 s at 120 BPM (24 beats), renderer; one timeline file
BEATS   second ranges → what happens; each landing on the BPM grid. The transformation
        gets its own 2-3 beats, held close, before the first hop. A climax act exists.
CAMERA  starts wide, pushes in from frame 0, follows every hop AT HERO HEIGHT with
        shallow focus, whips to each button, alternates a Dutch angle per act,
        ends on the result alone
LOOK    screens as emission over true-black comp; HDR emitters bloom; tone mapping on;
        lights stay out of the UI reflections; the hero must measure as its hex
CHECKS  UI texture + comp contact sheet, then 18 half-size stills, then the full render
```
Only BRAND changes between films. Do not invent product screens, logos or metrics. A
missing real asset means **stop and ask**, never draw a fake.

## 2. One timeline file drives everything

`src/<film>/timeline.ts` holds plain data only (no imports) so the scene, the camera, the
Node sound script and the Blender exporter all read it:
- FPS, BPM, `BEAT_S = 60 / BPM`, `TOTAL_S`
- the UI layout **in app pixels** + one `px(x, y)` → world-units function
  ("pixels are the API": every button position is known exactly)
- `HOPS`: `{ t0, t1, to, apex, press, flip?, from? }`. Landings sit on beats
- `EV`: story events (peel, pop, type-on, spark, keys, rewind, ride, play, power-down…)
- `SHOTS`: the camera shot list (§4)
- `SFX`: `{ t, kind }` cues derived from the hops and events

Put the per-frame maths in a second pure module, `motion.ts` (no three.js, no React):
`clawdAt(t)`, `shotAt(t)`, `fallState`, `pressState`, prop positions. The React scene draws
from it and `blender/export_motion.mjs` bakes it — one choreography, two renderers.

Rule: **a jump that presses nothing is cut.** Each event must change the result.
Node ≥22.18 imports `.ts` directly: `import { SFX } from "../src/film/timeline.ts"`.

## 3. Interface as slabs (the "fake app" look)

- Draw the whole UI once into a 2D canvas at 2x (3840x2160) → `THREE.CanvasTexture`,
  `colorSpace = SRGBColorSpace`. **Each panel is its own slab** with its own crop
  (`tex.clone()`, `repeat = w/W, h/H`, `offset = x/W, 1-(y+h)/H`), so panels can light up,
  press down and fall one by one.
- Fidelity spec (the viewer must recognise the app in one glance): ≥120 real labels and
  ≥30 icons, a neutral app palette (After Effects: `#232323` panels, `#c8c8c8` text, ONE
  blue accent `#2d8ceb`), the app's UI typeface at 400/600 (Inter is close), opaque label
  colours on layer bars, a focus outline on the active panel, footer bars, timecodes.
  Never a toy display font for chrome. The hero colour appears only in the result.
- Screen top = **unlit** `meshBasicMaterial({ map, color: k })` with `k` the brightness
  (can exceed 1 for HDR). An unlit screen cannot mirror the key light as white blocks.
- The **result** (comp) is a second canvas redrawn every frame from time t on a **pure
  black** background (`tex.needsUpdate = true`), at HDR gain ~1.35 so its bright type blooms.
  Follow real app logic: a keyframe stamp snaps the result to that pose; the playhead plays
  the poses back (draw from `playheadX(t)`); show the dotted motion path.
- Props at hero scale, not hairlines: keycaps 0.12 u tall that dip and STAY down while he
  stands on them; keyframes as white glowing cubes; the playhead as a light beam with a
  head he can ride.
- Fonts on canvas: load with `FontFace` behind `delayRender`, draw only after it resolves.

## 4. Camera: a shot list, not a follow rig

Write `SHOTS` as one key per story beat: `{ t, target: hero|result|…, az, el, dist, roll, fov }`.
Each frame: ease between the two surrounding keys, place the camera on a sphere around the
(lerped) target, `lookAt`, then `camera.rotateZ(roll)`. Keys close together = a whip.

| Rule | Number |
|---|---|
| Hero size while acting | 18–28% of frame height (≈ 3.0–3.6 u away for a 0.6 u hero at fov 40–42) |
| Elevation while following | 8–25° (hero eye-line). 40°+ reads as a screen recording |
| Dutch angle | 8–17°, sign alternates per act (toolbar +, effects −, timeline −, end ≈ +3) |
| Opening | wide on the whole set, pushing in from frame 0 — never a still first second |
| Whips | 0.2–0.35 s between keys, landing on the hop's beat |
| Showing the result | whip to it on the payoff beats (glow on, play) or keep it defocused behind the hero |
| Big leaps | the follow target includes ~60% of the jump arc, or the hero leaves the top of frame |
| Hero facing | he faces the travel direction mid-air at most halfway; on landing he turns to the camera |

Lens: fov 38–42 (≈29–33 mm) is right; the problem is never focal length, it is distance.

## 5. Look stack (works on CPU)

In `<ThreeCanvas>` (no `flat`), with `useFrame(() => composer.render(), 1)` taking over
rendering (Remotion advances it once per frame, so it is deterministic):
```
EffectComposer(gl, new WebGLRenderTarget(w, h, { type: HalfFloatType, samples: 4 }))
  RenderPass → BokehPass({ focus: camera→hero distance per frame, aperture 0.006 close /
  0.0015 wide, maxblur 0.012 }) → UnrealBloomPass(strength 0.55, radius 0.45, threshold 1.0)
  → OutputPass                               // tone mapping + sRGB happen here
gl.toneMapping = NeutralToneMapping          // keeps brand hues; AgX desaturates them
```
All from `three/examples/jsm/postprocessing` — no extra packages.
- Emitters are HDR (`color` > 1): keyframes ~1.6, playhead beam ~2.6 (blue), comp ×1.35.
  Everything else stays ≤ 1, so only the meaningful lights bloom.
- The set: a warm table plane + back wall (`#5a3e30`/`#4e362a`, roughness 0.9+) lit by a
  wide soft spot, fog the same warm colour (`#2a1d16`, near 14 / far 34). Fog far must
  exceed the widest camera distance.
- Hero: glossy toy material (`meshPhysicalMaterial` roughness ~0.42, clearcoat 0.4), a fill
  light that follows him, a cool spill from below (the screen lighting him).
- One soft DOM vignette at most. Never stack it with an ffmpeg vignette.
- Cost on 4 CPU cores: ~11 s per 1080p frame single-threaded (~4 s wall at concurrency 3)
  vs ~1.4 s without the stack. Budget for it: the look is where the time should go.

## 6. Character acting from the hop list

Per frame, find the current hop: in the air → lerp x/z, `y += apex·4u(1-u)`, arms up, legs
tucked, stretch `sy 1.14`, lean +0.3 at take-off levelling to −0.15; landed → squash
`exp(-framesSince/3)` plus one settle overshoot, blink on landing, ^^ eyes after a result,
turn to the camera within 0.2 s (he presents); 3 frames of anticipation crouch turning
toward the next target. The kick winds back 0.15 s, snaps forward in 2 frames, holds.
The ride: crouch, lean 0.3 rad into the move, arms out. Flat "PNG layer" = rotate face-up
and scale world-y ~0.07; the peel is its own beat (hinge up 0.35 s, wobble edge-on), then
the pop inflates with a 1.25 overshoot and a shard burst + ring.

## 7. Review gates (never render the full film and hope)

```
GATE 1  brief.md + timeline.ts written; real assets listed
GATE 2  UI texture + comp contact sheet (flat, before any 3D)
GATE 3  18 half-size stills as ONE contact sheet   (≈11 s/still with the look stack)
GATE 4  A/B against the reference (if one exists): 6 matched story moments side by side
GATE 5  fix the 3 worst items → re-render only those stills
GATE 6  full render as a PNG sequence → qc.py frames
GATE 7  sound from the same timeline → loudness shape + true peak
GATE 8  encode + extract frames from the MP4 → final checklist
```
```bash
node <skill>/scripts/stills.mjs src/film/index.ts FilmId --n 18 --scale 0.5
node <skill>/scripts/stills.mjs src/film/index.ts FilmId --frames 105,127,183
```
Critique prompt for every sheet:
> Judge only the rendered frames. Name the three largest problems — defects AND missing
> qualities the reference has (camera energy, depth, glow, hero size) — each with a
> timestamp, the evidence and an exact numeric fix. Patch only those, re-render only those.

Numeric gates on the stills (measure, don't eyeball): hero height ≥18% in follow shots ·
≥40% of frames with a dominant-line tilt ≥4° · camera still in ≤25% of frames · luma
p10–p90 range ≥50 · comp black ≤ luma 5 · hero colour dE ≤10 on a front face.

Fixes from the example, written as numbers:

| Saw | Fix |
|---|---|
| Hero 10% of frame, everything level | `SHOTS` at dist 3.2, el 12–16°, roll ±9–17° → hero ~25% |
| Hero leaves the top of frame on a big leap | follow target includes 60% of the arc; apex 1.4 → 1.0 |
| Black void, nothing reads as a light | warm wall + table + spot; tone mapping + HDR emitters + bloom |
| Pop ring blows the frame out | ring brightness 3 → 1.4, scale 2.6 → 1.6 |
| Keyframe cube hides the hero | cube offset 0.42 u to the side of the landing spot |
| Hero reads desaturated under AgX (dE 24.9) | `NeutralToneMapping`, base `#CE7253` for target `#D97757` |
| Intro as loud as the drop | knocks 0.6 → 0.22, intro pad/hats halved, 50 ms gap before the pop |

## 8. Measure, don't guess

```bash
python3 <skill>/scripts/qc.py color out/qc/still_0300.png 862 530 "#D97757"  # front face vs hex
python3 <skill>/scripts/qc.py loudness public/film/sound_master.wav  # LUFS per 0.5 s + true peak
python3 <skill>/scripts/qc.py frames out/film/frames                 # blank/broken frames
```
- Colour: sample a FRONT face in a frontal shot (side faces and the warm set skew it).
- Loudness targets: intro ≈ −26…−17, drop to ≈ −11 short-term, integrated ≈ −11…−12 LUFS,
  true peak ≤ −1 dBTP. If the intro is within ~6 dB of the body, the drop does not hit.
- Master: bus compressor → gain → limiter, then an oversampled limiter (`aresample=192000,
  alimiter`) for true peak. Do NOT use `loudnorm` in dynamic mode on a short film: it lifts
  the quiet intro and kills the drop.

## 9. Render: CPU first, Blender when a GPU machine is available

CPU (Remotion):
```bash
npx remotion render src/film/index.ts FilmId out/film/frames --sequence --image-format=png \
  --gl=swangle --concurrency=3                     # every frame stands alone
npx remotion render ... --frames=105-145            # re-render only a broken range
ffmpeg -framerate 30 -i out/film/frames/element-%03d.png -i public/film/sound_master.wav \
  -c:v libx264 -profile:v high -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k \
  -movflags +faststart -shortest out/film.mp4
```
Blender (Mac M-series / NVIDIA / any GPU): see `blender/README.md`. The flow exports the UI
texture and the comp frames from Remotion compositions, bakes `motion.ts` per frame into
`motion.json`, builds the `.blend` with `scene.py` (all keys baked, AgX, motion blur, DOF,
glare) and renders with `render.py` after `gpu.py` (Metal on a Mac). Choreography changes go
in `timeline.ts` and both renderers follow; light/lens changes go in `scene.py`.
`blender/run.sh stills|eevee|cycles` does all of it. Base M3 estimates: EEVEE ~1–3 s/frame,
Cycles ~5–12 s/frame at 64 samples + denoise.

## 10. Variants

A 9:16 cut is a **separate composition** reading the same timeline: bigger type, fewer
elements, a different shot list. Never crop the 16:9 render.

## Troubleshooting

| Problem | Fix |
|---|---|
| Wide shot dark / UI invisible | fog far distance < camera distance; push fog out |
| White blocks on glass panels | make the screen tops unlit (`meshBasicMaterial`); no global env map |
| Brand colour washed out or salmon | AgX desaturates: `NeutralToneMapping`, darker base, measure a front face |
| Everything glows | bloom threshold 1.0 and only true emitters above 1 |
| Post stack renders black | `useFrame(..., 1)` must call `composer.render()`; composer built from `useThree()` gl/scene/camera |
| Canvas text in the default font | draw only after `FontFace.load()` resolved (behind `delayRender`) |
| Frames differ between renders | something reads a clock or `Math.random()`; use frame time + seeded noise |
| Black render | missing `--gl=swangle` (CPU) / `--gl=angle` (GPU) |
| Audio clips on phones | true-peak ceiling −1 dBTP, not just sample peak |
