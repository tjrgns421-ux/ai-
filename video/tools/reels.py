"""Cut vertical Reels/Shorts (1080x1920) from finished 16:9 videos without re-rendering.

python3 tools/reels.py reels.json out/reels
spec: [{"name", "title": ["line 1", "line 2"], "parts": [{"ep": "mp01", "video": "out/mp01/mp01-full.mp4", "from": "phrase", "to": "phrase"}, ...]}]
Cut points come from the narration word timings (public/<ep>/narration.words.json): the first word of
`from` to the last word of `to`. The 16:9 frame sits in the middle over a blurred copy of itself;
the title goes on top and the channel line below.
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

FONT = sys.argv[3] if len(sys.argv) > 3 else "Pretendard-Black.ttf"
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())

def span(ep, a, b):
    w = json.load(open(f"public/{ep}/narration.words.json"))
    big, own = "", []
    for i, x in enumerate(w):
        for c in norm(x["text"]):
            big += c; own.append(i)
    i = big.find(norm(a)); j = big.find(norm(b), i)
    if i < 0 or j < 0: sys.exit(f"phrase not found: {a!r} / {b!r}")
    return max(0, w[own[i]]["start"] - 0.15), w[own[j + len(norm(b)) - 1]]["end"] + 0.45

def esc(t):
    return t.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’").replace("%", "\\%")

def main():
    spec, out = json.load(open(sys.argv[1])), Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    for r in spec:
        with tempfile.TemporaryDirectory() as td:
            pieces = []
            for k, p in enumerate(r["parts"]):
                s, e = span(p["ep"], p["from"], p["to"])
                f = Path(td) / f"p{k}.mp4"
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s:.2f}", "-to", f"{e:.2f}", "-i", p["video"],
                                "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-c:a", "aac", "-b:a", "192k", str(f)], check=True)
                pieces.append(f)
            lst = Path(td) / "list.txt"; lst.write_text("".join(f"file '{p}'\n" for p in pieces))
            joined = Path(td) / "joined.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(joined)], check=True)
            dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(joined)], capture_output=True, text=True).stdout)
            t1, t2 = r["title"][0], (r["title"][1] if len(r["title"]) > 1 else "")
            vf = (
                "[0:v]split[a][b];"
                "[a]scale=-2:1920,crop=1080:1920,boxblur=24:2,eq=brightness=-0.28[bg];"
                "[b]scale=1080:-2[fg];"
                "[bg][fg]overlay=0:(H-h)/2,"
                f"drawtext=fontfile={FONT}:text='{esc(t1)}':fontcolor=0xF5F5F2:fontsize=74:x=(w-tw)/2:y=330:shadowcolor=black@0.8:shadowx=0:shadowy=6,"
                f"drawtext=fontfile={FONT}:text='{esc(t2)}':fontcolor=0xD7FF3A:fontsize=74:x=(w-tw)/2:y=430:shadowcolor=black@0.8:shadowx=0:shadowy=6,"
                f"drawtext=fontfile={FONT}:text='Full video on YouTube':fontcolor=0xF5F5F2@0.85:fontsize=42:x=(w-tw)/2:y=1440,"
                f"drawtext=fontfile={FONT}:text='BLIP CHECK >_':fontcolor=0x0A0B0D:fontsize=46:x=(w-tw)/2:y=1510:box=1:boxcolor=0xD7FF3A:boxborderw=14,"
                f"fade=t=out:st={dur - 0.4:.2f}:d=0.4[v]"
            )
            dst = out / f"{r['name']}.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(joined), "-filter_complex", vf, "-map", "[v]", "-map", "0:a",
                            "-af", f"afade=t=out:st={dur - 0.4:.2f}:d=0.4", "-c:v", "libx264", "-crf", "20", "-preset", "veryfast",
                            "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(dst)], check=True)
            print(f"{dst}  {dur:.1f}s")

if __name__ == "__main__":
    main()
