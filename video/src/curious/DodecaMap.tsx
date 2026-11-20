import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { feature } from "topojson-client";
import { geoConicConformal, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import world from "world-atlas/countries-50m.json";

// Where Roman dodecahedra have been found (countries from Wikipedia's list; Italy has none).
// Dots = places of the museum photos used in the video (approximate city positions), not every find spot.
const INK = "#14151B";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1920, H = 1080;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countries = feature(world as any, (world as any).objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
const proj = geoConicConformal().rotate([-10, 0]).center([0, 49.5]).parallels([42, 56]).scale(2350).translate([W / 2, H / 2 + 40]);
const path = geoPath(proj);

export const FOUND = ["United Kingdom", "France", "Belgium", "Netherlands", "Luxembourg", "Germany", "Switzerland", "Austria", "Hungary"];
const EDGE: Record<string, string> = { Serbia: "farthest southeast", Slovakia: "2 fragments, outside the empire" };
export const PLACES: [string, number, number][] = [
  ["Aston (1739)", -0.13, 51.87], ["Norton Disney (2023)", -0.67, 53.13], ["Tongeren", 5.46, 50.78], ["Jublains", -0.5, 48.25],
  ["Bonn", 7.1, 50.73], ["Avenches", 7.04, 46.88], ["Besançon", 6.02, 47.24], ["Vienne", 4.87, 45.52], ["Stuttgart", 9.18, 48.78],
  ["Krefeld", 6.56, 51.33], ["Strasbourg", 7.75, 48.58], ["Geneva (silver)", 6.15, 46.2], ["Carmarthen", -4.31, 51.86],
];

export const DodecaMap: React.FC<{ step?: "countries" | "italy" | "places" | "edges"; highlight?: string }> = ({ step = "countries" }) => {
  const lf = useCurrentFrame();
  const order = (n: string) => FOUND.indexOf(n);
  const showItaly = step !== "countries";
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, background: "#BFDCEF" }}>
      {countries.features.map((f, i) => {
        const n = f.properties.name;
        const k = order(n);
        const on = k >= 0 ? interpolate(lf, [8 + k * 7, 18 + k * 7], [0, 1], cl) : 0;
        const italy = n === "Italy";
        const edge = step === "edges" && EDGE[n];
        const fill = k >= 0 ? `rgba(214,152,64,${0.25 + 0.75 * on})` : italy && showItaly ? "#F3D6D3" : edge ? "#F6E3B8" : "#EEE8DC";
        return <path key={i} d={path(f) ?? ""} fill={fill} stroke={italy && showItaly ? "#FF3B30" : "#9A8F80"} strokeWidth={italy && showItaly ? 4 : 1.2} />;
      })}
      {showItaly && (() => {
        const [x, y] = proj([12.5, 42.6]) as [number, number];
        const k = interpolate(lf, [10, 22], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
        return (
          <g transform={`translate(${x} ${y}) scale(${k})`}>
            <circle r={62} fill="#FFFFFF" stroke="#FF3B30" strokeWidth={6} />
            <text y={14} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={56} fill="#FF3B30">0</text>
            <text y={100} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={34} fill={INK}>Italy</text>
          </g>
        );
      })()}
      {step === "places" && PLACES.map(([name, lon, lat], i) => {
        const [x, y] = proj([lon, lat]) as [number, number];
        const k = interpolate(lf, [6 + i * 4, 14 + i * 4], [0, 1], cl);
        return (
          <g key={name} opacity={k}>
            <circle cx={x} cy={y} r={10} fill="#FFD23F" stroke={INK} strokeWidth={3} />
            <text x={x + 14} y={y + 6} fontFamily="Pretendard" fontWeight={800} fontSize={22} fill={INK} stroke="#FFFFFF" strokeWidth={5} paintOrder="stroke">{name}</text>
          </g>
        );
      })}
      {step === "edges" && Object.entries(EDGE).map(([n, label]) => {
        const f = countries.features.find((c) => c.properties.name === n);
        if (!f) return null;
        const [x, y] = path.centroid(f);
        return <text key={n} x={x} y={y} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={30} fill={INK} stroke="#FFFFFF" strokeWidth={6} paintOrder="stroke">{n}: {label}</text>;
      })}
      <g>
        <rect x={60} y={940} width={30} height={30} fill="rgb(214,152,64)" stroke={INK} strokeWidth={2} />
        <text x={102} y={965} fontFamily="Pretendard" fontWeight={800} fontSize={28} fill={INK}>countries where dodecahedra have been found (Wikipedia)</text>
      </g>
    </svg>
  );
};
