#!/bin/bash
# 긴 영상을 구간별로 렌더링(이어 하기 가능) → 이어 붙이기 → 내레이션 입히기
set -e
cd "$(dirname "$0")/.."
COMP=${COMP:-Cm01Full}; TOTAL=${TOTAL:-16404}; STEP=${STEP:-2000}; OUT=${OUT:-out/cm01}; AUDIO=${AUDIO:-public/cm01/narration.mp3}; NAME=${NAME:-cm01-full}; PARTS=$OUT/parts
BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p $PARTS; : > $PARTS/list.txt
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); ((b>=TOTAL)) && b=$((TOTAL-1))
  p=$PARTS/part-$(printf %05d $a).mp4
  echo "file '$(basename $p)'" >> $PARTS/list.txt
  if [ -s $p.done ]; then echo "건너뜀 $a-$b"; continue; fi
  echo "$(date +%H:%M) 렌더링 $a-$b / $TOTAL"
  npx remotion render $COMP $p --frames=$a-$b --muted --concurrency=4 --browser-executable=$BROWSER --log=error
  echo ok > $p.done
done
echo "$(date +%H:%M) 이어 붙이는 중"
ffmpeg -y -v error -f concat -safe 0 -i $PARTS/list.txt -i $AUDIO -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af apad -shortest $OUT/$NAME.mp4
echo "$(date +%H:%M) 완료"; ls -la $OUT/$NAME.mp4
