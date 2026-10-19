# Free speech enhancement with DeepFilterNet3 (https://github.com/Rikorose/DeepFilterNet).
# Suppression is capped (ATTEN_LIM) so a little real room tone stays and the voice sounds human.
# Usage: <venv>/bin/python scripts/enhance-voice.py <in.wav> <out.wav> <DeepFilterNet3 model dir> [atten dB]
import sys, wave
import numpy as np
import torch
from df.enhance import enhance, init_df

src, out, model_dir = sys.argv[1:4]
ATTEN_LIM = float(sys.argv[4]) if len(sys.argv) > 4 else 22.0
model, state, _ = init_df(model_dir, log_level="ERROR")
sr = state.sr()  # 48 kHz
w = wave.open(src)
assert w.getframerate() == sr and w.getnchannels() == 1, "expects 48 kHz mono"
x = torch.from_numpy(np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768)[None]
chunk = sr * 60  # 1-minute chunks with 1 s overlap keep memory flat
outs, pos, ov = [], 0, sr
while pos < x.shape[1]:
    seg = x[:, max(0, pos - ov): pos + chunk]
    y = enhance(model, state, seg, atten_lim_db=ATTEN_LIM)
    outs.append(y[:, (ov if pos else 0):])
    pos += chunk
y = torch.cat(outs, 1)[:, : x.shape[1]].numpy()[0]
o = wave.open(out, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
o.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
print(out, y.shape[0] / sr, "s")
