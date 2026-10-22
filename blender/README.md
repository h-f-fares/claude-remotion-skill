# ClawdEdit through Blender (for a Mac M-series or any GPU machine)

The same film as `examples/src/clawdedit/`, rendered by Blender instead of three.js. Blender adds
what a CPU rasteriser can only fake: real soft shadows and light bounce, true lens depth of field,
0.5-shutter motion blur and AgX colour. The choreography is not re-written: every frame is baked
from the same `timeline.ts` + `motion.ts` the Remotion scene uses, so timing is identical.

```
timeline.ts ─┬─ motion.ts ── export_motion.mjs ──► build/motion.json ─┐
             ├─ uiCanvas.ts ── Remotion ClawdUI ──► build/ui.png ─────┼─► scene.py ─► clawdedit.blend ─► render.py ─► frames ─► ffmpeg
             ├─ uiCanvas.ts ── Remotion ClawdComp ► build/comp/*.png ─┘                                  (gpu.py picks Metal)
             └─ gen-clawdedit-audio.mjs ─────────► sound_master.wav ───────────────────────────────────────────────────► mux
```

## Setup on the Mac (once, ~10 min)

```bash
brew install --cask blender        # Blender 4.2+ (tested with 5.2)
brew install node ffmpeg
git clone <this repo> && cd claude-remotion-skill/examples && npm ci && cd ..
```

Running it from a Claude Code session on the Mac (Remote Control or a local session) works the
same: the session runs `blender/run.sh` and reads the contact sheet it produces.

## Run

```bash
blender/run.sh stills     # GATE: 18 half-size Cycles stills → blender/build/contact_sheet.png
blender/run.sh eevee      # full film with EEVEE  → blender/build/clawd-edit-eevee.mp4
blender/run.sh cycles     # full film with Cycles → blender/build/clawd-edit-cycles.mp4
FRAMES=105-145,285-360 blender/run.sh cycles   # re-render only broken frames, re-encode
```

Knobs (env vars): `SAMPLES` (Cycles default 64, stills 32), `SCALE` (% resolution),
`FSTOP` (default 1.2; higher = more in focus), `BLENDER` (binary path).

Frames already on disk are skipped, so an interrupted render resumes where it stopped.

## Time on a 16 GB M3 (estimates from public Blender benchmarks, not measured on your Mac)

| Engine | Per 1080p frame | 360 frames |
|---|---|---|
| EEVEE | ~1–3 s | ~6–15 min |
| Cycles, 64 samples + OpenImageDenoise | ~5–12 s | ~30–70 min |
| Stills gate (18 × 50%, 32 samples) | ~2–4 s each | ~1 min |

M3 Pro/Max: roughly 2–4× faster. Close other apps while rendering (the GPU shares RAM).
Measured here on 4 CPU cores with no GPU: Cycles 16 samples at 50% ≈ 24 s/frame, EEVEE ≈ 60 s
(software GL) — the scripts work without a GPU, just slowly.

## Files

| File | Job |
|---|---|
| `export_motion.mjs` | bakes clawd rig, camera, panels, keys, playhead, chip, shards per frame → `motion.json` |
| `scene.py` | builds slabs, keycaps, Clawd (same proportions as `ClawdModel`), room, lights, camera; bakes all keys; AgX, motion blur, glare; saves `.blend` |
| `gpu.py` | enables METAL / OPTIX / CUDA / HIP / ONEAPI, else CPU. Pass it on **every** render: the device is a preference, not saved in the file |
| `render.py` | `--engine eevee\|cycles --frames a-b,c-d --scale --samples --out`, resumable |
| `run.sh` | the whole pipeline in one command |

All objects sit under one empty, `ROOT` (rotated +90° on X), so inside it coordinates are
three.js coordinates (Y up) and rotations use mode `ZYX` (= three.js `XYZ`).

## Review loop (same gates as the skill)

1. `run.sh stills` → read `contact_sheet.png` as one image.
2. Name the 3 worst defects with a timestamp and an exact number to change.
3. Choreography/camera/timing → edit `examples/src/clawdedit/timeline.ts` (both renderers follow).
   Light/material/lens → edit `scene.py`.
4. Re-run stills, then the full render; `qc.py frames` runs automatically after it.
5. Measure: `python3 remotion-motion-graphics/scripts/qc.py color <frame.png> x y "#D97757"`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Hero reads salmon/pink | AgX lightens: lower `vs.exposure` in `scene.py` (default −0.3) or darken `HERO`, re-measure |
| White blocks on the UI glass | `Specular IOR Level` on the screen material is 0.1; keep it low, or use light linking (Blender 4.0+) to exclude `key`/`rim` from the slabs |
| `[gpu] no GPU backend found` on a Mac | Blender older than 3.1, or run under Rosetta: install the Apple-silicon build |
| Out of memory mid-render | close apps; render in chunks with `FRAMES=1-120`, then `121-240`… (skips finished frames) |
| Comp texture frozen | the viewer uses an image sequence; keep `build/comp/element-000.png … 359.png` in place |
| Glare node missing | the compositor API changed in 5.0; the script tries both and prints `glare node skipped` if neither works — the film still renders |
