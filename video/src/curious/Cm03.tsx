import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm03/narration.words.json";
import LINES from "../../public/cm03/lines.json";
import CAPS from "../../public/cm03/caps/captures.json";
import { Dodecahedron, Icosahedron, Patina, Shot3, Stage3 } from "./Dodeca3D";
import { DodecaMap } from "./DodecaMap";

// Curious Minutes ep03 "100+ Roman Objects. Nobody Knows Why." — the Roman dodecahedron.
// Cut every ~4-6 s: 3D model (ILLUSTRATION), real museum photos (credited), the find map, source captures.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", BRZ = "#C08A4A";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const O = V(0, 0, 0);

const TL = makeTimeline(words, LINES as string[], [], 75);
export const CM03_FRAMES = TL.duration;
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

// ---------- photo credits (Wikimedia Commons) ----------
const PHOTO: Record<string, string> = {
  bonn: "Rheinisches Landesmuseum Bonn · photo Kleon3, CC BY-SA 4.0",
  besancon: "Musée des Beaux-Arts et d'Archéologie, Besançon · photo Naddoddr, CC0",
  aventicum: "Avenches (Aventicum) · photo Woudloper, CC BY-SA 3.0",
  stuttgart: "Landesmuseum Württemberg, Stuttgart · photo Daderot, CC0",
  jublains: "Musée archéologique, Jublains · photo Fab5669, CC BY-SA 4.0",
  muchhadham: "Much Hadham, England · Portable Antiquities Scheme, CC BY 2.0",
  strasbourg: "Musée archéologique, Strasbourg · photo Chatsam, CC BY-SA 3.0",
  schwarzenacker: "Replica monument, Schwarzenacker · photo Lokilech, GFDL",
  krefeld: "Museum Burg Linn, Krefeld · photo Fredvida, CC BY-SA 4.0",
  vienne: "Vienne, France · photo Vassil, CC0",
  leopoldwal: "Gallo-Roman Museum Tongeren, CC0",
  maastricht: "Fragments, Centre Céramique Maastricht · photo Kleon3, CC BY-SA 4.0",
};

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
const Stat: React.FC<{ big: string; small: string; y?: number; color?: string }> = ({ big, small, y = 170, color = INK }) => (
  <Card y={y}>
    <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1, color, letterSpacing: -2 }}>{big}</div>
    <div style={{ fontSize: 34, fontWeight: 700, marginTop: 12, opacity: 0.75 }}>{small}</div>
  </Card>
);
const Line: React.FC<{ text: React.ReactNode; sub?: string; y?: number; size?: number }> = ({ text, sub, y = 170, size = 62 }) => (
  <Card y={y}>
    <div style={{ fontSize: size, fontWeight: 900, lineHeight: 1.15 }}>{text}</div>
    {sub && <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12, opacity: 0.7 }}>{sub}</div>}
  </Card>
);
const Quote: React.FC<{ text: string; who: string; y?: number }> = ({ text, who, y = 170 }) => (
  <Card y={y} w={1500}>
    <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.25, fontStyle: "italic" }}>“{text}”</div>
    <div style={{ fontSize: 28, fontWeight: 700, marginTop: 16, opacity: 0.7 }}>{who}</div>
  </Card>
);
type CapInfo = { w: number; h: number; source?: string; marks: Record<string, { x: number; y: number; w: number; h: number }[]> };
const CI = CAPS as unknown as Record<string, CapInfo>;
const Src: React.FC<{ name: string; width?: number; y?: number; marks?: string[]; hold?: number }> = ({ name, width = 1300, y = 150, marks, hold = 105 }) => {
  const lf = useCurrentFrame();
  const c = CI[name];
  const sc = Math.min(width / c.w, 1.15);
  const w = c.w * sc;
  const ms = marks ?? Object.keys(c.marks);
  const k = interpolate(lf, [hold, hold + 14], [0, 1], { ...cl, easing: ease });
  const left = (1920 - w - 60) / 2, right = left + w + 70;
  return (
    <div style={{ position: "absolute", left, top: y, ...useIn() }}>
      <div style={{ background: "#FFFFFF", padding: 30, borderRadius: 18, border: `5px solid ${INK}`, boxShadow: "0 14px 0 rgba(0,0,0,0.35)", transformOrigin: "100% 0%", transform: `translate(${(1880 - right) * k}px, ${(36 - y) * k}px) scale(${1 - 0.6 * k})` }}>
        <div style={{ position: "relative", width: w, height: c.h * sc }}>
          {ms.flatMap((m) => c.marks[m] ?? []).map((b, i) => (
            <div key={i} style={{ position: "absolute", left: b.x * sc - 4, top: b.y * sc, height: b.h * sc, width: (b.w * sc + 8) * interpolate(lf, [12 + i * 6, 26 + i * 6], [0, 1], cl), background: YEL, opacity: 0.75, borderRadius: 6 }} />
          ))}
          <Img src={staticFile(`cm03/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: c.h * sc, mixBlendMode: "multiply" }} />
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: INK, opacity: 0.65, marginTop: 16 }}>Source: {c.source}</div>
      </div>
    </div>
  );
};
const Sprout: React.FC<{ pose: string; x?: number; y?: number; size?: number; flip?: boolean }> = ({ pose, x = 1500, y = 640, size = 300, flip }) => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  const hop = interpolate(lf, [0, 5, 10, 14], [60, -26, 6, 0], cl) + Math.sin(s * 1.3) * 10;
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x, top: y + hop, width: size, height: size, opacity: interpolate(lf, [0, 4], [0, 1], cl), transform: `rotate(${Math.sin(s * 0.9) * 6}deg) scaleX(${flip ? -1 : 1})` }} />;
};

// museum photo with a slow push and its credit
const Photo: React.FC<{ src: string; fit?: "cover" | "contain"; zoom?: [number, number]; origin?: string }> = ({ src, fit = "contain", zoom = [1.02, 1.12], origin = "50% 50%" }) => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#14110E" }}>
      {fit === "contain" && <Img src={staticFile(`cm03/img/${src}-bg.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <Img src={staticFile(`cm03/img/${src}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit, transform: `scale(${interpolate(lf, [0, 240], zoom, cl)})`, transformOrigin: origin }} />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>Photo: {PHOTO[src]}</div>
      <Badge text="REAL OBJECT" color="#9FE3B0" />
    </AbsoluteFill>
  );
};
// quick montage of photos (one every `every` seconds)
const Montage: React.FC<{ list: string[]; every?: number }> = ({ list, every = 1.6 }) => {
  const lf = useCurrentFrame();
  const i = Math.floor(lf / (every * FPS)) % list.length;
  return <Photo key={i} src={list[i]} zoom={[1.06, 1.16]} />;
};
const Grid: React.FC<{ list: string[] }> = ({ list }) => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#14110E", display: "flex", flexWrap: "wrap", padding: 60, gap: 24, alignContent: "center", justifyContent: "center" }}>
      {list.map((p, i) => (
        <div key={p} style={{ width: 560, height: 300, borderRadius: 16, overflow: "hidden", border: "4px solid #3A3128", opacity: interpolate(lf, [i * 5, i * 5 + 8], [0, 1], cl), transform: `scale(${interpolate(lf, [i * 5, i * 5 + 10], [0.9, 1], { ...cl, easing: out })})` }}>
          <Img src={staticFile(`cm03/img/${p}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 22, color: "#FFFFFF", opacity: 0.8 }}>Photos: Wikimedia Commons (see description for credits)</div>
      <Badge text="REAL OBJECTS" color="#9FE3B0" />
    </AbsoluteFill>
  );
};

// ---------- 3D scenes ----------
type Gen = (u: number) => Shot3;
const orbit = (a: number, r: number, h: number, look = O, fov = 35): Shot3 => ({ pos: V(Math.sin(a) * r, h, Math.cos(a) * r), look, fov });
const G: Record<string, Gen> = {
  hero: (u) => orbit(0.3 + u * 0.08, 6.2 - u * 0.12, 1.1),
  close: (u) => orbit(1.2 + u * 0.06, 3.6, 0.5, V(0.2, 0.1, 0), 32),
  top: (u) => ({ pos: V(Math.sin(u * 0.1) * 0.5, 6.5 - u * 0.15, 1.2), look: O, fov: 38 }),
  low: (u) => orbit(2.3 + u * 0.07, 5, -0.9, V(0, 0.3, 0)),
  side: (u) => orbit(-0.9 - u * 0.06, 5.2, 1.8, V(-0.9, 0, 0)),
  macro: (u) => orbit(0.7 + u * 0.04, 2.5, 0.9, V(0, 0.2, 0.3), 30),
};
const cuts = (names: string[], every = 4.5) => (s: number): Shot3 => {
  const k = Math.floor(s / every);
  return G[names[k % names.length]](s - k * every);
};
const Obj: React.FC<{ names?: string[]; every?: number; patina?: Patina; spin?: number; hole?: number; sprout?: { pose: string; x: number; y: number; size?: number; flip?: boolean }; badge?: string; children?: React.ReactNode; dark?: boolean }> = ({ names = ["hero", "close", "low", "top", "side"], every = 4.5, patina = "bronze", spin = 0.15, hole = -1, sprout, badge = "ILLUSTRATION", children, dark }) => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  const glow = hole >= 0 ? 0.6 + 0.4 * Math.sin(s * 4) : 0;
  return (
    <AbsoluteFill>
      <Stage3 shot={cuts(names, every)(s)} bg={dark ? "#060504" : "#15110D"}>
        <Dodecahedron patina={patina} rot={[0.35, 0.4 + s * spin, 0.1]} pos={[0, 0, 0]} highlightHole={hole} glow={glow} />
        {children}
      </Stage3>
      {sprout && <Sprout {...sprout} />}
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
// reveal: from darkness, the spotlight comes up
const Reveal: React.FC = () => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Obj names={["hero"]} every={30} dark />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(lf, [0, 40], [1, 0], cl) }} />
    </AbsoluteFill>
  );
};
// theory 1: rolled like a die, it barely tumbles and stops on its knobs
const DiceRoll: React.FC = () => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  const k = Math.min(1, s / 2.4);
  const x = -3 + 3.4 * (1 - Math.pow(1 - k, 2));
  const y = -0.25 + Math.abs(Math.sin(k * Math.PI * 3)) * 0.5 * (1 - k);
  return (
    <AbsoluteFill>
      <Stage3 shot={orbit(0.2, 7, 2.2, V(0, -0.4, 0))} plinth={false}>
        <mesh position={[0, -1.55, 0]} receiveShadow><boxGeometry args={[12, 0.3, 6]} /><meshStandardMaterial color="#5A4636" roughness={0.9} /></mesh>
        <Dodecahedron pos={[x, y, 0]} rot={[k * 2.2, 0.4, -k * 3.1]} scale={0.8} />
      </Stage3>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
// theory 2: sighting through two holes at a distant tower
const Sight: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [10, 40], [0, 1], { ...cl, easing: out });
  return (
    <AbsoluteFill>
      <Stage3 shot={{ pos: V(-6.5, 1.6, 2.4), look: V(2, 0.2, 0), fov: 40 }} plinth={false}>
        <Dodecahedron pos={[0, 0, 0]} rot={[0.35, 1.2, 0.1]} scale={0.9} />
        <mesh position={[16, 0.5, -1]}><boxGeometry args={[1.2, 6, 1.2]} /><meshStandardMaterial color="#9C8E7A" /></mesh>
        <mesh position={[5 * k - 3, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 10 * k + 0.01, 8]} /><meshBasicMaterial color="#FFD23F" /></mesh>
      </Stage3>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
// theory 3: wool wrapped around the knobs
const Wool: React.FC = () => {
  const lf = useCurrentFrame();
  const n = Math.floor(interpolate(lf, [0, 120], [2, 9], cl));
  const curves = React.useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    const pts = Array.from({ length: 7 }, (_, j) => V(Math.cos(a + j * 0.9) * (1.45 - j * 0.03), 1.2 - j * 0.38, Math.sin(a + j * 0.9) * (1.45 - j * 0.03)));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.04, 8, false);
  }), []);
  return (
    <Obj names={["hero", "side", "top"]} every={4} spin={0.25}>
      {curves.slice(0, n).map((g, i) => <mesh key={i} geometry={g}><meshStandardMaterial color="#C8324A" roughness={0.95} /></mesh>)}
    </Obj>
  );
};
// theory 4: a candle in the top hole
const Candle: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <Stage3 shot={s % 8 < 4 ? orbit(0.3 + s * 0.05, 7.5, 2.4, V(0, 0.7, 0)) : orbit(1.4 + s * 0.04, 5.2, 1.6, V(0, 1.2, 0))} bg="#0B0806">
        <Dodecahedron rot={[0, 0.4, 0]} />
        <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.22, 0.22, 1.4, 24]} /><meshStandardMaterial color="#F2E8D2" roughness={0.7} /></mesh>
        <mesh position={[0, 2.45 + Math.sin(s * 12) * 0.02, 0]}><coneGeometry args={[0.1, 0.35, 16]} /><meshBasicMaterial color="#FFC861" /></mesh>
        <pointLight position={[0, 2.6, 0]} intensity={18 + Math.sin(s * 11) * 3} color="#FFB347" distance={8} />
      </Stage3>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
