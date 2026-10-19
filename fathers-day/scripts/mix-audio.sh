#!/usr/bin/env bash
# Final mix on the output timeline (cold open + pause-cut body + end card):
#   voice  public/speech_cut.wav  (Adobe-enhanced, cut by cut-voice.py)
#   room   public/room_cut.wav    (camera B room sound; opens up for laughs/applause)
#   score  public/score.wav       (gen-score.py), ducked under the voice
# Usage: scripts/mix-audio.sh <end_card_seconds>
set -euo pipefail
END=${1:-3.5}
BODY=$(ffprobe -v error -show_entries format=duration -of csv=p=0 public/speech_cut.wav)
TOTAL=$(python3 -c "print($BODY+$END)")
ffmpeg -v error -y -i public/speech_cut.wav -i public/room_cut.wav -i public/score.wav -filter_complex "
[0:a]aformat=channel_layouts=mono,highpass=f=60,acompressor=threshold=-20dB:ratio=1.6:attack=15:release=250:makeup=1.5,
 loudnorm=I=-16:TP=-1.5:LRA=8,aresample=44100,apad=whole_dur=$TOTAL,asplit=2[v][sc];
[1:a]aresample=44100,volume=3.2,apad=whole_dur=$TOTAL,afade=t=out:st=$(python3 -c "print($BODY-0.3)"):d=2.5,pan=stereo|c0=0.9*c0|c1=c0[room];
[2:a]atrim=0:$TOTAL,volume=0.85[m];
[m][sc]sidechaincompress=threshold=0.03:ratio=2.5:attack=60:release=700[md];
[v]pan=stereo|c0=c0|c1=c0[vs];
[vs][room][md]amix=inputs=3:normalize=0:duration=longest,atrim=0:$TOTAL,alimiter=limit=0.95,
 afade=t=in:d=0.3,afade=t=out:st=$(python3 -c "print($TOTAL-1.2)"):d=1.2[out]" \
 -map "[out]" -ar 48000 public/mix.wav
