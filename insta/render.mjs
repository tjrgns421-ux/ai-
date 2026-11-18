// Usage: node insta/render.mjs insta/issues/<name>.json
// Writes 1080x1350 PNGs to insta/output/<name>/01.png, 02.png, ...
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = dirname(fileURLToPath(import.meta.url));
const input = process.argv[2];
if (!input) {
  console.error("usage: node insta/render.mjs <issue.json>");
  process.exit(1);
}
const data = JSON.parse(readFileSync(resolve(input), "utf8"));
const outDir = join(here, "output", basename(input, ".json"));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, "template.html")).href);
await page.evaluate((d) => window.renderSlides(d), data);
await page.evaluate(() => document.fonts.ready);

const slides = await page.$$("section.slide");
for (const [i, el] of slides.entries()) {
  // Warn when content runs past the footer area instead of silently clipping it.
  const overflow = await el.evaluate((s) => s.scrollHeight > s.clientHeight);
  if (overflow) console.warn(`slide ${i + 1}: content overflows, shorten the text`);
  const file = join(outDir, `${String(i + 1).padStart(2, "0")}.png`);
  await el.screenshot({ path: file });
  console.log(file);
}
await browser.close();
