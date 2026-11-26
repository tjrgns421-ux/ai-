import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { BG, DIM, INK, LIME, RED, clamp, outExpo, pop, rise } from "../bc01/Bc01";
import MAP from "../../public/mp04/night-map.json";
import LIT from "../../public/mp04/lit.json";
import PHOTOS from "../../public/mp04/photos/photos.json";

// mp04 visuals: a camera over NASA night images of Korea (same pixel grid as the border overlay),
// year cross-fades, pins, and a chart of our lit-area measurement.

type Pt = [number, number];
const D = MAP as unknown as { W: number; H: number; nk: string; sk: string; places: Record<string, Pt> };
export type Place = keyof typeof MAP.places;
export type Cam = { x: number; y: number; z: number };
export const YEL = "#FFC93A";
export const BLUE = "#7FD3FF";
// z = how many image px fit in the 1080 screen height, inverted: visible height = H / z
export const CAM = {
  peninsula: { x: 700, y: 1150, z: 1.25 },
  north: { x: 600, y: 760, z: 2.2 },
  south: { x: 860, y: 1450, z: 2.2 },
  pyongyang: { x: 350, y: 836, z: 7.5 },
  pyongWide: { x: 430, y: 830, z: 4.0 },
  east: { x: 650, y: 820, z: 3.6 },
  border: { x: 600, y: 1120, z: 3.2 },
} satisfies Record<string, Cam>;
const ease = { ...clamp, easing: outExpo };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z * Math.pow(b.z / a.z, k) });

export type Img = "bm2012" | "bm2016" | "gf2012" | "gf2016" | "gf2020" | "gf2023" | "gf2025";
export type Pin = { at: Place; d: number; label: string; color?: string; sub?: string; left?: boolean };

