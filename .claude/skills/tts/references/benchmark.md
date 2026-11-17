# Reference shorts benchmark

Measured from two Korean Claude-tips shorts the user picked as references
(720×1280, ~39 s each). Speech measured with Whisper small word timestamps;
captions read from frames every 0.5 s.

| | A: dialogue (3D character, "컨텍스트 과부하") | B: punch (motion graphics, "명령어 3개") |
|---|---|---|
| Length | 39.5 s (speech 0.0–37.4 s, 2 s silent CTA end card) | 38.9 s (speech 0.0–38.5 s) |
| Spoken Hangul syllables | ~247 | ~253 |
| **Speech rate** | **6.6 syllables/s** | **6.6 syllables/s** |
| Pauses | none ≥ 0.25 s (≤ 0.22 s) | none |
| Speech start | 0.0 s (hook in first word) | 0.0 s |
| Captions | 32, avg 7 / max 12 syllables, ~1.2 s each | 56, avg 4.5 / max 8 syllables, ~0.7 s each |
| Caption unit | one clause, breaks at `, .` ; spoken word highlighted (karaoke) | 1–2 words; keywords in yellow/red |
| Structure | hook question → metaphor → tip 1 → tip 2 → warning → CTA | hook (taboo/scarcity) → list of 3 → "the 3rd is the real one" → CTA keyword |

## Defaults derived from this (in `tts.config.json`)

- `target_sps: 6.6` — `speak` auto-calibrates the voice rate to this.
- `target_duration: 38` — `budget` checks scripts against it
  (≈ **250 syllables** of narration for a ~40 s short).
- `caption_preset: punch` — B style; use `--captions dialogue` for A style.
- Write scripts with no deliberate pauses; the first line is the hook and
  starts at 0 s. Leave ~2 s after the last word if there is an end card.
