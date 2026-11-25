import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { BG, INK, LIME, RED, clamp, outExpo, pop } from "../bc01/Bc01";
import MAP from "../../public/mp02/china-map.json";
import PHOTOS from "../../public/mp02/photos/photos.json";

// mp02 visuals: a camera over China with meridians, the 1918 zones and a sunlight sweep; photos with push-ins.

type Pt = [number, number];
type MapData = { W: number; H: number; china: string; neighbors: string[]; meridians: Record<string, { d: string; x: number }>; places: Record<string, Pt>; lonX: Record<string, number> };
const D = MAP as unknown as MapData;
export type Place = keyof typeof MAP.places;
export type Cam = { x: number; y: number; z: number };
export const CAM = {
  wide: { x: 800, y: 470, z: 1.05 },
  china: { x: 860, y: 480, z: 1.3 },
  west: { x: 420, y: 420, z: 2.4 },
  east: { x: 1330, y: 330, z: 2.4 },
  xinjiang: { x: 430, y: 380, z: 2.0 },
  center: { x: 960, y: 600, z: 2.2 },
} satisfies Record<string, Cam>;
const YEL = "#FFC93A";
const ease = { ...clamp, easing: outExpo };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z * Math.pow(b.z / a.z, k) });
/** longitude -> map x (Mercator x is linear in longitude) */
const lonToX = (lon: number) => { const a = D.lonX["60"], b = D.lonX["140"]; return a + ((lon - 60) / 80) * (b - a); };

export type Pin = { at: Place; d: number; label: string; color?: string; sub?: string };

/**
 * zones: frame the 15-degree meridians (UTC+5..+9) appear. z1918: frame the five 1918 zone meridians appear.
 * sun: [fromHour, toHour] Beijing time sweep over the beat (simplified day/night by longitude, December).
 */
