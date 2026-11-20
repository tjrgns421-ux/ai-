#!/bin/bash
# Blip Check long-form: render in resumable chunks (muted) + one full audio pass (narration and sfx), then mux.
# COMP=Sn03Full TOTAL=8811 OUT=out/sn03 NAME=sn03-full bash tools/render-long.sh
set -e
cd "$(dirname "$0")/.."
: "${COMP:?}" "${TOTAL:?}" "${OUT:?}"; STEP=${STEP:-1500}; NAME=${NAME:-full}; PARTS=$OUT/parts
BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p $PARTS; : > $PARTS/list.txt
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); ((b>=TOTAL)) && b=$((TOTAL-1))
  p=$PARTS/part-$(printf %05d $a).mp4
  echo "file '$(basename $p)'" >> $PARTS/list.txt
  if [ -s $p.done ]; then echo "skip $a-$b"; continue; fi
  echo "$(date +%H:%M) video $a-$b / $TOTAL"
  npx remotion render $COMP $p --frames=$a-$b --muted --concurrency=4 --browser-executable=$BROWSER --log=error
  echo ok > $p.done
done
if [ ! -s $OUT/mix.wav ]; then
  echo "$(date +%H:%M) audio"
  npx remotion render $COMP $OUT/mix.wav --codec=wav --browser-executable=$BROWSER --log=error
fi
echo "$(date +%H:%M) mux"
ffmpeg -y -v error -f concat -safe 0 -i $PARTS/list.txt -i $OUT/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest $OUT/$NAME.mp4
echo "$(date +%H:%M) done"; ls -la $OUT/$NAME.mp4
