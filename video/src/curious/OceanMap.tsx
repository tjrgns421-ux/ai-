import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { feature } from "topojson-client";
import { geoCircle, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import world from "world-atlas/countries-110m.json";

// Globe map for ep05: where each sound came from / where it was recorded. Positions are approximate
// (NOAA PMEL pages, Wikipedia coordinates, WHOI Oceanus).
const INK = "#14151B";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = 30;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const land = feature(world as any, (world as any).objects.countries) as unknown as FeatureCollection<Geometry>;
const grat = geoGraticule10();

export type Pin = { lon: number; lat: number; label: string; color?: string; ring?: boolean; area?: number; delay?: number; dx?: number; dy?: number };
export type Route = { pts: [number, number][]; color?: string; label?: string };

export const OceanMap: React.FC<{ rot: (s: number) => [number, number]; pins?: Pin[]; route?: Route; scale?: number; cx?: number; cy?: number; title?: string; width?: number; height?: number }> = ({ rot, pins = [], route, scale = 470, cx = 960, cy = 560, title, width = 1920, height = 1080 }) => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  const [lon, lat] = rot(s);
  const proj = geoOrthographic().rotate([-lon, -lat]).scale(scale).translate([cx, cy]).clipAngle(90);
  const path = geoPath(proj);
  const vis = (p: [number, number]) => {
    const r = proj.rotate();
    const a = (p[0] + r[0]) * (Math.PI / 180), b = p[1] * (Math.PI / 180), c = -r[1] * (Math.PI / 180);
    return Math.cos(b) * Math.cos(a) * Math.cos(c) + Math.sin(b) * Math.sin(c) > 0;
  };
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, background: "#04101C" }}>
      <defs>
        <radialGradient id="sea" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#2A7DB4" />
          <stop offset="100%" stopColor="#0B3556" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={scale} fill="url(#sea)" />
      <path d={path(grat) ?? ""} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      {land.features.map((f, i) => <path key={i} d={path(f) ?? ""} fill="#D9D2C0" stroke="#8C8472" strokeWidth={0.8} />)}
      {route && (() => {
        const k = interpolate(lf, [10, 90], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
        const n = Math.max(2, Math.round(route.pts.length * k));
        const d = path({ type: "LineString", coordinates: route.pts.slice(0, n) }) ?? "";
        return <path d={d} fill="none" stroke={route.color ?? "#7FE3FF"} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 14" />;
      })()}
      {pins.map((p, i) => {
        const d = (p.delay ?? i * 8) + 6;
        const k = interpolate(lf, [d, d + 10], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
        if (!vis([p.lon, p.lat])) return null;
        const [x, y] = proj([p.lon, p.lat]) as [number, number];
        const col = p.color ?? "#FFD23F";
        const out = [];
        if (p.area) out.push(<path key="a" d={path(geoCircle().center([p.lon, p.lat]).radius(p.area)()) ?? ""} fill={col} fillOpacity={0.22 * k} stroke={col} strokeWidth={3} strokeDasharray="10 8" />);
        if (p.ring)
          for (let j = 0; j < 3; j++) {
            const age = ((s - d / FPS) * 0.5 + j / 3) % 1;
            if (s - d / FPS < 0) continue;
            out.push(<path key={`r${j}`} d={path(geoCircle().center([p.lon, p.lat]).radius(2 + age * 45)()) ?? ""} fill="none" stroke={col} strokeWidth={3} opacity={(1 - age) * 0.8} />);
          }
        return (
          <g key={i}>
            {out}
            <g transform={`translate(${x} ${y}) scale(${k})`}>
              <circle r={13} fill={col} stroke={INK} strokeWidth={4} />
              <text x={22 + (p.dx ?? 0)} y={10 + (p.dy ?? 0)} fontFamily="Pretendard" fontWeight={900} fontSize={34} fill="#FFFFFF" stroke={INK} strokeWidth={7} paintOrder="stroke">{p.label}</text>
            </g>
          </g>
        );
      })}
      {title && <text x={width / 2} y={80} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={46} fill="#FFFFFF">{title}</text>}
    </svg>
  );
};
