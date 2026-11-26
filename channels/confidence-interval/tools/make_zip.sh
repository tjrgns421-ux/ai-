#!/usr/bin/env bash
# Package one episode per the delivery rule: "컨피던스 N화.zip" with -롱폼 / -쇼츠1 / -쇼츠2 mp4s.
# Usage: make_zip.sh <N> <dir with the three mp4s> [out dir]
set -euo pipefail
N=$1; SRC=$2; OUT=${3:-$SRC}
cd "$SRC"
files=("컨피던스 ${N}화-롱폼.mp4" "컨피던스 ${N}화-쇼츠1.mp4" "컨피던스 ${N}화-쇼츠2.mp4")
for f in "${files[@]}"; do [ -s "$f" ] || { echo "missing: $f" >&2; exit 1; }; done
mkdir -p "$OUT"
rm -f "$OUT/컨피던스 ${N}화.zip"
zip -q -0 "$OUT/컨피던스 ${N}화.zip" "${files[@]}"
unzip -l "$OUT/컨피던스 ${N}화.zip"
