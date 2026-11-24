import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { BG, INK, LIME, RED, clamp, outExpo, pop } from "../bc01/Bc01";
import MAP from "../../public/mp01/korea-map.json";
import PHOTOS from "../../public/mp01/photos/photos.json";

// mp01 visuals: a camera over the Korean peninsula map, and photos with slow push-ins to a detail.

type Pt = [number, number];
type MapData = {
  W: number; H: number; north: string; south: string; border: string; neighbors: string[]; parallel38: string; y38: number;
  borderPts: Pt[]; seoul: Pt; pyongyang: Pt; kaesong: Pt; panmunjom: Pt; sokcho: Pt; goseong: Pt; imjin: Pt;
};
const D = MAP as unknown as MapData;
export type Place = "seoul" | "pyongyang" | "kaesong" | "panmunjom" | "sokcho" | "goseong" | "imjin";
export type Cam = { x: number; y: number; z: number };
export const CAM = {
  wide: { x: 470, y: 520, z: 1.35 },
  dmz: { x: 455, y: 505, z: 3.2 },
  west: { x: 395, y: 520, z: 8 },
  east: { x: 515, y: 485, z: 6.5 },
  seoul: { x: 425, y: 545, z: 4 },
} satisfies Record<string, Cam>;

const ease = { ...clamp, easing: outExpo };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z * Math.pow(b.z / a.z, k) });

export type Pin = { at: Place; d: number; label: string; color?: string };

/**
 * Full-frame map. cam: [from, to] moves over `move` frames from `camAt`.
 * split: frame the peninsula splits (North red / South lime). p38: frame the 38th parallel draws in.
 * zones: frame the areas between the two lines light up. dots: markers along the line (fade: frame most of them disappear).
 * three: frame three versions of the line appear (illustration).
 */
