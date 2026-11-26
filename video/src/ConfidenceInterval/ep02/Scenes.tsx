import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";

// EP02 (Roanoke) visuals. Shared look comes from ../components.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const fade = (f: number, d = 0) => {
  const a = interpolate(f, [d, d + 14], [0, 1], { ...clamp, easing: outExpo });
  return { opacity: a, translate: `0 ${(1 - a) * 24}px` };
};

/* Letters carved into bark/wood, revealed one by one */
export const Carved: React.FC<{ word: string; where: string; at?: number; per?: number }> = ({ word, where, at = 0, per = 7 }) => {
  const f = useCurrentFrame() - at;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 150, fontFamily: FONT }}>
      <div
        style={{
          padding: "70px 90px",
          borderRadius: 18,
          background: "repeating-linear-gradient(92deg, #3B2F22 0px, #47382A 7px, #3A2D21 13px, #4A3B2B 22px)",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.65), 0 20px 60px rgba(0,0,0,0.6)",
          display: "flex",
          gap: 8,
        }}
      >
        {word.split("").map((ch, i) => {
          const a = interpolate(f, [i * per, i * per + 8], [0, 1], clamp);
          return (
            <span
              key={i}
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: word.length > 4 ? 150 : 230,
                fontWeight: 700,
                color: "#1C150E",
                textShadow: "2px 2px 0 rgba(255,230,190,0.18), -2px -2px 2px rgba(0,0,0,0.6)",
                opacity: a,
                transform: `scale(${1.3 - 0.3 * a})`,
                display: "inline-block",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 40, color: C.sub, fontSize: 32, fontWeight: 700, letterSpacing: 3, ...fade(f, word.length * per) }}>{where}</div>
    </AbsoluteFill>
  );
};

/* White's agreed signal: destination carved = moved; cross = distress */
export const Signal: React.FC<{ narrow?: boolean }> = ({ narrow = false }) => {
  const f = useCurrentFrame();
  const row = (d: number, left: string, right: React.ReactNode, ok: boolean) => (
    <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", alignItems: narrow ? "center" : "center", gap: narrow ? 14 : 40, ...fade(f, d) }}>
      <div style={{ width: narrow ? 900 : 680, textAlign: narrow ? "center" : "left", color: C.ink, fontSize: narrow ? 54 : 44, fontWeight: 800 }}>{left}</div>
      <div style={{ width: narrow ? 900 : 520, textAlign: narrow ? "center" : "left", color: ok ? C.amber : C.sub, fontSize: narrow ? 64 : 44, fontWeight: 900, whiteSpace: "nowrap" }}>{right}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: narrow ? 80 : 46, paddingBottom: narrow ? 300 : 150, fontFamily: FONT }}>
      <div style={{ color: C.sub, fontSize: 30, fontWeight: 800, letterSpacing: 4, ...fade(f, 0) }}>THE AGREED SIGNAL (WHITE, 1590)</div>
      {row(10, "If you move: carve where", "CROATOAN ✓ found", true)}
      {row(40, "If in distress: add a cross ✠", "none found", false)}
    </AbsoluteFill>
  );
};

/* Schematic 800-year rainfall index with the 1587–89 drought as the deepest dip (shape only) */
export const ringData = (): [number, number][] => {
  const out: [number, number][] = [];
  for (let y = 1200; y <= 1990; y += 5) {
    let v = (random(`r${y}`) - 0.5) * 1.6 + Math.sin(y / 23) * 0.35;
    if (y === 1585 || y === 1590) v = -2.6;
    if (y === 1605 || y === 1610) v = -1.5; // Jamestown drought (smaller)
    out.push([y, v]);
  }
  return out;
};

/* Map patch: a paper patch lifts off and reveals a hidden fort symbol (schematic) */
export const MapPatch: React.FC = () => {
  const f = useCurrentFrame();
  const lift = interpolate(f, [40, 90], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const glow = interpolate(f, [90, 110], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 150, fontFamily: FONT }}>
      <div style={{ position: "relative", width: 760, height: 520, borderRadius: 10, background: "radial-gradient(circle at 40% 40%, #D9C7A0, #B59D72 80%)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        {/* water lines + coast doodles */}
        <svg width={760} height={520} style={{ position: "absolute" }}>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <path key={k} d={`M0 ${380 + k * 22} Q190 ${360 + k * 22} 380 ${385 + k * 22} T760 ${375 + k * 22}`} stroke="#7C8C92" strokeWidth={2} fill="none" opacity={0.5} />
          ))}
          <path d="M60 300 Q200 250 330 290 Q430 320 520 260 Q620 200 720 230" stroke="#6B5432" strokeWidth={4} fill="none" />
          {/* the fort symbol, hidden under the patch */}
          <g transform="translate(380 190)" opacity={0.4 + 0.6 * glow}>
            <rect x={-26} y={-26} width={52} height={52} transform="rotate(45)" fill="none" stroke="#B0302A" strokeWidth={6} />
            <rect x={-14} y={-14} width={28} height={28} transform="rotate(45)" fill="#2D3E7A" />
          </g>
          <circle cx={380} cy={190} r={70 + glow * 10} fill="none" stroke={C.amber} strokeWidth={5} opacity={glow} />
        </svg>
        {/* the patch */}
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 120,
            width: 160,
            height: 140,
            background: "#CDB98F",
            boxShadow: `0 ${10 + lift * 40}px ${20 + lift * 40}px rgba(0,0,0,${0.25 + lift * 0.3})`,
            transform: `translate(${lift * 260}px, ${-lift * 200}px) rotate(${lift * 18}deg)`,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        />
      </div>
      <div style={{ marginTop: 34, color: C.sub, fontSize: 28, fontWeight: 700 }}>Under one patch: a fort symbol, inland (schematic)</div>
    </AbsoluteFill>
  );
};

