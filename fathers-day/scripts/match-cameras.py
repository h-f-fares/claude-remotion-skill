# Builds one 3D LUT per camera that pulls both phones to a shared base look
# (neutral white balance, same black/mid/white points, same saturation).
# Usage: python3 scripts/match-cameras.py <camA.mp4> <camB.mp4> <B_OFFSET> <outdir>
import subprocess, sys
import numpy as np

a_src, b_src, off, outdir = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
LUMA = np.array([0.2126, 0.7152, 0.0722])
TS = [30, 60, 80, 110, 140, 170, 200, 230, 260, 300, 330, 350, 375]
# neutral wall patches (y0, y1, x0, x1 at 270x480) used for white balance
WALL = {"A": (150, 190, 20, 60), "B": (150, 175, 140, 200)}
TARGET = {"p5": 0.055, "p50": 0.385, "p95": 0.655, "sat": 0.23}

def frames(f, ts):
    out = []
    for t in ts:
        r = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", f, "-frames:v", "1", "-vf", "scale=270:480",
                            "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
        out.append(np.frombuffer(r, np.uint8).reshape(480, 270, 3).astype(float) / 255)
    return np.array(out)

def sat(X):
    mx, mn = X.max(-1), X.min(-1)
    return float(((mx - mn) / (mx + 1e-6)).mean())

def make(params):
    gains, lo, hi, gamma, s = params
    def f(rgb):
        x = rgb * gains
        x = np.clip((x - lo) / (hi - lo), 0, 1) ** gamma
        x = TARGET["p5"] + x * (TARGET["p95"] + (1 - TARGET["p95"]) * 0.6 - TARGET["p5"])
        l = (x @ LUMA)[..., None]
        return np.clip(l + (x - l) * s, 0, 1)
    return f

def fit(X, wall):
    y0, y1, x0, x1 = wall
    w = X[:, y0:y1, x0:x1].reshape(-1, 3).mean(0)
    gains = w.mean() / w
    Xg = np.clip(X * gains, 0, 1)
    L = Xg @ LUMA
    p5, p50, p95 = np.percentile(L, [5, 50, 95])
    top = TARGET["p95"] + (1 - TARGET["p95"]) * 0.6
    # solve linear stretch so p5->target p5, p95->target p95; gamma for the midpoint
    span = top - TARGET["p5"]
    lo = p5 - (p95 - p5) * 0.0
    hi = p5 + (p95 - p5) * span / (TARGET["p95"] - TARGET["p5"])
    m = (p50 - lo) / (hi - lo)
    gamma = np.log((TARGET["p50"] - TARGET["p5"]) / span) / np.log(m)
    s = 1.0
    for _ in range(6):  # iterate saturation to hit the target
        Y = make((gains, lo, hi, gamma, s))(X)
        s *= TARGET["sat"] / sat(Y)
    return (gains, lo, hi, gamma, s)

def write_cube(f, path, n=33):
    g = np.linspace(0, 1, n)
    b, gg, r = np.meshgrid(g, g, g, indexing="ij")  # red fastest
    rgb = np.stack([r, gg, b], -1).reshape(-1, 3)
    out = f(rgb)
    with open(path, "w") as fh:
        fh.write(f"LUT_3D_SIZE {n}\n")
        for v in out: fh.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")

for cam, src, ts in (("A", a_src, TS), ("B", b_src, [t - off for t in TS])):
    X = frames(src, ts)
    p = fit(X, WALL[cam])
    Y = make(p)(X)
    L = Y @ LUMA
    print(cam, "gains", np.round(p[0], 3), "gamma", round(float(p[3]), 3), "sat x", round(p[4], 3),
          "-> L p5/50/95", np.round(np.percentile(L, [5, 50, 95]), 3), "sat", round(sat(Y), 3))
    write_cube(make(p), f"{outdir}/cam{cam}.cube")
