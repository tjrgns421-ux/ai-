import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm09/narration.words.json";
import LINES from "../../public/cm09/lines.json";
import CAPS from "../../public/cm09/caps/captures.json";
import { Crater, FairyField, LandStage, PinkLake, Playa, Richat, ShotP, Valley } from "./Places3D";

// Curious Minutes ep09 "6 Strange Places on Earth, Explained" — list format, a verdict after each.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71", ORG = "#FFB020";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const TL = makeTimeline(words, LINES as string[], [], 75);
export const CM09_FRAMES = TL.duration;
const LS: number[] = (() => {
  const res: number[] = [];
  let after = 0;
  for (const l of LINES as string[]) {
    const t = TL.timeOf(l.split(/\s+/).slice(0, 4).join(" "), after);
    res.push(t);
    after = t + 0.01;
  }
  return res;
})();
const END = TL.duration / FPS;
const S = (i: number) => (i < LS.length ? LS[i] : END);

// ---------- overlay pieces ----------
const useIn = (d = 0) => {
  const lf = useCurrentFrame() - d;
  return { opacity: interpolate(lf, [0, 6], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 10], [24, 0], { ...cl, easing: out })}px) scale(${interpolate(lf, [0, 10], [0.94, 1], { ...cl, easing: out })})` };
};
const Badge: React.FC<{ text: string; color?: string }> = ({ text, color = YEL }) => (
  <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: INK, background: color, padding: "6px 16px", borderRadius: 10, border: `4px solid ${INK}` }}>{text}</div>
);
const Card: React.FC<{ y?: number; children: React.ReactNode; w?: number; bg?: string }> = ({ y = 170, children, w = 1300, bg = "#FFFFFF" }) => (
  <div style={{ position: "absolute", left: (1920 - w) / 2, top: y, width: w, display: "flex", justifyContent: "center", ...useIn() }}>
    <div style={{ background: bg, border: `5px solid ${INK}`, borderRadius: 26, padding: "24px 40px", boxShadow: "0 12px 0 rgba(0,0,0,0.35)", fontFamily: "Pretendard", color: INK, textAlign: "center" }}>{children}</div>
  </div>
);
const Line: React.FC<{ text: React.ReactNode; sub?: string; y?: number; size?: number }> = ({ text, sub, y = 170, size = 62 }) => (
  <Card y={y}>
    <div style={{ fontSize: size, fontWeight: 900, lineHeight: 1.15 }}>{text}</div>
    {sub && <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12, opacity: 0.7 }}>{sub}</div>}
  </Card>
);
const Stat: React.FC<{ big: string; small: string; y?: number; color?: string }> = ({ big, small, y = 170, color = INK }) => (
  <Card y={y}>
    <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1, color, letterSpacing: -2 }}>{big}</div>
    <div style={{ fontSize: 34, fontWeight: 700, marginTop: 12, opacity: 0.75 }}>{small}</div>
  </Card>
);
type CapInfo = { w: number; h: number; source?: string; marks: Record<string, { x: number; y: number; w: number; h: number }[]> };
const CI = CAPS as unknown as Record<string, CapInfo>;
const Src: React.FC<{ name: string; width?: number; y?: number; hold?: number }> = ({ name, width = 1300, y = 150, hold = 105 }) => {
  const lf = useCurrentFrame();
  const c = CI[name];
  const sc = Math.min(width / c.w, 1.15);
  const w = c.w * sc;
  const k = interpolate(lf, [hold, hold + 14], [0, 1], { ...cl, easing: ease });
  const left = (1920 - w - 60) / 2, right = left + w + 70;
  return (
    <div style={{ position: "absolute", left, top: y, ...useIn() }}>
      <div style={{ background: "#FFFFFF", padding: 30, borderRadius: 18, border: `5px solid ${INK}`, boxShadow: "0 14px 0 rgba(0,0,0,0.35)", transformOrigin: "100% 0%", transform: `translate(${(1880 - right) * k}px, ${(36 - y) * k}px) scale(${1 - 0.6 * k})` }}>
        <div style={{ position: "relative", width: w, height: c.h * sc }}>
          {Object.values(c.marks).flat().map((b, i) => (
            <div key={i} style={{ position: "absolute", left: b.x * sc - 4, top: b.y * sc, height: b.h * sc, width: (b.w * sc + 8) * interpolate(lf, [12 + i * 6, 26 + i * 6], [0, 1], cl), background: YEL, opacity: 0.75, borderRadius: 6 }} />
          ))}
          <Img src={staticFile(`cm09/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: c.h * sc, mixBlendMode: "multiply" }} />
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: INK, opacity: 0.65, marginTop: 16 }}>Source: {c.source}</div>
      </div>
    </div>
  );
};
const Sprout: React.FC<{ pose: string; x?: number; y?: number; size?: number }> = ({ pose, x = 1500, y = 640, size = 280 }) => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x + Math.sin(s * 0.7) * 30, top: y + interpolate(lf, [0, 5, 10, 14], [60, -26, 6, 0], cl) + Math.sin(s * 1.3) * 14, width: size, height: size, opacity: interpolate(lf, [0, 4], [0, 1], cl), transform: `rotate(${Math.sin(s * 0.9) * 8}deg)`, filter: "drop-shadow(0 0 26px rgba(127,227,255,0.45))" }} />;
};
type Verd = "SOLVED" | "BEST GUESS" | "STILL UNKNOWN";
const VCOL: Record<Verd, string> = { SOLVED: GRN, "BEST GUESS": ORG, "STILL UNKNOWN": RED };
const Stamp: React.FC<{ v: Verd; note?: string }> = ({ v, note }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [0, 8], [2.2, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(0,0,0,${interpolate(lf, [0, 6], [0, 0.45], cl)})` }}>
      <div style={{ transform: `scale(${k}) rotate(-8deg)`, opacity: interpolate(lf, [0, 4], [0, 1], cl), border: `14px solid ${VCOL[v]}`, borderRadius: 30, padding: "18px 60px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 150, color: VCOL[v], background: "rgba(10,10,14,0.75)", letterSpacing: 4 }}>{v}</div>
      {note && <div style={{ marginTop: 50, fontFamily: "Pretendard", fontWeight: 800, fontSize: 46, color: "#FFFFFF", opacity: interpolate(lf, [10, 18], [0, 1], cl) }}>{note}</div>}
    </AbsoluteFill>
  );
};
const Chapter: React.FC<{ n: number; title: string }> = ({ n, title }) => {
  const lf = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 120, top: 330, fontFamily: "Pretendard", color: "#FFFFFF" }}>
      <div style={{ fontSize: 200, fontWeight: 900, lineHeight: 1, color: YEL, opacity: interpolate(lf, [0, 6], [0, 1], cl), transform: `translateX(${interpolate(lf, [0, 12], [-60, 0], { ...cl, easing: out })}px)`, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>#{n}</div>
      <div style={{ fontSize: 88, fontWeight: 900, opacity: interpolate(lf, [6, 14], [0, 1], cl), textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>{title}</div>
    </div>
  );
};

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const ch = TL.chunks;
  const i = ch.findIndex((c, k) => fr >= c.start && fr < (ch[k + 1]?.start ?? c.start + 50));
  if (i < 0 || fr - ch[i].start > 150) return null;
  const lf = fr - ch[i].start;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, bottom: 44, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, letterSpacing: -1, color: "#FFFFFF", background: "rgba(14,15,20,0.78)", padding: "8px 26px", borderRadius: 14, opacity: interpolate(lf, [0, 2], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 5], [12, 0], { ...cl, easing: out })}px)` }}>{ch[i].text}</span>
    </div>
  );
};

