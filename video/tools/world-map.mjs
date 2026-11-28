// mp05: world land (Natural Earth 1:110m via world-atlas) in equirectangular, 1920x960, plus places and the equator.
// Run from video/: node tools/world-map.mjs
import fs from "fs";
import { feature } from "topojson-client";
import { geoEquirectangular, geoPath } from "d3-geo";
const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/land-110m.json", "utf8"));
const land = feature(topo, topo.objects.land);
const W = 1920, H = 960;
const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
const path = geoPath(proj);
const pt = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const out = {
  W, H, land: path(land),
  places: { everest: pt(86.925, 27.988), mauna: pt(-155.468, 19.821), chimb: pt(-78.8175, -1.4692), kanch: pt(88.147, 27.703), india: pt(78, 22), nepal: pt(84, 28.3) },
  equator: pt(0, 0)[1],
};
fs.writeFileSync("public/mp05/world-map.json", JSON.stringify(out));
console.log(out.places, JSON.stringify(out).length);
