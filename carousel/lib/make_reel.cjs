// 캐러셀 이미지(slide-01.png ...)를 장당 N초씩 넘어가는 릴스 영상(1080x1920)으로 만든다.
// 사용법: node carousel/lib/make_reel.cjs <에피소드 폴더> "<EP 라벨>" [장당 초, 기본 2]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

(async () => {
  const [, , epArg, label = '', secArg = '2'] = process.argv;
  const epDir = path.resolve(epArg);
  const sec = Number(secArg);
  const slides = fs.readdirSync(epDir).filter(f => /^slide-\d+\.png$/.test(f)).sort();
  if (!slides.length) throw new Error('slide-XX.png 파일이 없습니다: ' + epDir);

  const reelDir = path.join(epDir, 'reel');
  fs.mkdirSync(reelDir, { recursive: true });
  const bg = path.relative(reelDir, path.join(__dirname, 'bg-grid.svg'));

  const sections = slides.map(f => `
  <section>
    <div class="top"><span class="ep">${label}</span><span>미루의 갓생일기</span></div>
    <img src="../${f}">
  </section>`).join('');
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  section { width: 1080px; height: 1920px; position: relative; overflow: hidden;
    background: #fffdf6 url(${bg}) 0 0 / 1080px 1350px repeat-y; }
  .top { position: absolute; left: 0; right: 0; top: 120px; display: flex; justify-content: center; align-items: center; gap: 16px;
    font-family: 'Gaegu'; font-weight: 700; font-size: 46px; color: #232323; }
  .top .ep { background: #232323; color: #fff; padding: 0 18px; border-radius: 6px; transform: rotate(-3deg); }
  img { position: absolute; left: 0; top: 250px; width: 1080px; height: 1350px; }
</style></head><body>${sections}</body></html>`;
  fs.writeFileSync(path.join(reelDir, 'reel.html'), html);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(reelDir, 'reel.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const els = await page.$$('section');
  const frames = [];
  for (let i = 0; i < els.length; i++) {
    const out = path.join(reelDir, `frame-${String(i + 1).padStart(2, '0')}.png`);
    await els[i].screenshot({ path: out });
    frames.push(path.basename(out));
  }
  await browser.close();

  // ffmpeg concat: 마지막 장은 한 번 더 적어야 길이가 반영됨
  const list = frames.map(f => `file '${f}'\nduration ${sec}`).join('\n') + `\nfile '${frames[frames.length - 1]}'\n`;
  fs.writeFileSync(path.join(reelDir, 'list.txt'), list);
  const out = path.join(epDir, 'reel.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt',
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', out], { cwd: reelDir });
  console.log('reel:', out, `(${frames.length}장 x ${sec}초)`);
})();
