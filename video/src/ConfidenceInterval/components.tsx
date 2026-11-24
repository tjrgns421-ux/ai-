import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, HYPOTHESES, MONO } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

/* ------------------------------------------------------------------ meter state */

export type MeterKey = {
  f: number; // frame at which the move starts
  v: [number, number, number, number] | null; // hypothesis %s (null = not shown yet)
  main: number | null; // "says something" total (null = empty meter)
  band?: [number, number] | null; // uncertainty band
  dur?: number; // frames for the move (default 36)
};
export type MeterState = { v: number[]; main: number; band: [number, number]; bandO: number; empty: number; cardsO: number };

// Interpolates the meter between keyframes. Everything on screen that shows numbers reads from this.
export const meterAt = (keys: MeterKey[], f: number): MeterState => {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].f <= f) i++;
  const k = keys[i];
  const p = i > 0 ? keys[i - 1] : k;
  const t = f < k.f ? 0 : interpolate(f, [k.f, k.f + (k.dur ?? 36)], [0, 1], { ...clamp, easing: ease });
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const pv = p.v ?? [25, 25, 25, 25];
  const kv = k.v ?? pv;
  const pm = p.main ?? 0;
  const km = k.main ?? pm;
  const pb = p.band ?? [pm, pm];
  const kb = k.band ?? [km, km];
  return {
    v: kv.map((x, j) => lerp(pv[j], x)),
    main: lerp(pm, km),
    band: [lerp(pb[0], kb[0]), lerp(pb[1], kb[1])],
    bandO: lerp(p.band ? 1 : 0, k.band ? 1 : 0),
    empty: lerp(p.main === null ? 1 : 0, k.main === null ? 1 : 0),
    cardsO: lerp(p.v ? 1 : 0, k.v ? 1 : 0),
  };
};

/* ------------------------------------------------------------------ ConfidenceMeter */

