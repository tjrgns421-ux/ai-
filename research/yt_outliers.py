"""Find overseas YouTube videos that beat their channel's size (outliers), per niche.

python3 research/yt_outliers.py [--days 30] [--niches research/niches.json] [--only korea-explained,history] [--region US]

Needs network access to www.googleapis.com and a YouTube Data API key. The key is sent in the
X-Goog-Api-Key header; in this cloud session the network proxy fills it in, so the script sends a
placeholder unless YT_API_KEY is set.

Score = views / max(subscribers, 1,000). A score of 3+ means the video did far better than the
channel usually would; 10+ is a strong signal that the topic or format is working right now.
Output: research/out/<date>/videos.csv, report.md (top videos per niche + niche summary).
"""
import argparse
import csv
import datetime as dt
import json
import os
import re
import statistics
import sys
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://www.googleapis.com/youtube/v3/"
HERE = Path(__file__).resolve().parent
KEY = os.environ.get("YT_API_KEY", "placeholder-filled-by-proxy")
units = 0


def get(path, **params):
    global units
    units += {"search": 100}.get(path, 1)
    url = API + path + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"X-Goog-Api-Key": KEY, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:400]
        sys.exit(f"YouTube API error {e.code} on {path}: {body}")


def iso_seconds(d):
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", d or "")
    if not m:
        return 0
    dd, h, mi, s = (int(x or 0) for x in m.groups())
    return dd * 86400 + h * 3600 + mi * 60 + s


def chunks(xs, n=50):
    for i in range(0, len(xs), n):
        yield xs[i : i + n]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--niches", default=str(HERE / "niches.json"))
    ap.add_argument("--only", default="")
    ap.add_argument("--region", default="US")
    a = ap.parse_args()

    cfg = json.loads(Path(a.niches).read_text())["niches"]
    only = {x.strip() for x in a.only.split(",") if x.strip()}
    after = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=a.days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    today = dt.date.today()

    found = {}  # video id -> (niche, group, keyword)
    for niche, n in cfg.items():
        if only and niche not in only:
            continue
        for kw in n["keywords"]:
            res = get("search", part="snippet", q=kw, type="video", order="viewCount", publishedAfter=after,
                      maxResults=50, relevanceLanguage="en", regionCode=a.region)
            for it in res.get("items", []):
                found.setdefault(it["id"]["videoId"], (niche, n["group"], kw))
            print(f"  {niche:18} {kw!r}: {len(res.get('items', []))} videos", file=sys.stderr)

    vids = {}
    for ids in chunks(list(found)):
        for v in get("videos", part="snippet,statistics,contentDetails", id=",".join(ids)).get("items", []):
            vids[v["id"]] = v
    chans = {}
    for ids in chunks(list({v["snippet"]["channelId"] for v in vids.values()})):
        for c in get("channels", part="snippet,statistics", id=",".join(ids)).get("items", []):
            chans[c["id"]] = c

    rows = []
    for vid, v in vids.items():
        c = chans.get(v["snippet"]["channelId"])
        if not c:
            continue
        niche, group, kw = found[vid]
        st, cs = v.get("statistics", {}), c.get("statistics", {})
        views = int(st.get("viewCount", 0))
        subs = 0 if cs.get("hiddenSubscriberCount") else int(cs.get("subscriberCount", 0))
        created = dt.date.fromisoformat(c["snippet"]["publishedAt"][:10])
        secs = iso_seconds(v["contentDetails"].get("duration"))
        rows.append({
            "niche": niche, "group": group, "keyword": kw,
            "title": v["snippet"]["title"], "channel": c["snippet"]["title"],
            "views": views, "likes": int(st.get("likeCount", 0)), "comments": int(st.get("commentCount", 0)),
            "subs": subs, "score": round(views / max(subs, 1000), 2),
            "format": "short" if secs <= 180 else "long", "length_s": secs,
            "published": v["snippet"]["publishedAt"][:10], "channel_age_days": (today - created).days,
            "channel_videos": int(cs.get("videoCount", 0)),
            "url": f"https://www.youtube.com/watch?v={vid}",
        })

    out = HERE / "out" / today.isoformat()
    out.mkdir(parents=True, exist_ok=True)
    with open(out / "videos.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]) if rows else ["niche"])
        w.writeheader()
        w.writerows(sorted(rows, key=lambda r: -r["score"]))

    md = [f"# YouTube outliers — last {a.days} days (region {a.region}), {today}", "",
          "Score = views / max(subscribers, 1,000). New channel = under 180 days old.", "",
          "## Niche summary", "",
          "| niche | group | videos | median score | score ≥10 | new channels with 100k+ views | shorts share |",
          "|---|---|---|---|---|---|---|"]
    by = {}
    for r in rows:
        by.setdefault(r["niche"], []).append(r)
    summary = []
    for niche, rs in by.items():
        new_hits = sum(1 for r in rs if r["channel_age_days"] < 180 and r["views"] >= 100_000)
        summary.append((statistics.median(r["score"] for r in rs), niche, rs, new_hits))
    for med, niche, rs, new_hits in sorted(summary, reverse=True):
        md.append(f"| {niche} | {rs[0]['group']} | {len(rs)} | {med:.2f} | {sum(r['score'] >= 10 for r in rs)} | {new_hits} | "
                  f"{100 * sum(r['format'] == 'short' for r in rs) // len(rs)}% |")
    for med, niche, rs, _ in sorted(summary, reverse=True):
        md += ["", f"## {niche}", "", "| score | views | subs | fmt | ch. age (d) | title | channel |", "|---|---|---|---|---|---|---|"]
        for r in sorted(rs, key=lambda r: -r["score"])[:10]:
            t = r["title"].replace("|", "/")[:70]
            md.append(f"| {r['score']} | {r['views']:,} | {r['subs']:,} | {r['format']} | {r['channel_age_days']} | [{t}]({r['url']}) | {r['channel'][:30]} |")
    (out / "report.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"done: {len(rows)} videos, ~{units} API units, report: {out / 'report.md'}")


if __name__ == "__main__":
    main()
