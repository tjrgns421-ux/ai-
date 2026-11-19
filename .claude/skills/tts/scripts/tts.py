#!/usr/bin/env python3
"""Text-to-speech with edge-tts (Microsoft Edge neural voices) + word timings.

Commands:
  voices  [--lang ko] [--all]                     list voices
  preview [--lang ko] [--voices A,B] [--text T]   one sample mp3 per voice to listen to
  set     <voice> [--rate +10%] [--pitch +0Hz] [--volume +0%]   save the chosen voice
  show                                            print the saved settings
  speak   ("text" | --file script.txt) [--voice V] [--rate R] [--pitch P]
          [--volume V] [--out DIR] [--name NAME]  make narration + timings + captions

Settings are saved in tts.config.json at the project root (git root, else cwd).
"""
import argparse
import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    sys.exit("[tts] edge-tts is not installed. Run: pip install edge-tts")

# Used when the live voice list can't be fetched.
FALLBACK_VOICES = [
    ("ko-KR-SunHiNeural", "Female", "ko"),
    ("ko-KR-InJoonNeural", "Male", "ko"),
    ("ko-KR-HyunsuMultilingualNeural", "Male", "ko"),
    ("en-US-AvaMultilingualNeural", "Female", "multi"),
    ("en-US-EmmaMultilingualNeural", "Female", "multi"),
    ("en-US-AndrewMultilingualNeural", "Male", "multi"),
    ("en-US-BrianMultilingualNeural", "Male", "multi"),
]
PREVIEW_TEXT = {
    "ko": "안녕하세요. 오늘은 클로드를 열 배 똑똑하게 쓰는 방법 세 가지를 알려드릴게요.",
    "en": "Hi there. Today I'll show you three ways to make Claude ten times smarter.",
    "ja": "こんにちは。今日はクロードを十倍賢く使う方法を三つ紹介します。",
}
DEFAULTS = {"voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+0Hz", "volume": "+0%",
            # Benchmarks measured from reference shorts (see references/benchmark.md)
            "target_sps": 6.6,          # Korean syllables per second of speech
            "target_duration": 38.0,    # seconds of speech for a ~40 s short
            "caption_preset": "punch",
            # Reference shorts have no pauses >= 0.25 s (editors cut silences):
            # pauses between words are trimmed to this many seconds.
            "max_pause": 0.12}

# Caption presets measured from the two reference shorts.
#   punch    : 1–2 words per caption, avg 4.5 / max 8 syllables, ~0.7 s each
#   dialogue : one clause per caption, avg 7 / max 12 syllables, ~1.2 s each
CAPTION_PRESETS = {
    "punch": {"max_syl": 8, "soft_syl": 4, "max_gap": 0.3},
    "dialogue": {"max_syl": 12, "soft_syl": 99, "max_gap": 0.35},
}


def syllables(text):
    """Spoken-syllable estimate: Hangul syllables + Latin words + digits.
    All-caps acronyms are spelled out (AI → 에이아이 = 4, ~2 per letter);
    other Latin words ~1 syllable per 3 letters."""
    import math
    import re
    hangul = len(re.findall(r"[가-힣]", text))
    latin = 0
    for w in re.findall(r"[A-Za-z]+", text):
        latin += 2 * len(w) if (w.isupper() and len(w) <= 5) else math.ceil(len(w) / 3)
    digits = len(re.findall(r"[0-9]", text))
    return hangul + latin + digits


def pct(x):
    return f"{'+' if x >= 0 else ''}{int(round(x))}%"


def rate_num(r):
    return float(str(r).strip().rstrip("%"))


def project_root():
    try:
        r = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                           capture_output=True, text=True)
        if r.returncode == 0:
            return Path(r.stdout.strip())
    except FileNotFoundError:
        pass
    return Path.cwd()


CONFIG = project_root() / "tts.config.json"


def proxy():
    # edge-tts uses aiohttp, which ignores proxy env vars unless told.
    return os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or None


def load_config():
    cfg = dict(DEFAULTS)
    if CONFIG.exists():
        cfg.update(json.loads(CONFIG.read_text(encoding="utf-8")))
        cfg["_saved"] = True
    return cfg


def net_fail(e):
    sys.exit(f"[tts] could not reach the edge-tts service ({type(e).__name__}: {e}).\n"
             "      It needs internet access to speech.platform.bing.com.")


async def fetch_voices():
    return await edge_tts.list_voices(proxy=proxy())


