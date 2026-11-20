import React from "react";
import { interpolate } from "remotion";
import { BG, INK, LIME, RED, clamp, outExpo, pop } from "../bc01/Bc01";
import MAP from "../../public/sn03/korea-map.json";

// Korean peninsula drawn from Natural Earth 1:10m (public domain), pre-projected by tools/korea-map.mjs.
type M = { W: number; H: number; north: string; south: string; border: string; neighbors: string[]; seoul: [number, number]; pyongyang: [number, number] };
const D = MAP as unknown as M;

export type Pin = { city: "seoul" | "pyongyang"; at: number; label: string; color?: string };

/**
 * draw: frame the outline starts drawing (negative = already drawn).
 * split: frame the peninsula splits into North/South (undefined = one peninsula).
 * arrow: frame an arrow goes from Seoul to Pyongyang.
 */
export const KoreaMap: React.FC<{ lf: number; x: number; y: number; scale?: number; draw?: number; split?: number; pins?: Pin[]; arrow?: number; arrowLabel?: string }> = ({
  lf, x, y, scale = 0.9, draw = 0, split, pins = [], arrow, arrowLabel,
}) => {
  const k = interpolate(lf - draw, [0, 24], [0, 1], { ...clamp, easing: outExpo });
  const s = split === undefined ? 0 : interpolate(lf - split, [0, 12], [0, 1], { ...clamp, easing: outExpo });
  const b = split === undefined ? 0 : interpolate(lf - split, [0, 18], [0, 1], { ...clamp, easing: outExpo });
  const mix = (a: string, c: string) => (s < 0.5 ? a : c);
  const one = "rgba(245,245,242,0.10)";
  const fillN = s > 0 ? `rgba(255,107,94,${0.22 * s})` : one;
  const fillS = s > 0 ? `rgba(215,255,58,${0.2 * s})` : one;
  const [sx, sy] = D.seoul;
  const [px, py] = D.pyongyang;
  const a = arrow === undefined ? 0 : interpolate(lf - arrow, [0, 16], [0, 1], { ...clamp, easing: outExpo });
  const ax = sx + (px - sx) * a, ay = sy + (py - sy) * a;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: D.W * scale, height: D.H * scale }}>
      <svg width={D.W * scale} height={D.H * scale} viewBox={`0 0 ${D.W} ${D.H}`} style={{ overflow: "visible" }}>
        {D.neighbors.map((p, i) => <path key={i} d={p} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} opacity={k} />)}
        <path d={D.north} fill={fillN} fillOpacity={k} stroke={mix(LIME, RED)} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
        <path d={D.south} fill={fillS} fillOpacity={k} stroke={LIME} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
        {split !== undefined && <path d={D.border} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="14 10" pathLength={1} opacity={b} />}
        {arrow !== undefined && a > 0 && (<>
          <line x1={sx} y1={sy} x2={ax} y2={ay} stroke={LIME} strokeWidth={10} strokeLinecap="round" />
          <circle cx={ax} cy={ay} r={14} fill={LIME} />
        </>)}
      </svg>
      {split !== undefined && (<>
        <div style={{ position: "absolute", left: 470 * scale, top: 250 * scale, fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: RED, opacity: s }}>NORTH</div>
        <div style={{ position: "absolute", left: 520 * scale, top: 720 * scale, fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: LIME, opacity: s }}>SOUTH</div>
      </>)}
      {arrow !== undefined && arrowLabel && (
        <div style={{ position: "absolute", left: (sx + px) / 2 * scale - 440, top: (sy + py) / 2 * scale + 40, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: BG, background: LIME, padding: "6px 14px", borderRadius: 10, whiteSpace: "nowrap", ...pop(lf, arrow + 10) }}>{arrowLabel}</div>
      )}
      {pins.map((p) => {
        const [cx, cy] = D[p.city];
        const c = p.color ?? (p.city === "seoul" ? LIME : RED);
        return (
          <div key={p.city} style={{ position: "absolute", left: cx * scale - 16, top: cy * scale - 16, ...pop(lf, p.at, 0.3) }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: c, border: `5px solid ${BG}`, boxShadow: `0 0 0 4px ${c}` }} />
            <div style={{ position: "absolute", left: 46, top: -10, fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: INK, background: "rgba(10,11,13,0.8)", padding: "4px 12px", borderRadius: 8, whiteSpace: "nowrap" }}>{p.label}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 0, bottom: -34, fontFamily: "Pretendard", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.4)", opacity: k }}>Map: Natural Earth (public domain)</div>
    </div>
  );
};
