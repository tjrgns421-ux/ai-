#!/usr/bin/env python3
"""Turn an episode's upload.md into upload.json for yt_upload.py.
Sections: ## 제목 / ## 설명 / ## 태그, and optionally ## 한국어 제목 / ## 한국어 설명 (shown to viewers whose YouTube language is Korean).
  python3 tools/youtube/md2spec.py <upload.md> [--category 28] [--thumbnail thumbnail.png] [--subs subs/long]
--subs adds subtitle tracks <prefix>.en.srt and <prefix>.ko.srt (paths relative to upload.md)."""
import json, re, sys, argparse
from pathlib import Path
a = argparse.ArgumentParser(); a.add_argument("md"); a.add_argument("--category", type=int, default=28); a.add_argument("--thumbnail", default=None); a.add_argument("--subs", default=None)
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
ko_t, ko_d = section("한국어 제목"), section("한국어 설명")
if ko_t:
    spec["localizations"] = {"ko": {"title": block(ko_t).splitlines()[0].strip(), "description": block(ko_d)}}
if o.subs:
    base = Path(o.md).parent
    spec["captions"] = [{"language": lang, "name": name, "file": f"{o.subs}.{lang}.srt"} for lang, name in (("en", "English"), ("ko", "한국어")) if (base / f"{o.subs}.{lang}.srt").exists()]
out = Path(o.md).with_name("upload.json")
out.write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
print(out, "|", title, "|", len(tags), "tags |", len(desc.encode()), "bytes |", "ko" if "localizations" in spec else "-", "|", len(spec.get("captions", [])), "subs")