export const MapCam: React.FC<{
  lf: number; cam: [Cam, Cam]; camAt?: number; move?: number; split?: number; p38?: number; mdl?: number; zones?: number;
  pins?: Pin[]; dots?: number; fade?: number; three?: number; note?: string; by38?: number; front?: number;
}> = ({ lf, cam, camAt = 0, move = 60, split, p38, mdl, zones, pins = [], dots, fade, three, note, by38, front }) => {
  const W = 1920, H = 1080;
  const c = lerpCam(cam[0], cam[1], interpolate(lf - camAt, [0, move], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) }));
  const vh = D.H / c.z, vw = (vh * W) / H, vx = c.x - vw / 2, vy = c.y - vh / 2;
  const sx = (p: Pt) => ((p[0] - vx) / vw) * W, sy = (p: Pt) => ((p[1] - vy) / vh) * H;
  const s = split === undefined ? 0 : interpolate(lf - split, [0, 12], [0, 1], ease);
  const k38 = p38 === undefined ? 0 : interpolate(lf - p38, [0, 30], [0, 1], ease);
  const kM = mdl === undefined ? 0 : interpolate(lf - mdl, [0, 24], [0, 1], ease);
  const kZ = zones === undefined ? 0 : interpolate(lf - zones, [0, 14], [0, 1], ease);
  const k3 = three === undefined ? 0 : interpolate(lf - three, [0, 20], [0, 1], ease);
  const one = "rgba(245,245,242,0.10)";
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={W} height={H} viewBox={`${vx} ${vy} ${vw} ${vh}`}>
        <defs>
          <clipPath id="above38"><rect x={0} y={0} width={D.W} height={D.y38} /></clipPath>
          <clipPath id="below38"><rect x={0} y={D.y38} width={D.W} height={D.H} /></clipPath>
        </defs>
        {D.neighbors.map((p, i) => <path key={i} d={p} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} {...ns} />)}
        <path d={D.north} fill={s > 0 ? `rgba(255,107,94,${0.2 * s})` : one} stroke={s > 0.5 ? RED : LIME} strokeWidth={2.5} {...ns} />
        <path d={D.south} fill={s > 0 ? `rgba(215,255,58,${0.16 * s})` : one} stroke={LIME} strokeWidth={2.5} {...ns} />
        {by38 !== undefined && (<>
          {[D.north, D.south].map((d, i) => <path key={"n" + i} d={d} clipPath="url(#above38)" fill={RED} opacity={0.32 * interpolate(lf - by38, [0, 12], [0, 1], ease)} />)}
          {[D.north, D.south].map((d, i) => <path key={"s" + i} d={d} clipPath="url(#below38)" fill={LIME} opacity={0.26 * interpolate(lf - by38, [0, 12], [0, 1], ease)} />)}
        </>)}
        {front !== undefined && (() => {
          // 1950-53 front, simplified: a line sweeping south, north, then settling (illustration)
          const t = Math.max(0, lf - front);
          const fy = interpolate(t, [0, 40, 80, 120, 160], [D.y38, 760, 300, 560, 505], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
          return <line x1={360} x2={560} y1={fy} y2={fy - 30} stroke={INK} strokeWidth={(7 * vh) / 1080} strokeDasharray={`${(18 * vh) / 1080} ${(10 * vh) / 1080}`} />;
        })()}
        {kZ > 0 && (<>
          <path d={D.south} clipPath="url(#above38)" fill={LIME} opacity={0.55 * kZ} />
          <path d={D.north} clipPath="url(#below38)" fill={RED} opacity={0.6 * kZ} />
        </>)}
        {split !== undefined && <path d={D.border} fill="none" stroke={INK} strokeWidth={kM > 0 ? 3 + 4 * kM : 3} strokeDasharray={kM > 0 ? undefined : "10 7"} opacity={s} {...ns} />}
        {k3 > 0 && [-1.6, 0, 1.6].map((o, i) => (
          <path key={i} d={D.border} transform={`translate(${o * 0.6}, ${o})`} fill="none" stroke={[LIME, "#7FD3FF", RED][i]} strokeWidth={3} opacity={k3} {...ns} />
        ))}
        {p38 !== undefined && (
          <path d={D.parallel38} fill="none" stroke="#FFC93A" strokeWidth={(6 * vh) / 1080} pathLength={1}
            style={{ strokeDasharray: `${k38} 1` }} />
        )}
        {dots !== undefined && D.borderPts.map((p, i) => {
          const on = interpolate(lf - dots - i * 0.25, [0, 4], [0, 1], clamp);
          const keep = i % 7 === 3;
          const off = fade === undefined || keep ? 1 : interpolate(lf - fade - (i % 11) * 1.5, [0, 8], [1, 0], clamp);
          return <circle key={i} cx={p[0]} cy={p[1]} r={(keep && fade !== undefined && lf > fade ? 2.4 : 1.6) / Math.sqrt(c.z / 3)} fill="#FFC93A" opacity={on * off} />;
        })}
      </svg>
      {p38 !== undefined && k38 > 0.6 && (
        <div style={{ position: "absolute", left: Math.min(W - 260, sx([560, D.y38]) + 20), top: sy([560, D.y38]) - 52, fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: BG, background: "#FFC93A", padding: "4px 12px", borderRadius: 8 }}>38°N</div>
      )}
      {split !== undefined && s > 0.5 && c.z < 3 && (<>
        <div style={{ position: "absolute", left: sx([470, 300]), top: sy([470, 300]), fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: RED, opacity: s }}>NORTH</div>
        <div style={{ position: "absolute", left: sx([520, 720]), top: sy([520, 720]), fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: LIME, opacity: s }}>SOUTH</div>
      </>)}
      {front !== undefined && (
        <div style={{ position: "absolute", right: 60, bottom: 150, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "rgba(255,255,255,0.7)" }}>- - front line, simplified (illustration)</div>
      )}
      {by38 !== undefined && (<>
        <div style={{ position: "absolute", left: sx([520, 380]), top: sy([520, 380]), fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: RED }}>SOVIET ZONE</div>
        <div style={{ position: "absolute", left: sx([520, 640]), top: sy([520, 640]), fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: LIME }}>U.S. ZONE</div>
      </>)}
      {k3 > 0.5 && (
        <div style={{ position: "absolute", right: 60, bottom: 150, fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: INK, background: "rgba(10,11,13,0.85)", padding: "10px 16px", borderRadius: 10, lineHeight: 1.5 }}>
          <div><span style={{ color: LIME }}>━</span> South Korea: 2004 U.S. military maps</div>
          <div><span style={{ color: "#7FD3FF" }}>━</span> UN Command: 2016 coordinates</div>
          <div><span style={{ color: RED }}>━</span> North Korea: lines between markers</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }}>illustration, offsets not to scale</div>
        </div>
      )}
      {pins.map((p) => {
        const pt = D[p.at];
        const col = p.color ?? LIME;
        return (
          <div key={p.at + p.label} style={{ position: "absolute", left: sx(pt) - 14, top: sy(pt) - 14, ...pop(lf, p.d, 0.3) }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: col, border: `5px solid ${BG}`, boxShadow: `0 0 0 4px ${col}` }} />
            <div style={{ position: "absolute", left: 40, top: -10, fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: INK, background: "rgba(10,11,13,0.85)", padding: "4px 12px", borderRadius: 8, whiteSpace: "nowrap" }}>{p.label}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 44, bottom: 110, fontFamily: "Pretendard", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.4)" }}>
        {note ?? "Map: Natural Earth (public domain). Lines approximate."}
      </div>
    </div>
  );
};

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
      <Img src={staticFile(`mp01/photos/${p.src}`)} style={{ position: "absolute", left, top, width: iw, height: ih }} />
      {!frame && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0) 65%, rgba(10,11,13,0.7) 100%)" }} />}
    </div>
  );
};

export const PhotoCredit: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ position: "absolute", left: 48, top: 36, fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.75)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{credit(name)}</div>
);
