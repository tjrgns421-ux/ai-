"""Write <episode>/upload.json (for tools/youtube/yt_upload.py) from <episode>/upload_meta.json,
with chapter timestamps taken from the real render timing and the source list from sources.md.
Usage (repo root): python3 channels/confidence-interval/tools/make_upload.py <episode dir> <ciNN>"""
import json, sys
from pathlib import Path

D, ID = Path(sys.argv[1]), sys.argv[2]
M = json.loads((D / "upload_meta.json").read_text())
T = json.loads(Path(f"video/src/ConfidenceInterval/ep{ID[2:]}/timing.json").read_text())
start = {l["i"]: l["start"] for l in T["lines"]}
fmt = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"
chapters = "\n".join(f"{'0:00' if i == 1 else fmt(start[i])} {name}" for i, name in M["chapters"])
sources = (D / "sources.md").read_text().split("## For the description")[1].split("## Image files")[0].strip()
desc = f"""{M['hook']}

{M['summary']}

{chapters}

{sources}

Narration and visuals are AI-generated.

{M['hashtags']}"""
spec = {"title": M["title"], "description": desc, "tags": M["tags"], "category": 27, "language": "en", "madeForKids": False,
        "syntheticMedia": True, "privacy": "public", "publishAt": None, "thumbnail": "thumbnail.png"}
assert len(desc) <= 5000 and len(M["title"]) <= 100
(D / "upload.json").write_text(json.dumps(spec, ensure_ascii=False, indent=1))
print(chapters); print(len(desc), "chars")
