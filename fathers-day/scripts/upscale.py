# AI upscale with Real-ESRGAN "realesr-general-x4v3" (SRVGGNetCompact), CPU.
# Reads raw frames from ffmpeg, upscales x4, scales to 1080x1920, writes raw frames to stdout.
# Usage: ffmpeg ... -r 30 -f rawvideo -pix_fmt rgb24 - | python upscale.py <weights> <w> <h> [ranges.json] | ffmpeg -f rawvideo ...
# With ranges.json ([[t0, t1], ...] source seconds) only frames inside the ranges get the AI pass,
# on every other frame (15 fps, each reused once); the rest are bicubic (never on screen).
import sys
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

class SRVGGNetCompact(nn.Module):
    def __init__(self, num_feat=64, num_conv=32, upscale=4):
        super().__init__()
        self.upscale = upscale
        body = [nn.Conv2d(3, num_feat, 3, 1, 1), nn.PReLU(num_parameters=num_feat)]
        for _ in range(num_conv):
            body += [nn.Conv2d(num_feat, num_feat, 3, 1, 1), nn.PReLU(num_parameters=num_feat)]
        body += [nn.Conv2d(num_feat, 3 * upscale * upscale, 3, 1, 1)]
        self.body = nn.ModuleList(body)
        self.upsampler = nn.PixelShuffle(upscale)

    def forward(self, x):
        out = x
        for m in self.body: out = m(out)
        out = self.upsampler(out)
        return out + F.interpolate(x, scale_factor=self.upscale, mode="nearest")

import json
weights, W, H = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
RANGES = json.load(open(sys.argv[4])) if len(sys.argv) > 4 else None
FPS = 30
OW, OH = 1080, 1920
net = SRVGGNetCompact()
sd = torch.load(weights, map_location="cpu")
net.load_state_dict(sd.get("params", sd.get("params_ema", sd)))
net.eval().to(memory_format=torch.channels_last)
torch.set_num_threads(4)
inp, out, n = sys.stdin.buffer, sys.stdout.buffer, W * H * 3
used = lambda t: RANGES is None or any(a <= t <= b for a, b in RANGES)
k, last = 0, None
with torch.inference_mode():
    while True:
        buf = inp.read(n)
        if len(buf) < n: break
        t = k / FPS
        x = torch.from_numpy(np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()).permute(2, 0, 1)[None].float() / 255
        if used(t) and (k % 2 == 0 or last is None):
            with torch.autocast("cpu", dtype=torch.bfloat16):  # ~2.5x faster on CPU
                y = net(x.contiguous(memory_format=torch.channels_last)).float().clamp(0, 1)
            y = F.interpolate(y, size=(OH, OW), mode="bicubic", antialias=True, align_corners=False).clamp(0, 1)
            last = (y[0].permute(1, 2, 0) * 255).round().byte().numpy().tobytes()
            frame = last
        elif used(t):
            frame = last  # 15 fps AI: reuse the previous upscaled frame
        else:
            y = F.interpolate(x, size=(OH, OW), mode="bicubic", align_corners=False).clamp(0, 1)
            frame = (y[0].permute(1, 2, 0) * 255).round().byte().numpy().tobytes()
            last = None
        out.write(frame)
        k += 1
        if k % 300 == 0: print(f"{t:.0f}s", file=sys.stderr, flush=True)
