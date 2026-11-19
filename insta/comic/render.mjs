// Usage: node insta/comic/render.mjs insta/comic/episodes/<name>.json
// Writes 1080x1350 PNGs to insta/comic/output/<name>/01.png, 02.png, ...
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = dirname(fileURLToPath(import.meta.url));
const input = process.argv[2];
if (!input) {
  console.error("usage: node insta/comic/render.mjs <episode.json>");
  process.exit(1);
}
const data = JSON.parse(readFileSync(resolve(input), "utf8"));
const outDir = join(here, "output", basename(input, ".json"));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, data.template ?? "template.html")).href); // "strip.html" for the 2–4 panel strip style
await page.evaluate((d) => window.renderComic(d), data);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))))));

const slides = await page.$$("section.slide");
for (const [i, el] of slides.entries()) {
  // warn when a bubble or the fact strip runs out of its area
  const warn = await el.evaluate((s) => {
    const out = [];
    const panel = s.querySelector(".panel")?.getBoundingClientRect();
    for (const b of s.querySelectorAll(".bubble")) {
      const r = b.getBoundingClientRect();
      if (panel && (r.right > panel.right || r.bottom > panel.bottom || r.left < panel.left || r.top < panel.top)) out.push("bubble outside panel");
    }
    const f = s.querySelector(".fact")?.getBoundingClientRect();
    if (f && f.bottom > s.getBoundingClientRect().bottom - 70) out.push("fact strip too long");
    return out;
  });
  if (warn.length) console.warn(`slide ${i + 1}: ${warn.join(", ")}`);
  const file = join(outDir, `${String(i + 1).padStart(2, "0")}.png`);
  await el.screenshot({ path: file });
  console.log(file);
}
await browser.close();
