"""Pick the fastest Cycles device available and enable it. Run before every render: the device
is a user PREFERENCE, not saved in the .blend.

    blender -b build/clawdedit.blend -P gpu.py -P render.py -- ...

On an Apple-silicon Mac (M1–M4) this selects METAL. NVIDIA → OPTIX/CUDA, AMD → HIP,
Intel → ONEAPI. With nothing available it stays on CPU and says so.
"""
import bpy


def enable_gpu():
    scene = bpy.context.scene
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
    except KeyError:
        print("[gpu] Cycles add-on not loaded; CPU")
        return "CPU"
    for kind in ("METAL", "OPTIX", "CUDA", "HIP", "ONEAPI"):
        try:
            prefs.compute_device_type = kind
        except TypeError:
            continue
        prefs.get_devices()
        gpus = [d for d in prefs.devices if d.type == kind]
        if gpus:
            for d in prefs.devices:
                d.use = d.type == kind  # GPU only: CPU+GPU is usually slower on Metal
            scene.cycles.device = "GPU"
            print(f"[gpu] {kind}: " + ", ".join(d.name for d in gpus))
            return kind
    scene.cycles.device = "CPU"
    print("[gpu] no GPU backend found; rendering on CPU")
    return "CPU"


DEVICE = enable_gpu()
