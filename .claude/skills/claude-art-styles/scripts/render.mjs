// 화풍 장면 미리 보기·내보내기 (스킬 묶음의 scripts/render.mjs)
// 사용:
//   node scripts/render.mjs preview <장면.html>                    → 주소를 알려 주고 반복 재생(끝내려면 Ctrl+C)
//   node scripts/render.mjs export  <장면.html> [--sec 4] [--fps 30] [--out out/이름.mp4]
// 장면 파일은 window.__seek(t)를 갖는다(같은 t면 같은 그림). 이 폴더(스킬 맨 위)를 작은 로컬 서버로 연다 —
// 브라우저는 파일을 그냥 열면 모듈(import)을 막기 때문.
// 준비: 이 폴더에서 npm install · mp4는 ffmpeg가 있어야 한다(없으면 PNG 장면만 남김).
import { createServer } from "node:http";
import { existsSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve, relative, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ARGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-dev-shm-usage", "--disable-setuid-sandbox"]; // sandbox: 이 환경에서는 user namespace 불가 → --no-sandbox 필요 // 3D 화풍용 소프트웨어 WebGL
const [, , mode, page, ...rest] = process.argv;
const opt = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : d; };
if (!["preview", "export"].includes(mode) || !page) {
  console.log("사용: node scripts/render.mjs preview <장면.html>\n      node scripts/render.mjs export <장면.html> [--sec 4] [--fps 30] [--out out/이름.mp4]");
  process.exit(1);
}
const file = resolve(page);
if (!existsSync(file)) { console.error(`장면 파일이 없습니다: ${page}`); process.exit(1); }
const rel = relative(ROOT, file).replaceAll("\\", "/");
if (rel.startsWith("..")) { console.error("장면 파일은 이 스킬 폴더 안에 있어야 합니다(글꼴·공용 파일 경로 때문)."); process.exit(1); }

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".ttf": "font/ttf", ".otf": "font/otf", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const p = join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

if (mode === "preview") {
  console.log(`\n미리 보기: ${base}/player.html?w=/${rel}\n(브라우저로 여세요. 끝내려면 Ctrl+C)\n`);
} else {
  let pp;
  try { pp = (await import("puppeteer")).default; } catch {
    console.error("puppeteer가 없습니다. 이 폴더에서 한 번만: npm install"); server.close(); process.exit(1);
  }
  const sec = Number(opt("--sec", "4")), fps = Number(opt("--fps", "30"));
  const name = basename(file, ".html");
  const out = resolve(opt("--out", join(ROOT, "out", `${name}.mp4`)));
  const frames = join(dirname(out), `${name}_frames`);
  rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true });
  const b = await pp.launch({ headless: true, args: ARGS });
  const p = await b.newPage();
  p.on("pageerror", (e) => console.log("  [장면 오류]", e.message));
  await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await p.goto(`${base}/${rel}`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => typeof window.__seek === "function", { timeout: 30000 });
  const n = Math.round(sec * fps);
  for (let i = 0; i < n; i++) {
    await p.evaluate(async (t) => { await window.__seek(t); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, i / fps);
    await p.screenshot({ path: join(frames, `${String(i).padStart(5, "0")}.png`) });
    if (i % fps === 0) process.stdout.write(`  ${i / fps}초…\r`);
  }
  await b.close();
  const ff = spawnSync("ffmpeg", ["-y", "-v", "error", "-framerate", String(fps), "-i", join(frames, "%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", out], { stdio: "inherit" });
  if (ff.error || ff.status !== 0) {
    console.log(`\nffmpeg가 없어 mp4는 만들지 못했습니다. 장면 ${n}장은 ${frames}에 있습니다.\nffmpeg 설치 뒤 다시 실행하세요(윈도우: winget install ffmpeg).`);
  } else {
    rmSync(frames, { recursive: true, force: true });
    console.log(`\n완료: ${out} (${sec}초, ${fps}fps)`);
  }
  server.close();
}
