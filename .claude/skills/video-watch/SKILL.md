---
name: video-watch
description: Watch and listen to a video — YouTube/web URL or local file — by downloading it (yt-dlp), extracting frames (ffmpeg) and transcribing speech (Whisper), then reading the result. Use when the user asks to watch, summarize, analyze, review, transcribe or answer questions about a video or its audio (영상 보고/들어보고 요약·분석해줘, 유튜브 링크 등).
---

# Video Watch

Claude cannot play video or audio directly. This skill converts a video into
things Claude can read: **frames (images)** and a **timestamped transcript**,
merged into `timeline.md`.

## Requirements

- `ffmpeg` / `ffprobe` — `apt-get install -y ffmpeg`
- `yt-dlp` (only for URLs) — `pip install yt-dlp`
- Whisper — `pip install faster-whisper` (runs on CPU; GPU used automatically if present)

Check with `which ffmpeg yt-dlp && python3 -c "import faster_whisper"` and install
only what is missing.

## Run

```bash
python3 .claude/skills/video-watch/scripts/watch.py "<url-or-file>" [options]
```

Options:
- `--frames N` evenly spaced frames (default 24) or `--interval SEC`
- `--start SEC --end SEC` analyze only part of the video
- `--model tiny|base|small|medium|large-v3` (default `small`; `tiny`/`base` for
  speed on long videos, `medium`+ for accuracy)
- `--lang ko` force speech language (auto-detected otherwise)
- `--no-audio` / `--no-frames` skip one side
- `--out DIR` output folder (default `video-watch-out/<name>/`, git-ignored)

Rough CPU speed with `small`: ~0.3–0.5× real time. For videos over ~20 min,
suggest `--model base` or a `--start/--end` range first.

The script prints JSON with `out_dir` and `timeline`.

## Output

```
<out_dir>/
  timeline.md       # metadata + frames and speech merged in time order
  transcript.txt    # [mm:ss] lines
  transcript.json   # [{start, end, text}]
  meta.json         # title, uploader, duration, description...
  frames/NNN_mm-ss.jpg
  video.mp4         # only when downloaded from a URL
```

## How to "watch"

1. Read `timeline.md` first — it gives the full structure.
2. Open frames with the Read tool. Don't open all of them by default: pick
   frames at scene changes, around key speech, or what the user asks about.
   Open more (or re-run with `--start/--end --interval 1`) when visual detail matters.
3. Answer from both sources, citing timestamps (e.g. `02:15`).
4. Be honest about limits: the transcript is machine output (names and jargon
   may be wrong), frames are samples so fast events between them can be missed,
   and music/sound effects are not described — only speech is transcribed.

## Troubleshooting

- YouTube `Sign in to confirm you're not a bot` / HTTP 403: the server IP is
  blocked. Ask the user for the video file instead, or a cookies file
  (`yt-dlp --cookies cookies.txt`; edit `download()` to pass it).
- `yt-dlp` errors on a new site change: `pip install -U yt-dlp`.
- First Whisper run downloads the model from Hugging Face (small ≈ 500 MB).