/* Soil layers with hammerscale flakes glinting in the dated layer (schematic) */
export const Hammerscale: React.FC = () => {
  const f = useCurrentFrame();
  const layers = [
    { h: 90, c: "#5B4A36", label: "later layers" },
    { h: 110, c: "#6E5940", label: "late 1500s – early 1600s (dated, as reported)", hot: true },
    { h: 120, c: "#4C3E2E", label: "older" },
  ];
  let y = 0;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 150, fontFamily: FONT }}>
      <div style={{ position: "relative", width: 1300, height: 320 }}>
        {layers.map((l, i) => {
          const top = y;
          y += l.h;
          return (
            <div key={i} style={{ position: "absolute", left: 0, top, width: 900, height: l.h, background: l.c, borderBottom: "2px solid rgba(0,0,0,0.3)", ...fade(f, i * 8) }}>
              <div style={{ position: "absolute", left: 930, top: l.h / 2 - 18, color: l.hot ? C.amber : C.sub, fontSize: 28, fontWeight: 800, whiteSpace: "nowrap" }}>{l.label}</div>
              {l.hot &&
                Array.from({ length: 60 }).map((_, k) => {
                  const a = interpolate(f, [40 + k, 50 + k], [0, 1], clamp);
                  const tw = 0.5 + 0.5 * Math.sin(f / 4 + k);
                  return (
                    <div
                      key={k}
                      style={{
                        position: "absolute",
                        left: 20 + random(`hx${k}`) * 860,
                        top: 10 + random(`hy${k}`) * (l.h - 20),
                        width: 6 + random(`hs${k}`) * 6,
                        height: 3 + random(`ht${k}`) * 3,
                        background: "#B8C0C8",
                        opacity: a * (0.55 + 0.45 * tw),
                        rotate: `${random(`hr${k}`) * 180}deg`,
                        boxShadow: "0 0 8px rgba(220,230,240,0.8)",
                      }}
                    />
                  );
                })}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 40, color: C.sub, fontSize: 28, fontWeight: 700, ...fade(f, 60) }}>Hammerscale: iron flakes from a blacksmith&apos;s hammer (schematic)</div>
    </AbsoluteFill>
  );
};

/* Three places: Roanoke, Croatoan (Hatteras), inland (Site X) — schematic, not to scale */
export const Places: React.FC<{ active?: number }> = ({ active = -1 }) => {
  const f = useCurrentFrame();
  const pts = [
    { x: 1080, y: 330, name: "Roanoke Island", sub: "the 1587 settlement" },
    { x: 1240, y: 700, name: "Croatoan", sub: "today's Hatteras Island" },
    { x: 380, y: 460, name: "Inland", sub: "head of Albemarle Sound (Site X)" },
  ];
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <path d="M0 0 L1000 0 Q1040 200 980 380 Q940 520 1060 640 Q1120 760 1080 1080 L0 1080 Z" fill="#1E1D1A" stroke={C.line} strokeWidth={3} />
        <path d="M1180 120 Q1220 400 1190 560 Q1180 640 1300 760 L1420 820" stroke={C.sub} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
        {pts.slice(1).map((p, i) => (
          <line key={i} x1={pts[0].x} y1={pts[0].y} x2={p.x} y2={p.y} stroke={C.amber} strokeWidth={4} strokeDasharray="14 12" opacity={interpolate(f, [20 + i * 20, 40 + i * 20], [0, 0.9], clamp)} />
        ))}
      </svg>
      {pts.map((p, i) => (
        <div key={p.name} style={{ position: "absolute", left: p.x - 16, top: p.y - 16, ...fade(f, i * 10) }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: i === active || i === 0 ? C.amber : C.ink }} />
          <div style={{ position: "absolute", left: 46, top: -14, whiteSpace: "nowrap", color: C.ink, fontSize: 40, fontWeight: 900 }}>{p.name}</div>
          <div style={{ position: "absolute", left: 46, top: 34, whiteSpace: "nowrap", color: C.sub, fontSize: 26, fontWeight: 600 }}>{p.sub}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 70, bottom: 210, color: C.dim, fontSize: 22 }}>schematic, not to scale</div>
    </AbsoluteFill>
  );
};
