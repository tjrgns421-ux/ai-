// Pre-projects the Korean peninsula (Natural Earth 1:10m via world-atlas) into SVG paths for a 900x1000 box.
// Run from video/: npm i --no-save world-atlas@2 topojson-client@3 d3-geo@3 && node tools/korea-map.mjs
import fs from "fs";
import { feature, mesh } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-10m.json", "utf8"));
const all = feature(topo, topo.objects.countries).features;
const by = (n) => all.find((f) => f.properties.name === n);
const N = by("North Korea"), S = by("South Korea");
const W = 900, H = 1000;
const box = { type: "Feature", geometry: { type: "MultiPoint", coordinates: [[124.0, 33.0], [130.9, 43.0]] } };
const proj = geoMercator().fitExtent([[40, 30], [W - 40, H - 30]], box);
const path = geoPath(proj);
const nb = ["China", "Japan", "Russia"].map((n) => path(by(n))).filter(Boolean);
const G = topo.objects.countries.geometries;
const gN = G.find((g) => g.properties.name === "North Korea"), gS = G.find((g) => g.properties.name === "South Korea");
const border = path(mesh(topo, topo.objects.countries, (a, b) => (a === gN && b === gS) || (a === gS && b === gN)));
const pt = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const out = { W, H, north: path(N), south: path(S), border, neighbors: nb,
  seoul: pt(126.978, 37.5665), pyongyang: pt(125.7625, 39.0392),
  source: "Natural Earth 1:10m (public domain), via world-atlas" };
const dest = process.argv[2] || "public/sn03/korea-map.json";
if (dest !== "public/sn03/korea-map.json") {
  // mp01 extras: the 38th parallel, more places, and evenly spaced points along the North-South line
  out.parallel38 = path({ type: "LineString", coordinates: Array.from({ length: 71 }, (_, i) => [124.0 + i * 0.1, 38]) });
  out.y38 = Math.round(proj([127, 38])[1] * 10) / 10;
  Object.assign(out, { kaesong: pt(126.554, 37.971), panmunjom: pt(126.677, 37.956), sokcho: pt(128.592, 38.207),
    goseong: pt(128.468, 38.380), imjin: pt(126.68, 37.77) });
  const ml = mesh(topo, topo.objects.countries, (a, b) => (a === gN && b === gS) || (a === gS && b === gN));
  const lines = ml.type === "MultiLineString" ? ml.coordinates : [ml.coordinates];
  const pts = lines.flat().map((c) => proj(c));
  pts.sort((a, b) => a[0] - b[0]);
  const seg = []; let acc = 0;
  for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(acc); }
  const step = acc / 129, samples = [pts[0]]; let j = 0;
  for (let d = step; d < acc; d += step) { while (seg[j] < d) j++; const a = pts[j], b = pts[j + 1], d0 = j ? seg[j - 1] : 0, t = (d - d0) / (seg[j] - d0); samples.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  out.borderPts = samples.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
}
fs.writeFileSync(dest, JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, typeof v === "string" ? v.length : Array.isArray(v) ? v.length : v])));
