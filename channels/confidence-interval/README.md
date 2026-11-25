# Confidence Interval

English YouTube channel: an openly-AI narrator investigates unsolved history mysteries and gives each hypothesis a confidence %.
Look: near-black #141413, warm grays #F1EFE8/#B4B2A9, single amber accent #EF9F27; public-domain scans, code-drawn charts.
Components: `video/src/ConfidenceInterval/` (meter, hypothesis cards, TextCard, ArchivalPan, CitationTag, Timeline, ZipfChart, Captions).
Voice: en-US-BrianNeural +3% (`ep01-voynich/voice.json`; root `tts.config.json` is for the Korean channels).
Upload: `python3 tools/youtube/yt_upload.py upload --channel ci --spec <upload.json> --video <mp4>`.

## Delivery rule (user request, applies to every episode)
Each episode = 1 long video + 2 shorts, delivered as ONE zip:
- zip: `컨피던스 N화.zip`
- long: `컨피던스 N화-롱폼.mp4`
- shorts: `컨피던스 N화-쇼츠1.mp4`, `컨피던스 N화-쇼츠2.mp4`
