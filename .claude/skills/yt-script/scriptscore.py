"""Score a whole spoken script against this repo's house rules (shorts-script sections 2, 3 and 11).

    python3 scriptscore.py script.txt                 # long-form defaults (Blip Check, 205 wpm, 4-5 min)
    python3 scriptscore.py script.txt --short         # Shorts (45-60 s)
    python3 scriptscore.py script.txt --json

One sentence per line is not required; the script is split into sentences. Like hookscore.py, this
counts words and patterns. It cannot tell whether a fact is true or a joke is funny. Use it to find
weak spots, not to replace reading the script out loud.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hookscore  # noqa: E402

WPM = 205
LIST_LINK = re.compile(r"\b(and then|and so|also|another thing|next|moving on|anyway)\b", re.I)
TURN = re.compile(r"\b(but|so|which means|that's why|turns out|except|until|the catch|the problem|here's the thing|wait)\b", re.I)
VAGUE = re.compile(r"\b(huge|insane|crazy|shocking|everything changed|game.?changer|nobody knows|mind.?blowing|unbelievable|incredible)\b", re.I)
HEDGE = re.compile(r"\b(reportedly|according to|says|said|report|reports|outlets?|claims?)\b", re.I)
NUMBER = re.compile(r"\b(\d[\d,.]*%?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
                    r"twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)\b", re.I)
# number lines that need a source: digits, years, or big-number words (not "one language", "three questions")
CLAIM_NUM = re.compile(r"\b(\d[\d,.]*%?|(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(-\w+)?|hundred|thousand|million|billion)\b", re.I)
WEAK_OPEN = re.compile(r"^(hey|hi|welcome|in today's video|today we|before we (start|get started)|don't forget)", re.I)


def sentences(text):
    text = re.sub(r"\[[^\]]*\]", " ", text)          # drop [ON SCREEN: ...] notes
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [p.strip() for p in parts if re.search(r"[A-Za-z]", p or "")]


def nwords(s):
    return len(re.findall(r"[A-Za-z0-9'$%]+", s))


def clamp(x):
    return max(0, min(100, round(x)))


def score(text, short=False):
    ss = sentences(text)
    total = sum(nwords(s) for s in ss)
    secs = total / WPM * 60
    lo, hi = (45, 60) if short else (240, 300)
    notes = {}

    # 1. HOOK: hookscore.py on the opening line(s), until ~15 words (a spoken hook is 9-24 words)
    first, n = [], 0
    for s in ss:
        if n >= 15:
            break
        first.append(s)
        n += nwords(s)
    hook_text = " ".join(first)
    hook = hookscore.score(hook_text)[1]
    if WEAK_OPEN.search(ss[0] if ss else ""):
        hook = min(hook, 20)
        notes["HOOK"] = "opens with a greeting or channel intro"

    # 2. LENGTH vs target band
    if lo <= secs <= hi:
        length = 100
    else:
        off = (lo - secs) if secs < lo else (secs - hi)
        length = 100 - off / lo * 150
    notes.setdefault("LENGTH", f"{total} words = {int(secs // 60)}:{int(secs % 60):02d} at {WPM} wpm, target {lo}-{hi} s")

    # 3. TURNS: connectors that add conflict/result vs list connectors
    turns = sum(len(TURN.findall(s)) for s in ss)
    lists = sum(len(LIST_LINK.findall(s)) for s in ss)
    per_min = turns / max(secs / 60, 0.25)
    turn_score = clamp(per_min / 4 * 100 - lists * 5)  # ~4 turns a minute is full marks
    notes["TURNS"] = f"{turns} but/so-type turns ({per_min:.1f}/min), {lists} list connectors"

    # 4. RHYTHM: runs of 3+ long sentences (>= 18 words) and length variety
    run, worst, long_runs = 0, 0, 0
    for s in ss:
        if nwords(s) >= 18:
            run += 1
            if run == 3:
                long_runs += 1
        else:
            run = 0
        worst = max(worst, run)
    lens = [nwords(s) for s in ss] or [0]
    avg = sum(lens) / len(lens)
    short_lines = sum(1 for x in lens if x <= 6)
    rhythm = clamp(100 - long_runs * 25 - max(0, avg - 14) * 5 + (0 if short_lines else -20))
    notes["RHYTHM"] = f"avg {avg:.1f} words/sentence, {short_lines} short punch lines, {long_runs} run(s) of 3+ long"

    # 5. CONCRETE: numbers/names per minute, minus vague hype words
    nums = sum(len(NUMBER.findall(s)) for s in ss)
    names = sum(len(re.findall(r"(?<!^)(?<![.!?] )\b[A-Z][a-z]+", s)) for s in ss)
    vague_hits = [m.group(0) for s in ss for m in VAGUE.finditer(s)]
    concrete = clamp((nums + names * 0.5) / max(secs / 60, 0.25) / 10 * 100 - len(vague_hits) * 15)
    notes["CONCRETE"] = f"{nums} numbers, {names} names" + (f"; vague: {', '.join(vague_hits)}" if vague_hits else "")

    # 6. ATTRIBUTION: sentences with a number should say who says so (house rule: facts only)
    numeric = [s for s in ss if CLAIM_NUM.search(s)]
    attributed = [s for s in numeric if HEDGE.search(s)]
    attr = clamp(len(attributed) / max(len(numeric), 1) / 0.3 * 100)  # 30% said out loud = full; the rest rely on on-screen sources
    unattributed = [s for s in numeric if not HEDGE.search(s)]
    notes["ATTRIBUTION"] = f"{len(attributed)}/{len(numeric)} number lines name a source (rest must carry an on-screen source)"

    # 7. RE-HOOKS: share of 30-second windows that contain a question or a turn
    windows, cur, wsecs = [], [], 0
    for s in ss:
        cur.append(s)
        wsecs += nwords(s) / WPM * 60
        if wsecs >= 30:
            windows.append(cur)
            cur, wsecs = [], 0
    if cur:
        windows.append(cur)
    alive = sum(1 for w in windows if any(s.endswith("?") or TURN.search(s) for s in w))
    rehook = clamp(alive / max(len(windows), 1) * 100)
    dead = [i for i, w in enumerate(windows) if not any(s.endswith("?") or TURN.search(s) for s in w)]
    notes["RE-HOOKS"] = f"{alive}/{len(windows)} thirty-second windows reopen a question" + (
        f"; flat at {', '.join(f'{i // 2}:{(i % 2) * 30:02d}' for i in dead)}" if dead else "")

    props = {"HOOK": clamp(hook), "LENGTH": clamp(length), "TURNS": turn_score, "RHYTHM": rhythm,
             "CONCRETE": concrete, "ATTRIBUTION": attr, "RE-HOOKS": rehook}
    weights = {"HOOK": 3, "LENGTH": 1, "TURNS": 2, "RHYTHM": 1, "CONCRETE": 1, "ATTRIBUTION": 1, "RE-HOOKS": 2}
    verdict = round(sum(props[k] * weights[k] for k in props) / sum(weights.values()))
    return {"verdict": verdict, "props": props, "notes": notes, "hook_text": hook_text,
            "unattributed": unattributed, "words": total, "seconds": round(secs)}


def label(v):
    return "STRONG" if v >= 72 else "WORKABLE" if v >= 55 else "WEAK"


def main():
    a = sys.argv[1:]
    as_json, short = "--json" in a, "--short" in a
    a = [x for x in a if not x.startswith("--")]
    if not a:
        sys.exit(__doc__)
    r = score(Path(a[0]).read_text(), short)
    if as_json:
        print(json.dumps(r, indent=2, ensure_ascii=False))
        return
    print(f"\n  {a[0]}  ({r['words']} words, ~{r['seconds'] // 60}:{r['seconds'] % 60:02d})")
    print("  " + "-" * 72)
    for k, v in r["props"].items():
        print(f"    {k:<12} {v:>3}  {'#' * (v // 5):<20}  {r['notes'].get(k, '')}")
    print(f"    {'VERDICT':<12} {r['verdict']:>3}  {label(r['verdict'])}")
    weakest = min(r["props"], key=r["props"].get)
    print(f"    weakest      {weakest}")
    if r["unattributed"]:
        print("\n  number lines with no source named (fine if the source is on screen):")
        for s in r["unattributed"][:8]:
            print(f"    - {s}")


if __name__ == "__main__":
    main()
