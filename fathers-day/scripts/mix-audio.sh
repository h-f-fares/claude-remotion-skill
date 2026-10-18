#!/usr/bin/env bash
# Voice enhancement on camera A's mic + music bed ducked under the voice.
# Usage: scripts/mix-audio.sh <camA source> <start s> <end s>
set -euo pipefail
SRC=$1; T0=$2; T1=$3
DUR=$(python3 -c "print($T1-$T0)")
ffmpeg -v error -y -ss "$T0" -t "$DUR" -i "$SRC" -ss "$T0" -t "$DUR" -i public/music_raw.wav -filter_complex "
[0:a]aformat=channel_layouts=mono,highpass=f=85,lowpass=f=11000,afftdn=nr=14:nf=-50:tn=1,
 equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=3,
 acompressor=threshold=-24dB:ratio=3:attack=10:release=200:makeup=4,
 loudnorm=I=-16:TP=-1.5:LRA=9,aresample=44100,asplit=2[v][sc];
[1:a]volume=0.22[m];
[m][sc]sidechaincompress=threshold=0.03:ratio=4:attack=60:release=900[md];
[v]pan=stereo|c0=c0|c1=c0[vs];
[vs][md]amix=inputs=2:normalize=0,alimiter=limit=0.95,
 afade=t=in:d=0.6,afade=t=out:st=$(python3 -c "print($DUR-2.5)"):d=2.5[out]" \
 -map "[out]" -ar 48000 public/mix.wav