// Horizontal 0–100 gauge: amber fill, shaded uncertainty band, big %. `scale` lets it shrink to a corner badge.
export const ConfidenceMeter: React.FC<{ s: MeterState; label?: string; width?: number; big?: boolean }> = ({
  s,
  label = "Does it say anything?",
  width = 1100,
  big = true,
}) => {
  const h = big ? 26 : 12;
  const x = (p: number) => (p / 100) * width;
  const num = s.empty > 0.5 ? "—" : `${Math.round(s.main)}%`;
  return (
    <div style={{ width, fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: big ? 18 : 8 }}>
        <div style={{ color: C.sub, fontSize: big ? 30 : 17, fontWeight: 700, letterSpacing: big ? 3 : 1.5, textTransform: "uppercase" }}>{label}</div>
        <div style={{ color: C.amber, fontSize: big ? 112 : 46, fontWeight: 900, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>{num}</div>
      </div>
      <div style={{ position: "relative", height: h, background: C.line, borderRadius: h / 2 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: x(s.main) * (1 - s.empty), background: C.amber, borderRadius: h / 2 }} />
        {s.bandO > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: x(s.band[0]),
              width: Math.max(2, x(s.band[1]) - x(s.band[0])),
              top: -h * 0.9,
              bottom: -h * 0.9,
              background: "rgba(241,239,232,0.13)",
              border: `2px solid rgba(241,239,232,${0.55 * s.bandO})`,
              borderRadius: 6,
              opacity: s.bandO,
            }}
          />
        )}
        <div style={{ position: "absolute", left: x(50) - 1, top: -h * 0.6, bottom: -h * 0.6, width: 2, background: C.dim }} />
      </div>
      {big && (
        <div style={{ position: "relative", height: 40, marginTop: 16, color: C.dim, fontSize: 22, fontWeight: 700 }}>
          {[0, 50, 100].map((p) => (
            <span key={p} style={{ position: "absolute", left: x(p), transform: `translateX(${p === 0 ? 0 : p === 100 ? -100 : -50}%)` }}>
              {p}%
            </span>
          ))}
          {s.bandO > 0.01 && (
            <span style={{ position: "absolute", left: x((s.band[0] + s.band[1]) / 2), transform: "translateX(-50%)", top: 22, color: C.ink, opacity: s.bandO, whiteSpace: "nowrap" }}>
              my uncertainty: {Math.round(s.band[0])}–{Math.round(s.band[1])}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ HypothesisCards */

export const HypothesisCards: React.FC<{ s: MeterState; appear?: number; highlight?: number; width?: number }> = ({ s, appear = -999, highlight = -1, width = 1640 }) => {
  const f = useCurrentFrame();
  const gap = 28;
  const w = (width - gap * 3) / 4;
  return (
    <div style={{ display: "flex", gap, width, fontFamily: FONT }}>
      {HYPOTHESES.map((name, i) => {
        const a = interpolate(f, [appear + i * 6, appear + i * 6 + 18], [0, 1], { ...clamp, easing: outExpo });
        const val = s.v[i];
        const dead = val < 3;
        const hi = highlight === i;
        return (
          <div
            key={name}
            style={{
              width: w,
              height: 250,
              boxSizing: "border-box",
              padding: "26px 28px",
              background: hi ? "#24221D" : C.bg2,
              border: `2px solid ${hi ? C.amber : C.line}`,
              borderRadius: 14,
              opacity: a * (dead && !hi ? 0.45 : 1),
              translate: `0 ${(1 - a) * 60}px`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ color: C.sub, fontSize: 27, fontWeight: 800, letterSpacing: 2 }}>{name}</div>
            <div>
              <div style={{ color: hi ? C.amber : C.ink, fontSize: 96, fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Math.round(val)}%</div>
              <div style={{ height: 8, background: C.line, borderRadius: 4, marginTop: 14 }}>
                <div style={{ width: `${val}%`, height: "100%", background: hi ? C.amber : C.sub, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ TextCard */

export const TextCard: React.FC<{ kicker?: string; title: string; sub?: string; at?: number; align?: "center" | "left"; size?: number }> = ({
  kicker,
  title,
  sub,
  at = 0,
  align = "center",
  size = 92,
}) => {
  const f = useCurrentFrame() - at;
  const a = (d: number) => interpolate(f, [d, d + 16], [0, 1], { ...clamp, easing: outExpo });
  return (
    <AbsoluteFill style={{ alignItems: align === "center" ? "center" : "flex-start", justifyContent: "center", padding: "0 160px 140px", fontFamily: FONT, textAlign: align }}>
      {kicker && (
        <div style={{ color: C.amber, fontSize: 30, fontWeight: 800, letterSpacing: 6, marginBottom: 28, opacity: a(0), translate: `0 ${(1 - a(0)) * 20}px` }}>{kicker}</div>
      )}
      <div style={{ color: C.ink, fontSize: size, fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1500, opacity: a(4), translate: `0 ${(1 - a(4)) * 30}px` }}>{title}</div>
      {sub && <div style={{ color: C.sub, fontSize: 38, fontWeight: 500, marginTop: 30, maxWidth: 1300, lineHeight: 1.35, opacity: a(10) }}>{sub}</div>}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ ArchivalPan */

// Slow Ken Burns over a public-domain scan, with vignette + faint grain. Image is fit to height by default.
export const ArchivalPan: React.FC<{
  src: string;
  dur: number; // frames the pan lasts
  from?: [number, number, number]; // [scale, xPct, yPct]
  to?: [number, number, number];
  fit?: "contain" | "cover";
  dim?: number;
  fadeIn?: number;
}> = ({ src, dur, from = [1.0, 0, 0], to = [1.12, 0, -2], fit = "contain", dim = 0, fadeIn = 12 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const sc = from[0] + (to[0] - from[0]) * t;
  const x = from[1] + (to[1] - from[1]) * t;
  const y = from[2] + (to[2] - from[2]) * t;
  const o = interpolate(f, [0, fadeIn], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${sc}) translate(${x}%, ${y}%)` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: fit, filter: "sepia(0.15) contrast(1.05) brightness(0.92)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(20,20,19,0) 35%, rgba(20,20,19,0.85) 85%, #141413 100%)" }} />
      {dim > 0 && <AbsoluteFill style={{ background: C.bg, opacity: dim }} />}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ CitationTag */

export const CitationTag: React.FC<{ text: string; at?: number; top?: boolean }> = ({ text, at = 0, top = false }) => {
  const f = useCurrentFrame() - at;
  const a = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: outExpo });
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        [top ? "top" : "bottom"]: top ? 60 : 200,
        fontFamily: MONO,
        fontSize: 24,
        color: C.sub,
        padding: "10px 18px",
        borderLeft: `4px solid ${C.amber}`,
        background: "rgba(20,20,19,0.82)",
        opacity: a,
        translate: `${(1 - a) * -30}px 0`,
      }}
    >
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ Callout */

export const Callout: React.FC<{ text: string; x: number; y: number; at?: number; size?: number }> = ({ text, x, y, at = 0, size = 44 }) => {
  const f = useCurrentFrame() - at;
  const a = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: outExpo });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        color: C.bg,
        background: C.amber,
        padding: "8px 22px",
        borderRadius: 6,
        opacity: a,
        scale: String(0.9 + 0.1 * a),
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ Timeline with error band */

export type Mark = { year: number; label: string; at?: number };
export const Timeline: React.FC<{
  from?: number;
  to?: number;
  band?: { a: number; b: number; label: string; at?: number };
  marks?: Mark[];
  width?: number;
}> = ({ from = 1300, to = 2000, band, marks = [], width = 1600 }) => {
  const f = useCurrentFrame();
  const x = (y: number) => ((y - from) / (to - from)) * width;
  const ticks = [];
  for (let y = from; y <= to; y += 100) ticks.push(y);
  const ba = band ? interpolate(f, [band.at ?? 0, (band.at ?? 0) + 10], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) }) : 0;
  return (
    <div style={{ position: "relative", width, height: 360, fontFamily: FONT }}>
      <div style={{ position: "absolute", top: 200, left: 0, width, height: 4, background: C.sub }} />
      {ticks.map((y) => (
        <div key={y} style={{ position: "absolute", left: x(y), top: 192 }}>
          <div style={{ width: 3, height: 20, background: C.sub, marginLeft: -1 }} />
          <div style={{ color: C.sub, fontSize: 28, fontWeight: 700, transform: "translateX(-50%)", marginTop: 12 }}>{y}</div>
        </div>
      ))}
      {band && (
        <>
          <div
            style={{
              position: "absolute",
              left: x(band.a),
              width: x(band.b) - x(band.a),
              top: 166,
              height: 72,
              background: C.amberSoft,
              border: `3px solid ${C.amber}`,
              borderRadius: 4,
              transform: `scaleY(${ba})`,
              opacity: Math.min(1, ba),
            }}
          />
          <div style={{ position: "absolute", left: x(band.a) - 20, top: 74, color: C.amber, fontSize: 40, fontWeight: 900, opacity: Math.min(1, ba), whiteSpace: "nowrap" }}>
            {band.a}–{band.b}
          </div>
          <div style={{ position: "absolute", left: x(band.a) - 20, top: 130, color: C.sub, fontSize: 24, fontWeight: 600, opacity: Math.min(1, ba), whiteSpace: "nowrap" }}>{band.label}</div>
        </>
      )}
      {marks.map((m) => {
        const a = interpolate(f, [m.at ?? 0, (m.at ?? 0) + 12], [0, 1], { ...clamp, easing: outExpo });
        return (
          <div key={m.year} style={{ position: "absolute", left: x(m.year), top: 160, opacity: a }}>
            <div style={{ width: 4, height: 84, background: C.ink, marginLeft: -2 }} />
            <div style={{ color: C.ink, fontSize: 28, fontWeight: 800, whiteSpace: "nowrap", transform: "translateX(-50%)", marginTop: 50 }}>
              {m.year} · {m.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ Zipf log-log chart */

export type ZipfSeries = { name: string; pts: [number, number][]; color: string }; // [rank, freq]
export const ZipfChart: React.FC<{ series: ZipfSeries[]; at?: number; w?: number; h?: number; note?: string }> = ({ series, at = 0, w = 1100, h = 640, note }) => {
  const f = useCurrentFrame() - at;
  const pad = 80;
  const lx = (r: number) => pad + (Math.log10(r) / 3) * (w - pad * 2); // ranks 1..1000
  const ly = (q: number) => pad + (1 - (Math.log10(q) + 4) / 4) * (h - pad * 2); // freq 1e-4..1
  const lineP = interpolate(f, [series.length * 20, series.length * 20 + 30], [0, 1], clamp);
  return (
    <svg width={w} height={h} style={{ fontFamily: FONT, overflow: "visible" }}>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke={C.sub} strokeWidth={3} />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke={C.sub} strokeWidth={3} />
      {[1, 10, 100, 1000].map((r) => (
        <text key={r} x={lx(r)} y={h - pad + 40} fill={C.sub} fontSize={24} textAnchor="middle">
          {r}
        </text>
      ))}
      <text x={w / 2} y={h - 4} fill={C.sub} fontSize={26} fontWeight={700} textAnchor="middle">
        word rank (log)
      </text>
      <text x={18} y={h / 2} fill={C.sub} fontSize={26} fontWeight={700} textAnchor="middle" transform={`rotate(-90 18 ${h / 2})`}>
        frequency (log)
      </text>
      <line
        x1={lx(1)}
        y1={ly(0.07)}
        x2={lx(1) + (lx(1000) - lx(1)) * lineP}
        y2={ly(0.07) + (ly(0.00007) - ly(0.07)) * lineP}
        stroke={C.ink}
        strokeWidth={3}
        strokeDasharray="10 8"
        opacity={0.7}
      />
      {series.map((s, si) =>
        s.pts.map(([r, q], i) => {
          const a = interpolate(f, [si * 20 + i * 0.3, si * 20 + i * 0.3 + 6], [0, 1], clamp);
          return <circle key={`${si}-${i}`} cx={lx(r)} cy={ly(q)} r={si === series.length - 1 ? 6 : 4.5} fill={s.color} opacity={a * 0.85} />;
        }),
      )}
      {series.map((s, si) => (
        <g key={s.name} opacity={interpolate(f, [si * 20, si * 20 + 10], [0, 1], clamp)}>
          <circle cx={w - 260} cy={pad + 10 + si * 44} r={9} fill={s.color} />
          <text x={w - 236} y={pad + 19 + si * 44} fill={C.ink} fontSize={28} fontWeight={700}>
            {s.name}
          </text>
        </g>
      ))}
      {note && (
        <text x={w - pad} y={h - pad - 16} fill={C.dim} fontSize={20} textAnchor="end">
          {note}
        </text>
      )}
    </svg>
  );
};

/* ------------------------------------------------------------------ Captions */

export type W = { t: string; s: number; e: number };
// Large burned-in captions, bottom-center. Groups words into short phrases (≤ maxWords, breaks on punctuation).
export const groupWords = (words: W[], maxWords = 6): W[][] => {
  const out: W[][] = [];
  let cur: W[] = [];
  for (const w of words) {
    cur.push(w);
    const punct = /[.,:;?!…]$/.test(w.t) || /["”]$/.test(w.t);
    if (cur.length >= maxWords || (punct && cur.length >= 2) || /[.?!]$/.test(w.t)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

export const Captions: React.FC<{ groups: W[][]; fps: number; bottom?: number }> = ({ groups, fps, bottom = 70 }) => {
  const f = useCurrentFrame();
  const t = f / fps;
  const g = groups.find((gr, i) => t >= gr[0].s - 0.05 && t < Math.min(gr[gr.length - 1].e + 0.35, groups[i + 1]?.[0].s ?? 1e9));
  if (!g) return null;
  return (
    <div style={{ position: "absolute", left: 120, right: 120, bottom, textAlign: "center", fontFamily: FONT }}>
      <span
        style={{
          display: "inline-block",
          fontSize: 58,
          fontWeight: 800,
          lineHeight: 1.2,
          color: C.ink,
          background: "rgba(20,20,19,0.72)",
          padding: "8px 26px",
          borderRadius: 10,
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        {g.map((w) => w.t).join(" ")}
      </span>
    </div>
  );
};