const Photo: React.FC<{ src: string; credit: string; fit?: "cover" | "contain"; zoom?: [number, number]; origin?: string; badge?: string }> = ({ src, credit, fit = "contain", zoom = [1.02, 1.14], origin = "50% 50%", badge = "REAL IMAGE" }) => {
  const lf = useCurrentFrame();
  const k = Math.floor(lf / (CUT * FPS));
  return (
    <AbsoluteFill style={{ background: "#040407" }}>
      <Img src={staticFile(`cm09/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit, transform: `scale(${interpolate(lf % (CUT * FPS), [0, CUT * FPS], [zoom[0] + 0.08 * (k % 2), zoom[1] + 0.08 * (k % 2)], cl)})`, transformOrigin: k % 3 === 0 ? origin : ["35% 45%", "65% 55%"][k % 2] }} />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text={badge} color="#9FE3B0" />
    </AbsoluteFill>
  );
};

// ---------- 3D scenes ----------
const CUT = 4.5;
const vary = (shot: (s: number) => ShotP, s: number): ShotP => {
  const b = shot(s);
  const k = Math.floor(s / CUT) % 3;
  if (k === 0) return b;
  const off = b.pos.clone().sub(b.look);
  if (k === 1) off.applyAxisAngle(V(0, 1, 0), 0.7);
  else off.multiplyScalar(1.35).add(V(0, off.length() * 0.15, 0));
  return { ...b, pos: b.look.clone().add(off) };
};
type ShotFn = (s: number) => ShotP;
const Land: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode; badge?: string; still?: boolean; night?: boolean; sky?: string; fogFar?: number }> = ({ shot, children, badge = "ILLUSTRATION · not to scale", still, night, sky, fogFar }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <LandStage shot={still ? shot(s) : vary(shot, s)} night={night} sky={sky} fogFar={fogFar}>{children(s)}</LandStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const orbit = (r: number, h: number, look: [number, number, number] = [0, 0, 0], a0 = 0, sp = 0.05, fov = 45): ShotFn => (s) => ({ pos: V(look[0] + Math.sin(a0 + s * sp) * r, look[1] + h, look[2] + Math.cos(a0 + s * sp) * r), look: V(...look), fov });
const top = (h: number, fov = 45): ShotFn => (s) => ({ pos: V(0.01, h - s * h * 0.02, 0.01), look: V(0, 0, 0), up: V(0, 0, -1), fov });
// map pin (2D, equirectangular world)
const PLACES: [string, number, number][] = [["Racetrack Playa, USA", -117.56, 36.68], ["Richat Structure, Mauritania", -11.4, 21.12], ["Lake Hillier, Australia", 123.2, -34.09], ["Darvaza, Turkmenistan", 58.44, 40.25], ["Namib Desert", 15.5, -24.5], ["Hessdalen, Norway", 11.19, 62.79]];
const WorldPins: React.FC<{ only?: number }> = ({ only }) => {
  const lf = useCurrentFrame();
  const X = (lon: number) => 160 + ((lon + 180) / 360) * 1600, Y = (lat: number) => 140 + ((90 - lat) / 180) * 800;
  return (
    <AbsoluteFill style={{ background: "#0B1622" }}>
      <svg width={1920} height={1080}>
        <rect x={160} y={140} width={1600} height={800} rx={20} fill="#16324A" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={160} x2={1760} y1={140 + i * 100} y2={140 + i * 100} stroke="rgba(255,255,255,0.06)" />)}
        {PLACES.map(([n, lon, lat], i) => {
          if (only !== undefined && only !== i) return null;
          const k = interpolate(lf, [i * 8 * (only === undefined ? 1 : 0), i * 8 * (only === undefined ? 1 : 0) + 10], [0, 1], cl);
          return <g key={i} opacity={k}><circle cx={X(lon)} cy={Y(lat)} r={16} fill={YEL} stroke={INK} strokeWidth={4} /><text x={X(lon) + 24} y={Y(lat) + 10} fontFamily="Pretendard" fontWeight={900} fontSize={34} fill="#FFFFFF" stroke={INK} strokeWidth={6} paintOrder="stroke">{n}</text></g>;
        })}
      </svg>
      <Badge text="MAP · positions approximate" color="#9FE3B0" />
    </AbsoluteFill>
  );
};
// two hypotheses side by side (2D)
const TwoCamps: React.FC = () => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0B0D14" }}>
      <svg width={1920} height={1080}>
        {[["termites", "eat grass roots → bare patch traps water", 0], ["thirsty grass", "plants compete for water → regular spacing", 1]].map(([t, sub, i]) => {
          const on = interpolate(lf, [(i as number) * 30, (i as number) * 30 + 12], [0, 1], cl);
          const x = 200 + (i as number) * 800;
          return <g key={i as number} opacity={on}><rect x={x} y={300} width={720} height={420} rx={30} fill="#FFFFFF" /><text x={x + 360} y={470} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={76} fill={INK}>{t as string}</text><text x={x + 360} y={560} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={30} fill={INK} opacity={0.7}>{sub as string}</text></g>;
        })}
        <text x={960} y={200} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={56} fill={YEL}>two main camps (Wikipedia)</text>
      </svg>
    </AbsoluteFill>
  );
};
const Ideas: React.FC = () => {
  const lf = useCurrentFrame();
  const items = ["burning dust from the rocks", "radon → glowing dusty plasma", "electric charges from quartz"];
  return (
    <AbsoluteFill style={{ background: "#05070F" }}>
      <svg width={1920} height={1080}>
        {items.map((t, i) => { const on = interpolate(lf, [i * 25, i * 25 + 10], [0, 1], cl); return <g key={i} opacity={on}><rect x={360} y={260 + i * 190} width={1200} height={140} rx={24} fill="#FFFFFF" /><text x={960} y={348 + i * 190} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={54} fill={INK}>{t}</text></g>; })}
        <text x={960} y={180} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={52} fill={YEL}>ideas, none proven (Wikipedia)</text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scoreboard ----------
const Scoreboard: React.FC = () => {
  const lf = useCurrentFrame();
  const rows: [number, string, Verd][] = [[70, "The sailing stones", "SOLVED"], [71, "The eye of the Sahara", "SOLVED"], [72, "The pink lake", "SOLVED"], [73, "The door to hell", "BEST GUESS"], [74, "The fairy circles", "STILL UNKNOWN"], [75, "The Hessdalen lights", "STILL UNKNOWN"]];
  const t0 = S(69);
  return (
    <div style={{ position: "absolute", left: 100, top: 130, width: 1500 }}>
      {rows.map(([i, name, v]) => {
        const d = (S(i) - t0) * FPS;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 20, opacity: interpolate(lf, [d, d + 8], [0, 1], cl), transform: `translateX(${interpolate(lf, [d, d + 10], [-30, 0], { ...cl, easing: out })}px)` }}>
            <div style={{ width: 700, fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: "#FFFFFF", textShadow: "0 4px 14px rgba(0,0,0,0.85)" }}>{name}</div>
            <div style={{ border: `6px solid ${VCOL[v]}`, color: VCOL[v], borderRadius: 14, padding: "4px 22px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, background: "rgba(10,10,14,0.75)", rotate: "-3deg" }}>{v}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------- the edit ----------------
export const CRED: Record<string, string> = {
  stones: "Racetrack Playa, Death Valley · Giuseppe Milo, CC BY 3.0 (Wikimedia Commons)",
  richat: "Richat Structure, SRTM 3D view (height exaggerated) · NASA/JPL/NIMA, public domain",
  hillier: "Lake Hillier, Middle Island · Aussie Oc, CC BY-SA 4.0 (Wikimedia Commons)",
  darvaza: "Darvaza gas crater · Tormod Sandtorv / Hellbus, CC BY-SA 2.0 (Wikimedia Commons)",
  fairy: "Fairy circles, Namibia (2017) · Olga Ernst & Hp. Baumeler, CC BY-SA 4.0 (Wikimedia Commons)",
  hessdalen: "Hessdalen church, Hessdalen valley · Ezzex, CC BY-SA 4.0 (Wikimedia Commons)",
};
const P = (k: string, zoom?: [number, number], origin?: string) => <Photo src={`${k}.jpg`} credit={CRED[k]} fit="cover" zoom={zoom} origin={origin} />;
const PL = (s: number) => <Playa t={s} />;
const SCENES: [number, React.ReactNode][] = [
  [0, P("stones")],
  [S(1), <Land shot={(s) => ({ pos: V(-40 + s, 3, 30), look: V(0, 1, 0), fov: 40 })}>{PL}</Land>],
  [S(2), <WorldPins />],
  [S(4), <Land shot={orbit(90, 30, [0, 0, 0], 0.3, 0.04)}>{PL}</Land>],
  [S(6), P("stones", [1.2, 1.35])],
  [S(7), <Land shot={(s) => ({ pos: V(10, 2.2, 14 - s * 0.3), look: V(0, 0.5, 0), fov: 45 })} still>{PL}</Land>],
  [S(8), <WorldPins only={0} />],
  [S(9), <Land shot={top(140)} still>{(s) => <Playa move={0.5} t={s} />}</Land>],
  [S(10), P("stones", [1.05, 1.2])],
  [S(11), <Land shot={orbit(70, 18, [0, 0, 0], 1.2, 0.05)}>{(s) => <Playa move={Math.min(1, s / 6)} ice={1} water={1} t={s} />}</Land>],
  [S(12), <Land shot={(s) => ({ pos: V(-50, 12, 50), look: V(0, 0, 0), fov: 40 })} still sky="#C9DCEA">{(s) => <Playa move={0} water={1} ice={Math.min(1, s / 3)} t={0} />}</Land>],
  [S(13), <Land shot={(s) => ({ pos: V(-20 + s, 4, 22), look: V(0, 0.5, 0), fov: 45 })} still>{(s) => <Playa move={Math.min(1, s / 8)} ice={1} water={1} t={s} />}</Land>],
  [S(15), <Land shot={top(150)} still>{(s) => <Playa t={s} />}</Land>],
  [S(17), P("richat")],
  [S(18), <WorldPins only={1} />],
  [S(19), <Land shot={top(850, 50)} still sky="#C8D6E4" fogFar={8000}>{() => <Richat />}</Land>],
  [S(21), <Land shot={orbit(900, 500, [0, 0, 0], 0.6, 0.03, 45)} sky="#C8D6E4" fogFar={8000}>{() => <Richat />}</Land>],
  [S(23), <Land shot={orbit(300, 60, [120, 0, 0], 1.2, 0.04, 45)} sky="#C8D6E4" fogFar={8000}>{() => <Richat />}</Land>],
  [S(25), P("richat", [1.3, 1.5])],
  [S(27), <Land shot={top(750, 50)} still sky="#C8D6E4" fogFar={8000}>{() => <Richat />}</Land>],
  [S(28), P("richat", [1.05, 1.15])],
  [S(30), P("hillier")],
  [S(31), <WorldPins only={2} />],
  [S(32), <Land shot={orbit(330, 160, [0, 0, 0], 0.2, 0.04)}>{() => <PinkLake />}</Land>],
  [S(34), P("hillier", [1.2, 1.35])],
  [S(35), <Land shot={(s) => ({ pos: V(0.01, 260 - s * 4, 60), look: V(0, 0, 0), fov: 45 })} still>{() => <PinkLake />}</Land>],
  [S(37), P("hillier", [1.05, 1.15])],
  [S(38), <Land shot={orbit(330, 160, [0, 0, 0], 2, 0.04)}>{(s) => <PinkLake fade={Math.min(1, s / 5)} />}</Land>],
  [S(40), P("darvaza")],
  [S(41), <WorldPins only={3} />],
  [S(42), <Land shot={orbit(80, 30, [0, -10, 0], 0.3, 0.06)} night>{(s) => <Crater t={s} />}</Land>],
  [S(44), <Land shot={orbit(60, 14, [0, -10, 0], 1.5, 0.06)} sky="#D9C49A">{(s) => <Crater t={s} />}</Land>],
  [S(45), <Land shot={orbit(70, 26, [0, -12, 0], 2.2, 0.06)} night>{(s) => <Crater t={s} />}</Land>],
  [S(46), P("darvaza", [1.2, 1.35])],
  [S(48), <Land shot={orbit(70, 26, [0, -12, 0], 3, 0.06)} night>{(s) => <Crater t={s} fire={Math.max(0.33, 1 - s / 6)} />}</Land>],
  [S(50), P("fairy")],
  [S(51), <Land shot={top(500, 50)} still sky="#D8C9A0">{() => <FairyField />}</Land>],
  [S(52), <WorldPins only={4} />],
  [S(53), <Land shot={orbit(160, 40, [0, 0, 0], 0.6, 0.04)} sky="#D8C9A0">{() => <FairyField />}</Land>],
  [S(54), <TwoCamps />],
  [S(57), <Land shot={(s) => ({ pos: V(-60 + s * 2, 10, 50), look: V(0, 0, 0), fov: 45 })} sky="#D8C9A0">{() => <FairyField />}</Land>],
  [S(58), P("fairy", [1.2, 1.35])],
  [S(60), P("hessdalen")],
  [S(61), <WorldPins only={5} />],
  [S(62), <Land shot={(s) => ({ pos: V(-160 + s * 3, 30, 160), look: V(0, 40, 0), fov: 45 })} night>{(s) => <Valley t={s} />}</Land>],
  [S(64), <Land shot={orbit(220, 60, [0, 30, 0], 1, 0.04)} night>{(s) => <Valley t={s} lights={2} />}</Land>],
  [S(66), <Ideas />],
  [S(67), <Land shot={(s) => ({ pos: V(-120 + s * 3, 26, 140), look: V(0, 40, 0), fov: 45 })} night>{(s) => <Valley t={s} lights={4} />}</Land>],
  [S(69), <Land shot={orbit(90, 30, [0, 0, 0], 0, 0.04)}>{PL}</Land>],
  [S(76), <Land shot={(s) => ({ pos: V(-160 + s * 3, 30, 160), look: V(0, 40, 0), fov: 45 })} night>{(s) => <Valley t={s} />}</Land>],
];
const OVER: [number, number, React.ReactNode][] = [
  [S(0), S(1), <Line text="Rocks that move by themselves?" size={76} y={120} />],
  [S(1), S(2), <Stat big="~100 m" small="long tracks · Racetrack Playa (Wikipedia)" y={120} />],
  [S(3), S(4), <Line text="Solved · Best guess · Still unknown" size={56} y={120} />],
  [S(4), S(5), <Chapter n={1} title="The sailing stones" />],
  [S(9), S(10), <Line text="Wind? Dust devils? Slippery mud?" size={66} y={120} />],
  [S(9), S(10), <Sprout pose="think" x={1500} y={620} />],
  [S(10), S(11), <Line text="GPS inside rocks + time-lapse cameras" sub="winter 2013–14 (Wikipedia)" size={58} y={120} />],
  [S(11), S(12), <Stat big="60+" small="rocks moving on Dec 20, 2013 (Wikipedia)" y={120} />],
  [S(12), S(13), <Line text="Ice just a few millimeters thick" sub="Wikipedia" size={66} y={120} />],
  [S(14), S(15), <Stat big="~5 m/min" small="up to 224 m in one winter (Wikipedia)" y={120} />],
  [S(16), S(17), <Stamp v="SOLVED" note="Thin sheets of ice, pushed by wind." />],
  [S(17), S(18), <Chapter n={2} title="The eye of the Sahara" />],
  [S(19), S(20), <Stat big="~40 km" small="across · Mauritania (Wikipedia)" y={120} />],
  [S(20), S(21), <Src name="richat-nasa" y={110} width={1500} />],
  [S(22), S(23), <Line text="No signs of an impact" sub="studies in the 1950s–60s (Wikipedia)" size={70} y={120} />],
  [S(27), S(28), <Src name="richat-atlantis" y={110} width={1500} />],
  [S(27), S(28), <Sprout pose="shock" x={1500} y={620} />],
  [S(29), S(30), <Stamp v="SOLVED" note="An eroded rock dome. Not Atlantis." />],
  [S(30), S(31), <Chapter n={3} title="The pink lake" />],
  [S(32), S(33), <Stat big="~600 m" small="long · Middle Island, Western Australia (Wikipedia)" y={120} />],
  [S(33), S(34), <Line text="Stays pink in a bottle" sub="Wikipedia" size={76} y={120} />],
  [S(36), S(37), <Line text="Dunaliella salina" sub="a salt-loving alga (Wikipedia)" size={80} y={120} />],
  [S(37), S(38), <Line text="+ Salinibacter ruber and other microbes" sub="Extreme Microbiome Project (Wikipedia)" size={56} y={120} />],
  [S(39), S(40), <Stamp v="SOLVED" note="Salt-loving microbes." />],
  [S(40), S(41), <Chapter n={4} title="The door to hell" />],
  [S(42), S(43), <Stat big="60–70 m" small="wide · ~30 m deep (Wikipedia)" y={120} />],
  [S(46), S(47), <Src name="darvaza-records" y={110} width={1500} />],
  [S(47), S(48), <Line text="Formed in the 1960s? Lit in the 1980s?" sub="some local geologists (Wikipedia)" size={58} y={120} />],
  [S(48), S(49), <Line text="2025: fire ~3× smaller" sub="officials, after gas wells were drilled (Wikipedia)" size={62} y={120} />],
  [S(49), S(50), <Stamp v="BEST GUESS" note="Drilling and a gas fire. Exact story unknown." />],
  [S(50), S(51), <Chapter n={5} title="The fairy circles" />],
  [S(53), S(54), <Line text="Also found in Australia (2014)" sub="Pilbara (Wikipedia)" size={66} y={120} />],
  [S(55), S(56), <Line text="2013: sand termites in almost every circle" sub="Norbert Juergens (Wikipedia)" size={56} y={120} />],
  [S(57), S(58), <Line text="2022: grasses died of thirst, not termites" sub="Wikipedia" size={58} y={120} />],
  [S(58), S(59), <Line text="2023: Martu knowledge → harvester termites" sub="Australia (Wikipedia)" size={56} y={120} />],
  [S(59), S(60), <Stamp v="STILL UNKNOWN" note="Termites, thirsty grass, or both." />],
  [S(60), S(61), <Chapter n={6} title="The lights of Hessdalen" />],
  [S(63), S(64), <Stat big="15–20 a week" small="sightings, late 1981 – mid 1984 (Wikipedia)" y={120} />],
  [S(64), S(65), <Line text="Automatic station since 1998" sub="Wikipedia" size={70} y={120} />],
  [S(67), S(68), <Sprout pose="think" x={1500} y={620} />],
  [S(68), S(69), <Stamp v="STILL UNKNOWN" note="The lights are real. The cause isn't clear." />],
  [S(69), S(76), <Scoreboard />],
  [S(77), S(78), <Line text="Photos credited on screen · 3D scenes are illustrations" size={44} y={140} />],
  [S(78), END, <Line text="Which place surprised you most?" size={70} sub="tell me in the comments" y={140} />],
  [S(78), END, <Sprout pose="excited" x={1500} y={620} />],
];

export const Cm09Full: React.FC = () => {
  useFonts();
  const f = (s: number) => Math.round(s * FPS);
  const sc = [...SCENES].sort((a, b) => a[0] - b[0]);
  return (
    <AbsoluteFill style={{ background: "#0B1622" }}>
      {sc.map(([t, el], k) => {
        const end = k + 1 < sc.length ? sc[k + 1][0] : END;
        return (
          <Sequence key={k} from={f(t)} durationInFrames={Math.max(1, f(end) - f(t))} layout="none">
            <AbsoluteFill>{el}</AbsoluteFill>
          </Sequence>
        );
      })}
      {OVER.map(([a, b, el], k) => (
        <Sequence key={`o${k}`} from={f(a)} durationInFrames={Math.max(1, f(b) - f(a) - 4)} layout="none">
          <AbsoluteFill>{el}</AbsoluteFill>
        </Sequence>
      ))}
      <Html5Audio src={staticFile("cm09/narration.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
