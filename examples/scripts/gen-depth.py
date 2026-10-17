"""Depth maps for the 3D camera moves in SolitudeLyrics.

Runs MiDaS v2.1 small (ONNX, CPU) on every public/lyrics/shot-XX.png and writes
shot-XX-depth.png next to it: grayscale, white = near, black = far.
Foreground edges are dilated slightly so near objects cover their own edges
when the camera moves (avoids rubber-sheet halos).

When shot-XX-plate.png exists (the same still with the man removed, from
gen-lyrics-images.mjs --plates), the depth map is made from the plate instead,
the man is cut out with a person matting model (rembg u2net_human_seg) into
shot-XX-fg.png (RGBA), and his depth goes into layers.json. He then moves as a flat layer at that depth, so
the camera never warps his body.

Model (66 MB, MIT): https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx
saved to examples/models/midas-small.onnx (gitignored).

Usage: python3 scripts/gen-depth.py [image ...]
"""
import json
import re
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


def inverse_depth(img: Image.Image, session: ort.InferenceSession) -> np.ndarray:
    x = np.asarray(img.resize((256, 256), Image.BICUBIC), dtype=np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
    return session.run(None, {session.get_inputs()[0].name: x})[0][0]  # near = high


def save_depth(d: np.ndarray, size: tuple[int, int], dest: Path) -> None:
    out = Image.fromarray((d * 255).astype(np.uint8)).resize(size, Image.BICUBIC)
    out = out.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
    out.save(dest)


def cutout(img: Image.Image, seg) -> np.ndarray:
    """Soft alpha (0..1) of the man (and his reflection) from a person matting model."""
    from rembg import remove

    m = np.asarray(remove(img, session=seg, only_mask=True, post_process_mask=False), dtype=np.float32) / 255.0
    return np.clip((m - 0.08) / 0.84, 0, 1)


def process(path: Path, session: ort.InferenceSession, seg, layers: dict) -> None:
    img = Image.open(path).convert("RGB")
    plate_path = path.with_name(path.stem + "-plate.png")
    if not plate_path.exists():
        inv = inverse_depth(img, session)
        lo, hi = np.percentile(inv, 1), np.percentile(inv, 99)
        save_depth(np.clip((inv - lo) / (hi - lo + 1e-6), 0, 1), img.size, path.with_name(path.stem + "-depth.png"))
        print("depth:", path.stem)
        return

    plate = Image.open(plate_path).convert("RGB").resize(img.size, Image.BICUBIC)
    inv_bg = inverse_depth(plate, session)
    inv_all = inverse_depth(img, session)
    lo, hi = np.percentile(inv_bg, 1), np.percentile(inv_bg, 99)
    norm = lambda v: np.clip((v - lo) / (hi - lo + 1e-6), 0, 1)
    save_depth(norm(inv_bg), img.size, path.with_name(path.stem + "-depth.png"))

    alpha = cutout(img, seg)
    rgba = np.dstack([np.asarray(img), (alpha * 255).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(path.with_name(path.stem + "-fg.png"))

    # his depth: where he stands, i.e. the plate's depth just under his lowest pixels
    small = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).resize((256, 256))) > 127
    rows = np.flatnonzero(small.any(axis=1))
    d_bg = norm(inv_bg)
    if rows.size:
        foot = rows[-1]
        cols = np.flatnonzero(small[foot])
        # cut off by the frame bottom: he is as near as the ground there
        fg = float(np.median(d_bg[min(foot + 2, 255), cols]))
    else:
        fg = 0.5
    layers[path.stem] = {"fg": round(min(max(fg, 0.0), 1.0), 3)}
    print(f"depth + cutout: {path.stem} (man at depth {layers[path.stem]['fg']})")


def main() -> None:
    if not MODEL.exists():
        sys.exit(f"missing {MODEL} — download model-small.onnx from the MiDaS v2_1 release")
    targets = [Path(p) for p in sys.argv[1:]] or sorted(
        p for p in SHOTS.glob("shot-*.png") if re.fullmatch(r"shot-\d+", p.stem)
    )
    session = ort.InferenceSession(str(MODEL), providers=["CPUExecutionProvider"])
    layers_path = SHOTS / "layers.json"
    layers = json.loads(layers_path.read_text()) if layers_path.exists() else {}
    seg = None
    if any(p.with_name(p.stem + "-plate.png").exists() for p in targets):
        from rembg import new_session  # pip install "rembg[cpu]"; model auto-downloads

        seg = new_session("u2net_human_seg")
    for p in targets:
        process(p, session, seg, layers)
    layers_path.write_text(json.dumps(layers, indent=2, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
