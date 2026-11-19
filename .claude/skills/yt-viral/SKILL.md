---
name: yt-viral
description: >-
  Find what is actually working in a niche on YouTube and rank it by how far
  each video beat its own channel, then name the formula. Use for "what's
  working right now", "find viral videos in my niche", "why did this blow
  up", 잘 나가는 채널, 해외 트렌드, competitor research, or a swipe file.
---

# yt-viral

From [Jakeschincariol/youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill) (MIT, see `LICENSE`),
adapted for this repo.

Raw view counts rank channel size, not ideas. This ranks by **multiple over each channel's own
median**, which is the only version of the question that is about the video.

## Collecting the input (this repo)

youtube.com pages are not reachable from the cloud session, so collect through the YouTube Data API
with the repo's research tool (needs the API key; see `research/yt_outliers.py`):

```bash
python3 research/yt_outliers.py --only korea-explained,history --swipe 15   # niches from research/niches.json
python3 .claude/skills/yt-viral/swipe.py research/out/<date>/collected.json --min 2.0
```

`yt_outliers.py` finds candidates by views ÷ subscribers; `--swipe N` then pulls the last N uploads of
each channel behind a strong candidate into `collected.json`, so `swipe.py` can compare each video
with **its own channel's median**. The two numbers answer different questions — report both.

Input format, if collected another way (at least **four videos per channel**, or the median means nothing):

```json
[{"channel":"...","title":"...","views":412000,"url":"...","duration":613}]
```

**Read, do not scrape.** Public data only, never a logged-in session, never the user's own credentials.

## Reading the output

The multiple is the signal. The formula line is a judgement about the TITLE, matched against
[the 21 formulas](../yt-script/hooks.json) - it is not a claim about why the video worked, and you
should say so when you present it.

What to hand back: the top five with their multiples, the formula each used, and the ONE structural
thing they share. Then the harder line - which of those the user could actually make this week with
the repo's pipeline (fact check → captures → narration → Remotion), and whether it fits a channel that
is accurate first ("Korea, checked."). A formula that only works by overstating is not one to copy.

## The gate

Nothing here publishes. This skill writes and you publish. Every output ends in a block the user
copies, and the last line of every run is the question: **ship it, or change it?**
