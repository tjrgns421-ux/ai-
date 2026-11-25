"""Short narrations (video/public/ci01/shorts/sN.mp3) -> punctuated word timings for Remotion
(video/src/ConfidenceInterval/ep01/shortN.json). Run from repo root."""
import json, re, subprocess
from pathlib import Path

norm = lambda x: re.sub(r"[^a-z0-9]", "", x.lower())
for n in (1, 2):
    toks = Path(f"channels/confidence-interval/ep01-voynich/shorts/short{n}.txt").read_text().split()
    words = json.loads(Path(f"video/public/ci01/shorts/s{n}.words.json").read_text())
    j, out = 0, []
    for w in words:
        t = w["text"]
        for k in range(j, min(j + 3, len(toks))):
            if norm(toks[k]) == norm(t):
                t, j = toks[k], k + 1
                break
        out.append({"t": t, "s": round(w["start"], 3), "e": round(w["end"], 3)})
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"video/public/ci01/shorts/s{n}.mp3"]))
    Path(f"video/src/ConfidenceInterval/ep01/short{n}.json").write_text(json.dumps({"dur": round(dur, 3), "words": out}))
    print(n, dur, len(out))
