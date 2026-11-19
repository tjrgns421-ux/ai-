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

## Strip style (`"template": "strip.html"`) — preferred

Short strips like the reference the channel owner picked: white page, logo top-left, 2–4 panels,
big hand-lettered caps, one punchline in the last panel, then a **"This really happened"** slide.

- `layout`: `2v` (two stacked), `2+1` (two on top, one wide), `2x2`, `1`
- panel: `bg`, `floor` (`h`, `color`), `blips[]`, `props[]` (`box`, `boxback`, `poster`, `phone`, `pencil`, `text`; `front: true` draws over Blip),
  `bubbles[]` (`top: true` = full-width speech box at the top of the panel, or `x`/`y`/`w`; `size`; `tail` `{x, dir}`)
- `facts` slide: `title` (HTML, `<span>` = lime marker), `items[]` (`text`, `src`, `plan`), `foot`, `face`
- Keep words per panel to one or two short lines. No adult or sexual jokes (fact channel, and Instagram limits reach for it).

Example: `episodes/02-devices.json`. Fonts: Patrick Hand (OFL) for lettering, Pretendard for facts.
