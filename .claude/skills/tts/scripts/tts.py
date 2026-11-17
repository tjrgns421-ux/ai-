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
DEFAULTS = {"voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+0Hz", "volume": "+0%"}


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


def group_lines(words, max_chars=16, max_gap=0.35):
    """Group words into short caption lines (good for vertical shorts)."""
    lines, cur = [], []
    for w in words:
        text_len = sum(len(x["text"]) + 1 for x in cur) + len(w["text"])
        gap = w["start"] - cur[-1]["end"] if cur else 0
        ends_sentence = cur and cur[-1]["text"][-1:] in ".?!。？！"
        if cur and (text_len > max_chars or gap > max_gap or ends_sentence):
            lines.append(cur)
            cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    return [{"text": " ".join(x["text"] for x in l), "start": l[0]["start"], "end": l[-1]["end"]}
            for l in lines]


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
    out = Path(a.out or "tts-out")
    out.mkdir(parents=True, exist_ok=True)
    name = a.name or "narration"
    mp3 = out / f"{name}.mp3"
    try:
        words = asyncio.run(synth(text, voice, rate, pitch, volume, mp3))
    except Exception as e:
        if mp3.exists():
            mp3.unlink()
        net_fail(e)

    lines = group_lines(words, a.max_chars)
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
    print(json.dumps({"audio": str(mp3.resolve()), "duration_sec": dur, "voice": voice,
                      "rate": rate, "pitch": pitch, "volume": volume,
                      "words": len(words), "caption_lines": len(lines),
                      "files": [str((out / f"{name}{s}").resolve()) for s in
                                (".words.json", ".srt", ".captions.json")]},
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
    sp.add_argument("--max-chars", type=int, default=16,
                    help="max characters per caption line (default 16, for vertical video)")
    sp.set_defaults(fn=cmd_speak)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
