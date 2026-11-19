"""Long narration, one line at a time.

The free edge-tts service sometimes rejects long requests (NoAudioReceived).
This calls the tts skill once per script line, with retries, trims each clip
just after its last word, joins the clips, and shifts the word timings.

python3 video/tools/tts_lines.py <script.txt> <out_dir> [--voice V] [--rate R] [--gap 0.12]
Writes <out_dir>/narration.mp3, narration.words.json, lines.json
"""
import argparse
import hashlib
import shutil
import json
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TTS = ROOT / ".claude/skills/tts/scripts/tts.py"


def speak(text, out, name, voice, rate, tries=6):
    for k in range(tries):
        r = subprocess.run([sys.executable, str(TTS), "speak", text, "--voice", voice, "--rate", rate,
                            "--out", str(out), "--name", name, "--captions", "dialogue"],
                           capture_output=True, text=True)
        if r.returncode == 0 and (out / f"{name}.words.json").exists():
            return json.loads((out / f"{name}.words.json").read_text())
        time.sleep(2 + 3 * k)
    sys.exit(f"TTS failed after {tries} tries: {text[:60]}\n{r.stdout[-300:]}{r.stderr[-300:]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("out")
    ap.add_argument("--voice", default="en-US-AndrewMultilingualNeural")
    ap.add_argument("--rate", default="+8%")
    ap.add_argument("--gap", type=float, default=0.12, help="silence kept after each line (s)")
    a = ap.parse_args()
    lines = [l.strip() for l in Path(a.script).read_text(encoding="utf-8").splitlines() if l.strip()]
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    words, parts, t0 = [], [], 0.0
    cache = out / ".lines"  # finished clips are kept, so a rerun only redoes what failed
    cache.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        for i, line in enumerate(lines):
            name = f"l{i:03d}"
            key = hashlib.sha1(f"{a.voice}|{a.rate}|{line}".encode()).hexdigest()[:16]
            if (cache / f"{key}.words.json").exists():
                shutil.copy(cache / f"{key}.mp3", tmp / f"{name}.mp3")
                ws = json.loads((cache / f"{key}.words.json").read_text())
            else:
                ws = speak(line, tmp, name, a.voice, a.rate)
                shutil.copy(tmp / f"{name}.mp3", cache / f"{key}.mp3")
                (cache / f"{key}.words.json").write_text(json.dumps(ws))
            spoken = [w for w in ws if any(c.isalnum() for c in w["text"])]
            end = spoken[-1]["end"] + a.gap
            wav = tmp / f"{name}.wav"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp / f"{name}.mp3"), "-t", f"{end:.3f}",
                            "-ar", "24000", "-ac", "1", str(wav)], check=True)
            dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)],
                                       capture_output=True, text=True, check=True).stdout)
            for w in ws:
                if w["start"] < end:
                    words.append({"text": w["text"], "start": round(w["start"] + t0, 3), "end": round(min(w["end"], end) + t0, 3)})
            parts.append(wav)
            t0 += dur
            print(f"{i + 1}/{len(lines)} {t0:6.1f}s  {line[:60]}", flush=True)
        lst = tmp / "list.txt"
        lst.write_text("".join(f"file '{p}'\n" for p in parts))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                        "-c:a", "libmp3lame", "-b:a", "128k", str(out / "narration.mp3")], check=True)
    (out / "narration.words.json").write_text(json.dumps(words, ensure_ascii=False, indent=1))
    (out / "lines.json").write_text(json.dumps(lines, ensure_ascii=False, indent=1))
    print(f"done: {t0:.1f}s, {len(words)} words")


if __name__ == "__main__":
    main()
