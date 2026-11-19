#!/usr/bin/env python3
"""Turn a video (URL or local file) into frames + transcript Claude can read.

Steps: yt-dlp (download) -> ffmpeg (frames, 16 kHz audio) -> Whisper (transcript)
-> timeline.md (frames and speech merged by time).

Usage:
  python3 watch.py <url-or-file> [--out DIR] [--frames N | --interval SEC]
                   [--model small] [--lang ko] [--no-audio] [--no-frames]
                   [--start SEC] [--end SEC]
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


def run(cmd, **kw):
    r = subprocess.run(cmd, text=True, capture_output=True, **kw)
    if r.returncode != 0:
        err = [l for l in r.stderr.strip().splitlines() if l.strip()]
        sys.exit(f"[video-watch] {cmd[0]} failed: " + (err[-1] if err else "unknown error"))
    return r


def need(tool, hint):
    if not shutil.which(tool):
        sys.exit(f"[video-watch] '{tool}' not found. Install: {hint}")


def fmt(t):
    t = int(t)
    h, m, s = t // 3600, t % 3600 // 60, t % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def slug(text):
    s = re.sub(r"[^\w\-]+", "_", text, flags=re.UNICODE).strip("_")
    return (s or "video")[:60]


def is_url(s):
    return re.match(r"^https?://", s) is not None


def download(url, out):
    need("yt-dlp", "pip install yt-dlp")
    info = json.loads(run(["yt-dlp", "-J", "--no-playlist", url]).stdout)
    run([
        "yt-dlp", "--no-playlist",
        "-f", "bv*[height<=720]+ba/b[height<=720]/b",
        "--merge-output-format", "mp4",
        "-o", str(out / "video.%(ext)s"), url,
    ])
    files = sorted(out.glob("video.*"))
    if not files:
        sys.exit("[video-watch] download failed")
    meta = {k: info.get(k) for k in (
        "title", "uploader", "duration", "upload_date", "webpage_url",
        "description", "view_count")}
    return files[0], meta


def probe_duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(path)])
    return float(r.stdout.strip() or 0)


def extract_frames(video, out, start, end, frames, interval):
    fdir = out / "frames"
    fdir.mkdir(exist_ok=True)
    span = end - start
    if interval is None:
        interval = max(span / frames, 1.0)
    times, t = [], start
    while t < end:
        times.append(t)
        t += interval
    result = []
    for i, t in enumerate(times):
        name = f"{i:03d}_{fmt(t).replace(':', '-')}.jpg"
        dst = fdir / name
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(video),
            "-frames:v", "1", "-vf", "scale='min(768,iw)':-2", "-q:v", "4",
            str(dst)], check=False)
        if dst.exists():
            result.append({"time": round(t, 2), "file": f"frames/{name}"})
    return result, interval


def extract_audio(video, out, start, end):
    wav = out / "audio.wav"
    r = subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-ss", str(start), "-to", str(end),
        "-i", str(video), "-vn", "-ac", "1", "-ar", "16000", str(wav)],
        capture_output=True, text=True)
    if r.returncode != 0 or not wav.exists() or wav.stat().st_size < 1000:
        return None  # no audio track
    return wav


def transcribe(wav, model_name, lang, offset):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("[video-watch] Whisper not installed. Run: pip install faster-whisper")
    import wave
    import numpy as np
    # Read the 16 kHz mono WAV ourselves: passing a path makes faster-whisper
    # decode it with PyAV, whose API changes between versions (e.g. PyAV 19).
    with wave.open(str(wav), "rb") as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    audio = audio.astype(np.float32) / 32768.0
    model = WhisperModel(model_name, device="auto", compute_type="int8")
    segs, info = model.transcribe(audio, language=lang, vad_filter=True,
                                  beam_size=5)
    out = [{"start": round(s.start + offset, 2), "end": round(s.end + offset, 2),
            "text": s.text.strip()} for s in segs]
    return out, info.language


def write_timeline(out, meta, frames, segs, lang):
    lines = [f"# {meta.get('title') or 'Video'}", ""]
    for k in ("uploader", "webpage_url", "upload_date"):
        if meta.get(k):
            lines.append(f"- {k}: {meta[k]}")
    lines.append(f"- duration: {fmt(meta.get('duration') or 0)}")
    if lang:
        lines.append(f"- speech language: {lang}")
    lines += ["", "## Timeline", "",
              "Frames are listed as images to open with the Read tool; "
              "speech lines are Whisper output (may contain errors).", ""]
    events = [(f["time"], 0, f"🖼 [{fmt(f['time'])}] {f['file']}") for f in frames]
    events += [(s["start"], 1, f"🗣 [{fmt(s['start'])}–{fmt(s['end'])}] {s['text']}")
               for s in segs]
    for _, _, line in sorted(events):
        lines.append(line)
    (out / "timeline.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("source")
    p.add_argument("--out")
    p.add_argument("--frames", type=int, default=24,
                   help="number of evenly spaced frames (default 24)")
    p.add_argument("--interval", type=float, help="seconds between frames")
    p.add_argument("--model", default="small",
                   help="Whisper model: tiny/base/small/medium/large-v3")
    p.add_argument("--lang", help="speech language code, e.g. ko, en (auto if omitted)")
    p.add_argument("--start", type=float, default=0)
    p.add_argument("--end", type=float)
    p.add_argument("--no-audio", action="store_true")
    p.add_argument("--no-frames", action="store_true")
    a = p.parse_args()

    need("ffmpeg", "apt-get install -y ffmpeg")
    need("ffprobe", "apt-get install -y ffmpeg")

    if is_url(a.source):
        name = a.source
        out = Path(a.out or Path("video-watch-out") / slug(a.source.split("/")[-1]))
        out.mkdir(parents=True, exist_ok=True)
        print("[video-watch] downloading...", file=sys.stderr)
        video, meta = download(a.source, out)
    else:
        video = Path(a.source)
        if not video.exists():
            sys.exit(f"[video-watch] file not found: {video}")
        out = Path(a.out or Path("video-watch-out") / slug(video.stem))
        out.mkdir(parents=True, exist_ok=True)
        meta = {"title": video.name}

    duration = probe_duration(video)
    meta["duration"] = meta.get("duration") or duration
    start = max(0.0, a.start)
    end = min(a.end or duration, duration)

    frames, interval = [], None
    if not a.no_frames:
        print("[video-watch] extracting frames...", file=sys.stderr)
        frames, interval = extract_frames(video, out, start, end, a.frames, a.interval)

    segs, lang = [], None
    if not a.no_audio:
        wav = extract_audio(video, out, start, end)
        if wav:
            print(f"[video-watch] transcribing with Whisper ({a.model})...",
                  file=sys.stderr)
            segs, lang = transcribe(wav, a.model, a.lang, start)
            wav.unlink()
        else:
            print("[video-watch] no audio track", file=sys.stderr)

    (out / "transcript.json").write_text(
        json.dumps(segs, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "transcript.txt").write_text(
        "\n".join(f"[{fmt(s['start'])}] {s['text']}" for s in segs) + "\n",
        encoding="utf-8")
    meta.update({"frames": len(frames), "frame_interval_sec": interval,
                 "speech_language": lang, "segments": len(segs),
                 "range": [start, end]})
    (out / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    write_timeline(out, meta, frames, segs, lang)
    print(json.dumps({"out_dir": str(out.resolve()), "timeline": str((out / "timeline.md").resolve()),
                      "frames": len(frames), "segments": len(segs),
                      "duration": round(duration, 1), "speech_language": lang},
                     ensure_ascii=False))


if __name__ == "__main__":
    main()
