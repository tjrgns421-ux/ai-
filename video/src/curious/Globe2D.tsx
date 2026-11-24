import React, { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// The Moon drawn pixel by pixel from NASA's equirectangular LRO map (CGI Moon Kit), orthographic view with
// simple sunlight shading. Drawn synchronously every frame, so it never misses Remotion's capture.
let tex: { w: number; h: number; d: Uint8ClampedArray } | null = null;
let loading: Promise<void> | null = null;
const load = () => {
  if (!loading)
    loading = new Promise<void>((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 2048;
        c.height = 1024;
        const g = c.getContext("2d")!;
        g.drawImage(img, 0, 0, c.width, c.height);
        tex = { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data };
        res();
      };
      img.onerror = () => rej(new Error("moon map failed"));
      img.src = staticFile("cm04/img/moon_color_4k.jpg");
    });
  return loading;
};

/** rotY: 0 = near side facing us, PI = far side. size = diameter in px. light = direction toward the Sun (x right, y up, z toward viewer). */
export const Globe2D: React.FC<{ rotY: number; size: number; cx: number; cy: number; tilt?: number; light?: [number, number, number] }> = ({ rotY, size, cx, cy, tilt = 0, light = [0.35, 0.25, 0.9] }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => (tex ? null : delayRender("moon map")));
  const [ready, setReady] = useState(Boolean(tex));
  useLayoutEffect(() => {
    if (tex) return;
    load().then(
      () => setReady(true),
      () => handle !== null && continueRender(handle),
    );
  }, [handle]);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !tex) return;
    const n = Math.max(2, Math.round(size));
    cv.width = n;
    cv.height = n;
    const g = cv.getContext("2d")!;
    const out = g.createImageData(n, n);
    const L = Math.hypot(...light);
    const [lx, ly, lz] = light.map((v) => v / L);
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const r = n / 2;
    for (let j = 0; j < n; j++) {
      const y0 = (r - j - 0.5) / r;
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5 - r) / r;
        const q = x * x + y0 * y0;
        if (q > 1) continue;
        const z0 = Math.sqrt(1 - q);
        // tilt around the x axis
        const y = y0 * ct + z0 * st, z = -y0 * st + z0 * ct;
        const lon = Math.atan2(x, z) + rotY, lat = Math.asin(Math.max(-1, Math.min(1, y)));
        let u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1;
        const v = 0.5 - lat / Math.PI;
        const tx = Math.min(tex.w - 1, Math.floor(u * tex.w)), ty = Math.min(tex.h - 1, Math.floor(v * tex.h));
        const k = (ty * tex.w + tx) * 4;
        const shade = Math.max(0.06, x * lx + y0 * ly + z0 * lz);
        const edge = Math.min(1, (1 - q) * 40); // soft limb
        const o = (j * n + i) * 4;
        out.data[o] = tex.d[k] * shade;
        out.data[o + 1] = tex.d[k + 1] * shade;
        out.data[o + 2] = tex.d[k + 2] * shade;
        out.data[o + 3] = 255 * edge;
      }
    }
    g.putImageData(out, 0, 0);
    if (handle !== null) continueRender(handle);
  });
  return <canvas ref={ref} style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: ready ? 1 : 0 }} />;
};