// theory 5: a sunbeam lining up with two holes
const Sunbeam: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [10, 50], [0, 1], { ...cl, easing: out });
  return (
    <AbsoluteFill>
      <Stage3 shot={{ pos: V(5.5, 2.2, 5.5), look: V(0, -0.2, 0), fov: 38 }} bg="#1C1812">
        <Dodecahedron rot={[0.35, 0.4, 0.1]} />
        <mesh position={[-2.2 * (1 - k) + 0, 2.5 - 2.5 * k * 0.4, 0]} rotation={[0, 0, -0.75]}><cylinderGeometry args={[0.18, 0.18, 9, 16, 1, true]} /><meshBasicMaterial color="#FFE08A" transparent opacity={0.35 * k} side={THREE.DoubleSide} /></mesh>
        <mesh position={[2.6, -1.53, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.35 * k + 0.01, 32]} /><meshBasicMaterial color="#FFE08A" transparent opacity={0.8 * k} /></mesh>
      </Stage3>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const Cousins: React.FC<{ show: ("ico" | "silver" | "gold")[] }> = ({ show }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <Stage3 shot={orbit(0.1 + s * 0.04, 8.5, 1.4)}>
        <Dodecahedron pos={[-2.4, 0, 0]} rot={[0.35, s * 0.2, 0.1]} scale={0.75} />
        {show.includes("ico") && <Icosahedron pos={[0, 0.1, 0]} rot={[0.2, s * 0.2, 0]} scale={1.1} />}
        {show.includes("silver") && <Dodecahedron patina="silver" pos={[2.4, 0, 0]} rot={[0.35, -s * 0.2, 0.1]} scale={0.75} />}
        {show.includes("gold") && <Dodecahedron patina="gold" pos={[0, 1.9, -1]} rot={[0.35, s * 0.3, 0.1]} scale={0.35} />}
      </Stage3>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const SizeGraphic: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [6, 30], [0, 1], { ...cl, easing: out });
  const cm = 62; // px per cm
  const D: React.FC<{ x: number; c: number; label: string }> = ({ x, c, label }) => (
    <g transform={`translate(${x} 620)`}>
      <polygon points={Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return `${Math.cos(a) * c * cm * 0.5 * k},${Math.sin(a) * c * cm * 0.5 * k}`; }).join(" ")} fill={BRZ} stroke={INK} strokeWidth={5} />
      <circle r={c * cm * 0.14 * k} fill="#14110E" />
      <text y={c * cm * 0.5 + 70} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={48} fill="#FFFFFF">{label}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ background: "#1C1812" }}>
      <svg width={1920} height={1080}>
        <D x={560} c={4} label="≈ 4 cm" />
        <D x={1240} c={11} label="≈ 11 cm" />
        <line x1={200} y1={1000} x2={200 + 11 * cm * k} y2={1000} stroke="#FFFFFF" strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={200 + i * cm} y1={985} x2={200 + i * cm} y2={1000} stroke="#FFFFFF" strokeWidth={4} opacity={i * cm <= 11 * cm * k ? 1 : 0} />)}
      </svg>
      <Badge text="ILLUSTRATION · to scale" />
    </AbsoluteFill>
  );
};
const Theories: React.FC<{ n: number }> = ({ n }) => {
  const list = ["Die / fortune telling", "Rangefinder", "Knitting tool", "Candle holder", "Calendar / sundial", "Coin gauge, masterpiece, toy…"];
  const lf = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 120, top: 160, width: 900 }}>
      {list.slice(0, n).map((t, i) => (
        <div key={t} style={{ opacity: interpolate(lf, [i * 6, i * 6 + 8], [0, 1], cl), fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: INK, background: "#FFFFFF", border: `4px solid ${INK}`, borderRadius: 16, padding: "10px 24px", marginBottom: 16, display: "table" }}>
          {i + 1}. {t}
        </div>
      ))}
    </div>
  );
};
const Verdict: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", right: 90, top: 150, ...useIn(4) }}>
    <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: "#FFFFFF", background: RED, border: `5px solid ${INK}`, borderRadius: 18, padding: "10px 26px", display: "inline-block", rotate: "4deg" }}>✗ {text}</span>
  </div>
);
const Recap: React.FC = () => {
  const items: [number, string][] = [[88, "100+ bronze dodecahedrons"], [89, "Made with care, mostly in Gaul, 2nd–4th c."], [90, "Britain to Hungary — never Italy"], [91, "No Roman description · 50+ theories"], [92, "Every practical theory breaks somewhere"], [93, "Newest idea: a sacred symbol (2025)"]];
  const lf = useCurrentFrame();
  const t0 = S(87);
  return (
    <div style={{ position: "absolute", left: 120, top: 150, width: 1000 }}>
      {items.map(([i, t]) => {
        const d = (S(i) - t0) * FPS;
        return <div key={i} style={{ opacity: interpolate(lf, [d, d + 8], [0, 1], cl), transform: `translateX(${interpolate(lf, [d, d + 10], [-30, 0], { ...cl, easing: out })}px)`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 44, color: INK, background: "#FFFFFF", border: `4px solid ${INK}`, borderRadius: 16, padding: "10px 24px", marginBottom: 18, display: "table" }}>{t}</div>;
      })}
    </div>
  );
};
const Timeline: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [10, 60], [0, 1], { ...cl, easing: ease });
  const x0 = 220, x1 = 1700;
  const X = (y: number) => x0 + ((y - 1739) / (2025 - 1739)) * (x1 - x0);
  return (
    <AbsoluteFill style={{ background: "#1C1812" }}>
      <svg width={1920} height={1080}>
        <line x1={x0} y1={620} x2={x0 + (x1 - x0) * k} y2={620} stroke="#FFFFFF" strokeWidth={8} />
        {[[1739, "first one recorded (Aston, England)"], [1982, "solid silver one (Geneva)"], [2023, "Norton Disney find"]].map(([y, t], i) => (
          <g key={i} opacity={interpolate(lf, [20 + i * 15, 30 + i * 15], [0, 1], cl)}>
            <circle cx={X(y as number)} cy={620} r={18} fill={YEL} stroke={INK} strokeWidth={4} />
            <text x={X(y as number)} y={i % 2 ? 720 : 560} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={56} fill="#FFFFFF">{y}</text>
            <text x={X(y as number)} y={i % 2 ? 770 : 500} textAnchor="middle" fontFamily="Pretendard" fontWeight={700} fontSize={30} fill="#FFFFFF" opacity={0.8}>{t}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
const MapZoom: React.FC<{ step: "countries" | "italy" | "places" | "edges"; z?: number }> = ({ step, z = 1 }) => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z * interpolate(lf, [0, 300], [1, 1.06], cl)})`, transformOrigin: "38% 45%" }}><DodecaMap step={step} /></div>
      <Badge text="MAP" color="#BFDCEF" />
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const ch = TL.chunks;
  const i = ch.findIndex((c, k) => fr >= c.start && fr < (ch[k + 1]?.start ?? c.start + 50));
  if (i < 0) return null;
  const lf = fr - ch[i].start;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, bottom: 44, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, letterSpacing: -1, color: "#FFFFFF", background: "rgba(14,15,20,0.78)", padding: "8px 26px", borderRadius: 14, opacity: interpolate(lf, [0, 2], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 5], [12, 0], { ...cl, easing: out })}px)` }}>{ch[i].text}</span>
    </div>
  );
};

