"""Render any frame range of build/clawdedit.blend, resumable.

    blender -b build/clawdedit.blend -P gpu.py -P render.py -- \
        --engine eevee|cycles --frames 1-360[,105-145] --scale 100 --samples 64 --out build/frames

  --engine   eevee  : real-time engine. Fast drafts and good finals on an M3 (~1-3 s/frame).
             cycles : path traced, the reference look (~5-12 s/frame on a base M3 with denoise).
  --frames   Blender frames (1-based), comma-separated ranges. Finished frames are skipped,
             so a crashed or interrupted run continues where it stopped.
  --scale    resolution percentage (50 for preview stills)
  --samples  Cycles samples per pixel (OpenImageDenoise cleans the rest) / EEVEE TAA samples
"""
import os
import sys

import bpy

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]


def arg(name, default):
    return ARGV[ARGV.index(name) + 1] if name in ARGV else default


scene = bpy.context.scene
engine = arg("--engine", "eevee").lower()
samples = int(arg("--samples", 64 if engine == "cycles" else 32))
scene.render.resolution_percentage = int(arg("--scale", 100))
out = os.path.abspath(arg("--out", os.path.join(os.path.dirname(bpy.data.filepath), "frames")))
os.makedirs(out, exist_ok=True)

if engine == "cycles":
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
    if scene.cycles.device != "GPU":
        print("[render] Cycles on CPU — add -P gpu.py before render.py to use the GPU")
else:
    for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):  # name changed between 4.2 and 5.0
        try:
            scene.render.engine = eng
            break
        except TypeError:
            continue
    ee = scene.eevee
    ee.taa_render_samples = samples
    for attr, val in (("use_raytracing", True), ("use_shadows", True), ("use_gtao", True)):
        if hasattr(ee, attr):
            setattr(ee, attr, val)

scene.render.image_settings.file_format = "PNG"
scene.render.use_overwrite = False  # skip frames already on disk → resumable chunks
scene.render.use_placeholder = True  # parallel Blender processes can share one folder
scene.render.filepath = os.path.join(out, "f_####")

ranges = []
for part in arg("--frames", f"{scene.frame_start}-{scene.frame_end}").split(","):
    a, _, b = part.partition("-")
    ranges.append((int(a), int(b or a)))
for a, b in ranges:
    scene.frame_start, scene.frame_end = a, b
    print(f"[render] {engine} frames {a}-{b} → {out}")
    bpy.ops.render.render(animation=True)