def cmd_voices(a):
    try:
        voices = asyncio.run(fetch_voices())
        rows = []
        for v in voices:
            name = v["ShortName"]
            loc = v.get("Locale", "")
            multi = "Multilingual" in name
            if not a.all and not (loc.lower().startswith(a.lang.lower()) or multi):
                continue
            tag = v.get("VoiceTag", {})
            pers = ", ".join(tag.get("VoicePersonalities", []) or [])
            rows.append((name, v.get("Gender", ""), loc,
                         "multilingual" if multi and not loc.startswith(a.lang) else "", pers))
        source = "live"
    except Exception:
        rows = [(n, g, n[:5], "multilingual" if t == "multi" else "", "")
                for n, g, t in FALLBACK_VOICES]
        source = "built-in list (offline)"
    rows.sort(key=lambda r: (r[3] != "", r[0]))
    print(f"# voices ({source}) — native {a.lang} first, then multilingual voices that can speak it")
    for name, g, loc, multi, pers in rows:
        extra = f"  [{multi}]" if multi else ""
        extra += f"  {pers}" if pers else ""
        print(f"{name:40s} {g:7s} {loc}{extra}")
    cfg = load_config()
    print(f"\ncurrent: {cfg['voice']} (rate {cfg['rate']}, pitch {cfg['pitch']}, volume {cfg['volume']})"
          + ("" if cfg.get("_saved") else "  — default, not chosen yet"))