// ---------------- the edit ----------------
const SCENES: [number, React.ReactNode][] = [
  [0, <Reveal />],
  [S(1), <Montage list={["bonn", "besancon", "aventicum", "stuttgart"]} every={1.4} />],
  [S(2), <Obj names={["hero", "macro"]} />],
  [S(3), <Photo src="strasbourg" />],
  [S(4), <Obj names={["hero", "close"]} />],
  [S(6), <Obj names={["top", "side"]} />],
  [S(7), <Obj names={["close", "macro"]} hole={3} />],
  [S(8), <Obj names={["low", "hero"]} />],
  [S(9), <Obj names={["macro"]} spin={0.05} />],
  [S(10), <SizeGraphic />],
  [S(12), <Photo src="vienne" />],
  [S(13), <Obj names={["macro", "close"]} spin={0.3} />],
  [S(14), <Photo src="besancon" zoom={[1.1, 1.35]} />],
  [S(15), <Obj names={["macro"]} spin={0.06} />],
  [S(16), <Photo src="muchhadham" />],
  [S(17), <Grid list={["bonn", "besancon", "aventicum", "stuttgart", "krefeld", "jublains"]} />],
  [S(18), <Obj names={["side", "hero"]} sprout={{ pose: "think", x: 1450, y: 600, size: 280 }} />],
  [S(19), <Photo src="aventicum" zoom={[1.1, 1.3]} />],
  [S(20), <Obj names={["close", "low"]} />],
  [S(22), <Timeline />],
  [S(24), <Grid list={["vienne", "krefeld", "strasbourg", "leopoldwal", "maastricht", "muchhadham"]} />],
  [S(25), <MapZoom step="countries" />],
  [S(26), <MapZoom step="edges" />],
  [S(27), <MapZoom step="italy" />],
  [S(29), <MapZoom step="places" z={1.35} />],
  [S(30), <Photo src="muchhadham" />],
  [S(32), <Montage list={["jublains", "krefeld", "vienne", "strasbourg"]} every={1.8} />],
  [S(35), <Obj names={["low", "side"]} dark />],
  [S(37), <Photo src="jublains" />],
  [S(38), <Obj names={["macro"]} dark spin={0.04} />],
  [S(40), <Obj names={["hero", "top"]} sprout={{ pose: "sad", x: 1480, y: 620, size: 260 }} />],
  [S(42), <Photo src="schwarzenacker" />],
  [S(44), <Obj names={["side", "low"]} sprout={{ pose: "think", x: 1500, y: 640, size: 260 }} />],
  [S(47), <DiceRoll />],
  [S(51), <Sight />],
  [S(55), <Wool />],
  [S(60), <Candle />],
  [S(63), <Sunbeam />],
  [S(67), <Montage list={["leopoldwal", "krefeld", "stuttgart"]} every={2} />],
  [S(70), <Photo src="bonn" />],
  [S(71), <Cousins show={["ico"]} />],
  [S(72), <Photo src="bonn" zoom={[1.15, 1.3]} />],
  [S(73), <Cousins show={["ico", "silver"]} />],
  [S(75), <Cousins show={["ico", "silver", "gold"]} />],
  [S(77), <Obj names={["hero", "macro"]} dark />],
  [S(79), <Obj names={["side", "top"]} />],
  [S(81), <Obj names={["hero"]} patina="gold" spin={0.2} />],
  [S(82), <Obj names={["low", "close"]} />],
  [S(83), <MapZoom step="countries" z={1.25} />],
  [S(84), <Obj names={["hero", "macro", "top"]} spin={0.2} sprout={{ pose: "excited", x: 1500, y: 620, size: 260 }} />],
  [S(86), <Obj names={["side"]} dark />],
  [S(87), <Obj names={["side", "hero", "low", "top", "close"]} />],
  [S(94), <Reveal />],
  [S(95), <Photo src="muchhadham" />],
  [S(96), <Grid list={["bonn", "besancon", "stuttgart", "jublains", "krefeld", "vienne"]} />],
  [S(97), <Obj names={["hero"]} sprout={{ pose: "wink", x: 1480, y: 620, size: 300 }} />],
];
const OVER: [number, number, React.ReactNode][] = [
  [S(0), S(1), <Line text="What is this?" size={84} y={120} />],
  [S(1), S(2), <Stat big="100+" small="found · no Roman wrote down what they were for" y={120} />],
  [S(2), S(3), <Line text="The Roman dodecahedron" sub="2nd–4th century AD" size={70} y={120} />],
  [S(3), S(4), <Line text="What we know · 5 theories · a 2025 study" size={52} />],
  [S(5), S(6), <Line text="Copper alloy (bronze)" size={56} />],
  [S(6), S(7), <Line text="12 pentagon faces" size={66} />],
  [S(7), S(8), <Src name="w-what" />],
  [S(8), S(9), <Line text="20 corners · 20 knobs" size={66} />],
  [S(9), S(10), <Line text="Hollow" size={66} />],
  [S(10), S(12), <Src name="w-size" y={120} />],
  [S(12), S(13), <Stat big="35 g – 1 kg" small="lightest and heaviest known" />],
  [S(13), S(14), <Src name="w-cast" />],
  [S(14), S(15), <Line text="Rings carved around the holes" size={56} />],
  [S(15), S(16), <Src name="w-knobs" />],
  [S(16), S(17), <Line text="Carmarthen: cast in one piece · London: 3 balls per corner" size={44} sub="Wikipedia, Roman dodecahedron" />],
  [S(18), S(19), <Quote text="They were evidently costly and difficult objects to make" who="Google Arts & Culture (Corbridge Roman Museum object)" />],
  [S(19), S(20), <Src name="w-letters" marks={["do not have any inscribed numbers or letters"]} />],
  [S(20), S(22), <Src name="w-letters" marks={["rarely show signs of wear"]} />],
  [S(23), S(24), <Src name="w-1739" y={820} />],
  [S(24), S(25), <Src name="w-unknown" y={110} />],
  [S(24), S(25), <Quote text="116 of these objects have been discovered" who="Google Arts & Culture · other counts: about 130 (Wikipedia)" y={680} />],
  [S(26), S(27), <Src name="w-slovakia" y={760} />],
  [S(27), S(29), <Src name="w-italy" y={760} />],
  [S(30), S(32), <Src name="w-norton" y={110} />],
  [S(31), S(32), <Stat big="33" small="from Roman Britain (after the 2023 find)" y={560} />],
  [S(33), S(35), <Quote text="Roman military camps, public baths, temples, theatres, and tombs" who="Google Arts & Culture" />],
  [S(35), S(37), <Src name="w-context" />],
  [S(37), S(38), <Line text="“Enfin un dodécaèdre en contexte archéologique !”" sub="Guillier, Delage & Besombes (2008), Revue archéologique de l'Ouest" size={46} />],
  [S(38), S(40), <Src name="w-tomb" />],
  [S(42), S(43), <Line text="Farming. Building. Medicine. War." size={66} />],
  [S(43), S(44), <Src name="w-fifty" marks={["no mention of dodecahedra has been found in contemporary accounts or pictures"]} />],
  [S(44), S(46), <Stat big="50+" small="explanations published (Wikipedia)" />],
  [S(46), S(47), <Theories n={6} />],
  [S(47), S(49), <Line text="1. A die" sub="for games or telling the future" />],
  [S(49), S(51), <Quote text="experiments with reproductions show they are difficult to roll" who="Google Arts & Culture" />],
  [S(50), S(51), <Verdict text="won't roll" />],
  [S(51), S(52), <Line text="2. A rangefinder" />],
  [S(52), S(53), <Src name="a-abs" />],
  [S(54), S(55), <Quote text="with no standardisation, they wouldn't be much use" who="Google Arts & Culture" />],
  [S(54), S(55), <Verdict text="no markings" />],
  [S(55), S(57), <Line text="3. A knitting tool" sub="popular online" />],
  [S(58), S(59), <Src name="w-knit" />],
  [S(58), S(59), <Quote text="no evidence for knitting until at least 1,000 years after" who="Google Arts & Culture" y={560} />],
  [S(59), S(60), <Verdict text="1,000 years too early" />],
  [S(60), S(61), <Line text="4. A candle holder" />],
  [S(61), S(62), <Quote text="Traces of wax have been found on some examples" who="Google Arts & Culture" />],
  [S(62), S(63), <Verdict text="too complicated" />],
  [S(63), S(64), <Line text="5. A calendar / sundial" />],
  [S(64), S(66), <Quote text="the sun would align with two of the holes" who="Google Arts & Culture (the sundial theory)" />],
  [S(66), S(67), <Verdict text="no dates or marks" />],
  [S(67), S(68), <Line text="Coin gauge? Masterpiece? Toy?" size={60} />],
  [S(69), S(70), <Src name="w-coins" />],
  [S(71), S(72), <Src name="w-ico" y={800} />],
  [S(73), S(74), <Src name="w-silver" y={820} />],
  [S(74), S(75), <Line text="2009, France: a round cousin" sub="triangular and pentagonal holes (Wikipedia)" />],
  [S(75), S(76), <Src name="w-gold" y={760} />],
  [S(78), S(79), <Line text="The Antiquaries Journal, 2025" sub="Guggenberger & Leach" size={60} />],
  [S(79), S(80), <Src name="c-abs" marks={["no contemporaneous description"]} />],
  [S(80), S(81), <Src name="c-abs" marks={["Iamblichus"]} />],
  [S(81), S(82), <Line text="Pythagoras & Plato: a shape with deep meaning" size={52} sub="as noted in the 2025 paper's abstract" />],
  [S(82), S(83), <Src name="c-abs" marks={["the interest of the Druids in Pythagoras"]} />],
  [S(84), S(85), <Line text="A symbol? A ritual object?" size={66} />],
  [S(86), S(87), <Line text="Still a theory." size={84} />],
  [S(87), S(94), <Recap />],
  [S(96), S(97), <Line text="Photos: real dodecahedrons in museums · 3D: illustrations" size={44} sub="photo credits in the description" />],
  [S(97), END, <Line text="Which theory do you believe?" size={70} sub="tell me in the comments" />],
];

export const Cm03Full: React.FC = () => {
  useFonts();
  const f = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: "#14110E" }}>
      {SCENES.map(([t, el], k) => {
        const end = k + 1 < SCENES.length ? SCENES[k + 1][0] : END;
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
      <Html5Audio src={staticFile("cm03/narration.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
