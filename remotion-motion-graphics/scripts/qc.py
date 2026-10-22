#!/usr/bin/env python3
"""Measure, don't guess. Numbers for the review gates; needs only ffmpeg + Python stdlib.

  qc.py loudness <video|wav>              loudness every 0.5 s + integrated LUFS + true peak
  qc.py frames   <dir-of-pngs|video>      flag blank/broken frames (brightness scan)
  qc.py color    <image> <x> <y> <#hex>   average a 9x9 patch, compare to the brand hex (dE)

Targets: quiet before the drop, loud from it, softer on the fade; true peak <= -1.0 dBTP;
hero patch within dE ~10 of its hex (lit surfaces never match exactly — darker is usual).
"""
import glob
import os
import re
import subprocess
import sys


def run(args):
    return subprocess.run(args, capture_output=True, text=True).stderr


def loudness(path):
    log = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"])
    buckets = {}
    for t, m in re.findall(r"t:\s*([\d.]+).*?M:\s*(-?[\d.]+|-inf)", log):
        if m != "-inf":
            buckets.setdefault(int(float(t) / 0.5), []).append(float(m))
    print("time    momentary LUFS (max in each 0.5 s)")
    for b in sorted(buckets):
        v = max(buckets[b])
        print(f"{b * 0.5:5.1f}s  {v:6.1f}  {'#' * max(0, int((v + 40) / 1.5))}")
    i = re.search(r"Integrated loudness:\s*I:\s*(-?[\d.]+)", log)
    tp = re.search(r"True peak:\s*Peak:\s*(-?[\d.]+)", log)
    print(f"\nintegrated {i.group(1) if i else '?'} LUFS   true peak {tp.group(1) if tp else '?'} dBTP")
    if tp and float(tp.group(1)) > -1.0:
        print("FAIL true peak above -1.0 dBTP: add a low-pass roll-off and a true-peak ceiling")


def frames(path):
    if os.path.isdir(path):
        files = sorted(glob.glob(os.path.join(path, "*.png")))
        src = ["-framerate", "30", "-pattern_type", "glob", "-i", os.path.join(path, "*.png")]
    else:
        files, src = None, ["-i", path]
    log = run(["ffmpeg", "-hide_banner", *src, "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-f", "null", "-"])
    ys = [float(v) for v in re.findall(r"YAVG=([\d.]+)", log)]
    bad = []
    for i, y in enumerate(ys):
        prev = ys[i - 1] if i else y
        nxt = ys[i + 1] if i + 1 < len(ys) else y
        # blank, or a one-frame spike/dip against both neighbours = broken frame
        if y < 2 or (abs(y - prev) > 25 and abs(y - nxt) > 25):
            bad.append(i)
    print(f"{len(ys)} frames scanned, mean luma {sum(ys) / max(1, len(ys)):.1f}")
    if bad:
        names = [os.path.basename(files[i]) for i in bad] if files else bad
        print("SUSPECT frames (re-render only these):", names)
    else:
        print("no blank or broken frames")


def srgb_to_lab(rgb):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = map(lin, rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return 116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))


def color(path, x, y, hexc):
    x, y = int(x), int(y)
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", f"crop=9:9:{x - 4}:{y - 4}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True,
    ).stdout
    px = [raw[i:i + 3] for i in range(0, len(raw), 3)]
    avg = [sum(p[k] for p in px) / len(px) for k in range(3)]
    want = [int(hexc.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    la, lb = srgb_to_lab(avg), srgb_to_lab(want)
    de = sum((a - b) ** 2 for a, b in zip(la, lb)) ** 0.5
    got = "#%02X%02X%02X" % tuple(round(v) for v in avg)
    hint = "lighter" if la[0] > lb[0] else "darker"
    print(f"measured {got}  target {hexc.upper()}  dE {de:.1f}  ({hint} than target, L {la[0]:.0f} vs {lb[0]:.0f})")
    if de > 10:
        print("FAIL: adjust light intensity / exposure / base colour, then measure again")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    cmd, *rest = sys.argv[1:]
    {"loudness": loudness, "frames": frames, "color": color}[cmd](*rest)
