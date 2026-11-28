import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { BG, DIM, INK, LIME, RED, clamp, outExpo, pop, rise } from "../bc01/Bc01";
import MAP from "../../public/mp05/world-map.json";
import PHOTOS from "../../public/mp05/photos/photos.json";

// mp05 visuals: world map with the three summits, mountains to scale, the Earth's bulge (exaggerated),
// the 1849-50 survey from the plains, and photos.

export const YEL = "#FFC93A";
export const BLUE = "#7FD3FF";
export const SEA = "#1E4E7A";
const ease = { ...clamp, easing: outExpo };
const font = (size: number, color = INK, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: "Pretendard", fontWeight: 900, fontSize: size, color, ...extra });

// ---- world map ----
type Pt = [number, number];
const M = MAP as unknown as { W: number; H: number; land: string; places: Record<string, Pt>; equator: number };
export type Place = keyof typeof MAP.places;
export type Cam = { x: number; y: number; z: number };
export const WCAM = {
  world: { x: 960, y: 470, z: 1.0 },
  asia: { x: 1400, y: 330, z: 3.2 },
  everest: { x: 1424, y: 330, z: 7 },
  pacific: { x: 260, y: 360, z: 3.0 },
  ecuador: { x: 540, y: 490, z: 3.6 },
} satisfies Record<string, Cam>;
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z * Math.pow(b.z / a.z, k) });
export type Pin = { at: Place; d: number; label: string; color?: string; sub?: string; left?: boolean };

export const WorldCam: React.FC<{ lf: number; cam: [Cam, Cam]; move?: number; pins?: Pin[]; equator?: number; note?: string }> = ({ lf, cam, move = 60, pins = [], equator, note }) => {
  const W = 1920, H = 1080;
  const c = lerpCam(cam[0], cam[1], interpolate(lf, [0, move], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) }));
  const vh = 1080 / c.z, vw = (vh * W) / H, vx = c.x - vw / 2, vy = c.y - vh / 2;
  const sx = (p: Pt) => ((p[0] - vx) / vw) * W, sy = (p: Pt) => ((p[1] - vy) / vh) * H;
  const ke = equator === undefined ? 0 : interpolate(lf - equator, [0, 18], [0, 1], ease);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0b1422" }}>
      <svg width={W} height={H} viewBox={`${vx} ${vy} ${vw} ${vh}`} style={{ position: "absolute", inset: 0 }}>
        <path d={M.land} fill="#2a3340" stroke="rgba(255,255,255,0.25)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {ke > 0 && <line x1={0} x2={M.W * ke} y1={M.equator} y2={M.equator} stroke={YEL} strokeWidth={2.5} strokeDasharray="10 8" vectorEffect="non-scaling-stroke" />}
      </svg>
      {ke > 0 && <div style={{ position: "absolute", left: 40, top: sy([0, M.equator]) - 46, ...font(30, YEL), opacity: ke }}>EQUATOR</div>}
      {pins.map((p) => {
        const pt = M.places[p.at];
        const col = p.color ?? LIME;
        const flip = p.left ?? sx(pt) > W - 460;
        return (
          <div key={p.at + p.label} style={{ position: "absolute", left: sx(pt) - 13, top: sy(pt) - 13, ...pop(lf, p.d, 0.3) }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: col, border: `5px solid ${BG}`, boxShadow: `0 0 0 4px ${col}` }} />
            <div style={{ position: "absolute", ...(flip ? { right: 40 } : { left: 40 }), top: -12, ...font(34), background: "rgba(10,11,13,0.85)", padding: "4px 12px", borderRadius: 8, whiteSpace: "nowrap", textAlign: flip ? "right" : "left" }}>
              {p.label}{p.sub && <div style={{ fontSize: 26, color: col }}>{p.sub}</div>}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 44, bottom: 110, ...font(20, "rgba(255,255,255,0.4)", { fontWeight: 700 }) }}>{note ?? "Map: Natural Earth (public domain)"}</div>
    </div>
  );
};

