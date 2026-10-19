# Two-stage grade baked into one 3D LUT per camera:
#   1. per-camera correction (white balance, de-haze, exposure, contrast, saturation) so both phones match
#   2. one shared "clean cool" look on top
# Usage: python3 scripts/grade.py <outdir>            -> writes camA.cube, camB.cube
#        python3 scripts/grade.py --preview <a.png> <b.png> <out.png>
import sys
import numpy as np

LUMA = np.array([0.2126, 0.7152, 0.0722])

CAMS = {
    # camera A: heavy window haze (lifted blacks, low contrast); values fitted so its
    # tone curve, saturation and white colour match camera B after grading
    "A": dict(wb=(1.003, 1.0, 1.011), haze=0.094, exposure=1.204, gamma=0.917, contrast=0.169, sat=1.198),
    # camera B: phone HDR look - slightly cyan whites, punchy, oversaturated
    "B": dict(wb=(1.025, 1.0, 1.0), haze=0.0, exposure=0.96, gamma=0.98, contrast=0.04, sat=0.86),
}
LOOK = dict(
    temp=(0.965, 1.0, 1.04),                 # cooler white balance
    shadow_tint=(-0.012, 0.004, 0.016),      # gentle teal-blue in the shadows
    highlight_tint=(0.0, 0.0, 0.004),        # clean, slightly cool whites
    black=0.025, white=0.97,                 # soft film-like toe and shoulder
    sat=1.04,
)

def smoothstep(x):
    return x * x * (3 - 2 * x)

def correct(x, p):
    x = x * np.array(p["wb"])
    x = np.clip((x - p["haze"]) / (1 - p["haze"]), 0, None)   # remove veiling glare
    x = np.clip(x * p["exposure"], 0, 1) ** p["gamma"]
    x = x + p["contrast"] * (smoothstep(np.clip(x, 0, 1)) - x)  # S-curve around mid-grey
    l = (x @ LUMA)[..., None]
    return np.clip(l + (x - l) * p["sat"], 0, 1)

def look(x):
    x = np.clip(x * np.array(LOOK["temp"]), 0, 1)
    l = (x @ LUMA)[..., None]
    x = x + np.array(LOOK["shadow_tint"]) * (1 - l) ** 2 + np.array(LOOK["highlight_tint"]) * l ** 2
    l = (x @ LUMA)[..., None]
    x = l + (x - l) * LOOK["sat"]
    return np.clip(LOOK["black"] + x * (LOOK["white"] - LOOK["black"]), 0, 1)

def grade(cam):
    return lambda x: look(correct(x, CAMS[cam]))

def write_cube(f, path, n=33):
    g = np.linspace(0, 1, n)
    b, gg, r = np.meshgrid(g, g, g, indexing="ij")  # red fastest
    out = f(np.stack([r, gg, b], -1).reshape(-1, 3))
    with open(path, "w") as fh:
        fh.write(f"LUT_3D_SIZE {n}\n")
        for v in out: fh.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")

if __name__ == "__main__":
    if sys.argv[1] == "--preview":
        from PIL import Image
        a, b, out = sys.argv[2:5]
        ims = []
        for path, cam in ((a, "A"), (b, "B")):
            x = np.asarray(Image.open(path).convert("RGB").resize((360, 640))).astype(float) / 255
            ims += [x, grade(cam)(x)]
        Image.fromarray((np.concatenate([ims[0], ims[2], ims[1], ims[3]], 1) * 255).astype("uint8")).save(out)
    else:
        for cam in CAMS: write_cube(grade(cam), f"{sys.argv[1]}/cam{cam}.cube")
