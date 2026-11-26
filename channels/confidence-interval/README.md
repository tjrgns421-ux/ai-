# Confidence Interval

English YouTube channel: an openly-AI narrator investigates unsolved history mysteries and gives each hypothesis a confidence %.
Look: near-black #141413, warm grays #F1EFE8/#B4B2A9, single amber accent #EF9F27; public-domain scans, code-drawn charts.
Components: `video/src/ConfidenceInterval/` (meter, hypothesis cards, TextCard, ArchivalPan, CitationTag, Timeline, ZipfChart, Captions).
Voice: en-US-BrianNeural +3% (`ep01-voynich/voice.json`; root `tts.config.json` is for the Korean channels).
Upload: `python3 tools/youtube/yt_upload.py upload --channel ci --spec <upload.json> --video <mp4>`.

## Making an episode (shared tools in `tools/`)
1. `epNN-topic/script.txt` (one narration line per row) + `gaps.json` (extra pause after line N) → TTS per line into `video/public/ciNN/vo/lNN.mp3` (voice above, `--no-tighten`).
2. `python3 channels/confidence-interval/tools/build_narration.py <ep dir> ciNN` → `narration.mp3` + `video/src/ConfidenceInterval/epNN/timing.json`.
3. Composition: `EpisodeFrame` (`video/src/ConfidenceInterval/Episode.tsx`) with meter keys, hypothesis names, scenes. Shorts: `ShortFrame` (`Short.tsx`), timings via `tools/build_shorts.py`. Thumbnail: `CiThumb` (`Thumb.tsx`).
4. `upload_meta.json` + `sources.md` → `python3 channels/confidence-interval/tools/make_upload.py <ep dir> ciNN`.
5. `tools/make_zip.sh N <dir with mp4s>`.

## Delivery rule (user request, applies to every episode)
Each episode = 1 long video + 2 shorts, delivered as ONE zip:
- zip: `컨피던스 N화.zip`
- long: `컨피던스 N화-롱폼.mp4`
- shorts: `컨피던스 N화-쇼츠1.mp4`, `컨피던스 N화-쇼츠2.mp4`