// ---- mountains to scale ----
/** Three mountains drawn to the same vertical scale, with sea level. show: which ones; base: show Mauna Kea below sea level. */
export const Mountains: React.FC<{ lf: number; show: ("everest" | "mauna" | "chimb")[]; base?: number; d?: number[]; labels?: boolean; baseRange?: number; note?: string }> = ({ lf, show, base, d = [0, 6, 12], baseRange, note }) => {
  const sea = 640, px = 0.042; // px per meter
  const kb = base === undefined ? 0 : interpolate(lf - base, [0, 30], [0, 1], ease);
  const items: Record<string, { x: number; h: number; below: number; w: number; color: string; name: string; val: string }> = {
    everest: { x: 420, h: 8849, below: 0, w: 520, color: "#E8E2D6", name: "Everest", val: "8,849 m" },
    mauna: { x: 1000, h: 4207, below: 6000, w: 720, color: "#7F6A5A", name: "Mauna Kea", val: "4,207 m" },
    chimb: { x: 1530, h: 6263, below: 0, w: 440, color: "#CFD6DC", name: "Chimborazo", val: "6,263 m" },
  };
  const belowH = 6000 * px * kb;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: sea, height: 1080 - sea, background: `linear-gradient(180deg, ${SEA} 0%, #081624 100%)`, opacity: 0.9 }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {show.map((k, i) => {
          const m = items[k];
          const k1 = interpolate(lf - (d[i] ?? 0), [0, 18], [0, 1], ease);
          const top = sea - m.h * px * k1;
          const bot = k === "mauna" ? sea + belowH : sea;
          const half = (m.w / 2) * (k === "mauna" ? 1 + 0.6 * kb : 1);
          return <path key={k} d={`M${m.x - half},${bot} L${m.x - 40},${top + 6} Q${m.x},${top - 4} ${m.x + 40},${top + 6} L${m.x + half},${bot} Z`} fill={m.color} opacity={0.95} />;
        })}
        <line x1={0} x2={1920} y1={sea} y2={sea} stroke={BLUE} strokeWidth={3} strokeDasharray="12 8" />
      </svg>
      <div style={{ position: "absolute", right: 40, top: sea - 44, ...font(26, BLUE) }}>sea level</div>
      {show.map((k, i) => {
        const m = items[k];
        const top = sea - m.h * px;
        return (
          <div key={k} style={{ position: "absolute", left: m.x - 200, width: 400, top: top - 110, textAlign: "center", ...rise(lf, (d[i] ?? 0) + 10) }}>
            <div style={font(40)}>{m.name}</div>
            <div style={font(34, YEL)}>{m.val}</div>
          </div>
        );
      })}
      {kb > 0 && show.includes("mauna") && (
        <div style={{ position: "absolute", left: 1000 - 260, width: 520, top: sea + belowH - 120, textAlign: "center", opacity: kb }}>
          <div style={font(46, YEL)}>10,210 m+</div>
          <div style={font(28, INK)}>base to peak (NOAA)</div>
        </div>
      )}
      {baseRange !== undefined && (
        <div style={{ position: "absolute", left: 1260, top: 720, ...font(40, INK), background: "rgba(10,11,13,0.85)", padding: "10px 20px", borderRadius: 12, ...pop(lf, baseRange, 0.7) }}>
          Base? <span style={{ color: YEL }}>9,966 – 17,205 m</span>
        </div>
      )}
      <div style={{ position: "absolute", right: 44, bottom: 110, ...font(20, "rgba(255,255,255,0.45)", { fontWeight: 700 }) }}>{note ?? "Heights to scale · Mauna Kea's underwater part simplified"}</div>
    </div>
  );
};

