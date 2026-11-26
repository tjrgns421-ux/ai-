"""Short narrations (video/public/<ciNN>/shorts/sN.mp3) -> punctuated word timings for Remotion
(video/src/ConfidenceInterval/epNN/shortN.json).
Usage (repo root): python3 channels/confidence-interval/tools/build_shorts.py <episode dir> <ciNN>"""
import json, re, subprocess, sys
from pathlib import Path

EP, ID = Path(sys.argv[1]), sys.argv[2]

norm = lambda x: re.sub(r"[^a-z0-9]", "", x.lower())
for n in (1, 2):
    toks = (EP / f"shorts/short{n}.txt").read_text().split()
    words = json.loads(Path(f"video/public/{ID}/shorts/s{n}.words.json").read_text())
    j, out = 0, []
    for w in words:
        t = w["text"]
        for k in range(j, min(j + 3, len(toks))):
            if norm(toks[k]) == norm(t):
                t, j = toks[k], k + 1
                break
        out.append({"t": t, "s": round(w["start"], 3), "e": round(w["end"], 3)})
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"video/public/{ID}/shorts/s{n}.mp3"]))
    Path(f"video/src/ConfidenceInterval/ep{ID[2:]}/short{n}.json").write_text(json.dumps({"dur": round(dur, 3), "words": out}))
    print(n, dur, len(out))
