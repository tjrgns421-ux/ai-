import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { C, FONT, MONO } from "../theme";

// Episode-specific visuals for EP01 (Voynich). Shared look comes from ../components.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const fadeUp = (f: number, d = 0) => {
  const a = interpolate(f, [d, d + 14], [0, 1], { ...clamp, easing: outExpo });
  return { opacity: a, translate: `0 ${(1 - a) * 24}px` };
};

const SECTIONS = ["HERBAL", "ASTRONOMICAL", "BALNEOLOGICAL", "PHARMACEUTICAL", "RECIPES"];
export const SectionLabels: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: "absolute", top: 70, left: 70, display: "flex", gap: 30, fontFamily: FONT }}>
    {SECTIONS.map((s, i) => (
      <div key={s} style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: i === active ? C.amber : C.dim, borderBottom: `3px solid ${i === active ? C.amber : "transparent"}`, paddingBottom: 6 }}>
        {s}
      </div>
    ))}
  </div>
);

/* Keyword clustering across the book's sections (Montemurro & Zanette 2013) — schematic */
const STRIP = [
  { name: "HERBAL", w: 0.42 },
  { name: "ASTRO", w: 0.12 },
  { name: "BALNEO", w: 0.12 },
  { name: "PHARMA", w: 0.14 },
  { name: "RECIPES", w: 0.2 },
];
export const SectionStrip: React.FC = () => {
  const f = useCurrentFrame();
  const W = 1640;
  let acc = 0;
  const pos = STRIP.map((s) => {
    const p = { ...s, x: acc * W, wpx: s.w * W };
    acc += s.w;
    return p;
  });
  const words = [
    { w: "chol", sec: 0, n: 16 },
    { w: "shol", sec: 0, n: 10 },
    { w: "qokedy", sec: 2, n: 14 },
    { w: "otal", sec: 1, n: 7 },
    { w: "okeey", sec: 3, n: 8 },
  ];
  const colors = [C.amber, "#E8C27A", C.ink, "#C9B99A", C.sub];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
      <div style={{ position: "relative", width: W, height: 420, marginBottom: 120 }}>
        {pos.map((s) => (
          <div key={s.name} style={{ position: "absolute", left: s.x + 4, width: s.wpx - 8, top: 80, height: 260, background: C.bg2, border: `2px solid ${C.line}`, borderRadius: 10 }}>
            <div style={{ position: "absolute", bottom: -50, width: "100%", textAlign: "center", color: C.sub, fontSize: 26, fontWeight: 800, letterSpacing: 3 }}>{s.name}</div>
          </div>
        ))}
        {words.map((wd, wi) =>
          Array.from({ length: wd.n }).map((_, k) => {
            const s = pos[wd.sec];
            const stray = k === wd.n - 1;
            const sec = stray ? pos[(wd.sec + 2) % 5] : s;
            const x = sec.x + 30 + random(`x${wi}${k}`) * (sec.wpx - 60);
            const y = 110 + random(`y${wi}${k}`) * 200;
            const a = interpolate(f, [20 + wi * 26 + k * 2, 32 + wi * 26 + k * 2], [0, 1], clamp);
            return <div key={`${wi}-${k}`} style={{ position: "absolute", left: x, top: y, width: 16, height: 16, borderRadius: 8, background: colors[wi], opacity: a, boxShadow: `0 0 16px ${colors[wi]}` }} />;
          }),
        )}
        <div style={{ position: "absolute", top: 0, left: 0, display: "flex", gap: 36 }}>
          {words.map((wd, wi) => (
            <div key={wd.w} style={{ display: "flex", alignItems: "center", gap: 10, ...fadeUp(f, 20 + wi * 26) }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: colors[wi] }} />
              <span style={{ fontFamily: MONO, color: C.ink, fontSize: 28 }}>{wd.w}</span>
            </div>
          ))}
          <span style={{ color: C.dim, fontSize: 22, alignSelf: "center" }}>schematic · EVA transcription words</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Repeated words + word parts */