// ---- the bulge ----
/** Exaggerated Earth with its equatorial bulge, the two summits and their distances from the center. */
export const Bulge: React.FC<{ lf: number; lines?: number; nums?: number; diff?: number; flat?: number }> = ({ lf, lines, nums, diff, flat = 0 }) => {
  const cx = 760, cy = 560, R = 380;
  const kf = interpolate(lf - flat, [0, 30], [0, 1], ease);
  const ry = R * (1 - 0.22 * kf); // exaggerated flattening
  const kl = lines === undefined ? 0 : interpolate(lf - lines, [0, 20], [0, 1], ease);
  const at = (latDeg: number, extra: number) => {
    const t = (latDeg * Math.PI) / 180;
    return [cx + (R + extra) * Math.cos(t), cy - (ry + extra) * Math.sin(t)] as Pt;
  };
  const ev = at(28, 34), ch = at(-1.5, 52);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={cx} cy={cy} rx={R} ry={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeDasharray="8 8" strokeWidth={2} opacity={kf} />
        <ellipse cx={cx} cy={cy} rx={R} ry={ry} fill="#1E4E7A" stroke={BLUE} strokeWidth={3} />
        <line x1={cx - R - 60} x2={cx + R + 60} y1={cy} y2={cy} stroke={YEL} strokeWidth={2} strokeDasharray="10 8" />
        <circle cx={cx} cy={cy} r={8} fill={INK} />
        {kl > 0 && (<>
          <line x1={cx} y1={cy} x2={cx + (ev[0] - cx) * kl} y2={cy + (ev[1] - cy) * kl} stroke="#E8E2D6" strokeWidth={5} />
          <line x1={cx} y1={cy} x2={cx + (ch[0] - cx) * kl} y2={cy + (ch[1] - cy) * kl} stroke={LIME} strokeWidth={5} />
        </>)}
        <path d={`M${ev[0] - 26},${ev[1] + 22} L${ev[0]},${ev[1] - 14} L${ev[0] + 26},${ev[1] + 22} Z`} fill="#E8E2D6" />
        <path d={`M${ch[0] - 22},${ch[1] + 26} L${ch[0] + 14},${ch[1] - 2} L${ch[0] + 22},${ch[1] + 30} Z`} fill={LIME} />
      </svg>
      <div style={{ position: "absolute", left: cx + R + 80, top: cy - 30, ...font(30, YEL) }}>EQUATOR</div>
      <div style={{ position: "absolute", left: ev[0] + 40, top: ev[1] - 60, ...font(40) }}>Everest <span style={{ color: DIM, fontSize: 28 }}>28°N</span></div>
      <div style={{ position: "absolute", left: ch[0] + 50, top: ch[1] + 10, ...font(40, LIME) }}>Chimborazo <span style={{ color: DIM, fontSize: 28 }}>1.5°S</span></div>
      {nums !== undefined && (<>
        <div style={{ position: "absolute", left: 1400, top: 180, ...font(34, DIM), ...rise(lf, nums) }}>Distance from Earth's center</div>
        <div style={{ position: "absolute", left: 1400, top: 240, ...font(64), ...rise(lf, nums + 4) }}>6,382.3 km</div>
        <div style={{ position: "absolute", left: 1400, top: 320, ...font(30, DIM), ...rise(lf, nums + 4) }}>Everest summit</div>
        <div style={{ position: "absolute", left: 1400, top: 400, ...font(64, LIME), ...rise(lf, nums + 10) }}>6,384.4 km</div>
        <div style={{ position: "absolute", left: 1400, top: 480, ...font(30, DIM), ...rise(lf, nums + 10) }}>Chimborazo summit</div>
      </>)}
      {diff !== undefined && (
        <div style={{ position: "absolute", left: 1360, top: 580, ...font(64, BG), background: YEL, padding: "8px 24px", borderRadius: 14, ...pop(lf, diff, 0.6) }}>≈ 2,080 m farther</div>
      )}
      <div style={{ position: "absolute", right: 44, bottom: 110, ...font(20, "rgba(255,255,255,0.45)", { fontWeight: 700 }) }}>Shape exaggerated · distances: our calculation, WGS84 ellipsoid</div>
    </div>
  );
};

// ---- the 1849-50 survey ----
const STATIONS: [string, string][] = [["Jarol", "28,991.6"], ["Mirzapur", "29,005.3"], ["Janjipati", "29,001.8"], ["Ladnia", "28,998.6"], ["Harpur", "29,026.1"], ["Minai", "28,990.4"]];
export const Survey: React.FC<{ lf: number; rays?: number; nums?: number; mean?: number; bend?: number; hide?: number }> = ({ lf, rays, nums, mean, bend, hide }) => {
  const ground = 860, mx = 1560, mtop = 260;
  const kb = bend === undefined ? 0 : interpolate(lf - bend, [0, 24], [0, 1], ease);
  const kh = hide === undefined ? 0 : interpolate(lf - hide, [0, 16], [0, 1], ease);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={ground} width={1920} height={220} fill="#2a2418" />
        {/* lower peaks in front */}
        <path d={`M1180,${ground} L1300,${ground - 330 * kh - 120} L1420,${ground} Z`} fill="#5d6670" opacity={0.6 + 0.4 * kh} />
        <path d={`M1320,${ground} L1440,${ground - 250 * kh - 90} L1520,${ground} Z`} fill="#6b7480" opacity={0.6 + 0.4 * kh} />
        <path d={`M${mx - 300},${ground} L${mx - 30},${mtop + 10} Q${mx},${mtop - 6} ${mx + 30},${mtop + 10} L${mx + 300},${ground} Z`} fill="#E8E2D6" />
        {STATIONS.map((s, i) => {
          const x = 120 + i * 110, y = ground - 10;
          const k = rays === undefined ? 0 : interpolate(lf - rays - i * 3, [0, 18], [0, 1], ease);
          const qx = (x + mx) / 2, qy = (y + mtop) / 2 - 140 * kb;
          return (
            <g key={s[0]}>
              <rect x={x - 10} y={y - 30} width={20} height={30} fill={YEL} />
              {k > 0 && <path d={`M${x},${y - 30} Q${qx},${qy} ${mx},${mtop}`} fill="none" stroke={YEL} strokeWidth={3} pathLength={1} strokeDasharray={`${k} 1`} opacity={0.8} />}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 80, top: ground + 30, ...font(30, YEL) }}>6 stations on the plains, ~110 miles away</div>
      <div style={{ position: "absolute", left: mx - 140, top: mtop - 70, width: 280, textAlign: "center", ...font(40) }}>Peak XV</div>
      {nums !== undefined && STATIONS.map((s, i) => (
        <div key={s[0]} style={{ position: "absolute", left: 120, top: 120 + i * 62, ...font(40), ...rise(lf, nums + i * 4) }}>
          <span style={{ color: DIM, fontSize: 30, display: "inline-block", width: 200 }}>{s[0]}</span>{s[1]} ft
        </div>
      ))}
      {mean !== undefined && (
        <div style={{ position: "absolute", left: 600, top: 300, ...font(70, BG), background: YEL, padding: "8px 26px", borderRadius: 14, ...pop(lf, mean, 0.6) }}>mean: 29,002 ft</div>
      )}
      <div style={{ position: "absolute", right: 44, bottom: 110, ...font(20, "rgba(255,255,255,0.45)", { fontWeight: 700 }) }}>Illustration · station values: Himalayan Journal vol. 17 (1952)</div>
    </div>
  );
};

// ---- photos ----
type Photo = { src: string; w: number; h: number; author: string; license: string[]; via?: string };
const PH = PHOTOS as unknown as Record<string, Photo>;
export const hasPhoto = (n: string) => !!PH[n] && PH[n].license?.length > 0 && !!PH[n].w;
export const credit = (name: string) => {
  const p = PH[name];
  const lic = p.license.filter((l) => l !== "PDM").join(", ");
  if (p.via === "satellite") return `Image: ${p.author} · ${lic}`;
  return `Photo: ${p.author.replace(/\s*\(.*$/, "").replace(/derivative work.*/i, "").slice(0, 70)} · ${lic} · Wikimedia Commons`;
};
export type Focus = { x: number; y: number; z: number };
export const Photo: React.FC<{ name: string; lf: number; dur: number; from?: Focus; to?: Focus; box?: { x: number; y: number; w: number; h: number }; d?: number; frame?: boolean }> = ({
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
      <Img src={staticFile(`mp05/photos/${p.src}`)} style={{ position: "absolute", left, top, width: iw, height: ih }} />
      {!frame && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0) 65%, rgba(10,11,13,0.7) 100%)" }} />}
    </div>
  );
};
export const PhotoCredit: React.FC<{ name: string; extra?: string }> = ({ name, extra }) => (
  <div style={{ position: "absolute", left: 48, top: 36, ...font(22, "rgba(255,255,255,0.75)", { fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }) }}>{extra ? `${extra} · ` : ""}{credit(name)}</div>
);

