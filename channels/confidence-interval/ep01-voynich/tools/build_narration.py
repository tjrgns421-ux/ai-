"""Join per-line TTS clips (video/public/ci01/vo/lNN.mp3) into one narration track with
deliberate gaps, and write timing.json (absolute start of every line + per-word timings).
Run from repo root: python3 channels/confidence-interval/ep01-voynich/tools/build_narration.py"""
import json, subprocess
from pathlib import Path

VO = Path("video/public/ci01/vo")
LEAD = 1.2  # silence before the first line (f1r fades in)
# extra pause AFTER line N (1-based). Default gap 0.45 s.
GAP = {2: 1.6, 3: 1.4, 5: 1.4, 9: 0.8, 10: 2.6, 11: 1.6, 15: 0.8, 16: 2.6, 17: 0.9,
       19: 0.7, 20: 0.9, 21: 2.6, 22: 1.6, 23: 0.8, 24: 1.4, 26: 2.6, 27: 0.9, 29: 2.6, 30: 0.8,
       31: 2.6, 32: 0.9, 34: 3.0, 36: 3.2, 37: 1.6, 38: 0.9, 39: 0.9, 40: 0.9, 41: 1.2, 42: 2.6,
       43: 0.9, 44: 1.0, 45: 1.0, 46: 2.2, 47: 1.0}
TAIL = 6.0  # end screen

import re
SCRIPT = Path("channels/confidence-interval/ep01-voynich/script.txt").read_text().strip().split("\n")
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
                "-ar", "44100", "-c:a", "libmp3lame", "-q:a", "2", "video/public/ci01/narration.mp3"], check=True)
Path("video/src/ConfidenceInterval/ep01").mkdir(parents=True, exist_ok=True)
Path("video/src/ConfidenceInterval/ep01/timing.json").write_text(json.dumps({"total": round(total, 3), "lines": lines}))
print(f"{len(files)} lines, total {total:.1f}s ({int(total//60)}:{int(total%60):02d})")
