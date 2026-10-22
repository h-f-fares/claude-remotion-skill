#!/bin/sh
# ClawdEdit through Blender — one command on a Mac (Apple silicon) or any machine with Blender.
#
#   blender/run.sh stills            # 18 half-size Cycles stills + contact sheet (the review gate)
#   blender/run.sh eevee             # full film, EEVEE  (~1-3 s/frame on an M3)
#   blender/run.sh cycles            # full film, Cycles (~5-12 s/frame on a base M3, Metal + denoise)
#   FRAMES=105-145,285-360 blender/run.sh cycles   # re-render only these frames, then re-encode
#
# Env: BLENDER (path to the binary), FRAMES, SCALE (%), SAMPLES, FSTOP.
set -e
cd "$(dirname "$0")/.."
MODE=${1:-stills}
if [ -z "$BLENDER" ]; then
  if [ -x /Applications/Blender.app/Contents/MacOS/Blender ]; then BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
  else BLENDER=blender; fi
fi
B=blender/build
mkdir -p $B

# 1) textures + motion + sound, all from the same timeline the Remotion film uses (skips if present)
if [ ! -f $B/ui.png ] || [ ! -f $B/comp/element-359.png ]; then
  (cd examples && npx remotion still src/clawdedit/index.ts ClawdUI ../$B/ui.png --overwrite \
    && npx remotion render src/clawdedit/index.ts ClawdComp ../$B/comp --sequence --image-format=png)
fi
node blender/export_motion.mjs
if [ ! -f examples/public/clawdedit/sound_master.wav ]; then
  (cd examples && npm run -s audio:clawdedit && npm run -s master:clawdedit)
fi

# 2) build the .blend (bakes every frame from motion.json)
"$BLENDER" -b --factory-startup -P blender/scene.py -- --build $B ${FSTOP:+--fstop $FSTOP}

# 3) render
case "$MODE" in
  stills)
    FR=$(node -e 'console.log(Array.from({length:18},(_,i)=>1+Math.round(i*359/17)).join(","))')
    rm -rf $B/stills
    "$BLENDER" -b $B/clawdedit.blend -P blender/gpu.py -P blender/render.py -- \
      --engine cycles --frames "$FR" --scale 50 --samples ${SAMPLES:-32} --out $B/stills
    ffmpeg -v error -y -pattern_type glob -i "$B/stills/f_*.png" -vf "scale=480:-2,tile=6x3" -frames:v 1 $B/contact_sheet.png
    echo "contact sheet: $B/contact_sheet.png"
    ;;
  eevee|cycles)
    "$BLENDER" -b $B/clawdedit.blend -P blender/gpu.py -P blender/render.py -- \
      --engine "$MODE" --frames "${FRAMES:-1-360}" --scale ${SCALE:-100} ${SAMPLES:+--samples $SAMPLES} --out $B/frames_$MODE
    ffmpeg -v error -y -framerate 30 -start_number 1 -i $B/frames_$MODE/f_%04d.png \
      -i examples/public/clawdedit/sound_master.wav -c:v libx264 -profile:v high -crf 17 -pix_fmt yuv420p \
      -c:a aac -b:a 320k -movflags +faststart -shortest $B/clawd-edit-$MODE.mp4
    python3 remotion-motion-graphics/scripts/qc.py frames $B/frames_$MODE
    echo "film: $B/clawd-edit-$MODE.mp4"
    ;;
  *) echo "usage: blender/run.sh stills|eevee|cycles"; exit 1 ;;
esac
