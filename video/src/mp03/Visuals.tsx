import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { BG, INK, LIME, RED, clamp, outExpo, pop } from "../bc01/Bc01";
import MAP from "../../public/mp03/bering-map.json";
import PHOTOS from "../../public/mp03/photos/photos.json";

// mp03 visuals: a camera over the Bering Strait (wide + strait close-up), the 1867 line / date line,
// a measuring ruler between the Diomedes, route arrows; photos with push-ins.

type Pt = [number, number];
type MapData = { W: number; H: number; us: string; ru: string; others: string[]; border: string; places: Record<string, Pt> };
const M = MAP as unknown as { wide: MapData; strait: MapData };
export type Place = keyof typeof MAP.wide.places;
export type Cam = { x: number; y: number; z: number };
export const CAM = {
  // wide map (Alaska + Chukotka)
  wide: { x: 960, y: 560, z: 1.0 },
  alaska: { x: 1250, y: 600, z: 1.5 },
  strait: { x: 990, y: 470, z: 4.2 },
  south: { x: 960, y: 520, z: 2.4 },
  // strait map (close-up)
  sWide: { x: 960, y: 520, z: 1.0 },
  sIslands: { x: 965, y: 535, z: 3.2 },
  sTight: { x: 963, y: 534, z: 6.5 },
  sCape: { x: 1120, y: 600, z: 1.9 },
} satisfies Record<string, Cam>;
export const YEL = "#FFC93A";
export const BLUE = "#7FD3FF";
const ease = { ...clamp, easing: outExpo };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z * Math.pow(b.z / a.z, k) });

export type Pin = { at: Place; d: number; label: string; color?: string; sub?: string; left?: boolean };
export type Route = { from: Place; to: Place; d: number; color?: string; label?: string; dash?: boolean; bend?: number };

