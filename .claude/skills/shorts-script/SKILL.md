---
name: shorts-script
description: House rules for writing this channel's Korean AI-tips shorts scripts (~40 s vertical) — measured pace/length from the reference shorts plus sentence-order storytelling rules. Use whenever writing, revising or reviewing a shorts/reels script, hook, or narration (쇼츠 대본, 릴스 대본, 훅, 내레이션 원고), together with yt-script for hook ideas and tts for audio.
---

# Shorts script house rules

Audience: people who struggle with AI or want to do something with it but find
it hard. Goal: make it easy, and be **accurate** (no exaggeration, no
"secret/illegal command" framing; check that every feature named really
exists and works as described before writing it).

## 1. Format (measured from the reference shorts, see tts/references/benchmark.md)

- Length: ~38 s of speech ≈ **250 Hangul syllables** at **6.6 syllables/s**.
  Check with `python3 .claude/skills/tts/scripts/tts.py budget --file script.txt`.
- First word is the hook, at 0 s. No deliberate pauses.
- 2–3 tips max. End with a CTA; leave ~2 s after it if there is an end card.
- One beat per line in the script file (line breaks become caption breaks).
- Write things as they should be spoken: `/compact` → "슬래시 컴팩트".

Beat budget (≈ syllables):

| Beat | Time | Syllables |
|---|---|---|
| Hook (what + why) | 0–3 s | ~20 |
| Concrete scene / problem | 3–8 s | ~30 |
| Tip 1 + mini proof | 8–17 s | ~60 |
| Re-hook | ~1 s | ~8 |
| Tip 2 (+ tip 3) | 17–31 s | ~90 |
| Payoff / result | 31–35 s | ~25 |
| CTA | 35–38 s | ~20 |

## 2. Sentence rules (Callaway's storytelling lesson, via the "MKTG WITH AI" post)

The problem is usually not the topic but the **order of the sentences**.

1. **Flip the first sentence — what & why first.** Don't open with when/where
   ("지난주에 회사에서…"). Most common mistake: the "shuffled W" — when/where
   up front, what/why pushed back.
   - ✗ "지난달 마이애미 콘퍼런스에 갔어요. 디즈니 CEO 강연을 들었는데요…"
   - ✓ "엔터테인먼트의 미래는 완전히 달라질 거예요. 디즈니 CEO가 이걸 진짜 걱정하더라고요. 마이애미 콘퍼런스에서요."
2. **Swap the connectors.** Scenes joined by "그리고 (나서)" are just a list.
   - "그런데" → add conflict: something unexpected happened.
   - "그래서" → move to the result: because of that, this happened.
   - **Rhythm**: a short sentence after a long one; mix lengths.
3. **A concrete scene, not a vague teaser.** One sentence with who · when · what.
   - ✗ "엄청난 일이 벌어졌어요", "이제 모든 게 바뀌려던 참이었죠"
   - ✓ "고객과 통화를 시작했는데, 30분 만에 앞으로 6개월 전략을 통째로 바꿀 말을 들었어요"
4. **Re-hook right after an answer.** Moving on with "아무튼, 다음은…" is where
   viewers leave. Put a twist right after the good news:
   "좋았을 텐데, 문제는…", "그런데 여기서 일이 꼬여요", "그때 알게 됐어요".

## 3. Revision checklist (run on every draft)

1. First sentence: does it say **what/why** before when/where?
2. Find every "그리고 / 그리고 나서" → can it be "그런데" or "그래서"?
3. Find every vague teaser ("엄청난", "대박", "모든 게 바뀌") → replace with a
   who·when·what scene.
4. After each tip/answer, is there a one-line re-hook before the next?
5. Rhythm: any run of 3+ long sentences? Break one into a short line.
6. Accuracy: every feature, menu name and number verified; no hype words
   ("불법", "아무도 모르는") unless literally true.
7. `budget` says ok (≈250 syllables).

Show the user the draft with the checklist result, and before/after lines
where a rule changed something.

## 4. Title & cover (curiosity formula)

Reference the user liked: "무료로 풀려 논란인 화제의 3가지 AI 도구" over an
opened-padlock image with repo cards (names + star counts) partly shown.

Formula — combine 3–5 of these, all of them **true**:
- **Gain**: 무료, 시간 절약, 바로 쓰는
- **Event verb**: 풀려, 공개된, 바뀐 (something changed/unlocked)
- **Tension / surprise**: 논란인, 같은 AI인데, ~하면 망하는 이유
  ("논란" only when there really is one)
- **Social proof**: 화제의, real numbers (stars, users, views)
- **Number**: 3가지, 딱 3줄
- **Topic**: AI 도구, AI 글쓰기

Cover: one visual metaphor that *is* the title (padlock = 풀려), plus real
proof objects (names, counts) shown but not explained, so viewers swipe/watch.

Give 3–4 title options, mark any that stretch the truth, recommend one.

## 5. Approved house style

`shorts/ep01-ai-writing/script.txt` is the approved model script: provocative
but true hook, named tips (재료 세 줄 / 금지어 리스트 / 말투 복사), strongest
tip last with a re-hook before it, short lines mixed in, a before/after proof
beat, CTA ≤ ~5 s with a concrete offer and a **2-character comment keyword**
(e.g. '복붙') for the DM.

## 6. Characters

- **Host = our own original mascot: the ">_" prompt terminal buddy**
  (`video/src/mascot/Prompt.tsx`, variant `terminal`): lime rounded-screen head,
  dark screen whose face is the glowing `>_` (face = logo), antenna, stubby
  limbs. Expressions swap the screen glyphs (`prompt` >_, `happy` ^_^,
  `shock` O_O); signature motion: the `_` cursor blinks. It
  appears in every episode, on covers and as the channel's face.
- **Claude's official character (Anthropic's mascot) = cameo only.** Use it
  briefly, as a symbol, only in beats that are specifically about Claude
  (e.g. "Claude가 이렇게 답해요"). Never as the host, logo, profile image,
  cover/thumbnail main visual or merchandise, and never in a way that
  suggests the channel is official.
- Put "Anthropic과 무관한 개인 채널입니다" in the video description whenever
  the cameo appears.
- When writing the scene plan, mark cameo beats with `[Claude 카메오]`.
