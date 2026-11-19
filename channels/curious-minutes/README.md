# Curious Minutes (new channel, decided 2026-11-19)

Why this channel: the niche scan (`research/2026-11-19-findings.md`) put science-space long-form far ahead
(median score 10.3, 22 new-channel hits out of 52 long videos, median length 14 min). Winning formats:
"<topic> Explained in N Minutes" and "What If <question>?".

| decision | value |
|---|---|
| name | Curious Minutes (check the handle on YouTube before creating) |
| format | long-form **8:00 or longer** (mid-roll ads need 8 min); script target 8:30+ for margin, check the rendered length; 2 per week; 2–3 Shorts cut from each |
| voice | en-US-AndrewMultilingualNeural, +0% (same voice as Blip, calmer pace; Blip uses +8%) |
| character | **Sprout** (lilac round body, sprout on top; chosen 2026-11-19). Thumbnails and a few reaction beats only. Poses in `video/public/sprout/` (happy, excited, shock, think, sad, wink, side, turn); recipe `video/src/mascot/sprout-poses.tsv`; model `SproutStage` in `video/src/mascot/Curious.tsx` |
| look | bright sky-blue thumbnails with black-outlined white/yellow words (Blip uses dark + lime, so the channels never look alike) |
| rules | same as Blip: every claim sourced and shown on screen; "what if" = labeled estimates, never stated as fact |
| structure | promise first (Blip sn02 lesson): the thing the title/thumbnail promises lands in the first 30 s |

## First five episodes
| # | title | thumbnail | yt-package score | core sources (to read in full before scripting) |
|---|---|---|---|---|
| 1 | Why Do Phantom Traffic Jams Happen? | NOBODY CRASHED | 98 | Sugiyama et al. 2008 (New J. Phys.); Flynn et al. 2009 (Phys. Rev. E, MIT); Stern et al. 2018 (Transp. Res. C) |
| 2 | What If You Fell Into a Black Hole? | SPAGHETTIFIED | 98 | NASA Goddard 2024 black hole plunge visualization |
| 3 | Every Type of Cloud Explained in 12 Minutes | 10 CLOUDS | 98 | WMO International Cloud Atlas |
| 4 | What If the Moon Disappeared? | NO MORE TIDES? | 98 | NASA; Earth obliquity stability research |
| 5 | Every Type of Lightning Explained in 10 Minutes | RED SPRITES? | — | NOAA NSSL |

Dropped: "24-HOUR DAYS?" for ep 4 (scored 98 but misleading: day length would not change right away).
