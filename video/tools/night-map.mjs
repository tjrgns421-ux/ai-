// mp04: North/South Korea borders and places in the pixel space of the NASA GIBS night images
// (EPSG:4326, BBOX lat 33..43.2, lon 124..131, 1400x2040 px). Run from video/: node tools/night-map.mjs
import fs from "fs";
import { feature } from "topojson-client";
const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-10m.json", "utf8"));
const all = feature(topo, topo.objects.countries).features;
const W = 1400, H = 2040, LAT0 = 33, LAT1 = 43.2, LON0 = 124, LON1 = 131;
const px = ([lon, lat]) => [Math.round(((lon - LON0) / (LON1 - LON0)) * W * 10) / 10, Math.round(((LAT1 - lat) / (LAT1 - LAT0)) * H * 10) / 10];
const path = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates).map((p) => p.map((r) => "M" + r.map((c) => px(c).join(",")).join("L") + "Z").join("")).join("");
const nk = all.find((f) => f.properties.name === "North Korea"), sk = all.find((f) => f.properties.name === "South Korea");
const P = {
  pyongyang: [125.75, 39.02], yangdok: [126.62, 39.22], wonsan: [127.44, 39.15], sinuiju: [124.40, 40.10], kusong: [125.24, 39.98],
  nampo: [125.40, 38.73], chongjin: [129.78, 41.80], rason: [130.30, 42.25], seoul: [126.98, 37.57], yeongyang: [129.11, 36.67],
  busan: [129.07, 35.18], china: [125.6, 42.6],
};
const out = { W, H, nk: path(nk.geometry), sk: path(sk.geometry), places: Object.fromEntries(Object.entries(P).map(([k, v]) => [k, px(v)])) };
fs.writeFileSync("public/mp04/night-map.json", JSON.stringify(out));
console.log(out.places, JSON.stringify(out).length);
