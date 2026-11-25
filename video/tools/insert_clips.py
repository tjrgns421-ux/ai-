#!/usr/bin/env python3
"""Insert real recordings into a line-by-line narration, after given lines, and shift word timings.

python3 video/tools/insert_clips.py <dir> <cues.json>
  <dir>: has narration.mp3, narration.words.json, lines.json, snd/<clip files>
  cues.json: {"<line index>": ["<clip file>", <seconds to keep>], ...}
Writes <dir>/full.mp3, words.full.json, clips.json (start time and length of every inserted clip),
env.json (80-step loudness envelope per clip) and img/spec_<clip>.jpg (spectrogram of each clip).
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np

d = Path(sys.argv[1]); cues = {int(k): v for k, v in json.loads(Path(sys.argv[2]).read_text()).items()}
GAP = 0.5
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
W = json.loads((d / "narration.words.json").read_text()); L = json.loads((d / "lines.json").read_text())
big = ""; own = []
for i, w in enumerate(W):
    for c in norm(w["text"]):
        big += c; own.append(i)
pos = 0; ends = []
for l in L:
    pos += len(norm(l)); k = own[pos - 1]
    # cut halfway between this line's last word and the next line's first word
    ends.append((W[k]["end"] + W[k + 1]["start"]) / 2 if k + 1 < len(W) else W[k]["end"])
run = lambda *a: subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
parts = []; ins = []; shift = 0.0; prev = 0.0; cut = []
for i in sorted(cues):
    f, keep = cues[i]; t = ends[i]
    run("-ss", str(prev), "-to", str(t), "-i", str(d / "narration.mp3"), "-ar", "48000", "-ac", "2", str(d / f"tmp_n{i}.wav"))
    run("-t", str(keep), "-i", str(d / "snd" / f), "-af", f"loudnorm=I=-17:TP=-2,afade=t=in:d=0.15,afade=t=out:st={keep - 0.6}:d=0.6,apad=pad_dur={GAP}", "-ar", "48000", "-ac", "2", str(d / f"tmp_c{i}.wav"))
    parts += [f"tmp_n{i}.wav", f"tmp_c{i}.wav"]
    ins.append({"line": i, "file": f, "at": round(t + shift, 3), "dur": keep + GAP})
    cut.append((t, keep + GAP)); shift += keep + GAP; prev = t
run("-ss", str(prev), "-i", str(d / "narration.mp3"), "-ar", "48000", "-ac", "2", str(d / "tmp_last.wav")); parts.append("tmp_last.wav")
(d / "tmp_list.txt").write_text("".join(f"file '{p}'\n" for p in parts))
run("-f", "concat", "-safe", "0", "-i", str(d / "tmp_list.txt"), "-c:a", "libmp3lame", "-b:a", "192k", str(d / "full.mp3"))
for p in d.glob("tmp_*"):
    p.unlink()
for w in W:
    s = sum(g for t, g in cut if w["start"] >= t)
    w["start"] = round(w["start"] + s, 3); w["end"] = round(w["end"] + s, 3)
(d / "words.full.json").write_text(json.dumps(W))
(d / "clips.json").write_text(json.dumps(ins, indent=1))
env = {}
STOP = {"ak52_10x.wav": 700, "whistle16x.wav": 600}
(d / "img").mkdir(exist_ok=True)
for f, keep in {v[0]: v[1] for v in cues.values()}.items():
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-t", str(keep), "-i", str(d / "snd" / f), "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout, dtype=np.int16).astype(float)
    hop = max(1, len(a) // 80)
    e = [float(np.sqrt((a[i * hop:(i + 1) * hop] ** 2).mean())) for i in range(80)]
    env[f] = [round(x / (max(e) or 1), 3) for x in e]
    run("-t", str(keep), "-i", str(d / "snd" / f), "-lavfi", f"showspectrumpic=s=1600x560:legend=0:stop={STOP.get(f, 1100)}:color=magma:scale=log", str(d / "img" / f"spec_{f.rsplit('.', 1)[0]}.jpg"))
(d / "env.json").write_text(json.dumps(env))
print(f"full.mp3 ends at {W[-1]['end']:.1f}s; {len(ins)} clips")
