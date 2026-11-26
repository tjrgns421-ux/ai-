import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm07/narration.words.json";
import LINES from "../../public/cm07/lines.json";
import CAPS from "../../public/cm07/caps/captures.json";
import { MarsStage, Methane, Oumuamua, Orbiter, Planet, Saturn, ShotS, SpaceStage } from "./Space3D";

// Curious Minutes ep07 "6 Strange Things Found in Our Solar System" — list format, a verdict after each.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71", ORG = "#FFB020";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const TL = makeTimeline(words, LINES as string[], [], 75);
export const CM07_FRAMES = TL.duration;
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
          <Img src={staticFile(`cm07/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: c.h * sc, mixBlendMode: "multiply" }} />
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
      <Img src={staticFile(`cm07/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit, transform: `scale(${interpolate(lf % (CUT * FPS), [0, CUT * FPS], [zoom[0] + 0.08 * (k % 2), zoom[1] + 0.08 * (k % 2)], cl)})`, transformOrigin: k % 3 === 0 ? origin : ["35% 45%", "65% 55%"][k % 2] }} />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text={badge} color="#9FE3B0" />
    </AbsoluteFill>
  );
};

// ---------- 3D scenes ----------
const CUT = 4.5;
const vary = (shot: (s: number) => ShotS, s: number): ShotS => {
  const b = shot(s);
  const k = Math.floor(s / CUT) % 3;
  if (k === 0) return b;
  const off = b.pos.clone().sub(b.look);
  if (k === 1) off.applyAxisAngle(V(0, 1, 0), 0.7);
  else off.multiplyScalar(1.35).add(V(0, off.length() * 0.2, 0));
  return { ...b, pos: b.look.clone().add(off) };
};
type ShotFn = (s: number) => ShotS;
const Space: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode; badge?: string; still?: boolean; sun?: [number, number, number] }> = ({ shot, children, badge = "ILLUSTRATION · not to scale", still, sun }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <SpaceStage shot={still ? shot(s) : vary(shot, s)} sun={sun}>{children(s)}</SpaceStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const Mars: React.FC<{ shot: ShotFn; night: (s: number) => number; children: (s: number) => React.ReactNode }> = ({ shot, night, children }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <MarsStage shot={vary(shot, s)} night={night(s)}>{children(s)}</MarsStage>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const orbit = (r: number, h: number, a0 = 0, sp = 0.05, fov = 40, look: [number, number, number] = [0, 0, 0]): ShotFn => (s) => ({ pos: V(look[0] + Math.sin(a0 + s * sp) * r, look[1] + h, look[2] + Math.cos(a0 + s * sp) * r), look: V(...look), fov });
const RoverM: React.FC<{ x: number; z: number; t: number }> = ({ x, z, t }) => (
  <group position={[x, 1.2, z]}>
    <mesh position={[0, 0.6, 0]}><boxGeometry args={[3, 1, 2]} /><meshStandardMaterial color="#D8D2C8" metalness={0.4} roughness={0.5} /></mesh>
    <mesh position={[1, 2, 0]}><cylinderGeometry args={[0.08, 0.08, 2, 8]} /><meshStandardMaterial color="#CCCCCC" /></mesh>
    <mesh position={[1, 3, 0]}><boxGeometry args={[0.6, 0.4, 0.4]} /><meshStandardMaterial color="#EEEEEE" /></mesh>
    {[-1.1, 0, 1.1].flatMap((wx) => [-1.2, 1.2].map((wz) => <mesh key={`${wx}${wz}`} position={[wx, -0.2, wz]} rotation={[Math.PI / 2, t, 0]}><cylinderGeometry args={[0.45, 0.45, 0.4, 14]} /><meshStandardMaterial color="#333333" /></mesh>))}
  </group>
);
// Earth-side observers for Venus: radio dishes (2D)
const Dishes: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [10, 60], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0B1024, #1E2A44)" }}>
      <svg width={1920} height={1080}>
        <circle cx={1500} cy={220} r={70} fill="#E3C78E" />
        {[300, 620, 940].map((x, i) => (
          <g key={i} transform={`translate(${x} 760)`}>
            <path d="M -110 0 Q 0 -150 110 0 Z" fill="#E9EDF2" transform="rotate(-25)" />
            <rect x={-10} y={0} width={20} height={150} fill="#B8C0CA" />
            <line x1={0} y1={-40} x2={1500 - x} y2={220 - 760} stroke="#FFD23F" strokeWidth={4} strokeDasharray="14 12" opacity={k} />
          </g>
        ))}
        <rect x={0} y={900} width={1920} height={180} fill="#3A3028" />
        <text x={700} y={140} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={44} fill="#FFFFFF">radio telescopes on Earth (ALMA, JCMT) → Venus</text>
      </svg>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
// a spectrum line that shrinks: 20 ppb → about 1 ppb
const Spectrum: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [30, 90], [1, 0.05], { ...cl, easing: ease });
  const pts = Array.from({ length: 300 }, (_, i) => { const x = i / 299; const dip = Math.exp(-((x - 0.5) ** 2) / 0.0006) * 220 * k; const noise = Math.sin(i * 1.7) * 6 + Math.sin(i * 0.61) * 5; return `${160 + x * 1600},${500 + dip + noise}`; }).join(" ");
  return (
    <AbsoluteFill style={{ background: "#0B0D14" }}>
      <svg width={1920} height={1080}>
        <line x1={160} y1={500} x2={1760} y2={500} stroke="#2A2F40" strokeWidth={2} />
        <polyline points={pts} fill="none" stroke="#FFD23F" strokeWidth={4} />
        <text x={960} y={200} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={60} fill="#FFFFFF">{k > 0.5 ? "first report: ~20 ppb" : "after corrected data: ~1 ppb"}</text>
        <text x={960} y={880} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={34} fill="#FFFFFF" opacity={0.7}>the dip that was read as phosphine</text>
      </svg>
      <Badge text="ILLUSTRATION · shape, not data" />
    </AbsoluteFill>
  );
};
// day/night mixing diagram for Mars methane (2D)
const DayNight: React.FC = () => {
  const lf = useCurrentFrame();
  const day = Math.floor(lf / 75) % 2 === 1;
  return (
    <AbsoluteFill style={{ background: day ? "#D9A77A" : "#0B0A12" }}>
      <svg width={1920} height={1080}>
        <rect x={0} y={820} width={1920} height={260} fill={day ? "#9A5A3A" : "#3A2016"} />
        {Array.from({ length: 140 }, (_, i) => {
          const x = (i * 137) % 1920, y = day ? 120 + ((i * 53) % 680) : 760 + ((i * 29) % 60);
          return <circle key={i} cx={x} cy={y} r={day ? 4 : 7} fill="#9AF0C8" opacity={day ? 0.35 : 0.85} />;
        })}
        <text x={960} y={210} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={56} fill={day ? INK : "#FFFFFF"}>{day ? "DAY: mixed high and thin → orbiter sees nothing" : "NIGHT: calm air, methane builds up near the ground"}</text>
      </svg>
      <Badge text="ILLUSTRATION · based on NASA (2021)" />
    </AbsoluteFill>
  );
};
// Iapetus runaway loop (2D)
const Loop: React.FC = () => {
  const lf = useCurrentFrame();
  const steps = ["dust darkens the leading side", "dark ice warms in sunlight", "ice turns to vapor", "vapor freezes on bright, cold areas"];
  return (
    <AbsoluteFill style={{ background: "#0B0D14" }}>
      <svg width={1920} height={1080}>
        {steps.map((t, i) => {
          const a = -Math.PI / 2 + (i * Math.PI) / 2, x = 960 + Math.cos(a) * 330, y = 560 + Math.sin(a) * 300;
          const on = interpolate(lf, [i * 20, i * 20 + 10], [0, 1], cl);
          return <g key={i} opacity={on}><rect x={x - 250} y={y - 50} width={500} height={100} rx={20} fill="#FFFFFF" /><text x={x} y={y + 14} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={34} fill={INK}>{t}</text></g>;
        })}
        <circle cx={960} cy={560} r={200} fill="none" stroke={YEL} strokeWidth={8} strokeDasharray="30 20" transform={`rotate(${lf * 2} 960 560)`} />
        <text x={960} y={575} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={44} fill={YEL}>runaway loop</text>
      </svg>
      <Badge text="ILLUSTRATION · based on NASA (2007)" />
    </AbsoluteFill>
  );
};
// rotating-tank lab hexagon (2D)
const Tank: React.FC = () => {
  const lf = useCurrentFrame();
  const n = [6, 4, 8, 6][Math.floor(lf / 60) % 4];
  const pts = Array.from({ length: 200 }, (_, i) => { const a = (i / 199) * Math.PI * 2 + lf * 0.01; const r = 260 + 26 * Math.cos(n * (a - lf * 0.01)); return `${960 + Math.cos(a) * r},${560 + Math.sin(a) * r}`; }).join(" ");
  return (
    <AbsoluteFill style={{ background: "#0B1622" }}>
      <svg width={1920} height={1080}>
        <circle cx={960} cy={560} r={400} fill="#163A5C" stroke="#9FD8FF" strokeWidth={6} />
        <polygon points={pts} fill="none" stroke="#FFFFFF" strokeWidth={8} />
        <text x={960} y={1030} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={46} fill="#FFFFFF">spinning tank of water: {n} sides</text>
      </svg>
      <Badge text="ILLUSTRATION · lab experiment (NASA)" />
    </AbsoluteFill>
  );
};
// ʻOumuamua's path past the Sun (2D): straight-ish hyperbola, slight extra push after perihelion
const Path: React.FC<{ push?: boolean }> = ({ push }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [0, 150], [0, 1], cl);
  const pt = (u: number, extra: number) => { const x = 960 + u * 900; const y = 540 - 260 / Math.cosh(u * 2.2) - extra * Math.max(0, u) * 60; return [x, y]; };
  const grav = Array.from({ length: 120 }, (_, i) => pt(-1 + 2 * (i / 119), 0).join(",")).join(" ");
  const real = Array.from({ length: Math.max(2, Math.round(120 * k)) }, (_, i) => pt(-1 + 2 * (i / 119), push ? 1 : 0).join(",")).join(" ");
  return (
    <AbsoluteFill style={{ background: "#020207" }}>
      <svg width={1920} height={1080}>
        <circle cx={960} cy={540} r={40} fill="#FFD23F" />
        {push && <polyline points={grav} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeDasharray="10 10" opacity={0.6} />}
        <polyline points={real} fill="none" stroke={push ? "#FF8A5A" : "#9FD8FF"} strokeWidth={6} />
        {push && <text x={1580} y={180} fontFamily="Pretendard" fontWeight={900} fontSize={38} fill="#FF8A5A">observed: a little extra push</text>}
        {push && <text x={1560} y={420} fontFamily="Pretendard" fontWeight={800} fontSize={32} fill="#FFFFFF" opacity={0.7}>gravity alone</text>}
        <text x={960} y={1000} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={40} fill="#FFFFFF">ʻOumuamua's path past the Sun (2017)</text>
      </svg>
      <Badge text="ILLUSTRATION · not to scale" />
    </AbsoluteFill>
  );
};