/** Rows of source → number (like a scoreboard). */
export const Board: React.FC<{ lf: number; title: string; rows: [string, string, string?][]; shown: number[]; ours?: [string, string, number] }> = ({ lf, title, rows, shown, ours }) => (<>
  <div style={{ position: "absolute", left: 140, top: 100, ...font(44, DIM), ...rise(lf) }}>{title}</div>
  {rows.map(([who, n, c], i) => shown[i] === undefined ? null : (
    <div key={who} style={{ position: "absolute", left: 140, top: 190 + i * 104, width: 1360, display: "flex", justifyContent: "space-between", ...font(52), ...rise(lf, shown[i]) }}>
      <span style={{ opacity: 0.85 }}>{who}</span><span style={{ color: c ?? INK }}>{n}</span>
    </div>
  ))}
  {ours && (
    <div style={{ position: "absolute", left: 120, top: 190 + rows.length * 104 + 20, width: 1400, display: "flex", justifyContent: "space-between", ...font(56, BG), background: LIME, padding: "10px 20px", borderRadius: 14, boxSizing: "border-box", ...pop(lf, ours[2], 0.7) }}>
      <span>{ours[0]}</span><span>{ours[1]}</span>
    </div>
  )}
</>);

export const Timeline: React.FC<{ lf: number; items: [string, string, string, number][] }> = ({ lf, items }) => (<>
  <div style={{ position: "absolute", left: 160, right: 160, top: 560, height: 4, background: "rgba(255,255,255,0.3)" }} />
  {items.map(([year, val, sub, d], i) => {
    const x = 160 + (i * (1600 - 160)) / Math.max(1, items.length - 1);
    return (
      <div key={year + i} style={{ position: "absolute", left: x - 150, width: 300, top: i % 2 ? 590 : 330, textAlign: "center", ...rise(lf, d) }}>
        <div style={font(40, YEL)}>{year}</div>
        <div style={font(52)}>{val}</div>
        <div style={font(26, DIM)}>{sub}</div>
      </div>
    );
  })}
  {items.map(([y], i) => {
    const x = 160 + (i * (1600 - 160)) / Math.max(1, items.length - 1);
    return <div key={"dot" + y + i} style={{ position: "absolute", left: x - 12, top: 550, width: 24, height: 24, borderRadius: 12, background: YEL, ...pop(lf, items[i][3], 0.3) }} />;
  })}
</>);
export { RED };