export const ChinaCam: React.FC<{
  lf: number; dur?: number; cam: [Cam, Cam]; camAt?: number; move?: number; zones?: number; z1918?: number; pins?: Pin[];
  sun?: [number, number]; sunDays?: "dec" | "jun"; glow?: number; note?: string;
}> = ({ lf, dur = 120, cam, camAt = 0, move = 60, zones, z1918, pins = [], sun, sunDays = "dec", glow, note }) => {
  const W = 1920, H = 1080;
  const c = lerpCam(cam[0], cam[1], interpolate(lf - camAt, [0, move], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) }));
  const vh = D.H / c.z, vw = (vh * W) / H, vx = c.x - vw / 2, vy = c.y - vh / 2;
  const sx = (p: Pt) => ((p[0] - vx) / vw) * W, sy = (p: Pt) => ((p[1] - vy) / vh) * H;
  const kz = zones === undefined ? 0 : interpolate(lf - zones, [0, 16], [0, 1], ease);
  const k18 = z1918 === undefined ? 0 : interpolate(lf - z1918, [0, 16], [0, 1], ease);
  const kg = glow === undefined ? 0 : interpolate(lf - glow, [0, 14], [0, 1], ease);
  const hour = sun ? interpolate(lf, [0, Math.max(1, dur)], sun, clamp) : 0;
  // simplified daylight: local solar hour = Beijing hour + (lon - 120) / 15; day between 07:20 and 16:40 (Dec) or 04:50 and 19:10 (Jun) local solar time
  const [rise, set] = sunDays === "dec" ? [7.33, 16.67] : [4.83, 19.17];
  const stops = sun ? Array.from({ length: 33 }, (_, i) => {
    const lon = 60 + i * 2.5;
    const solar = hour + (lon - 120) / 15;
    const dawn = interpolate(solar, [rise - 0.6, rise + 0.4], [0.72, 0], clamp) + interpolate(solar, [set - 0.4, set + 0.6], [0, 0.72], clamp);
    return { off: (lonToX(lon) - vx) / vw, a: Math.min(0.72, dawn) };
  }) : [];
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  const hh = Math.floor(hour), mm = Math.floor((hour - hh) * 60);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={W} height={H} viewBox={`${vx} ${vy} ${vw} ${vh}`}>
        <defs>
          <clipPath id="cn"><path d={D.china} /></clipPath>
          {sun && (<>
            <linearGradient id="night" gradientUnits="objectBoundingBox" x1="0" x2="1" y1="0" y2="0">
              {stops.map((s, i) => <stop key={i} offset={Math.max(0, Math.min(1, s.off))} stopColor="#04060f" stopOpacity={s.a} />)}
            </linearGradient>
            <linearGradient id="day" gradientUnits="objectBoundingBox" x1="0" x2="1" y1="0" y2="0">
              {stops.map((s, i) => <stop key={i} offset={Math.max(0, Math.min(1, s.off))} stopColor="#FFE38A" stopOpacity={0.55 * (1 - s.a / 0.72)} />)}
            </linearGradient>
          </>)}
        </defs>
        {D.neighbors.map((p, i) => <path key={i} d={p} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.14)" strokeWidth={1.2} {...ns} />)}
        <path d={D.china} fill={`rgba(255,201,58,${0.1 + 0.12 * kg})`} stroke={YEL} strokeWidth={2.5} {...ns} />
        {sun && <rect x={vx} y={vy} width={vw} height={vh} fill="url(#day)" clipPath="url(#cn)" />}
        {sun && <rect x={vx} y={vy} width={vw} height={vh} fill="url(#night)" clipPath="url(#cn)" />}
        {kz > 0 && ["75", "90", "105", "120", "135"].map((l) => (
          <path key={l} d={D.meridians[l].d} fill="none" stroke={l === "120" ? RED : INK} strokeWidth={l === "120" ? 3 : 1.6} strokeDasharray="8 8" opacity={kz * (l === "120" ? 1 : 0.6)} {...ns} />
        ))}
        {k18 > 0 && ["82.5", "90", "105", "120", "127.5"].map((l, i) => (
          <path key={"z" + l} d={D.meridians[l].d} fill="none" stroke={[BLUE, LIME, YEL, RED, "#C9A7FF"][i]} strokeWidth={3} opacity={interpolate(lf - (z1918 ?? 0) - i * 6, [0, 10], [0, 1], clamp)} {...ns} />
        ))}
      </svg>
      {kz > 0 && ["75", "90", "105", "120", "135"].map((l, i) => (
        <div key={"t" + l} style={{ position: "absolute", left: sx([D.meridians[l].x, 0]) - 60, top: 140, width: 120, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: l === "120" ? RED : INK, opacity: kz }}>
          {l}°E<div style={{ fontSize: 22, opacity: 0.7 }}>UTC+{5 + i}</div>
        </div>
      ))}
      {k18 > 0 && [["82.5", "Kunlun"], ["90", "Huizang"], ["105", "Longshu"], ["120", "Zhongyuan"], ["127.5", "Changbai"]].map(([l, n], i) => (
        <div key={"n" + l} style={{ position: "absolute", left: sx([D.meridians[l].x, 0]) - 90, top: 150 + (i % 2) * 70, width: 180, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: [BLUE, LIME, YEL, RED, "#C9A7FF"][i], opacity: interpolate(lf - (z1918 ?? 0) - i * 6, [0, 10], [0, 1], clamp) }}>
          {n}<div style={{ fontSize: 20, color: INK, opacity: 0.7 }}>{l}°E</div>
        </div>
      ))}
      {sun && (
        <div style={{ position: "absolute", left: 60, top: 640, fontFamily: "Pretendard", fontWeight: 900, color: INK, background: "rgba(10,11,13,0.85)", padding: "14px 24px", borderRadius: 16, textAlign: "center" }}>
          <div style={{ fontSize: 22, color: RED }}>BEIJING TIME</div>
          <div style={{ fontSize: 64, fontVariantNumeric: "tabular-nums" }}>{String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}</div>
          <div style={{ fontSize: 18, opacity: 0.6 }}>{sunDays === "dec" ? "December" : "June"} · daylight simplified</div>
        </div>
      )}
      {pins.map((p) => {
        const pt = D.places[p.at];
        const col = p.color ?? LIME;
        return (
          <div key={p.at + p.label} style={{ position: "absolute", left: sx(pt) - 13, top: sy(pt) - 13, ...pop(lf, p.d, 0.3) }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: col, border: `5px solid ${BG}`, boxShadow: `0 0 0 4px ${col}` }} />
            <div style={{ position: "absolute", ...(sx(pt) > W - 420 ? { right: 38 } : { left: 38 }), top: -12, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: INK, background: "rgba(10,11,13,0.85)", padding: "4px 12px", borderRadius: 8, whiteSpace: "nowrap", textAlign: sx(pt) > W - 420 ? "right" : "left" }}>
              {p.label}{p.sub && <div style={{ fontSize: 26, color: col }}>{p.sub}</div>}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 44, bottom: 110, fontFamily: "Pretendard", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.4)" }}>{note ?? "Map: Natural Earth (public domain)"}</div>
    </div>
  );
};
const BLUE = "#7FD3FF";

// ---- photos ----
type Photo = { src: string; w: number; h: number; author: string; license: string[] };
const P = PHOTOS as unknown as Record<string, Photo>;
export const credit = (name: string) => {
  const p = P[name];
  const lic = p.license.filter((l) => l !== "PDM").join(", ");
  return `Photo: ${p.author.replace(/\s*\(.*$/, "").slice(0, 70)} · ${lic} · Wikimedia Commons`;
};
export type Focus = { x: number; y: number; z: number };

/** A photo filling a box, pushing in from one focus point (0..1 image coords, z >= 1) to another. */
export const Photo: React.FC<{ name: string; lf: number; dur: number; from?: Focus; to?: Focus; box?: { x: number; y: number; w: number; h: number }; d?: number; frame?: boolean }> = ({
  name, lf, dur, from = { x: 0.5, y: 0.5, z: 1 }, to = { x: 0.5, y: 0.5, z: 1.12 }, box = { x: 0, y: 0, w: 1920, h: 1080 }, d = 0, frame,
}) => {
  const p = P[name];
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
      <Img src={staticFile(`mp02/photos/${p.src}`)} style={{ position: "absolute", left, top, width: iw, height: ih }} />
      {!frame && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0) 65%, rgba(10,11,13,0.7) 100%)" }} />}
    </div>
  );
};

export const PhotoCredit: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ position: "absolute", left: 48, top: 36, fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.75)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{credit(name)}</div>
);
