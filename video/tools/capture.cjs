// Real paragraph captures for Blip Check videos.
// node video/tools/capture.cjs <spec.json> <outDir>
// spec: [{ name, url, find, until?, marks?: [phrase], redact?: [phrase] }]
//   find   — text where the capture starts (must be unique on the page)
//   until  — text where it ends (default: the `find` text itself)
//   marks  — phrases whose boxes are saved for the lime highlighter
//   redact — phrases blacked out in the image (personal names)
// Writes <outDir>/<name>.png at 2x and <outDir>/captures.json with sizes and mark boxes (image px).
const { chromium } = require("playwright");
const fs = require("fs");
const { execFileSync } = require("child_process");
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
    const res = await page.evaluate(({ find, until, marks = [], redact = [] }) => {
      // hide overlays that could cover the text
      for (const el of document.querySelectorAll("body *")) {
        const st = getComputedStyle(el);
        if (st.position === "fixed" || st.position === "sticky") el.style.setProperty("display", "none", "important");
      }
      document.querySelectorAll(".cap-redact").forEach((e) => e.remove());
      document.querySelectorAll(".cap-hide").forEach((e) => (e.style.visibility = "visible"));
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
      target.startContainer.parentElement.scrollIntoView({ block: "center" });
      const rects = [...target.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
      const top = Math.min(...rects.map((r) => r.top));
      const bottom = Math.max(...rects.map((r) => r.bottom));
      const left = Math.min(...rects.map((r) => r.left));
      const right = Math.max(...rects.map((r) => r.right));
      const pad = 6;
      const clip = { x: Math.max(0, left - pad), y: top - 2, width: right - left + pad * 2, height: bottom - top + 4 };
      const blanks = []; // (kept empty: text outside the sentence is hidden in the page instead, see below)
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
      // hide the text before the start and after the end inside the same block (visibility keeps the layout),
      // so neighbouring words on the first/last line don't show up in the capture
      const block = (target.startContainer.parentElement.closest("p,li,blockquote,figcaption,h1,h2,h3,h4,td") || target.startContainer.parentElement.parentElement);
      const hideRange = (n, from, to) => {
        if (to <= from) return;
        const r = document.createRange();
        r.setStart(n, from); r.setEnd(n, to);
        const sp = document.createElement("span");
        sp.className = "cap-hide";
        sp.style.visibility = "hidden";
        r.surroundContents(sp);
      };
      const tw = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      const list = [];
      for (let n; (n = tw.nextNode()); ) list.push(n);
      for (const n of list) {
        const info = nodes.find((x) => x.n === n);
        if (!info) continue;
        const ns = info.start, ne = ns + n.data.length;
        // after-part first, so the before-part offsets stay valid
        if (ne > endAt) hideRange(n, Math.max(0, endAt - ns), n.data.length);
        if (ns < a[0]) hideRange(n, 0, Math.min(n.data.length, a[0] - ns));
      }
      return { blanks, clip, doc: { x: clip.x + scrollX, y: clip.y + scrollY, width: clip.width, height: clip.height }, marks: out, text: norm(target.toString()).slice(0, 400) };
    }, s);
    if (res.error) {
      console.error(`${s.name}: ${res.error}`);
      process.exitCode = 1;
      continue;
    }
    const file = path.join(outDir, `${s.name}.png`);
    try { await page.screenshot({ path: file, clip: res.doc, fullPage: true }); } catch (e) {
      // the page did not scroll (e.g. its own scroll container): capture from the full page in document coordinates
      try { await page.screenshot({ path: file, clip: res.clip }); } catch (e2) { console.log(`SKIP ${s.name}: screenshot failed: ${String(e2.message).split("\n")[0]}`); continue; }
    }
    if (res.blanks.length) {
      const box = res.blanks.map((b) => `drawbox=x=${Math.round(b.x * 2)}:y=${Math.round(b.y * 2)}:w=${Math.ceil(b.w * 2)}:h=${Math.ceil(b.h * 2)}:color=white:t=fill`).join(",");
      const tmp = file.replace(/\.png$/, ".tmp.png");
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-vf", box, tmp]);
      fs.renameSync(tmp, file);
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
