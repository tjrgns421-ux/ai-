# Curious Minutes (new channel, decided 2026-11-19)

## Positioning (decided 2026-11-23): **Science mysteries, explained.**
Every episode is one mystery: a strange real thing (an event, an object, a phenomenon), what we actually know,
the theories tested one by one, and an honest verdict (solved / best explanation / still unknown).
Why: ep01-03 covered traffic, space and archaeology with no common thread, so viewers and the algorithm could
not tell what the channel is for. A mystery frame fits ep01 (a jam with no cause) and ep03 (an object nobody can
explain), and ep02 (what really happens in a black hole). Avoid topics big science channels already own unless we
have a new angle. Never call a mystery "solved" unless a source does.

Why this channel: the niche scan (`research/2026-11-19-findings.md`) put science-space long-form far ahead
(median score 10.3, 22 new-channel hits out of 52 long videos, median length 14 min). Winning formats:
"<topic> Explained in N Minutes" and "What If <question>?".

| decision | value |
|---|---|
| name | Curious Minutes (check the handle on YouTube before creating) |
| format | long-form **8:00 or longer** (mid-roll ads need 8 min); script target 8:30+ for margin, check the rendered length; 2 per week; 2–3 Shorts cut from each |
| voice | en-US-AndrewMultilingualNeural, +0% (same voice as Blip, calmer pace; Blip uses +8%) |
| character | **Sprout** (lilac round body, sprout on top; chosen 2026-11-19). Thumbnails and a few reaction beats only. Poses in `video/public/sprout/` (happy, excited, shock, think, sad, wink, side, turn); recipe `video/src/mascot/sprout-poses.tsv`; model `SproutStage` in `video/src/mascot/Curious.tsx` |
| look | from ep03 on, one thumbnail template: dark background with a single lit subject on the right, big black-outlined white words with the last line in yellow on the left, Sprout small in a corner (ep02/ep03 style). Blip uses lime accents, so the channels still don't look alike |
| rules | same as Blip: every claim sourced and shown on screen; "what if" = labeled estimates, never stated as fact |
| structure | promise first (Blip sn02 lesson): the thing the title/thumbnail promises lands in the first 30 s |
| ending | from ep03 on: **no next-episode teaser** at the end (user decision 2026-11-20); no bridging line about earlier teasers |
| editing | cut every 4–6 s (vary angles: thirds, top, low, close), Sprout floating in 3D scenes, source cards fold away after ~3.5 s; add every useful visual (photos, maps) (user, 2026-11-20) |
| scores | hook ≥72 (yt-script hookscore), title+thumbnail checked with yt-package before production |

## First five episodes
| # | title | thumbnail | yt-package score | core sources (to read in full before scripting) |
|---|---|---|---|---|
| 1 | Why Do Phantom Traffic Jams Happen? | NOBODY CRASHED | 98 | Sugiyama et al. 2008 (New J. Phys.); Flynn et al. 2009 (Phys. Rev. E, MIT); Stern et al. 2018 (Transp. Res. C) |
| 2 | What If You Fell Into a Black Hole? | SPAGHETTIFIED | 98 | NASA Goddard 2024 black hole plunge visualization |
| 3 | Every Type of Cloud Explained in 12 Minutes | 10 CLOUDS | 98 | WMO International Cloud Atlas |
| 4 | What If the Moon Disappeared? | NO MORE TIDES? | 98 | NASA; Earth obliquity stability research |
| 5 | Every Type of Lightning Explained in 10 Minutes | RED SPRITES? | — | NOAA NSSL |

Dropped: "24-HOUR DAYS?" for ep 4 (scored 98 but misleading: day length would not change right away).

## Channel setup (YouTube)
| field | value |
|---|---|
| name | Curious Minutes |
| handle | @CuriousMinutes (fallbacks in order: @CuriousMinutesTV, @CuriousMinutesSci, @TheCuriousMinutes) |
| category | Science & Technology |
| language / country | English / (leave country unset or pick the user's) |

Description:
> Science mysteries, explained.
> Strange objects, impossible events, things nobody could explain. Each video lays out what we actually know, tests the theories one by one, and gives an honest answer: solved, best guess, or still unknown.
> Recreated in 3D, with every source on screen. Illustrations and estimates are always labeled.
> New mysteries every week.

Channel keywords (YouTube Studio > Settings > Channel > Keywords):
science mysteries, unsolved mysteries, mystery explained, science explained, archaeology mysteries, strange phenomena, unexplained, history mysteries, space mysteries, 3d animation, documentary, what really happened, ancient mysteries, physics, education, "Curious Minutes"

## Next mysteries (candidates, 2026-11-23; check sources and score title/hook before choosing)
| idea | verdict to give | why it fits |
|---|---|---|
| The rocks that move by themselves (Death Valley "sailing stones") | solved on camera (verify the paper) | classic mystery with a filmed answer, great 3D (ice sheets, wind, tracks) |
| The missing great white shark (tag data) | best explanation | was a 22x outlier in the 2026-11-20 scan; tag data on screen |
| The Wow! signal (1977) | still unknown, natural explanations proposed | famous; must not imply aliens |
| Tunguska, 1908 | best explanation (airburst) | huge visual event, no crater |
| Fairy circles of Namibia | debated | striking aerials, two competing theories |

## Channel keywords (2026-11-25, from YouTube autocomplete, US/English)
Seeds: unexplained, unsolved mysteries, science mysteries, strange things found, strange sounds, mystery solved, ocean/space mysteries.
Kept only suggestions that match what we make (dropped songs, movies, "healing frequency" audio, Google Maps finds).
Paste into YouTube Studio → Settings → Channel → Basic info → Keywords (477 of 500 characters):
"unexplained mysteries" "science mysteries explained" "science mysteries solved" "unsolved mysteries solved" "solved mysteries" "strange things found" "strange things found on the moon" "strange things found in the ocean" "strange things found in space" "strange things found on mars" "unexplained sounds" "unexplained sounds in the ocean" "strange sounds from space" "ocean mysteries" "space mysteries explained" "unexplained phenomena" "mysteries explained" "curious minutes"
