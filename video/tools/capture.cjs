// Real paragraph captures for Blip Check videos.
// node video/tools/capture.cjs <spec.json> <outDir>
// spec: [{ name, url, find, until?, marks?: [phrase], redact?: [phrase] }]
//   find   — text where the capture starts (must be unique on the page)
//   until  — text where it ends (default: the `find` text itself)
//   marks  — phrases whose boxes are saved for the lime highlighter
//   redact — phrases blacked out in the image (personal names)
// image capture: { name, url, figure: "caption or alt text", source, credit }
//   saves the article's photo together with its caption and credit line (keep the credit visible on screen)
// Writes <outDir>/<name>.png at 2x and <outDir>/captures.json with sizes and mark boxes (image px).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const [specPath, outDir] = process.argv.slice(2);
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  fs.mkdirSync(outDir, { recursive: true });
  const manifestPath = path.join(outDir, "captures.json");
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 760, height: 1400 }, deviceScaleFactor: 2 });
  let current = "";
  for (const s of spec) {
    if (s.url !== current) {
      try {
        await page.goto(s.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      } catch (e) {
        console.log(`SKIP ${s.name}: ${String(e.message).split("\n")[0]}`);
        current = "";
        continue;
      }
      await page.waitForTimeout(2500);
      current = s.url;
    }
    if (s.figure) {
      // image capture: the <figure> (or image) whose caption contains `figure`, with its caption and credit
      const locate = (needle) => {
        const re = new RegExp(needle.trim().split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+"));
        const small = (el) => { const r = el.getBoundingClientRect(); return r.height > 40 && r.height < 1800 && r.width > 80; };
        const txt = (el) => (el.textContent || "").replace(/\s+/g, " ") + " " + [...el.querySelectorAll("img")].map((i) => i.alt).join(" ");
        // 1) a <figure> (or figure-like box) holding an image, whose caption/credit/alt matches
        let hit = [...document.querySelectorAll("figure, [class*=photo], [class*=figure], [class*=img-box], [class*=image-box]")]
          .filter((el) => el.querySelector("img") && small(el) && re.test(txt(el)))
          .sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0] || null;
        // 2) an image whose alt matches
        if (!hit) hit = [...document.images].find((i) => re.test(i.alt || "") && small(i)) || null;
        if (!hit) return null;
        for (const el of document.querySelectorAll("body *")) {
          const st = getComputedStyle(el);
          if (st.position === "fixed" || st.position === "sticky") el.style.setProperty("display", "none", "important");
        }
        document.documentElement.style.setProperty("scroll-behavior", "auto", "important");
        hit.scrollIntoView({ block: "center", behavior: "instant" });
        hit.setAttribute("data-cap-figure", "1");
        return true;
      };
      const ok = await page.evaluate(locate, s.figure);
      if (!ok) { console.error(`${s.name}: figure not found: ${s.figure}`); process.exitCode = 1; continue; }
      await page.waitForTimeout(1500); // lazy-loaded images
      const el = await page.$("[data-cap-figure]");
      const broken = await el.evaluate((e) => [...(e.tagName === "IMG" ? [e] : e.querySelectorAll("img"))]
        .filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => { try { return new URL(i.currentSrc || i.src).host; } catch { return i.src; } }));
      if (broken.length) {
        console.error(`${s.name}: image did not load (host blocked? ${[...new Set(broken)].join(", ")})`);
        process.exitCode = 1;
        await page.evaluate(() => document.querySelectorAll("[data-cap-figure]").forEach((e) => e.removeAttribute("data-cap-figure")));
        continue;
      }
      const file = path.join(outDir, `${s.name}.png`);
      try { await el.screenshot({ path: file }); } catch (e) { console.log(`SKIP ${s.name}: screenshot failed`); continue; }
      const bb = await el.boundingBox();
      await page.evaluate(() => document.querySelectorAll("[data-cap-figure]").forEach((e) => e.removeAttribute("data-cap-figure")));
      manifest[s.name] = { w: Math.round(bb.width * 2), h: Math.round(bb.height * 2), source: s.source, credit: s.credit, kind: "figure", marks: {} };
      console.log(`${s.name}: figure ${manifest[s.name].w}x${manifest[s.name].h}`);
      continue;
    }
    const res = await page.evaluate(({ find, until, marks = [], redact = [] }) => {
      // hide overlays that could cover the text
      for (const el of document.querySelectorAll("body *")) {
        const st = getComputedStyle(el);
        if (st.position === "fixed" || st.position === "sticky") el.style.setProperty("display", "none", "important");
      }
      document.querySelectorAll(".cap-redact").forEach((e) => e.remove());
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let all = "";
      for (let n; (n = walker.nextNode()); ) {
        if (!n.parentElement || n.parentElement.closest("script,style,noscript")) continue;
        nodes.push({ n, start: all.length });
        all += n.data;
      }
      const rangeAt = (from, to) => {
        const r = document.createRange();
        const loc = (pos) => {
          let k = nodes.length - 1;
          while (k > 0 && nodes[k].start > pos) k--;
          return [nodes[k].n, Math.min(pos - nodes[k].start, nodes[k].n.data.length)];
        };
        r.setStart(...loc(from));
        r.setEnd(...loc(to));
        return r;
      };
      const norm = (t) => t.replace(/\s+/g, " ");
      const findIdx = (needle, from = 0) => {
        // tolerant of whitespace differences
        const re = new RegExp(needle.trim().split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+"), "g");
        re.lastIndex = from;
        const m = re.exec(all);
        return m ? [m.index, m.index + m[0].length] : null;
      };
      const a = findIdx(find);
      if (!a) return { error: "find not found: " + find };
      if (findIdx(find, a[1])) return { error: "find not unique: " + find };
      let endAt;
      if (until) {
        const u = findIdx(until, a[0]);
        if (!u) return { error: "until not found: " + until };
        endAt = u[1];
      } else {
        endAt = a[1]; // no `until`: the capture is exactly the `find` text
      }
      const target = rangeAt(a[0], endAt);
      // some sites set scroll-behavior: smooth; measure only after an instant scroll
      document.documentElement.style.setProperty("scroll-behavior", "auto", "important");
      document.body.style.setProperty("scroll-behavior", "auto", "important");
      target.startContainer.parentElement.scrollIntoView({ block: "center", behavior: "instant" });
      const rects = [...target.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
      const top = Math.min(...rects.map((r) => r.top));
      const bottom = Math.max(...rects.map((r) => r.bottom));
      const left = Math.min(...rects.map((r) => r.left));
      const right = Math.max(...rects.map((r) => r.right));
      const pad = 6;
      const clip = { x: Math.max(0, left - pad), y: top - pad, width: right - left + pad * 2, height: bottom - top + pad + 2 };
      // white out whatever follows the end text on its last line
      const last = rects[rects.length - 1];
      if (last.right < right - 1) {
        const d = document.createElement("div");
        d.className = "cap-redact";
        Object.assign(d.style, { position: "absolute", left: last.right + 1 + scrollX + "px", top: last.top - 2 + scrollY + "px", width: right + pad - last.right + "px", height: last.height + 6 + "px", background: "#fff", zIndex: 99999 });
        document.body.appendChild(d);
      }
      const boxesOf = (phrase) => {
        const m = findIdx(phrase, a[0]);
        if (!m || m[0] > endAt) return null;
        return [...rangeAt(m[0], m[1]).getClientRects()].filter((r) => r.width > 1).map((r) => ({ x: r.left - clip.x, y: r.top - clip.y, w: r.width, h: r.height }));
      };
      for (const p of redact) {
        const bx = boxesOf(p);
        if (!bx) return { error: "redact phrase not found: " + p };
        for (const b of bx) {
          const d = document.createElement("div");
          d.className = "cap-redact";
          Object.assign(d.style, { position: "absolute", left: b.x + clip.x + scrollX + "px", top: b.y + clip.y + scrollY + "px", width: b.w + "px", height: b.h + "px", background: "#111", zIndex: 99999 });
          document.body.appendChild(d);
        }
      }
      const out = {};
      for (const p of marks) {
        const bx = boxesOf(p);
        if (!bx) return { error: "mark phrase not found: " + p };
        out[p] = bx;
      }
      return { clip, doc: { x: clip.x + scrollX, y: clip.y + scrollY, width: clip.width, height: clip.height }, marks: out, text: norm(target.toString()).slice(0, 400) };
    }, s);
    if (res.error) {
      console.error(`${s.name}: ${res.error}`);
      process.exitCode = 1;
      continue;
    }
    const file = path.join(outDir, `${s.name}.png`);
    // document coordinates + fullPage are immune to later scrolling; fall back to the viewport clip
    try { await page.screenshot({ path: file, clip: res.doc, fullPage: true }); }
    catch (e) {
      try { await page.screenshot({ path: file, clip: res.clip }); } catch (e2) { console.log(`SKIP ${s.name}: screenshot failed`); continue; }
    }
    const k = 2;
    const sc = (b) => ({ x: Math.round(b.x * k), y: Math.round(b.y * k), w: Math.round(b.w * k), h: Math.round(b.h * k) });
    manifest[s.name] = {
      w: Math.round(res.clip.width * k),
      h: Math.round(res.clip.height * k),
      source: s.source,
      marks: Object.fromEntries(Object.entries(res.marks).map(([p, bx]) => [p, bx.map(sc)])),
    };
    console.log(`${s.name}: ${manifest[s.name].w}x${manifest[s.name].h} | ${res.text}`);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
  await browser.close();
})();
