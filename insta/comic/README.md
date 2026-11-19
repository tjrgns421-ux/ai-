# Blip in Korea — comic carousel generator

Each slide is one comic panel plus a **fact strip** under it. 1080x1350 PNGs for Instagram.

```bash
node insta/comic/render.mjs insta/comic/episodes/01-exam-day.json
```

Output: `insta/comic/output/<episode>/01.png …`. The script warns if a bubble leaves the panel or a fact strip is too long.

## Rules (fact channel)

- Jokes live in the panel (Blip's reactions). **Facts and numbers live only in the fact strip**, each with its source.
- `fact.plan: true` marks something that is announced but not in place yet (amber "STILL A PLAN" label).
- The last slide lists what is real vs still a plan, and says comic scenes are illustrations.
- Only Blip's own poses (`video/public/bc01/blip/*.png`) and props drawn in code. No other artists' styles, no news photos.

## Episode JSON

- `cover`: `kicker`, `title` (HTML allowed: `<em>` = lime), `sub`, `face`
- panel slide: `scene` (`sky` | `hall` | `dark` | `money` | none), `caption`, `blips[]` (`face`, `x`, `y`, `size`, `flip`),
  `bubbles[]` (`text`, `x`, `y`, `w`, `tail`: `bl|br|tl|tr`, `style`: `shout|off`, `who`),
  `props[]` (`plane`, `zzz`, `phone`, `stickers`, `door`, `sign`, `lines`; `front: true` draws over Blip), `fact` (`text`, `src`, `plan`)
- `end`: `title`, `rows[]` (`st`: `real|plan`, `text`), `sources`, `cta` (HTML)

Panel area is 984x900; coordinates are inside it.