export const BeringCam: React.FC<{
  lf: number; map?: "wide" | "strait"; cam: [Cam, Cam]; camAt?: number; move?: number; pins?: Pin[]; routes?: Route[];
  border?: number; days?: number; dayNames?: [string, string]; ruler?: number; rulerText?: string; glowUS?: number; glowRU?: number; labels?: number; note?: string;
}> = ({ lf, map = "wide", cam, camAt = 0, move = 60, pins = [], routes = [], border, days, dayNames = ["TODAY", "TOMORROW"], ruler, rulerText = "≈ 2.4 mi", glowUS, glowRU, labels, note }) => {
  const D = map === "wide" ? M.wide : M.strait;
  const W = 1920, H = 1080;
  const c = lerpCam(cam[0], cam[1], interpolate(lf - camAt, [0, move], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) }));
  const vh = D.H / c.z, vw = (vh * W) / H, vx = c.x - vw / 2, vy = c.y - vh / 2;
  const sx = (p: Pt) => ((p[0] - vx) / vw) * W, sy = (p: Pt) => ((p[1] - vy) / vh) * H;
  const kb = border === undefined ? 0 : interpolate(lf - border, [0, 18], [0, 1], ease);
  const kd = days === undefined ? 0 : interpolate(lf - days, [0, 12], [0, 1], ease);
  const ku = glowUS === undefined ? 0 : interpolate(lf - glowUS, [0, 12], [0, 1], ease);
  const kr = glowRU === undefined ? 0 : interpolate(lf - glowRU, [0, 12], [0, 1], ease);
  const kl = labels === undefined ? 0 : interpolate(lf - labels, [0, 12], [0, 1], ease);
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  const P = D.places as Record<string, Pt>;
  // border x on screen (the 1867 line runs due north above 65.5N, through the Diomedes)
  const bx = sx([(P.little[0] + P.big[0]) / 2, 0]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={W} height={H} viewBox={`${vx} ${vy} ${vw} ${vh}`}>
        {D.others.map((p, i) => <path key={i} d={p} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} {...ns} />)}
        <path d={D.ru} fill={`rgba(255,77,61,${0.07 + 0.16 * kr})`} stroke={`rgba(255,77,61,${0.5 + 0.5 * kr})`} strokeWidth={2} {...ns} />
        <path d={D.us} fill={`rgba(127,211,255,${0.07 + 0.16 * ku})`} stroke={`rgba(127,211,255,${0.5 + 0.5 * ku})`} strokeWidth={2} {...ns} />
        {kb > 0 && <path d={D.border} fill="none" stroke={YEL} strokeWidth={3.5} strokeDasharray="14 10" pathLength={1000} strokeDashoffset={0} opacity={kb} {...ns} />}
        {routes.map((r, i) => {
          const a = P[r.from], b = P[r.to];
          const k = interpolate(lf - r.d, [0, 26], [0, 1], ease);
          if (k <= 0) return null;
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - (r.bend ?? 0.25) * Math.hypot(b[0] - a[0], b[1] - a[1]);
          const d = `M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`;
          const u = vw / W; // map units per screen px
          return r.dash
            ? <path key={i} d={d} fill="none" stroke={r.color ?? LIME} strokeWidth={5 * u} strokeDasharray={`${12 * u} ${10 * u}`} opacity={k} strokeLinecap="round" />
            : <path key={i} d={d} fill="none" stroke={r.color ?? LIME} strokeWidth={6 * u} pathLength={1} strokeDasharray={`${k} 2`} strokeLinecap="round" />;
        })}
      </svg>
      {kd > 0 && (<>
        <div style={{ position: "absolute", left: 0, width: Math.max(0, bx), top: 0, bottom: 0, background: "linear-gradient(90deg, rgba(255,77,61,0) 40%, rgba(255,77,61,0.12) 100%)", opacity: kd }} />
        <div style={{ position: "absolute", left: Math.max(0, bx), right: 0, top: 0, bottom: 0, background: "linear-gradient(270deg, rgba(127,211,255,0) 40%, rgba(127,211,255,0.12) 100%)", opacity: kd }} />
        <div style={{ position: "absolute", left: bx - 560, width: 520, top: 170, textAlign: "right", fontFamily: "Pretendard", fontWeight: 900, fontSize: 60, color: RED, opacity: kd }}>{dayNames[1]}</div>
        <div style={{ position: "absolute", left: bx + 40, width: 520, top: 170, fontFamily: "Pretendard", fontWeight: 900, fontSize: 60, color: BLUE, opacity: kd }}>{dayNames[0]}</div>
      </>)}
      {kb > 0 && (
        <div style={{ position: "absolute", left: bx - 160, width: 320, top: 92, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 26, color: YEL, opacity: kb }}>1867 LINE · DATE LINE</div>
      )}
      {kl > 0 && (<>
        <div style={{ position: "absolute", left: sx(P.chukotka) - 150, top: sy(P.chukotka) - 30, width: 300, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 54, color: RED, opacity: kl, letterSpacing: 4 }}>RUSSIA</div>
        <div style={{ position: "absolute", left: sx(P.alaska) - 200, top: sy(P.alaska) - 30, width: 400, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 54, color: BLUE, opacity: kl, letterSpacing: 4 }}>ALASKA</div>
      </>)}
      {ruler !== undefined && (() => {
        const k = interpolate(lf - ruler, [0, 20], [0, 1], ease);
        const a: Pt = [sx(P.little), sy(P.little)], b: Pt = [sx(P.big), sy(P.big)];
        const ex = a[0] + (b[0] - a[0]) * k, ey = a[1] + (b[1] - a[1]) * k;
        return (<>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <line x1={a[0]} y1={a[1]} x2={ex} y2={ey} stroke={LIME} strokeWidth={8} strokeLinecap="round" />
            <circle cx={a[0]} cy={a[1]} r={10} fill={LIME} />
            {k > 0.98 && <circle cx={b[0]} cy={b[1]} r={10} fill={LIME} />}
          </svg>
          <div style={{ position: "absolute", left: (a[0] + b[0]) / 2 - 400, width: 800, top: Math.max(a[1], b[1]) + 70, textAlign: "center", whiteSpace: "nowrap", ...pop(lf, ruler + 14, 0.6) }}>
            <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 60, color: BG, background: LIME, padding: "6px 20px", borderRadius: 12 }}>{rulerText}</span>
          </div>
        </>);
      })()}
      {pins.map((p) => {
        const pt = P[p.at];
        const col = p.color ?? LIME;
        const flip = p.left ?? sx(pt) > W - 420;
        return (
          <div key={p.at + p.label} style={{ position: "absolute", left: sx(pt) - 13, top: sy(pt) - 13, ...pop(lf, p.d, 0.3) }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: col, border: `5px solid ${BG}`, boxShadow: `0 0 0 4px ${col}` }} />
            <div style={{ position: "absolute", ...(flip ? { right: 38 } : { left: 38 }), top: -12, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: INK, background: "rgba(10,11,13,0.85)", padding: "4px 12px", borderRadius: 8, whiteSpace: "nowrap", textAlign: flip ? "right" : "left" }}>
              {p.label}{p.sub && <div style={{ fontSize: 26, color: col }}>{p.sub}</div>}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 44, bottom: 110, fontFamily: "Pretendard", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.4)" }}>{note ?? "Map: Natural Earth (public domain) · border simplified"}</div>
    </div>
  );
};

