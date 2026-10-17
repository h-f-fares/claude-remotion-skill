"""Depth maps for the 3D camera moves in SolitudeLyrics.

Runs MiDaS v2.1 small (ONNX, CPU) on every public/lyrics/shot-XX.png and writes
shot-XX-depth.png next to it: grayscale, white = near, black = far.
Foreground edges are dilated slightly so near objects cover their own edges
when the camera moves (avoids rubber-sheet halos).

Model (66 MB, MIT): https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx
saved to examples/models/midas-small.onnx (gitignored).

Usage: python3 scripts/gen-depth.py [image ...]
"""
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / "models" / "midas-small.onnx"
SHOTS = ROOT / "public" / "lyrics"
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def depth_for(path: Path, session: ort.InferenceSession) -> Path:
    img = Image.open(path).convert("RGB")
    x = np.asarray(img.resize((256, 256), Image.BICUBIC), dtype=np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
    inv = session.run(None, {session.get_inputs()[0].name: x})[0][0]  # inverse depth, near = high
    lo, hi = np.percentile(inv, 1), np.percentile(inv, 99)
    d = np.clip((inv - lo) / (hi - lo + 1e-6), 0, 1)
    out = Image.fromarray((d * 255).astype(np.uint8)).resize(img.size, Image.BICUBIC)
    out = out.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
    dest = path.with_name(path.stem + "-depth.png")
    out.save(dest)
    return dest


def main() -> None:
    if not MODEL.exists():
        sys.exit(f"missing {MODEL} — download model-small.onnx from the MiDaS v2_1 release")
    targets = [Path(p) for p in sys.argv[1:]] or sorted(
        p for p in SHOTS.glob("shot-*.png") if not p.stem.endswith("-depth")
    )
    session = ort.InferenceSession(str(MODEL), providers=["CPUExecutionProvider"])
    for p in targets:
        print("depth:", depth_for(p, session).name)


if __name__ == "__main__":
    main()
