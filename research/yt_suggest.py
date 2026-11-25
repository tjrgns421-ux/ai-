"""YouTube search autocomplete for keyword research (what people actually type).

python3 research/yt_suggest.py "38th parallel" "china time zone"            # suggestions per seed
python3 research/yt_suggest.py "time zone" --az                             # + seed a, seed b, ... seed z
python3 research/yt_suggest.py "border" --hl en --gl US --out research/out/suggest.csv

Uses Google's public suggest endpoint with ds=yt (YouTube). No volumes: only which phrases show up,
in order. Results depend on region/language. Counts how often each suggestion appears across seeds.
"""
import argparse, csv, json, string, sys, time, urllib.parse, urllib.request
from collections import Counter

def suggest(q, hl, gl):
    url = "https://suggestqueries.google.com/complete/search?" + urllib.parse.urlencode({"client": "firefox", "ds": "yt", "q": q, "hl": hl, "gl": gl})
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20) as r:
        data = json.loads(r.read().decode("utf-8", "replace"))
    return data[1] if len(data) > 1 else []

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("seeds", nargs="+")
    ap.add_argument("--az", action="store_true", help="also query 'seed a' .. 'seed z'")
    ap.add_argument("--hl", default="en"); ap.add_argument("--gl", default="US")
    ap.add_argument("--out", default="")
    a = ap.parse_args()
    rows, seen = [], Counter()
    for seed in a.seeds:
        qs = [seed] + ([f"{seed} {c}" for c in string.ascii_lowercase] if a.az else [])
        for q in qs:
            try:
                res = suggest(q, a.hl, a.gl)
            except Exception as e:
                print(f"! {q}: {e}", file=sys.stderr); continue
            for rank, s in enumerate(res, 1):
                rows.append({"seed": seed, "query": q, "rank": rank, "suggestion": s}); seen[s] += 1
            time.sleep(0.15)
    if a.out:
        with open(a.out, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["seed", "query", "rank", "suggestion"]); w.writeheader(); w.writerows(rows)
    for seed in a.seeds:
        top = [r["suggestion"] for r in rows if r["seed"] == seed and r["query"] == seed]
        print(f"\n## {seed}\n  " + "\n  ".join(top))
        if a.az:
            extra = sorted({r["suggestion"] for r in rows if r["seed"] == seed and r["query"] != seed} - set(top))
            print(f"  … +{len(extra)} from a-z: " + " | ".join(extra[:60]))

if __name__ == "__main__":
    main()