// ---- photos ----
type Photo = { src: string; w: number; h: number; author: string; license: string[] };
const PH = PHOTOS as unknown as Record<string, Photo>;
export const credit = (name: string) => {
  const p = PH[name];
  const lic = p.license.filter((l) => l !== "PDM").join(", ");
  return `Photo: ${p.author.replace(/\s*\(.*$/, "").slice(0, 70)} · ${lic} · Wikimedia Commons`;
};
export type Focus = { x: number; y: number; z: number };

/** A photo filling a box, pushing in from one focus point (0..1 image coords, z >= 1) to another. */
export const Photo: React.FC<{ name: string; lf: number; dur: number; from?: Focus; to?: Focus; box?: { x: number; y: number; w: number; h: number }; d?: number; frame?: boolean; crop?: { x: number; y: number; w: number; h: number } }> = ({
  name, lf, dur, from = { x: 0.5, y: 0.5, z: 1 }, to = { x: 0.5, y: 0.5, z: 1.12 }, box = { x: 0, y: 0, w: 1920, h: 1080 }, d = 0, frame,
}) => {
  const p = PH[name];
  if (!p) throw new Error(`no photo ${name}`);
  const k = interpolate(lf - d, [0, Math.max(1, dur - d)], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const f = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k, z: from.z * Math.pow(to.z / from.z, k) };
  const base = Math.max(box.w / p.w, box.h / p.h);
  const sc = base * f.z, iw = p.w * sc, ih = p.h * sc;
  const left = Math.min(0, Math.max(box.w - iw, box.w / 2 - f.x * iw));
  const top = Math.min(0, Math.max(box.h - ih, box.h / 2 - f.y * ih));
  const o = interpolate(lf - d, [0, 4], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, overflow: "hidden", opacity: o, borderRadius: frame ? 18 : 0, boxShadow: frame ? "0 30px 80px rgba(0,0,0,0.6)" : undefined }}>
      <Img src={staticFile(`mp03/photos/${p.src}`)} style={{ position: "absolute", left, top, width: iw, height: ih }} />
      {!frame && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0) 65%, rgba(10,11,13,0.7) 100%)" }} />}
    </div>
  );
};

export const PhotoCredit: React.FC<{ name: string; extra?: string }> = ({ name, extra }) => (
  <div style={{ position: "absolute", left: 48, top: 36, fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.75)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{extra ? `${extra} · ` : ""}{credit(name)}</div>
);

/** Two clocks side by side (Little Diomede vs Big Diomede). */
export const DayClocks: React.FC<{ lf: number; a: [string, string, string]; b: [string, string, string]; d?: number; d2?: number }> = ({ lf, a, b, d = 2, d2 = 10 }) => (<>
  {[a, b].map(([place, day, time], i) => (
    <div key={place} style={{ position: "absolute", left: i ? 1000 : 160, top: 240, width: 760, textAlign: "center", ...pop(lf, i ? d2 : d, 0.6) }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: i ? RED : BLUE }}>{place}</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: INK, marginTop: 10 }}>{day}</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 180, color: INK, fontVariantNumeric: "tabular-nums", letterSpacing: -6 }}>{time}</div>
    </div>
  ))}
</>);
