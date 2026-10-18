#!/usr/bin/env bash
# Mix: ElevenLabs-isolated voice (public/speech_isolated.mp3, already trimmed to the
# edit) + the music bed, kept low and ducked under the voice.
# Usage: scripts/mix-audio.sh <start s> <end s>   (music_raw.wav is on camera A's clock)
set -euo pipefail
T0=$1; T1=$2
DUR=$(python3 -c "print($T1-$T0)")
ffmpeg -v error -y -ss 0.011 -t "$DUR" -i public/speech_isolated.mp3 -ss "$T0" -t "$DUR" -i public/music_raw.wav -filter_complex "
[0:a]aformat=channel_layouts=mono,highpass=f=70,
 equalizer=f=200:t=q:w=1:g=-1.5,equalizer=f=3500:t=q:w=1.4:g=2,equalizer=f=9000:t=h:w=0.7:g=1.5,
 acompressor=threshold=-22dB:ratio=2.5:attack=8:release=180:makeup=3,
 loudnorm=I=-16:TP=-1.5:LRA=8,aresample=44100,asplit=2[v][sc];
[1:a]volume=0.10[m];
[m][sc]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=700[md];
[v]pan=stereo|c0=c0|c1=c0[vs];
[vs][md]amix=inputs=2:normalize=0,alimiter=limit=0.95,
 afade=t=in:d=0.4,afade=t=out:st=$(python3 -c "print($DUR-2.5)"):d=2.5[out]" \
 -map "[out]" -ar 48000 public/mix.wav