// ---------- scoreboard ----------
const Scoreboard: React.FC = () => {
  const lf = useCurrentFrame();
  const rows: [number, string, Verd][] = [[78, "The face on Mars", "SOLVED"], [79, "Iapetus's two faces", "SOLVED"], [80, "Saturn's hexagon", "BEST GUESS"], [81, "ʻOumuamua", "BEST GUESS"], [82, "Methane on Mars", "STILL UNKNOWN"], [83, "Phosphine on Venus", "STILL UNKNOWN"]];
  const t0 = S(77);
  return (
    <div style={{ position: "absolute", left: 100, top: 130, width: 1500 }}>
      {rows.map(([i, name, v]) => {
        const d = (S(i) - t0) * FPS;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 20, opacity: interpolate(lf, [d, d + 8], [0, 1], cl), transform: `translateX(${interpolate(lf, [d, d + 10], [-30, 0], { ...cl, easing: out })}px)` }}>
            <div style={{ width: 640, fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: "#FFFFFF", textShadow: "0 4px 14px rgba(0,0,0,0.85)" }}>{name}</div>
            <div style={{ border: `6px solid ${VCOL[v]}`, color: VCOL[v], borderRadius: 14, padding: "4px 22px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, background: "rgba(10,10,14,0.75)", rotate: "-3deg" }}>{v}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------- the edit ----------------
const MarsGlobe = (s: number) => <><Planet tex="mars" r={10} spin={s * 0.08} /><Orbiter pos={[13, 3, 6]} rot={s * 0.2} /></>;
const SatSys = (s: number) => <Saturn spin={s * 0.15} />;
const IapG = (s: number) => <Planet tex="iapetus" r={8} spin={0.6 + s * 0.12} />;
const VenusG = (s: number) => <Planet tex="venus" r={10} spin={s * 0.05} rough={0.7} />;
const OumG = (s: number) => <Oumuamua t={s} />;
const C_VIK = "Viking 1 Orbiter, July 1976 · NASA/JPL (public domain)";
const SCENES: [number, React.ReactNode][] = [
  [0, <Photo src="face_viking.jpg" credit={C_VIK} zoom={[1.1, 1.25]} />],
  [S(1), <Space shot={orbit(34, 8, 0.4, 0.05, 40)}>{MarsGlobe}</Space>],
  [S(2), <Space shot={orbit(90, 20, 1, 0.05, 40)}>{SatSys}</Space>],
  [S(3), <Space shot={orbit(30, 6, 2, 0.06, 40)}>{VenusG}</Space>],
  [S(4), <Photo src="face_viking.jpg" credit={C_VIK} />],
  [S(5), <Space shot={orbit(30, 10, 0.6, 0.06, 40)}>{MarsGlobe}</Space>],
  [S(6), <Photo src="face_viking.jpg" credit={C_VIK} zoom={[1.3, 1.5]} />],
  [S(8), <Photo src="face_viking.jpg" credit={C_VIK} zoom={[1.6, 1.8]} />],
  [S(9), <Photo src="face_viking.jpg" credit={C_VIK} zoom={[1.0, 1.1]} />],
  [S(10), <Space shot={orbit(26, 6, 2, 0.08, 40)}>{MarsGlobe}</Space>],
  [S(11), <Photo src="face_mgs.png" credit="Mars Global Surveyor (MOC), April 2001 · NASA/JPL/MSSS (public domain)" />],
  [S(11) + 4, <Photo src="face_hirise.jpg" credit="Mars Reconnaissance Orbiter (HiRISE), 2007, Viking inset · NASA/JPL/University of Arizona (public domain)" />],
  [S(13), <Photo src="face_hirise.jpg" credit="HiRISE, 2007 · NASA/JPL/University of Arizona (public domain)" zoom={[1.2, 1.35]} />],
  [S(14), <Photo src="face_viking.jpg" credit={C_VIK} />],
  [S(16), <Photo src="iapetus.png" credit="Iapetus · NASA/JPL/Space Science Institute (Cassini, public domain)" />],
  [S(18), <Space shot={orbit(26, 4, 0, 0.1, 40)}>{IapG}</Space>],
  [S(19), <Space shot={orbit(140, 30, 0.5, 0.04, 40)}>{(s) => <><Saturn spin={s * 0.15} /><Planet tex="iapetus" r={3} pos={[Math.cos(s * 0.3) * 80, 0, Math.sin(s * 0.3) * 80]} spin={s * 0.3} /></>}</Space>],
  [S(21), <Photo src="iapetus.png" credit="Iapetus · NASA/JPL/Space Science Institute (Cassini, public domain)" zoom={[1.2, 1.35]} />],
  [S(22), <Space shot={orbit(30, 6, 1.4, 0.08, 40)}>{(s) => <>{IapG(s)}{Array.from({ length: 60 }, (_, i) => { const ph = (s * 0.4 + i / 60) % 1; return <mesh key={i} position={[-30 + ph * 26, Math.sin(i * 2.1) * 6, Math.cos(i * 1.3) * 6]}><sphereGeometry args={[0.15, 6, 4]} /><meshBasicMaterial color="#B08A6A" /></mesh>; })}</>}</Space>],
  [S(23), <Loop />],
  [S(25), <Space shot={orbit(24, 2, 3, 0.1, 40)}>{IapG}</Space>],
  [S(26), <Photo src="iapetus.png" credit="Iapetus, equatorial ridge on the edge · NASA/JPL/SSI (public domain)" zoom={[1.5, 1.7]} origin="80% 50%" />],
  [S(28), <Photo src="saturn_hex.jpg" credit="Saturn, July 2013 · NASA/JPL-Caltech/SSI, processed by Kevin Gill (CC BY 2.0)" />],
  [S(29), <Space shot={(s) => ({ pos: V(0.01, 70 - s, 8), look: V(0, 0, 0), fov: 40 })} still>{(s) => <Saturn spin={s * 0.2} tilt={0} />}</Space>],
  [S(31), <Space shot={orbit(90, 30, 2, 0.05, 40)} sun={[100, -40, 0]}>{SatSys}</Space>],
  [S(33), <Photo src="saturn_hex.jpg" credit="Saturn, July 2013 · NASA/JPL-Caltech/SSI, processed by Kevin Gill (CC BY 2.0)" zoom={[1.5, 1.7]} origin="50% 20%" />],
  [S(35), <Space shot={(s) => ({ pos: V(10, 60, 20), look: V(0, 10, 0), fov: 40 })} still>{(s) => <Saturn spin={s * 0.25} tilt={0} />}</Space>],
  [S(36), <Tank />],
  [S(37), <Space shot={orbit(80, -10, 0, 0.05, 40)}>{SatSys}</Space>],
  [S(38), <Photo src="saturn_hex.jpg" credit="Saturn, July 2013 · NASA/JPL-Caltech/SSI, processed by Kevin Gill (CC BY 2.0)" />],
  [S(40), <Photo src="oum_real.jpg" credit="ʻOumuamua (centre dot), William Herschel Telescope, Oct 2017 · A. Fitzsimmons (QUB) / Isaac Newton Group, public domain" />],
  [S(42), <Path />],
  [S(43), <Photo src="oum_art.jpg" credit="ARTIST'S IMPRESSION · ESO/M. Kornmesser (derivative: nagualdesign), CC BY-SA 4.0 · real shape not known" badge="ARTIST'S IMPRESSION" fit="cover" />],
  [S(44), <Space shot={orbit(22, 3, 0, 0.1, 40)}>{OumG}</Space>],
  [S(45), <Path push />],
  [S(47), <Space shot={orbit(24, 4, 1, 0.1, 40)}>{OumG}</Space>],
  [S(48), <Photo src="oum_art.jpg" credit="ARTIST'S IMPRESSION · ESO/M. Kornmesser (deriv. nagualdesign), CC BY-SA 4.0" badge="ARTIST'S IMPRESSION" fit="cover" zoom={[1.2, 1.35]} />],
  [S(50), <Space shot={orbit(22, 3, 2, 0.1, 40)}>{(s) => <Oumuamua t={s} gas={1} />}</Space>],
  [S(52), <Space shot={orbit(40, 8, 3, 0.06, 40)}>{(s) => <Oumuamua t={s} gas={0.6} />}</Space>],
  [S(54), <Space shot={orbit(30, 8, 0.6, 0.06, 40)}>{MarsGlobe}</Space>],
  [S(55), <Mars shot={(s) => ({ pos: V(-14 + s, 4, 12), look: V(0, 2, 0), fov: 45 })} night={() => 0}>{(s) => <RoverM x={0} z={0} t={s} />}</Mars>],
  [S(57), <Mars shot={(s) => ({ pos: V(10, 3, 14 - s * 0.4), look: V(0, 1.5, 0), fov: 45 })} night={() => 0.9}>{(s) => <><RoverM x={0} z={0} t={0} /><Methane t={s} spread={0} /></>}</Mars>],
  [S(59), <Space shot={orbit(30, 10, 2, 0.06, 40)}>{(s) => <><Planet tex="mars" r={10} spin={s * 0.08} /><Orbiter pos={[0, 12, 6]} rot={s * 0.3} /></>}</Space>],
  [S(61), <DayNight />],
  [S(63), <Mars shot={(s) => ({ pos: V(-20 + s, 10, 30), look: V(0, 8, 0), fov: 50 })} night={() => 0}>{(s) => <><RoverM x={0} z={0} t={0} /><Methane t={s} spread={1} /></>}</Mars>],
  [S(64), <Mars shot={(s) => ({ pos: V(12, 3, 14), look: V(0, 1.5, 0), fov: 45 })} night={() => 0.9}>{(s) => <><RoverM x={0} z={0} t={0} /><Methane t={s} spread={0} /></>}</Mars>],
  [S(66), <Photo src="venus.jpg" credit="Venus, Mariner 10, 1974 · NASA/JPL (public domain)" />],
  [S(67), <Space shot={orbit(30, 6, 0, 0.06, 40)}>{VenusG}</Space>],
  [S(69), <Dishes />],
  [S(71), <Space shot={orbit(26, 4, 2, 0.08, 40)}>{VenusG}</Space>],
  [S(72), <Spectrum />],
  [S(74), <Photo src="venus.jpg" credit="Venus, Mariner 10, 1974 · NASA/JPL (public domain)" zoom={[1.2, 1.35]} />],
  [S(77), <Space shot={orbit(140, 30, 0, 0.04, 40)}>{(s) => <><Saturn spin={s * 0.15} pos={[0, 0, -40]} /><Planet tex="mars" r={8} pos={[60, 10, 40]} spin={s * 0.1} /><Planet tex="venus" r={9} pos={[-70, -10, 30]} spin={s * 0.05} /></>}</Space>],
  [S(85), <Space shot={orbit(100, 20, 2, 0.05, 40)}>{SatSys}</Space>],
];
const OVER: [number, number, React.ReactNode][] = [
  [S(0), S(1), <Line text="A face on Mars?" size={84} y={120} />],
  [S(1), S(2), <Stat big="1.5 km" small="wide · Viking 1, July 1976 (NASA)" y={120} />],
  [S(3), S(4), <Line text="Solved · Best guess · Still unknown" size={56} y={120} />],
  [S(4), S(5), <Chapter n={1} title="The face on Mars" />],
  [S(7), S(8), <Src name="face-shadow" y={110} width={1500} />],
  [S(9), S(10), <Line text="“An ancient Martian monument”?" size={70} y={120} />],
  [S(9), S(10), <Sprout pose="shock" x={1480} y={600} />],
  [S(13), S(14), <Src name="face-hill" y={110} width={1000} />],
  [S(14), S(15), <Line text="Pareidolia" sub="seeing faces in random shapes" size={90} y={120} />],
  [S(14), S(15), <Sprout pose="wink" x={1500} y={620} />],
  [S(15), S(16), <Stamp v="SOLVED" note="A hill and a trick of the light." />],
  [S(16), S(17), <Chapter n={2} title="The moon with two faces" />],
  [S(19), S(20), <Line text="Discovered 1671 · Giovanni Cassini" sub="seen on one side of Saturn only (Wikipedia)" size={58} y={120} />],
  [S(21), S(22), <Src name="iap-runaway" y={110} width={1500} />],
  [S(22), S(23), <Src name="iap-dust" y={110} width={1500} />],
  [S(25), S(26), <Line text="“a runaway feedback loop”" sub="John Spencer, Cassini scientist (NASA)" size={66} y={120} />],
  [S(27), S(28), <Stamp v="SOLVED" note="Dust, then a runaway loop of ice and sunlight." />],
  [S(28), S(29), <Chapter n={3} title="Saturn's hexagon" />],
  [S(30), S(31), <Line text="First seen: Voyager, 1980–81" sub="NASA" size={64} y={120} />],
  [S(31), S(32), <Stat big="29 years" small="one Saturn year · each season 7+ years (NASA)" y={120} />],
  [S(33), S(34), <Stat big="30,000 km" small="across · winds ~500 km/h (NASA)" y={120} />],
  [S(34), S(35), <Line text="Eye ~50× a hurricane's" sub="NASA" size={70} y={120} />],
  [S(36), S(37), <Src name="hex-lab" y={110} width={1500} />],
  [S(37), S(38), <Src name="hex-why" y={110} width={1500} />],
  [S(37), S(38), <Sprout pose="think" x={1500} y={620} />],
  [S(39), S(40), <Stamp v="BEST GUESS" note="A jet stream, strangely stable." />],
  [S(40), S(41), <Chapter n={4} title="A visitor from another star" />],
  [S(41), S(42), <Line text="Oct 19, 2017 · Pan-STARRS, Hawaii" sub="Wikipedia" size={62} y={120} />],
  [S(43), S(44), <Line text="ʻOumuamua = “scout”" sub="Hawaiian" size={80} y={120} />],
  [S(44), S(45), <Stat big="~100–1,000 m" small="long, probably very elongated (Wikipedia)" y={120} />],
  [S(47), S(48), <Line text="No coma · no tail" size={90} y={140} />],
  [S(47), S(48), <Sprout pose="shock" x={1500} y={620} />],
  [S(49), S(50), <Line text="2023 · Nature" sub="Jennifer Bergner & Darryl Seligman" size={72} y={120} />],
  [S(51), S(52), <Src name="oum-nature" y={110} width={1500} />],
  [S(53), S(54), <Stamp v="BEST GUESS" note="Probably an icy body releasing hydrogen." />],
  [S(54), S(55), <Chapter n={5} title="Methane on Mars" />],
  [S(57), S(58), <Src name="meth-salt" y={110} width={1500} />],
  [S(58), S(59), <Stat big="~20 ppb" small="sudden spikes (NASA)" y={120} color={RED} />],
  [S(60), S(61), <Src name="meth-shock" y={110} width={1300} />],
  [S(64), S(65), <Line text="Where does it come from?" size={80} y={120} />],
  [S(64), S(65), <Sprout pose="think" x={1500} y={620} />],
  [S(65), S(66), <Stamp v="STILL UNKNOWN" note="The timing makes sense. The source doesn't." />],
  [S(66), S(67), <Chapter n={6} title="A gas in the clouds of Venus" />],
  [S(68), S(69), <Line text="High clouds: closer to Earth-like" sub="temperature and pressure (Wikipedia)" size={62} y={120} />],
  [S(70), S(71), <Line text="Phosphine (PH₃)" sub="on Earth, linked to life (Wikipedia)" size={80} y={120} />],
  [S(72), S(73), <Src name="venus-calib" y={110} width={1500} />],
  [S(73), S(74), <Line text="Sulfur dioxide instead?" size={76} y={120} />],
  [S(75), S(76), <Sprout pose="think" x={1500} y={620} />],
  [S(76), S(77), <Stamp v="STILL UNKNOWN" note="Disputed. Future missions will check." />],
  [S(77), S(84), <Scoreboard />],
  [S(85), S(86), <Line text="NASA images credited on screen · 3D scenes are illustrations" size={42} y={140} />],
  [S(86), END, <Line text="Which one surprised you most?" size={70} sub="tell me in the comments" y={140} />],
  [S(86), END, <Sprout pose="excited" x={1500} y={620} />],
];

export const Cm07Full: React.FC = () => {
  useFonts();
  const f = (s: number) => Math.round(s * FPS);
  const sc = [...SCENES].sort((a, b) => a[0] - b[0]);
  return (
    <AbsoluteFill style={{ background: "#020207" }}>
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
      <Html5Audio src={staticFile("cm07/narration.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
