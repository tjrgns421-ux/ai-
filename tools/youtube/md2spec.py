#!/usr/bin/env python3
"""Turn an episode's upload.md (## 제목 / ## 설명 / ## 태그 sections) into upload.json for yt_upload.py.
  python3 tools/youtube/md2spec.py <upload.md> [--category 28] [--thumbnail thumbnail.png]"""
import json, re, sys, argparse
from pathlib import Path
a = argparse.ArgumentParser(); a.add_argument("md"); a.add_argument("--category", type=int, default=28); a.add_argument("--thumbnail", default=None)
o = a.parse_args()
t = Path(o.md).read_text(encoding="utf-8")
def section(name):
    m = re.search(r"^## " + name + r"\s*\n(.*?)(?=^## |\Z)", t, re.S | re.M)
    return m.group(1) if m else ""
def block(txt):
    m = re.search(r"```[a-z]*\n(.*?)```", txt, re.S)
    return (m.group(1) if m else txt).strip()
title = block(section("제목")).splitlines()[0].strip()
desc = block(section("설명"))
tags = [x.strip() for x in block(section("태그")).replace("\n", ",").split(",") if x.strip()] if section("태그") else []
spec = {"title": title, "description": desc, "tags": tags, "category": o.category, "language": "en",
        "madeForKids": False, "syntheticMedia": True, "privacy": "private", "publishAt": None}
if o.thumbnail: spec["thumbnail"] = o.thumbnail
out = Path(o.md).with_name("upload.json")
out.write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
print(out, "|", title, "|", len(tags), "tags |", len(desc.encode()), "bytes")
