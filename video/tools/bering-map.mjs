// Pre-projects the Bering Strait (Natural Earth 1:10m via world-atlas) for mp03: a wide view and a strait close-up.
// Run from video/: node tools/bering-map.mjs   (needs world-atlas, topojson-client, d3-geo; npm i --no-save)
import fs from "fs";
import { feature } from "topojson-client";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-10m.json", "utf8"));
const all = feature(topo, topo.objects.countries).features;
const US = all.find((f) => f.properties.name === "United States of America");
const RU = all.find((f) => f.properties.name === "Russia");
const r1 = (v) => Math.round(v * 10) / 10;
// island centroids from the map data itself, so pins sit on the drawn shapes
const islandAt = (f, lon, lat) => {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const p of polys) {
    const xs = p[0].map((c) => c[0]), ys = p[0].map((c) => c[1]);
    if (Math.min(...xs) - 0.05 <= lon && lon <= Math.max(...xs) + 0.05 && Math.min(...ys) - 0.05 <= lat && lat <= Math.max(...ys) + 0.05 && Math.max(...xs) - Math.min(...xs) < 1) return geoCentroid({ type: "Polygon", coordinates: p });
  }
  throw new Error("island not found " + lon + "," + lat);
};
const LITTLE = islandAt(US, -168.92, 65.754), BIG = islandAt(RU, -169.06, 65.78);
console.log("little", LITTLE, "big", BIG);
const make = (W, H, a, b) => {
  const proj = geoMercator().rotate([169, 0]).fitExtent([[0, 0], [W, H]], { type: "Feature", geometry: { type: "MultiPoint", coordinates: [a, b] } });
  proj.clipExtent([[-400, -400], [W + 400, H + 400]]);
  const path = geoPath(proj);
  const pt = (lon, lat) => proj([lon, lat]).map(r1);
  const line = (coords) => path({ type: "LineString", coordinates: coords });
  const inView = (f) => { const [[x0, y0], [x1, y1]] = path.bounds(f); return x1 > -100 && x0 < W + 100 && y1 > -100 && y0 < H + 100 && x1 - x0 < W * 20; };
  const others = all.filter((f) => f !== US && f !== RU && inView(f)).map((f) => path(f)).filter(Boolean);
  return {
    W, H, us: path(US), ru: path(RU), others,
    // 1867 treaty line, simplified: due north from 65°30'N on 168°58'37"W, and south-west past St. Lawrence Island
    border: line([[-168.977, 75], [-168.977, 65.5], [-172.0, 64.2], [-180, 60.5]]),
    places: {
      little: pt(...LITTLE), big: pt(...BIG), wales: pt(-168.09, 65.61), capePW: pt(-168.09, 65.64), dezhnev: pt(-169.65, 66.07),
      nome: pt(-165.41, 64.5), provideniya: pt(-173.23, 64.42), tincity: pt(-167.93, 65.56), stlawrence: pt(-170.3, 63.4), anchorage: pt(-149.9, 61.22),
      chukotka: pt(-175, 66.6), alaska: pt(-155, 64.5), juneau: pt(-134.42, 58.3),
    },
  };
};
const out = {
  wide: make(1920, 1080, [158, 54], [-138, 72]),
  strait: make(1920, 1080, [-171.2, 65.05], [-166.8, 66.45]),
  source: "Natural Earth 1:10m (public domain), via world-atlas",
};
fs.writeFileSync("public/mp03/bering-map.json", JSON.stringify(out));
console.log(JSON.stringify(out.wide.places), "\n", JSON.stringify(out.strait.places), "\nsize", JSON.stringify(out).length);
