// Pre-projects China and its neighbours (Natural Earth 1:10m via world-atlas) for mp02.
// Run from video/: npm i --no-save world-atlas@2 topojson-client@3 d3-geo@3 && node tools/china-map.mjs
import fs from "fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-10m.json", "utf8"));
const all = feature(topo, topo.objects.countries).features;
const W = 1600, H = 1000;
const box = { type: "Feature", geometry: { type: "MultiPoint", coordinates: [[62, 16], [140, 54]] } };
const proj = geoMercator().fitExtent([[20, 20], [W - 20, H - 20]], box);
const path = geoPath(proj);
const china = all.find((f) => f.properties.name === "China");
const inBox = (f) => { const [[x0, y0], [x1, y1]] = path.bounds(f); return x1 > -200 && x0 < W + 200 && y1 > -200 && y0 < H + 200; };
const neighbors = all.filter((f) => f !== china && inBox(f)).map((f) => path(f)).filter(Boolean);
const pt = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const meridian = (lon) => path({ type: "LineString", coordinates: Array.from({ length: 41 }, (_, i) => [lon, 14 + i]) });
const out = {
  W, H, china: path(china), neighbors,
  meridians: Object.fromEntries([75, 82.5, 90, 105, 120, 127.5, 135].map((l) => [String(l), { d: meridian(l), x: Math.round(proj([l, 35])[0] * 10) / 10 }])),
  places: {
    kashgar: pt(75.99, 39.47), urumqi: pt(87.62, 43.83), beijing: pt(116.41, 39.9), fuyuan: pt(134.29, 48.36), shanghai: pt(121.47, 31.23),
    chongqing: pt(106.55, 29.56), chengdu: pt(104.07, 30.67), xian: pt(108.94, 34.34), kunming: pt(102.83, 24.88), samarkand: pt(66.97, 39.65), kaifeng: pt(114.31, 34.8),
  },
  lonX: Object.fromEntries([60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140].map((l) => [String(l), Math.round(proj([l, 35])[0] * 10) / 10])),
  source: "Natural Earth 1:10m (public domain), via world-atlas",
};
fs.writeFileSync("public/mp02/china-map.json", JSON.stringify(out));
console.log(Object.keys(out.places).map((k) => k + " " + out.places[k]).join("\n"), "\nneighbors", neighbors.length, "size", JSON.stringify(out).length);
