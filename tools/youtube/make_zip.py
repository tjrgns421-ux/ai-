#!/usr/bin/env python3
"""Pack one episode for the user: 큐리어스 N화.zip with
  큐리어스 N화-롱폼.mp4, 큐리어스 N화-쇼츠1..K.mp4, 업로드정보.md (long + every Short, English + Korean), 썸네일.png,
  자막/ (English and Korean .srt for every video).
python3 tools/youtube/make_zip.py <episode dir> <N> <long.mp4> <short1.mp4> [<short2.mp4> ...] [--out video/out/zips]
"""
import argparse, re, shutil, subprocess, tempfile
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("ep"); ap.add_argument("n"); ap.add_argument("long"); ap.add_argument("shorts", nargs="+")
ap.add_argument("--out", default="video/out/zips")
a = ap.parse_args()
ep = Path(a.ep); name = f"큐리어스 {a.n}화"
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
tmp = Path(tempfile.mkdtemp())

def body(md: Path) -> str:
    t = md.read_text(encoding="utf-8")
    t = re.sub(r"^# .*\n", "", t, count=1)          # drop the file's own title
    t = re.sub(r"^## 자막\n.*?(?=^## |\Z)", "", t, flags=re.S | re.M)  # subtitle paths are internal
    return re.sub(r"^## ", "### ", t, flags=re.M).strip()

parts = [f"# {name} 업로드 정보\n\n파일: {name}-롱폼.mp4, " + ", ".join(f"{name}-쇼츠{i}.mp4" for i in range(1, len(a.shorts) + 1)) +
         ", 썸네일.png (롱폼용), 자막 폴더 (.en.srt 영어 / .ko.srt 한국어)\n",
         f"## {name}-롱폼\n\n" + body(ep / "upload.md")]
for i in range(1, len(a.shorts) + 1):
    parts.append(f"## {name}-쇼츠{i}\n\n" + body(ep / f"short{i}" / "upload.md"))
(tmp / "업로드정보.md").write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8")
shutil.copy(ep / "thumbnail.png", tmp / "썸네일.png")
shutil.copy(a.long, tmp / f"{name}-롱폼.mp4")
for i, s in enumerate(a.shorts, 1):
    shutil.copy(s, tmp / f"{name}-쇼츠{i}.mp4")
subs = ep / "subs"
if subs.exists():
    (tmp / "자막").mkdir()
    for f in sorted(subs.glob("*.srt")):
        label = "롱폼" if f.name.startswith("long") else "쇼츠" + re.search(r"short(\d+)", f.name).group(1)
        shutil.copy(f, tmp / "자막" / f"{name}-{label}.{f.name.split('.')[-2]}.srt")
z = out / f"{name}.zip"
z.unlink(missing_ok=True)
subprocess.run(["zip", "-q", "-0", "-r", str(z.resolve()), "."], cwd=tmp, check=True)
shutil.rmtree(tmp)
print(z, f"{z.stat().st_size / 1e6:.0f} MB")
