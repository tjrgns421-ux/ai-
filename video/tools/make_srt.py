#!/usr/bin/env python3
"""Make English and Korean subtitle files (.srt) for a narrated video.

python3 video/tools/make_srt.py <dir> <out_prefix> [--ko ko.txt] [--words words.full.json] [--clips clips.json]
  <dir>: has lines.json and narration.words.json (or --words, e.g. words.full.json when recordings were inserted)
  --ko: Korean translation, one line per script line (same count as lines.json)
  --clips: clips.json from insert_clips.py; each inserted recording gets a "[NOAA recording]" / "[NOAA 실제 녹음]" cue
Writes <out_prefix>.en.srt (one cue per ~8 words, timed by word) and <out_prefix>.ko.srt (one cue per script line,
long lines split at sentence ends with time shared by length).
"""
import argparse, json, re
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("dir"); ap.add_argument("out")
ap.add_argument("--ko"); ap.add_argument("--words", default="narration.words.json"); ap.add_argument("--clips")
a = ap.parse_args()
d = Path(a.dir)
L = json.loads((d / "lines.json").read_text())
W = json.loads((d / a.words).read_text())
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
big = ""; own = []
for i, w in enumerate(W):
    for c in norm(w["text"]):
        big += c; own.append(i)
# word index range of every line
rng = []; pos = 0
for l in L:
    n = len(norm(l)); rng.append((own[pos], own[pos + n - 1])); pos += n

def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"

def write(path, cues):
    cues = sorted(cues)
    out = []
    for k, (s, e, txt) in enumerate(cues, 1):
        nxt = cues[k][0] if k < len(cues) else e + 1
        out.append(f"{k}\n{ts(s)} --> {ts(min(e, nxt - 0.02))}\n{txt}\n")
    Path(path).write_text("\n".join(out), encoding="utf-8")

clips = json.loads(Path(a.clips).read_text()) if a.clips else []
en = []
# take words from the script (keeps punctuation) and their times from the narration
cpos = 0
for l in L:
    toks = [t for t in l.split() if norm(t)]
    timed = []
    for t in toks:
        n = len(norm(t)); i0, i1 = own[cpos], own[cpos + n - 1]; cpos += n
        timed.append((W[i0]["start"], W[i1]["end"], t))
    n = -(-len(timed) // 9)  # cues of up to ~9 words, balanced (no 1-3 word leftovers)
    size = -(-len(timed) // n) if n else 1
    for j in range(0, len(timed), size):
        part = timed[j:j + size]
        en.append((part[0][0], part[-1][1] + 0.15, " ".join(x[2] for x in part)))
en += [(c["at"], c["at"] + c["dur"] - 0.3, "[NOAA recording]") for c in clips]
write(f"{a.out}.en.srt", en)
if a.ko:
    K = [x for x in Path(a.ko).read_text(encoding="utf-8").split("\n") if x.strip()]
    assert len(K) == len(L), f"Korean has {len(K)} lines, script has {len(L)}"
    ko = []
    for (i0, i1), txt in zip(rng, K):
        s, e = W[i0]["start"], W[i1]["end"] + 0.2
        parts = [p for p in re.split(r"(?<=[.?!])\s+", txt) if p]
        tot = sum(len(p) for p in parts)
        t = s
        for p in parts:
            dt = (e - s) * len(p) / tot
            ko.append((t, t + dt, p)); t += dt
    ko += [(c["at"], c["at"] + c["dur"] - 0.3, "[NOAA 실제 녹음]") for c in clips]
    write(f"{a.out}.ko.srt", ko)
print("ok", a.out)
