---
name: tts
description: Make narration / voiceover audio from a script with edge-tts (free Microsoft neural voices, Korean included), with word-level timings, SRT and Remotion captions. The user picks the voice. Use when the user wants TTS, 내레이션, 보이스오버, 성우 목소리, 대본 읽어줘, 음성 파일 만들어줘, or a voice for a video (Remotion, HyperFrames, etc.).
---

# TTS (edge-tts)

Script → `narration.mp3` + word timings + captions. The **user chooses the voice**;
never pick one silently for real work.

## Requirements

- `pip install edge-tts` (check: `python3 -c "import edge_tts"`)
- Internet access to `speech.platform.bing.com`. If a call fails with a
  connection/DNS/403 error, tell the user the network blocks it (in a cloud
  session, the environment's allowed hosts must include that host).

Script: `python3 .claude/skills/tts/scripts/tts.py <command>`

## 1. Voice selection (first time, or when the user wants to change)

1. `tts.py show` — if a voice is already saved in `tts.config.json`, use it
   unless the user asks to change.
2. `tts.py voices --lang ko` — list voices (native ones first, then
   multilingual voices that can also speak Korean, often with a slight accent).
3. `tts.py preview --lang ko [--multilingual] [--text "user's own line"]` —
   one mp3 per voice in `tts-out/preview/`. Prefer a line from the user's
   actual script with `--text`. Send the files to the user (SendUserFile) and
   show a short table: voice, gender, character.
4. Ask the user to pick. Also offer speed/pitch: rate `-50%..+100%`
   (shorts usually `+10%`~`+20%`), pitch `-20Hz..+20Hz`. Re-preview with
   `--voices NAME --rate +15%` if they want to hear the change.
5. `tts.py set <voice> [--rate +15%] [--pitch +0Hz] [--volume +0%]` — saved to
   `tts.config.json` at the project root (commit it so the choice follows the repo).

Korean voices: `ko-KR-SunHiNeural` (female, bright), `ko-KR-InJoonNeural`
(male, calm), `ko-KR-HyunsuMultilingualNeural` (male, multilingual).

## 2. Check script length, then make narration

Pace, length and caption style come from the user's reference shorts
(`references/benchmark.md`): **6.6 syllables/s, ~38 s of speech ≈ 250
syllables, no deliberate pauses, hook at 0 s**.

```bash
python3 .claude/skills/tts/scripts/tts.py budget --file script.txt   # fits ~38 s?
python3 .claude/skills/tts/scripts/tts.py speak --file script.txt --out tts-out --name ep01
python3 .claude/skills/tts/scripts/tts.py speak --file script.txt --captions dialogue
```

- Run `budget` first; if it says too long/short, edit the script (cut or add
  the number of syllables it reports) before making audio.
- `speak` auto-calibrates speed: it synthesizes, measures syllables/s, and
  re-synthesizes at the corrected rate (up to 2 times, ±3%). The report shows
  `rate`, `syllables_per_sec` and a `length_note` if the result is off target.
  Passing `--rate` disables calibration; `--no-calibrate` too.
- Pause trimming (default on): the voice's pauses are cut to `max_pause`
  (0.12 s, in `tts.config.json`) like an editor's jump cuts, *before* speed
  calibration — so the voice needs less speed-up and sounds more natural
  (ep01: +56% instead of +71%). `--max-pause 0.2` or `--no-tighten` to change.
- Caption presets: `punch` (default, 1–2 words, ≤8 syllables, ~0.7 s) or
  `dialogue` (one clause, ≤12 syllables, ~1.2 s). Script punctuation and line
  breaks are respected as caption breaks.

Per-call `--voice/--pitch/--volume` override the saved settings.

Output in `--out` (default `tts-out/`, git-ignored):
- `<name>.mp3` — the narration
- `<name>.words.json` — `[{text, start, end}]` in seconds, per word
- `<name>.srt` — caption lines per the preset (`--max-syl` to override)
- `<name>.captions.json` — Remotion `Caption[]` (`@remotion/captions`), per word

## Script tips

- **Verify key words by ear-proxy:** run the mp3 through Whisper (the
  `video-watch` skill's model) and check that keywords — especially a CTA
  comment keyword — are transcribed correctly. ep01: "복붙" was heard as
  "복부" until a comma followed it ("댓글에 복붙, 남기면…"). A short pause
  after a word ending in a final consonant makes it come through.

- Write numbers and English the way they should be read, e.g. `/compact` →
  "슬래시 컴팩트", `67` → "육칠" if that is how it should sound.
- Punctuation controls pauses: `.` longer, `,` short. Use line breaks between beats.
- For separate scene clips (one file per beat), call `speak` once per line
  with `--name scene01`, `scene02`… so each scene's audio can be placed exactly.

## Using with video skills

- **Remotion**: copy the mp3 to `video/public/`, play it with `<Audio>` /
  `@remotion/media`, size the composition from `duration_sec`, and drive
  captions from `<name>.captions.json` (see `remotion-captions` skill).
- **HyperFrames**: add as a separate `<audio>`; time beats to `words.json`.
- After rendering, check sync with the `video-watch` skill.

## Limits

- edge-tts uses Microsoft Edge's online read-aloud service; it is not an
  official commercial API. For a monetized channel, mention that a paid TTS
  (ElevenLabs, Typecast, Supertone) is the safer choice.
- No emotion/style control beyond rate, pitch and volume.
