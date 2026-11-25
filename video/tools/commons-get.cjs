// node tools/commons-get.cjs <outDir> name=File:Title.jpg ...
// Reads license, author and source from each Wikimedia Commons file page, downloads a 1920px copy,
// and writes <outDir>/photos.json (credits shown on screen and in the description).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
(async () => {
  const [outDir, ...items] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const manPath = path.join(outDir, "photos.json");
  const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, "utf8")) : {};
  const b = await chromium.launch(); const p = await b.newPage();
  for (const it of items) {
    const [name, file] = it.split("=");
    const page = "https://commons.wikimedia.org/wiki/" + encodeURI(file.replace(/ /g, "_"));
    try {
      await p.goto(page, { waitUntil: "domcontentloaded", timeout: 60000 });
      await p.waitForTimeout(1500);
      const info = await p.evaluate(() => {
        const cell = (id) => { const e = document.getElementById(id); return e && e.nextElementSibling ? e.nextElementSibling.innerText.replace(/\s+/g, " ").trim().slice(0, 200) : ""; };
        return { license: [...document.querySelectorAll(".licensetpl_short")].map((e) => e.innerText.trim()).filter(Boolean),
                 author: cell("fileinfotpl_aut"), source: cell("fileinfotpl_src"), date: cell("fileinfotpl_date"),
                 pd: !!document.querySelector(".licensetpl_short") && /public domain/i.test(document.body.innerText.slice(0, 40000)) };
      });
      const url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file.replace(/^File:/, "")) + "?width=1920";
      // download through the environment's proxy (curl honours HTTPS_PROXY; the browser request API does not)
      const tmp = path.join(outDir, name + ".tmp");
      const ct = execFileSync("curl", ["-sSL", "--max-time", "120", "-A", "BlipCheckBot/1.0 (video research)", "-o", tmp, "-w", "%{content_type}", url]).toString();
      if (!ct.startsWith("image/")) { fs.rmSync(tmp, { force: true }); throw new Error("not an image (" + ct + ")"); }
      const ext = ct.includes("png") ? "png" : "jpg";
      const out = path.join(outDir, name + "." + ext);
      fs.renameSync(tmp, out);
      man[name] = { file, page, src: path.basename(out), ...info };
      console.log(`${name}: ${info.license.join(", ") || "?"} | ${info.author.slice(0, 60)}`);
    } catch (e) { console.log(`FAIL ${name}: ${String(e.message).split("\n")[0]}`); }
  }
  fs.writeFileSync(manPath, JSON.stringify(man, null, 1));
  await b.close();
})();