export const RepeatAndParts: React.FC<{ split: number }> = ({ split }) => {
  const f = useCurrentFrame();
  const line = ["qokedy", "qokedy", "dal", "qokedy", "qokedy", "shedy", "qokain"];
  const rep = [0, 1, 3, 4];
  const parts = [
    ["qo", "ked", "y"],
    ["o", "kai", "n"],
    ["ch", "ed", "y"],
    ["sh", "ed", "y"],
  ];
  const showParts = f >= split;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: MONO, paddingBottom: 160 }}>
      {!showParts && (
        <>
          <div style={{ display: "flex", gap: 30, fontSize: 64 }}>
            {line.map((w, i) => {
              const hi = rep.includes(i) && f > 30 + i * 6;
              return (
                <span key={i} style={{ color: hi ? C.bg : C.ink, background: hi ? C.amber : "transparent", padding: "4px 12px", borderRadius: 6, ...fadeUp(f, i * 5) }}>
                  {w}
                </span>
              );
            })}
          </div>
          <div style={{ marginTop: 40, color: C.dim, fontSize: 24, fontFamily: FONT }}>Voynichese in EVA transcription — the same word, back to back</div>
        </>
      )}
      {showParts && (
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", gap: 16, color: C.sub, fontSize: 26, fontFamily: FONT, fontWeight: 800, letterSpacing: 3, paddingLeft: 4 }}>
            <span style={{ width: 200 }}>PREFIX</span>
            <span style={{ width: 200 }}>MIDDLE</span>
            <span style={{ width: 200 }}>SUFFIX</span>
          </div>
          {parts.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 16, fontSize: 60, ...fadeUp(f - split, i * 6) }}>
              {p.map((x, j) => {
                const a = interpolate(f - split, [i * 6 + 10, i * 6 + 24], [0, 1], { ...clamp, easing: outExpo });
                return (
                  <span key={j} style={{ width: 200, textAlign: "center", color: j === 1 ? C.amber : C.ink, border: `2px solid ${C.line}`, background: C.bg2, borderRadius: 8, padding: "6px 0", translate: `${(j - 1) * a * 12}px 0` }}>
                    {x}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* Cardan grille sliding over a syllable table */
const SYL = [
  ["qo", "ch", "sh", "o", "d", "ok"],
  ["ke", "ee", "ai", "e", "te", "ol"],
  ["dy", "y", "in", "l", "r", "aiin"],
];
export const Grille: React.FC = () => {
  const f = useCurrentFrame();
  const cell = 130;
  const step = Math.floor(f / 40);
  const pos = [0, 2, 1, 3, 0, 2, 3, 1];
  const col = pos[step % pos.length];
  const slide = interpolate(f % 40, [0, 14], [0, 1], { ...clamp, easing: outExpo });
  const prev = pos[(step + pos.length - 1) % pos.length];
  const cx = (prev + (col - prev) * slide) * cell;
  const made = Array.from({ length: Math.min(step + 1, 6) }).map((_, i) => {
    const c = pos[i % pos.length];
    return SYL[0][c] + SYL[1][(c + 1) % 6] + SYL[2][(c + 2) % 6];
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: MONO, paddingBottom: 140 }}>
      <div style={{ display: "flex", gap: 120, alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          {SYL.map((row, r) => (
            <div key={r} style={{ display: "flex" }}>
              {row.map((s, c) => (
                <div key={c} style={{ width: cell, height: cell, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, color: C.sub, border: `1px solid ${C.line}` }}>
                  {s}
                </div>
              ))}
            </div>
          ))}
          {/* the card: three holes on a diagonal */}
          <svg width={cell * 3} height={cell * 3} style={{ position: "absolute", top: 0, left: cx }}>
            <defs>
              <mask id="holes">
                <rect width="100%" height="100%" fill="white" />
                {[0, 1, 2].map((k) => (
                  <rect key={k} x={k * cell + 10} y={k * cell + 10} width={cell - 20} height={cell - 20} rx={8} fill="black" />
                ))}
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="#3A3226" opacity={0.93} mask="url(#holes)" />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={k * cell + 10} y={k * cell + 10} width={cell - 20} height={cell - 20} rx={8} fill="none" stroke={C.amber} strokeWidth={4} />
            ))}
          </svg>
          <div style={{ position: "absolute", top: -60, left: 0, fontFamily: FONT, color: C.sub, fontSize: 26, fontWeight: 800, letterSpacing: 3 }}>CARDAN GRILLE · syllable table</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 420 }}>
          {made.map((w, i) => (
            <div key={i} style={{ fontSize: 52, color: i === made.length - 1 ? C.amber : C.ink }}>
              {w}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Self-citation: each new word copies an earlier nearby word with one glyph changed */
const SC = [
  ["daiin", "", -1],
  ["chol", "", -1],
  ["dain", "daiin", 2],
  ["chor", "chol", 3],
  ["shor", "chor", 0],
  ["dain", "dain", -1],
  ["shol", "shor", 3],
  ["okain", "dain", 0],
  ["qokain", "okain", 0],
  ["qokal", "qokain", 4],
  ["shal", "shol", 2],
  ["okal", "qokal", 0],
] as const;
export const SelfCitation: React.FC = () => {
  const f = useCurrentFrame();
  const per = 26;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160, fontFamily: MONO }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "28px 34px", width: 1400 }}>
        {SC.map(([w, src, ch], i) => {
          const t = f - 10 - i * per;
          if (t < 0) return null;
          const a = interpolate(t, [0, 10], [0, 1], clamp);
          const fresh = t < per * 1.4 && src !== "";
          return (
            <div key={i} style={{ fontSize: 58, opacity: a, position: "relative" }}>
              {w.split("").map((g, k) => (
                <span key={k} style={{ color: fresh && k === ch ? C.amber : C.ink, textDecoration: fresh && k === ch ? "underline" : "none" }}>
                  {g}
                </span>
              ))}
              {fresh && <div style={{ position: "absolute", top: -26, left: 0, fontSize: 20, color: C.sub, fontFamily: FONT, whiteSpace: "nowrap" }}>← copy of “{src}”</div>}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 90, color: C.sub, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 3 }}>SELF-CITATION · copy a nearby word, change a glyph</div>
    </AbsoluteFill>
  );
};

/* Five scribes: one glyph, five hands (schematic, not traced from the manuscript) */
const SCRIBE_COL = ["#EF9F27", "#E8D7A8", "#9FB7C9", "#C98F7A", "#A8C49A"];
export const FiveScribes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140, fontFamily: FONT }}>
      <div style={{ display: "flex", gap: 40 }}>
        {SCRIBE_COL.map((col, i) => {
          const slant = (i - 2) * 7;
          const loop = 30 + i * 6;
          return (
            <div key={i} style={{ width: 260, ...fadeUp(f, i * 8) }}>
              <div style={{ height: 300, background: C.bg2, border: `2px solid ${col}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={200} height={240} viewBox="0 0 200 240">
                  <g transform={`skewX(${slant}) translate(${-slant}, 0)`} fill="none" stroke={col} strokeWidth={8 + (i % 3) * 3} strokeLinecap="round">
                    <path d={`M60 200 L60 ${60 - i * 4} Q60 30 ${90 + i * 4} 40`} />
                    <path d={`M120 200 L120 ${80 - i * 3}`} />
                    <path d={`M60 120 Q${100 + loop / 3} ${60 - loop / 2} 120 120 Q${140 + i * 4} 150 160 110`} />
                    <path d="M40 200 L180 200" />
                  </g>
                </svg>
              </div>
              <div style={{ textAlign: "center", marginTop: 18, color: col, fontSize: 30, fontWeight: 800 }}>Scribe {i + 1}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 40, color: C.dim, fontSize: 22 }}>schematic: the same gallows glyph, five hands</div>
    </AbsoluteFill>
  );
};

/* Naibbe cipher: Latin → pieces → die + card → glyph strings */
export const Naibbe: React.FC = () => {
  const f = useCurrentFrame();
  const pieces = ["pr", "i", "ma", "he", "r", "ba"];
  const out = ["qokeedy", "ol", "chedy", "qokaiin", "ar", "shedy"];
  const pip = 1 + Math.floor(random(Math.floor(f / 5)) * 6);
  const rolling = f > 70 && f < 110;
  const die = rolling ? pip : 4;
  const dots: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [2, 0], [0, 2], [2, 2]],
    5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
    6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  };
  const flip = interpolate(f, [120, 140], [0, 180], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 150, fontFamily: FONT }}>
      <div style={{ ...fadeUp(f, 0), fontSize: 64, color: C.ink, fontStyle: "italic", fontFamily: "Georgia, serif" }}>prima herba</div>
      <div style={{ display: "flex", gap: 22, marginTop: 34 }}>
        {pieces.map((p, i) => (
          <div key={i} style={{ ...fadeUp(f, 30 + i * 4), fontFamily: MONO, fontSize: 46, color: C.amber, border: `2px solid ${C.amber}`, borderRadius: 8, padding: "4px 18px" }}>
            {p}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 60, marginTop: 50, alignItems: "center", ...fadeUp(f, 64) }}>
        <div style={{ width: 120, height: 120, background: C.ink, borderRadius: 18, position: "relative", rotate: rolling ? `${(f * 23) % 360}deg` : "0deg" }}>
          {dots[die].map(([x, y], k) => (
            <div key={k} style={{ position: "absolute", left: 18 + x * 34, top: 18 + y * 34, width: 18, height: 18, borderRadius: 9, background: C.bg }} />
          ))}
        </div>
        <div style={{ width: 110, height: 160, perspective: 600 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 12, transform: `rotateY(${flip}deg)`, background: flip > 90 ? C.ink : "#3A3226", border: `3px solid ${C.amber}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 900, color: C.bg }}>
            {flip > 90 && <span style={{ transform: "scaleX(-1)" }}>7♣</span>}
          </div>
        </div>
        <div style={{ color: C.sub, fontSize: 28, width: 320 }}>die picks the table · card picks the spelling</div>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 50 }}>
        {out.map((o, i) => (
          <div key={i} style={{ ...fadeUp(f, 150 + i * 8), fontFamily: MONO, fontSize: 46, color: C.ink }}>
            {o}
          </div>
        ))}
      </div>
      <div style={{ ...fadeUp(f, 190), color: C.dim, fontSize: 22, marginTop: 24 }}>schematic of the method, not Greshko's actual tables</div>
    </AbsoluteFill>
  );
};

export const Checklist: React.FC<{ items: string[]; title?: string }> = ({ items, title }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140, fontFamily: FONT }}>
      {title && <div style={{ color: C.sub, fontSize: 30, fontWeight: 800, letterSpacing: 4, marginBottom: 40 }}>{title}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {items.map((it, i) => (
          <div key={it} style={{ display: "flex", gap: 30, alignItems: "center", fontSize: 60, fontWeight: 800, color: C.ink, ...fadeUp(f, 10 + i * 40) }}>
            <span style={{ color: C.amber }}>✓</span>
            {it}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* Sheets: scribe-coloured pages. mode "bound" = current (mixed) order, "loose" = unbinds and re-sorts */
export const Sheets: React.FC<{ mode: "mixed" | "unbind"; label?: string }> = ({ mode, label }) => {
  const f = useCurrentFrame();
  const N = 20;
  const scribe = Array.from({ length: N }).map((_, i) => Math.floor(random(`s${i}`) * 5));
  const sorted = scribe.map((s, i) => ({ s, i })).sort((a, b) => a.s - b.s || a.i - b.i);
  const target: number[] = [];
  sorted.forEach((o, k) => (target[o.i] = k));
  const lift = mode === "unbind" ? interpolate(f, [20, 60], [0, 1], { ...clamp, easing: outExpo }) : 0;
  const sort = mode === "unbind" ? interpolate(f, [80, 150], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const W = 72;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160, fontFamily: FONT }}>
      <div style={{ position: "relative", width: N * (W + 10), height: 300 }}>
        {scribe.map((s, i) => {
          const x = (i + (target[i] - i) * sort) * (W + 10);
          const y = 40 + Math.sin(i * 1.7) * 40 * lift - 30 * lift;
          const rot = (random(`r${i}`) - 0.5) * 16 * lift * (1 - sort);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: W,
                height: 200,
                background: "#2A2823",
                borderTop: `10px solid ${SCRIBE_COL[s]}`,
                borderRadius: 4,
                rotate: `${rot}deg`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                ...fadeUp(f, i * 1.5),
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} style={{ height: 4, margin: "14px 10px 0", background: SCRIBE_COL[s], opacity: 0.35 }} />
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 34, marginTop: 30 }}>
        {SCRIBE_COL.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", color: C.sub, fontSize: 24, fontWeight: 700 }}>
            <div style={{ width: 18, height: 18, background: c, borderRadius: 3 }} /> Scribe {i + 1}
          </div>
        ))}
      </div>
      {label && <div style={{ marginTop: 26, color: C.dim, fontSize: 22 }}>{label}</div>}
    </AbsoluteFill>
  );
};

export const NumberedCard: React.FC<{ n: number; text: string }> = ({ n, text }) => (
  <div style={{ display: "flex", gap: 36, alignItems: "flex-start", fontFamily: FONT, width: 1500 }}>
    <div style={{ color: C.amber, fontSize: 80, fontWeight: 900, lineHeight: 1, width: 70 }}>{n}</div>
    <div style={{ color: C.ink, fontSize: 50, fontWeight: 700, lineHeight: 1.25 }}>{text}</div>
  </div>
);