async def synth(text, voice, rate, pitch, volume, mp3_path):
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, volume=volume,
                                boundary="WordBoundary", proxy=proxy())
    words = []
    with open(mp3_path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                start = chunk["offset"] / 1e7
                end = (chunk["offset"] + chunk["duration"]) / 1e7
                words.append({"text": chunk["text"], "start": round(start, 3),
                              "end": round(end, 3)})
    return words


def cmd_preview(a):
    lang = a.lang
    text = a.text or PREVIEW_TEXT.get(lang, PREVIEW_TEXT["en"])
    if a.voices:
        names = [v.strip() for v in a.voices.split(",") if v.strip()]
    else:
        names = [n for n, _, t in FALLBACK_VOICES
                 if (t == lang) or (t == "multi" and a.multilingual)]
        if not names:
            try:
                names = [v["ShortName"] for v in asyncio.run(fetch_voices())
                         if v.get("Locale", "").startswith(lang)]
            except Exception as e:
                net_fail(e)
    out = Path(a.out or "tts-out/preview")
    out.mkdir(parents=True, exist_ok=True)
    made = []
    for n in names:
        p = out / f"{n}.mp3"
        try:
            asyncio.run(synth(text, n, a.rate, a.pitch, "+0%", p))
            made.append(str(p.resolve()))
            print(f"[tts] {n} -> {p}", file=sys.stderr)
        except Exception as e:
            if p.exists():
                p.unlink()
            if not made:
                net_fail(e)
            print(f"[tts] {n} failed: {e}", file=sys.stderr)
    print(json.dumps({"text": text, "files": made}, ensure_ascii=False, indent=1))


def cmd_set(a):
    cfg = {k: v for k, v in load_config().items() if not k.startswith("_")}
    cfg["voice"] = a.voice
    for k in ("rate", "pitch", "volume"):
        if getattr(a, k) is not None:
            cfg[k] = getattr(a, k)
    CONFIG.write_text(json.dumps(cfg, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"[tts] saved to {CONFIG}: {cfg}")


def cmd_show(a):
    cfg = load_config()
    print(json.dumps({k: v for k, v in cfg.items() if not k.startswith("_")},
                     ensure_ascii=False, indent=1))
    if not cfg.get("_saved"):
        print("(default — no voice chosen yet; run `voices` / `preview`, then `set`)")


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


PUNCT = ".?!,。？！、…~"


def attach_punct(words, script):
    """Word boundaries come without punctuation; copy it (and line breaks) back
    from the script so captions can break at clause and beat ends."""
    pos = 0
    for w in words:
        i = script.find(w["text"], pos)
        if i < 0:
            continue
        j = i + len(w["text"])
        tail = ""
        while j < len(script) and (script[j] in PUNCT or script[j] in "\"'”’)"):
            tail += script[j]
            j += 1
        k = j
        while k < len(script) and script[k] in " \t":
            k += 1
        w["display"] = w["text"] + tail
        w["break"] = bool(tail.strip("\"'”’)")) or (k < len(script) and script[k] == "\n")
        pos = j
    return words


def group_lines(words, preset="punch", max_syl=None):
    """Group words into caption lines using a measured preset (see CAPTION_PRESETS)."""
    p = dict(CAPTION_PRESETS.get(preset, CAPTION_PRESETS["punch"]))
    if max_syl:
        p["max_syl"] = max_syl
    lines, cur = [], []
    for w in words:
        cur_syl = sum(syllables(x["text"]) for x in cur)
        gap = w["start"] - cur[-1]["end"] if cur else 0
        prev = cur[-1].get("display", cur[-1]["text"]) if cur else ""
        ends_clause = bool(cur) and (cur[-1].get("break") or prev[-1:] in PUNCT)
        if cur and (cur_syl + syllables(w["text"]) > p["max_syl"] or gap > p["max_gap"]
                    or ends_clause or cur_syl >= p["soft_syl"]):
            lines.append(cur)
            cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    return [{"text": " ".join(x.get("display", x["text"]) for x in l), "start": l[0]["start"], "end": l[-1]["end"]}
            for l in lines]


def tighten_audio(mp3, words, max_gap, lead=0.05, tail=0.35):
    """Cut silences between words down to max_gap (like a jump-cut edit).
    Returns words with shifted timings. Cuts happen in the middle of each gap."""
    # Punctuation boundaries (English voices send "," "." as timed tokens) cover
    # silence, so measure gaps between spoken words only.
    spoken = [w for w in words if any(ch.isalnum() for ch in w["text"])]
    if not spoken:
        return words
    keep = []  # (start, end) in original time
    cur = max(0.0, spoken[0]["start"] - lead)
    for i in range(1, len(spoken)):
        g0, g1 = spoken[i - 1]["end"], spoken[i]["start"]
        if g1 - g0 > max_gap:
            # keep max_gap of the silence (half on each side), drop the rest
            keep.append((cur, g0 + max_gap / 2))
            cur = g1 - max_gap / 2
    keep.append((cur, spoken[-1]["end"] + tail))

    def shift(t):
        out, acc = 0.0, 0.0
        for a, b in keep:
            if t < a:
                return acc
            if t <= b:
                return acc + (t - a)
            acc += b - a
        return acc

    tmp = Path(str(mp3) + ".tmp.mp3")
    parts = "".join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS[s{i}];" for i, (a, b) in enumerate(keep))
    cat = "".join(f"[s{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[o]"
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-filter_complex", parts + cat,
                        "-map", "[o]", "-c:a", "libmp3lame", "-q:a", "2", str(tmp)], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[tts] tighten skipped: {r.stderr.strip()[-200:]}", file=sys.stderr)
        return words
    tmp.replace(mp3)
    return [{**w, "start": round(shift(w["start"]), 3), "end": round(shift(w["end"]), 3)} for w in words]


def cmd_speak(a):
    if a.file:
        text = Path(a.file).read_text(encoding="utf-8").strip()
    elif a.text:
        text = a.text
    else:
        text = sys.stdin.read().strip()
    if not text:
        sys.exit("[tts] no text given")
    cfg = load_config()
    if not cfg.get("_saved") and not a.voice:
        print("[tts] note: no voice chosen yet, using default "
              f"{cfg['voice']}. Pick one with `voices` / `preview` / `set`.", file=sys.stderr)
    voice = a.voice or cfg["voice"]
    rate = a.rate or cfg["rate"]
    pitch = a.pitch or cfg["pitch"]
    volume = a.volume or cfg["volume"]
    target_sps = a.target_sps or cfg.get("target_sps")
    preset = a.captions or cfg.get("caption_preset", "punch")
    out = Path(a.out or "tts-out")
    out.mkdir(parents=True, exist_ok=True)
    name = a.name or "narration"
    mp3 = out / f"{name}.mp3"
    syl = syllables(text)

    max_pause = None if a.no_tighten else (a.max_pause if a.max_pause is not None else cfg.get("max_pause"))

    def run_once(r):
        try:
            ws = asyncio.run(synth(text, voice, r, pitch, volume, mp3))
        except Exception as e:
            if mp3.exists():
                mp3.unlink()
            net_fail(e)
        return tighten_audio(mp3, ws, max_pause) if max_pause else ws

    def measured_sps(ws):
        span = (ws[-1]["end"] - ws[0]["start"]) if ws else 0
        return syl / span if span > 0 else None

    words = run_once(rate)
    sps = measured_sps(words)
    # Calibrate speed to the target syllables/sec (rate scales speed linearly):
    # speed ∝ (1 + rate/100), so new = (1 + old/100) * target/measured - 1.
    calibrated = False
    if target_sps and not a.rate and not a.no_calibrate and sps:
        for _ in range(2):
            if abs(sps - target_sps) / target_sps <= 0.03:
                break
            new = (1 + rate_num(rate) / 100) * (target_sps / sps) * 100 - 100
            new = max(-50, min(100, new))
            if pct(new) == rate:
                break
            rate = pct(new)
            words = run_once(rate)
            sps = measured_sps(words)
            calibrated = True

    words = attach_punct(words, text)
    lines = group_lines(words, preset, a.max_syl)
    (out / f"{name}.words.json").write_text(
        json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / f"{name}.srt").write_text("\n".join(
        f"{i}\n{srt_time(l['start'])} --> {srt_time(l['end'])}\n{l['text']}\n"
        for i, l in enumerate(lines, 1)), encoding="utf-8")
    # Remotion `Caption` type (@remotion/captions), one entry per word.
    remotion = [{"text": (" " if i else "") + w["text"], "startMs": int(w["start"] * 1000),
                 "endMs": int(w["end"] * 1000), "timestampMs": int(w["start"] * 1000),
                 "confidence": None} for i, w in enumerate(words)]
    (out / f"{name}.captions.json").write_text(
        json.dumps(remotion, ensure_ascii=False, indent=1), encoding="utf-8")

    dur = None
    try:
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "default=nw=1:nk=1", str(mp3)], capture_output=True, text=True)
        dur = round(float(r.stdout.strip()), 2)
    except Exception:
        pass
    speech = sum(w["end"] - w["start"] for w in words) or None
    report = {"audio": str(mp3.resolve()), "duration_sec": dur, "voice": voice,
              "max_pause": max_pause, "articulation_sps": round(syl / speech, 2) if speech else None,
              "rate": rate, "calibrated": calibrated, "pitch": pitch, "volume": volume,
              "syllables": syl, "syllables_per_sec": round(sps, 2) if sps else None,
              "target_sps": target_sps, "caption_preset": preset,
              "words": len(words), "caption_lines": len(lines)}
    tgt = cfg.get("target_duration")
    if tgt and dur and abs(dur - tgt) / tgt > 0.1:
        report["length_note"] = (f"{dur}s vs target {tgt}s: about "
                                 f"{int(round(tgt * (target_sps or 6.6)))} syllables fits the target")
    print(json.dumps({**report,
                      "files": [str((out / f"{name}{s}").resolve()) for s in
                                (".words.json", ".srt", ".captions.json")]},
                     ensure_ascii=False, indent=1))


