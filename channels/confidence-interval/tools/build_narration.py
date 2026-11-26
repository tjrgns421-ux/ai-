"""Join per-line TTS clips (video/public/ciNN/vo/lNN.mp3) into one narration track with
deliberate gaps, and write timing.json (absolute start of every line + per-word timings).
Usage (repo root): python3 channels/confidence-interval/tools/build_narration.py <episode dir> <ciNN>
Pauses come from <episode dir>/gaps.json: {"after line N": seconds}; default 0.45 s."""
import json, subprocess, sys
from pathlib import Path

EP, ID = Path(sys.argv[1]), sys.argv[2]
VO = Path(f"video/public/{ID}/vo")
LEAD = 1.2  # silence before the first line
GAP = {int(k): v for k, v in json.loads((EP / "gaps.json").read_text()).items()} if (EP / "gaps.json").exists() else {}
TAIL = 6.0  # end screen

import re
SCRIPT = (EP / "script.txt").read_text().strip().split("\n")
norm = lambda x: re.sub(r"[^a-z0-9]", "", x.lower())

def punctuate(words, line):
    """TTS word timings have no punctuation; copy it back from the script line (for caption breaks)."""
    toks, j, out = line.split(), 0, []
    for w in words:
        txt = w["text"]
        for k in range(j, min(j + 3, len(toks))):
            if norm(toks[k]) == norm(txt):
                txt, j = toks[k], k + 1
                break
        out.append({**w, "text": txt})
    return out

lines, t, inputs, filt = [], LEAD, [], []
files = sorted(VO.glob("l??.mp3"))
for i, f in enumerate(files, 1):
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))
    words = punctuate(json.loads((VO / f"{f.stem}.words.json").read_text()), SCRIPT[i - 1])
    lines.append({"i": i, "start": round(t, 3), "dur": round(dur, 3),
                  "words": [{"t": w["text"], "s": round(t + w["start"], 3), "e": round(t + w["end"], 3)} for w in words]})
    inputs += ["-i", str(f)]
    filt.append(f"[{i-1}:a]adelay={int(t*1000)}|{int(t*1000)}[a{i}]")
    t += dur + GAP.get(i, 0.45)
total = lines[-1]["start"] + lines[-1]["dur"] + TAIL
mix = ";".join(filt) + ";" + "".join(f"[a{i}]" for i in range(1, len(files) + 1)) + \
      f"amix=inputs={len(files)}:normalize=0,apad,atrim=0:{total:.3f}[o]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", mix, "-map", "[o]",
                "-ar", "44100", "-c:a", "libmp3lame", "-q:a", "2", f"video/public/{ID}/narration.mp3"], check=True)
OUTD = Path(f"video/src/ConfidenceInterval/ep{ID[2:]}")
OUTD.mkdir(parents=True, exist_ok=True)
(OUTD / "timing.json").write_text(json.dumps({"total": round(total, 3), "lines": lines}))
print(f"{len(files)} lines, total {total:.1f}s ({int(total//60)}:{int(total%60):02d})")