/** imgs: [image, fromFrame] list; each one fades in over the previous at its frame. */
export const NightCam: React.FC<{
  lf: number; imgs: [Img, number][]; cam: [Cam, Cam]; camAt?: number; move?: number; borders?: number; glowNK?: number; pins?: Pin[]; tag?: string; note?: string;
}> = ({ lf, imgs, cam, camAt = 0, move = 60, borders, glowNK, pins = [], tag, note }) => {
  const W = 1920, H = 1080;
  const c = lerpCam(cam[0], cam[1], interpolate(lf - camAt, [0, move], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) }));
  const vh = D.H / c.z, vw = (vh * W) / H; // z=1: the whole image height fits the screen
  const vx = c.x - vw / 2, vy = c.y - vh / 2;
  const sx = (p: Pt) => ((p[0] - vx) / vw) * W, sy = (p: Pt) => ((p[1] - vy) / vh) * H;
  const kb = borders === undefined ? 0 : interpolate(lf - borders, [0, 14], [0, 1], ease);
  const kg = glowNK === undefined ? 0 : interpolate(lf - glowNK, [0, 14], [0, 1], ease);
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  let year = tag;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#05070f" }}>
      <svg width={W} height={H} viewBox={`${vx} ${vy} ${vw} ${vh}`} style={{ position: "absolute", inset: 0 }}>
        {imgs.map(([name, at], i) => {
          const o = i === 0 ? 1 : interpolate(lf - at, [0, 12], [0, 1], clamp);
          if (o > 0.5) year = name.replace(/^\D+/, "");
          return <image key={name + i} href={staticFile(`mp04/night/${name}.jpg`)} x={0} y={0} width={D.W} height={D.H} opacity={o} />;
        })}
        {kb > 0 && <path d={D.sk} fill="none" stroke={BLUE} strokeWidth={2.2} opacity={0.75 * kb} {...ns} />}
        {kb > 0 && <path d={D.nk} fill={`rgba(255,77,61,${0.12 * kg})`} stroke={RED} strokeWidth={2.2} opacity={0.85 * kb} {...ns} />}
      </svg>
      {pins.map((p) => {
        const pt = D.places[p.at];
        const col = p.color ?? LIME;
        const flip = p.left ?? sx(pt) > W - 460;
        return (
          <div key={p.at + p.label} style={{ position: "absolute", left: sx(pt) - 13, top: sy(pt) - 13, ...pop(lf, p.d, 0.3) }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, border: `4px solid ${col}`, boxShadow: `0 0 0 3px ${BG}` }} />
            <div style={{ position: "absolute", ...(flip ? { right: 40 } : { left: 40 }), top: -12, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: INK, background: "rgba(10,11,13,0.85)", padding: "4px 12px", borderRadius: 8, whiteSpace: "nowrap", textAlign: flip ? "right" : "left" }}>
              {p.label}{p.sub && <div style={{ fontSize: 26, color: col }}>{p.sub}</div>}
            </div>
          </div>
        );
      })}
      {year && (
        <div style={{ position: "absolute", left: 48, top: 110, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: YEL, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>{year}</div>
      )}
      <div style={{ position: "absolute", right: 44, bottom: 110, fontFamily: "Pretendard", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.45)", textAlign: "right" }}>{note ?? "NASA Black Marble / VIIRS night lights (GIBS) · borders: Natural Earth"}</div>
    </div>
  );
};

/** Our measurement: share of land lit, North Korea (bars) with South Korea for scale. */
export const LitChart: React.FC<{ lf: number; upTo?: number; showSK?: number; mult?: number }> = ({ lf, upTo = 2026, showSK, mult }) => {
  const L = LIT as unknown as { nk: Record<string, number>; sk: Record<string, number> };
  const years = Object.keys(L.nk).map(Number).filter((y) => y <= 2026);
  const x0 = 200, x1 = 1640, yb = 860, hMax = 560, max = 0.4;
  const bw = (x1 - x0) / years.length;
  return (<>
    <div style={{ position: "absolute", left: 140, top: 90, fontFamily: "Pretendard", fontWeight: 900, fontSize: 44, color: INK, ...rise(lf) }}>North Korea: share of land lit at night</div>
    <div style={{ position: "absolute", left: 140, top: 150, fontFamily: "Pretendard", fontWeight: 700, fontSize: 28, color: DIM, ...rise(lf, 3) }}>Our measurement · NASA VIIRS, three October nights a year</div>
    {years.map((y, i) => {
      const v = L.nk[String(y)];
      const k = interpolate(lf - i * 2, [0, 14], [0, 1], ease) * (y <= upTo ? 1 : 0);
      const h = (v / max) * hMax * k;
      const hot = y >= 2023;
      return (
        <div key={y}>
          <div style={{ position: "absolute", left: x0 + i * bw + 8, width: bw - 16, top: yb - h, height: h, background: hot ? YEL : "rgba(255,201,58,0.45)", borderRadius: "8px 8px 0 0" }} />
          <div style={{ position: "absolute", left: x0 + i * bw, width: bw, top: yb + 12, textAlign: "center", fontFamily: "Pretendard", fontWeight: 700, fontSize: 24, color: DIM }}>{String(y).slice(2)}</div>
          {k > 0.9 && (y === 2012 || y === 2025) && <div style={{ position: "absolute", left: x0 + i * bw - 30, width: bw + 60, top: yb - h - 48, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 32, color: INK }}>{v.toFixed(2)}%</div>}
        </div>
      );
    })}
    <div style={{ position: "absolute", left: x0 - 10, width: x1 - x0 + 20, top: yb, height: 3, background: "rgba(255,255,255,0.3)" }} />
    {showSK !== undefined && (
      <div style={{ position: "absolute", left: 200, top: 330, fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: BLUE, background: "rgba(10,11,13,0.85)", padding: "10px 18px", borderRadius: 12, ...pop(lf, showSK, 0.7) }}>
        South Korea, same method: {L.sk["2012"].toFixed(0)}% → {L.sk["2025"].toFixed(0)}%
      </div>
    )}
    {mult !== undefined && (
      <div style={{ position: "absolute", left: 380, top: 300, fontFamily: "Pretendard", fontWeight: 900, fontSize: 80, color: BG, background: YEL, padding: "6px 24px", borderRadius: 14, ...pop(lf, mult, 0.6) }}>×4–5 since 2012</div>
    )}
    <div style={{ position: "absolute", right: 44, bottom: 110, fontFamily: "Pretendard", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.45)" }}>Calculated: NASA GIBS VNP46A2 gap-filled radiance, pixels ≥ 120/255 inside Natural Earth borders</div>
  </>);
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

export const Photo: React.FC<{ name: string; lf: number; dur: number; from?: Focus; to?: Focus; box?: { x: number; y: number; w: number; h: number }; d?: number; frame?: boolean; src?: string; size?: [number, number] }> = ({
  name, lf, dur, from = { x: 0.5, y: 0.5, z: 1 }, to = { x: 0.5, y: 0.5, z: 1.12 }, box = { x: 0, y: 0, w: 1920, h: 1080 }, d = 0, frame, src, size,
}) => {
  const p = src ? { src, w: size![0], h: size![1] } : PH[name];
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
      <Img src={staticFile(src ? `mp04/night/${p.src}` : `mp04/photos/${p.src}`)} style={{ position: "absolute", left, top, width: iw, height: ih }} />
      {!frame && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0) 65%, rgba(10,11,13,0.7) 100%)" }} />}
    </div>
  );
};
/** NASA ISS photo (public domain) */
export const ISS: React.FC<{ y: 2014 | 2024; lf: number; dur: number; from?: Focus; to?: Focus }> = ({ y, lf, dur, from, to }) => (
  <Photo name={`iss${y}`} src={`iss${y}.jpg`} size={y === 2014 ? [2400, 1597] : [1600, 2400]} lf={lf} dur={dur} from={from} to={to} />
);

export const PhotoCredit: React.FC<{ name?: string; extra?: string; text?: string }> = ({ name, extra, text }) => (
  <div style={{ position: "absolute", left: 48, top: 36, fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.75)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{extra ? `${extra} · ` : ""}{text ?? credit(name!)}</div>
);
