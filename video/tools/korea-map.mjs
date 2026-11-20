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
fs.writeFileSync("public/sn03/korea-map.json", JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, typeof v === "string" ? v.length : Array.isArray(v) ? v.length : v])));
