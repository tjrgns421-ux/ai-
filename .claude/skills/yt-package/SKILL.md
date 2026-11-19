---
name: yt-package
description: >-
  Write and lint the title and thumbnail for a YouTube video as one pairing,
  checking truncation, duplication and vagueness before publish. Use for
  "title ideas", "what should I call this", "thumbnail text", "my CTR is
  bad", 제목, 썸네일 문구, packaging, or any request to rename or repackage a video.
---

# yt-package

From [Jakeschincariol/youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill) (MIT, see `LICENSE`),
adapted for this repo's **Blip Check** channel.

The title and the thumbnail are ONE unit. Writing them separately is why most packaging fails: the
thumbnail repeats the title, and half the click surface says the same thing twice.

```bash
python3 .claude/skills/yt-package/title.py --title "..." --thumb "AI RAN IT"
python3 .claude/skills/yt-package/title.py titles.txt            # one per line, ranked
```

## Before you write (Blip Check)

1. Read the channel rules instead of a voice file: `.claude/skills/shorts-script/SKILL.md` sections 10–11
   (English channel, host Blip, Blip Check format) and `shorts/brand-blip/korea-channel.md`
   (positioning "Korea, checked.", audience abroad).
2. **Every claim in the title or thumbnail must be in the episode's fact table** (`shorts/<episode>/post.md`).
   Never invent a number, a result or a source.
3. **Plans are not facts.** If something is announced but not in place, the words must say so
   ("wants to", "plans", "could") or the title must carry the question ("How much is real?").
   A thumbnail is read without the title, so it must be accurate on its own.

## Rules the tool enforces, and why

- **60 characters** is where desktop search truncates, **40** is a mobile home feed. Both are
  reported because they fail differently: a desktop cut loses the tail, a mobile cut can lose the
  subject.
- **The thumbnail must not repeat the title.** Different words, same promise.
- **Three words maximum on the thumbnail.** At feed size a fourth word is a grey smear.
- **A number, a name or a date** beats every adjective available to you.
- **Two all-caps words is the ceiling** before a title reads as spam.

The tool scores words; it cannot judge accuracy. Rule 3 above is checked by you, every time.

## Write ten, keep two

Generate ten titles, run them all through `title.py`, show the user the top three with their scores
and the specific issue on each. For the winner, write the thumbnail brief: the Blip pose
(`video/public/bc01/blip/*.png`), the framing, the three words, and what the background has to do to
hold contrast at feed size. Thumbnails are Remotion compositions (see `video/src/sn02/Thumb.tsx`).

## The gate

Nothing here publishes. This skill writes and you publish. Every output ends in a block the user
copies, and the last line of every run is the question: **ship it, or change it?**