def cmd_budget(a):
    text = Path(a.file).read_text(encoding="utf-8") if a.file else (a.text or sys.stdin.read())
    cfg = load_config()
    sps = cfg.get("target_sps", 6.6)
    target = a.target or cfg.get("target_duration", 38.0)
    syl = syllables(text)
    est = syl / sps
    need = int(round(target * sps))
    lines = [l for l in text.splitlines() if l.strip()]
    print(json.dumps({"syllables": syl, "target_sps": sps,
                      "estimated_sec": round(est, 1), "target_sec": target,
                      "syllables_for_target": need, "diff_syllables": syl - need,
                      "verdict": "ok" if abs(syl - need) <= need * 0.05 else
                      ("too long: cut ~%d syllables" % (syl - need) if syl > need
                       else "too short: add ~%d syllables" % (need - syl)),
                      "per_line": [{"line": l[:30], "syllables": syllables(l),
                                    "sec": round(syllables(l) / sps, 1)} for l in lines]},
                     ensure_ascii=False, indent=1))


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    v = sub.add_parser("voices")
    v.add_argument("--lang", default="ko")
    v.add_argument("--all", action="store_true")
    v.set_defaults(fn=cmd_voices)

    pr = sub.add_parser("preview")
    pr.add_argument("--lang", default="ko")
    pr.add_argument("--voices", help="comma-separated voice names")
    pr.add_argument("--multilingual", action="store_true",
                    help="also preview multilingual voices that can speak the language")
    pr.add_argument("--text")
    pr.add_argument("--rate", default="+0%")
    pr.add_argument("--pitch", default="+0Hz")
    pr.add_argument("--out")
    pr.set_defaults(fn=cmd_preview)

    s = sub.add_parser("set")
    s.add_argument("voice")
    s.add_argument("--rate")
    s.add_argument("--pitch")
    s.add_argument("--volume")
    s.set_defaults(fn=cmd_set)

    sh = sub.add_parser("show")
    sh.set_defaults(fn=cmd_show)

    sp = sub.add_parser("speak")
    sp.add_argument("text", nargs="?")
    sp.add_argument("--file")
    sp.add_argument("--voice")
    sp.add_argument("--rate")
    sp.add_argument("--pitch")
    sp.add_argument("--volume")
    sp.add_argument("--out")
    sp.add_argument("--name")
    sp.add_argument("--captions", choices=list(CAPTION_PRESETS),
                    help="caption preset: punch (1-2 words) or dialogue (one clause)")
    sp.add_argument("--max-syl", type=int, help="override max syllables per caption")
    sp.add_argument("--target-sps", type=float,
                    help="target syllables/sec for auto speed calibration (default from config)")
    sp.add_argument("--no-calibrate", action="store_true")
    sp.add_argument("--max-pause", type=float, help="trim pauses to this many seconds (default from config, 0.12)")
    sp.add_argument("--no-tighten", action="store_true", help="keep the voice's natural pauses")
    sp.set_defaults(fn=cmd_speak)

    b = sub.add_parser("budget", help="check a script's length before making audio")
    b.add_argument("text", nargs="?")
    b.add_argument("--file")
    b.add_argument("--target", type=float, help="target seconds (default from config)")
    b.set_defaults(fn=cmd_budget)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
