// Render several stills of one composition with a single bundle, then a contact sheet.
// node tools/stills.mjs <Composition> <outDir> <frame> [frame...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const [comp, outDir, ...frames] = process.argv.slice(2);
const CH = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable: CH });
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `f${String(f).padStart(5, "0")}.png`);
  await renderStill({ serveUrl, composition, frame: Math.min(f, composition.durationInFrames - 1), output, browserExecutable: CH, scale: 0.5 });
  console.log(output);
}
