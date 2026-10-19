#!/usr/bin/env bash
# Final mix on the output (pause-cut) timeline: voice assembled by cut-voice.py
# from the ElevenLabs-isolated speech, plus the music bed kept low and ducked.
# Usage: scripts/mix-audio.sh   (needs public/speech_cut.wav and public/music_out.wav)
set -euo pipefail
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 public/speech_cut.wav)
ffmpeg -v error -y -i public/speech_cut.wav -i public/music_out.wav -filter_complex "
[0:a]aformat=channel_layouts=mono,highpass=f=70,
 equalizer=f=200:t=q:w=1:g=-1.5,equalizer=f=3500:t=q:w=1.4:g=2,equalizer=f=9000:t=h:w=0.7:g=1.5,
 acompressor=threshold=-22dB:ratio=2.5:attack=8:release=180:makeup=3,
 loudnorm=I=-16:TP=-1.5:LRA=8,aresample=44100,asplit=2[v][sc];
[1:a]atrim=0:$DUR,volume=0.10[m];
[m][sc]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=700[md];
[v]pan=stereo|c0=c0|c1=c0[vs];
[vs][md]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95,
 afade=t=in:d=0.4,afade=t=out:st=$(python3 -c "print($DUR-2.5)"):d=2.5[out]" \
 -map "[out]" -ar 48000 public/mix.wav
