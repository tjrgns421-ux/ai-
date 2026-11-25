import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm04/narration.words.json";
import LINES from "../../public/cm04/lines.json";
import CAPS from "../../public/cm04/caps/captures.json";
import { HutRock, Magnetotail, Rover, Shot4, Stage4, Surface, groundY } from "./Moon3D";
import { Globe2D } from "./Globe2D";

// Curious Minutes ep04 "6 Strange Things Found on the Moon" — list format, a verdict stamp after each mystery.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71", ORG = "#FFB020";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const TL = makeTimeline(words, LINES as string[], [], 75);
export const CM04_FRAMES = TL.duration;
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
          <Img src={staticFile(`cm04/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: c.h * sc, mixBlendMode: "multiply" }} />
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: INK, opacity: 0.65, marginTop: 16 }}>Source: {c.source}</div>
      </div>
    </div>
  );
};
const Sprout: React.FC<{ pose: string; x?: number; y?: number; size?: number }> = ({ pose, x = 1500, y = 640, size = 280 }) => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x, top: y + interpolate(lf, [0, 5, 10, 14], [60, -26, 6, 0], cl) + Math.sin(s * 1.3) * 10, width: size, height: size, opacity: interpolate(lf, [0, 4], [0, 1], cl), transform: `rotate(${Math.sin(s * 0.9) * 6}deg)`, filter: "drop-shadow(0 0 24px rgba(255,190,110,0.35))" }} />;
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
const Photo: React.FC<{ src: string; credit: string; fit?: "cover" | "contain"; zoom?: [number, number] }> = ({ src, credit, fit = "contain", zoom = [1.02, 1.12] }) => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#050507" }}>
      <Img src={staticFile(`cm04/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit, transform: `scale(${interpolate(lf % (CUT * FPS), [0, CUT * FPS], [zoom[0] + 0.08 * (Math.floor(lf / (CUT * FPS)) % 2), zoom[1] + 0.08 * (Math.floor(lf / (CUT * FPS)) % 2)], cl)})`, transformOrigin: ["50% 50%", "30% 40%", "70% 60%"][Math.floor(lf / (CUT * FPS)) % 3] }} />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text="REAL IMAGE" color="#9FE3B0" />
    </AbsoluteFill>
  );
};

// ---------- 3D scenes ----------
const CUT = 4.5; // seconds per camera angle inside a scene
// every CUT seconds, swing the camera around what it looks at, or pull back for a wide view
const vary = (shot: (s: number) => Shot4, s: number): Shot4 => {
  const b = shot(s);
  const k = Math.floor(s / CUT) % 3;
  if (k === 0) return b;
  const off = b.pos.clone().sub(b.look);
  if (k === 1) off.applyAxisAngle(V(0, 1, 0), 0.9);
  else off.multiplyScalar(1.7).add(V(0, 3, 0));
  return { ...b, pos: b.look.clone().add(off) };
};
type ShotFn = (s: number) => Shot4;
const STARS2 = Array.from({ length: 260 }, (_, i) => [((Math.sin(i * 91.7) * 0.5 + 0.5) * 1920), ((Math.sin(i * 47.3 + 1) * 0.5 + 0.5) * 1080), 1 + (i % 3)]);
const Globe: React.FC<{ rot: (s: number) => number; dist?: (s: number) => number; side?: number; badge?: string }> = ({ rot, dist = () => 34, side = 0, badge = "NASA LRO MAP" }) => {
  const s = useCurrentFrame() / FPS;
  const d = dist(s);
  const k = Math.floor(s / CUT) % 4;
  // shots: centred, offset left, offset right, close-up
  const size = (760 * 34) / d * [1, 0.92, 0.92, 1.45][k];
  const cx = 960 + side * 40 + [0, -330, 330, 0][k];
  const cy = 540 + [0, 20, -20, 120][k];
  return (
    <AbsoluteFill style={{ background: "#020205" }}>
      {STARS2.map(([x, y, r], i) => <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: r, background: "#FFFFFF", opacity: 0.55 }} />)}
      <Globe2D rotY={rot(s)} size={size} cx={cx} cy={cy} tilt={[0, 0.08, -0.06, 0.12][k]} />
      <Badge text={badge} color="#9FE3B0" />
    </AbsoluteFill>
  );
};
const SurfaceScene: React.FC<{ shot: ShotFn; hut?: "far" | "close" | "none"; rover?: (s: number) => [number, number, number]; glass?: boolean; children?: React.ReactNode }> = ({ shot, hut = "none", rover, glass, children }) => {
  const s = useCurrentFrame() / FPS;
  const r = rover?.(s);
  return (
    <AbsoluteFill>
      <Stage4 shot={vary(shot, s)}>
        <Surface glass={glass} />
        {hut !== "none" && <HutRock x={22} z={-3} close={hut === "close"} />}
        {r && <Rover x={r[0]} z={r[1]} heading={r[2]} t={s} />}
        {children}
      </Stage4>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const gy = (x: number, z: number, h: number) => groundY(x, z) + h;
const approach: ShotFn = (s) => ({ pos: V(-9 + s * 0.3, gy(-6, 0, 2.2), 4), look: V(22, gy(22, -3, 1.2), -3), fov: 26 - s * 0.4 });
const topDown: ShotFn = (s) => ({ pos: V(8, 60 - s * 1.2, 0.01), look: V(8, 0, 0), up: V(0, 0, -1), fov: 40 });
const drive: ShotFn = (s) => { const x = -6 + s * 2.4; return { pos: V(x - 7, gy(x - 7, 3, 3), 4), look: V(x + 6, gy(x + 6, 0, 0.6), -1), fov: 45 }; };
const closeRock: ShotFn = (s) => ({ pos: V(19.6 - s * 0.05, gy(19.6, -1.2, 1.1), -1.2 + s * 0.08), look: V(22.3, gy(22.3, -3, 0.4), -3), fov: 35 });
const craterShot: ShotFn = (s) => ({ pos: V(Math.sin(0.4 + s * 0.05) * 7, gy(0, 0, 3.2), Math.cos(0.4 + s * 0.05) * 7), look: V(0, gy(0, 0, 0), 0), fov: 40 });

// impact of the lunar module's ascent stage, seen from the seismometer site
const Impact: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const hitAt = 2.2;
  const k = Math.min(1, s / hitAt);
  const P = V(30, groundY(30, -10), -10);
  const pos = V(P.x - 40 * (1 - k), P.y + 30 * (1 - k), P.z);
  const flash = s > hitAt ? Math.max(0, 1 - (s - hitAt) * 1.2) : 0;
  const ring = s > hitAt ? (s - hitAt) * 8 : 0;
  return (
    <AbsoluteFill>
      <Stage4 shot={{ pos: V(-4, gy(-4, 2, 2.4), 2), look: V(30, gy(30, -10, 2), -10), fov: 40 }}>
        <Surface />
        <mesh position={[-1, groundY(-1, 0) + 0.4, 0]}><cylinderGeometry args={[0.35, 0.45, 0.7, 16]} /><meshStandardMaterial color="#D8D8D8" metalness={0.6} roughness={0.3} /></mesh>
        {s < hitAt && <mesh position={pos} rotation={[0.3, 0, 0.6]}><boxGeometry args={[1.6, 1.2, 1.6]} /><meshStandardMaterial color="#C9A24B" metalness={0.7} roughness={0.35} /></mesh>}
        {flash > 0 && <mesh position={[P.x, P.y + 1, P.z]}><sphereGeometry args={[2 + (1 - flash) * 6, 24, 18]} /><meshBasicMaterial color="#FFF2C8" transparent opacity={flash} /></mesh>}
        {ring > 0 && <mesh position={[P.x, P.y + 0.3, P.z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[ring, ring + 0.6, 64]} /><meshBasicMaterial color="#D9CDB8" transparent opacity={Math.max(0, 0.7 - ring * 0.02)} /></mesh>}
      </Stage4>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
// seismograph: a quick fade on Earth vs a long ring on the Moon
const Seismo: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [0, 150], [0, 1], cl);
  const trace = (len: number, decay: number, build: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 600 * k; i++) {
      const t = i / 600;
      const env = t < build ? t / build : Math.exp(-(t - build) / decay);
      pts.push(`${i * 2.6},${Math.sin(i * 0.9) * Math.sin(i * 0.23 + 1) * 70 * env * (t < len ? 1 : 0)}`);
    }
    return pts.join(" ");
  };
  return (
    <AbsoluteFill style={{ background: "#0B0D14" }}>
      <svg width={1920} height={1080}>
        {[["EARTH (typical)", 340, trace(0.25, 0.03, 0.01), "#4FA3FF"], ["MOON · Apollo 12, 1969", 680, trace(1, 0.45, 0.13), YEL]].map(([label, y, d, c]) => (
          <g key={label as string} transform={`translate(200 ${y})`}>
            <line x1={0} y1={0} x2={1560} y2={0} stroke="#2A2F40" strokeWidth={2} />
            <polyline points={d as string} fill="none" stroke={c as string} strokeWidth={3} />
            <text x={0} y={-110} fontFamily="Pretendard" fontWeight={900} fontSize={40} fill="#FFFFFF">{label}</text>
          </g>
        ))}
        <text x={1760} y={760} textAnchor="end" fontFamily="Pretendard" fontWeight={900} fontSize={44} fill={YEL} opacity={k}>over 55 minutes</text>
      </svg>
      <Badge text="ILLUSTRATION · shape, not data" />
    </AbsoluteFill>
  );
};
const Tail: React.FC<{ close?: boolean }> = ({ close }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <Stage4 shot={(close ? 1 : 0) + Math.floor(s / CUT) % 2 === 1 ? { pos: V(18, 6, 18), look: V(24, 0, 8), fov: 40 } : { pos: V(10, 22 - (s % CUT) * 0.3, 40), look: V(14, 0, 4), fov: 45 }} sun={[-80, 10, 0]}>
        <Magnetotail t={s} moonAngle={0.35} />
      </Stage4>
      <Badge text="ILLUSTRATION · not to scale" />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: "#FFFFFF" }}>
        <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 9, background: "#FF6B5E", marginRight: 10 }} />oxygen from Earth's upper atmosphere
      </div>
    </AbsoluteFill>
  );
};
// a magnetic bubble deflecting the solar wind (2D diagram)
const Bubble: React.FC = () => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0B0D14" }}>
      <svg width={1920} height={1080}>
        <rect x={0} y={780} width={1920} height={300} fill="#5E5A54" />
        <rect x={760} y={780} width={400} height={20} fill="#D9D4CA" />
        <path d="M 640 790 Q 960 430 1280 790" fill="rgba(127,184,255,0.12)" stroke="#7FB8FF" strokeWidth={4} strokeDasharray="12 10" />
        {Array.from({ length: 18 }, (_, i) => {
          const x0 = 200 + i * 85, ph = ((lf * 6 + i * 40) % 700) / 700;
          const inside = x0 > 640 && x0 < 1280;
          const x = inside ? x0 + (x0 < 960 ? -1 : 1) * ph * 260 * Math.max(0, ph - 0.45) : x0;
          const y = 60 + ph * (inside ? 560 : 720);
          return <circle key={i} cx={x} cy={y} r={8} fill={YEL} opacity={0.9} />;
        })}
        <text x={960} y={860} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={40} fill={INK}>stays bright</text>
        <text x={420} y={860} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={36} fill="#FFFFFF">darkens</text>
        <text x={1500} y={860} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={36} fill="#FFFFFF">darkens</text>
        <text x={960} y={560} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={34} fill="#7FB8FF">magnetic patch</text>
        <text x={1740} y={170} textAnchor="end" fontFamily="Pretendard" fontWeight={800} fontSize={34} fill={YEL}>solar wind ↓</text>
      </svg>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const Crust: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [6, 30], [0, 1], { ...cl, easing: out });
  return (
    <AbsoluteFill style={{ background: "#0B0D14" }}>
      <svg width={1920} height={1080}>
        <circle cx={960} cy={540} r={330} fill="#5A3A28" />
        <path d={`M 630 540 A 330 330 0 0 1 1290 540`} fill="none" stroke="#B8B2A7" strokeWidth={40 + 60 * k} />
        <path d={`M 630 540 A 330 330 0 0 0 1290 540`} fill="none" stroke="#B8B2A7" strokeWidth={40} />
        <text x={960} y={140} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={46} fill="#FFFFFF">far side: thicker crust</text>
        <text x={960} y={965} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={40} fill="#FFFFFF">near side (faces Earth): thinner crust, lava seas</text>
      </svg>
      <Badge text="ILLUSTRATION · not to scale" />
    </AbsoluteFill>
  );
};
const Scoreboard: React.FC = () => {
  const lf = useCurrentFrame();
  const rows: [number, string, Verd][] = [[89, "The hut", "SOLVED"], [90, "The gel", "SOLVED"], [91, "The ringing Moon", "SOLVED"], [92, "The rust", "BEST GUESS"], [93, "The swirls", "BEST GUESS"], [94, "The two faces", "STILL UNKNOWN"]];
  const t0 = S(88);
  return (
    <div style={{ position: "absolute", left: 140, top: 130, width: 1100 }}>
      {rows.map(([i, name, v]) => {
        const d = (S(i) - t0) * FPS;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 20, opacity: interpolate(lf, [d, d + 8], [0, 1], cl), transform: `translateX(${interpolate(lf, [d, d + 10], [-30, 0], { ...cl, easing: out })}px)` }}>
            <div style={{ width: 480, fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: "#FFFFFF", textShadow: "0 4px 14px rgba(0,0,0,0.7)" }}>{name}</div>
            <div style={{ border: `6px solid ${VCOL[v]}`, color: VCOL[v], borderRadius: 14, padding: "4px 22px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, background: "rgba(10,10,14,0.7)", rotate: "-3deg" }}>{v}</div>
          </div>
        );
      })}
    </div>
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

const spin = (a: number, sp = 0.06) => (s: number) => a + s * sp;
const roverAt = (x: number, z: number, h: number) => () => [x, z, h] as [number, number, number];
const rolling = (s: number) => [-6 + s * 2.4, 0, 0.05] as [number, number, number];

// ---------------- the edit ----------------
const SCENES: [number, React.ReactNode][] = [
  [0, <SurfaceScene shot={approach} hut="far" rover={roverAt(-5, 1, 0.3)} />],
  [S(1), <SurfaceScene shot={drive} hut="far" rover={rolling} />],
  [S(2), <Globe rot={spin(0)} dist={(s) => 40 - s} />],
  [S(4), <SurfaceScene shot={topDown} hut="far" rover={roverAt(-5, 1, 0.3)} />],
  [S(5), <Globe rot={(s) => interpolate(s, [0, 6], [0, Math.PI], { ...cl, easing: ease })} />],
  [S(7), <SurfaceScene shot={approach} hut="far" rover={roverAt(-5, 1, 0.3)} />],
  [S(9), <SurfaceScene shot={(s) => ({ pos: V(10, gy(10, 2, 0.6), 2), look: V(22, gy(22, -3, 1.5), -3), fov: 30 + s })} hut="far" />],
  [S(11), <SurfaceScene shot={craterShot} hut="far" rover={roverAt(-5, 1, 0.3)} />],
  [S(12), <SurfaceScene shot={topDown} hut="far" rover={roverAt(-5, 1, 0.3)} />],
  [S(13), <SurfaceScene shot={drive} hut="far" rover={rolling} />],
  [S(15), <SurfaceScene shot={closeRock} hut="close" rover={roverAt(18, 0, 0.2)} />],
  [S(19), <Globe rot={spin(2.6, 0.05)} dist={() => 30} />],
  [S(21), <SurfaceScene shot={craterShot} glass rover={roverAt(4, 4, 2.2)} />],
  [S(25), <SurfaceScene shot={(s) => ({ pos: V(4.2, gy(0, 0, 2.6), 4.2), look: V(0, gy(0, 0, 0), 0), fov: 34 - s * 0.3 })} glass />],
  [S(28), <SurfaceScene shot={craterShot} glass rover={roverAt(4, 4, 2.2)} />],
  [S(30), <Impact />],
  [S(31), <SurfaceScene shot={(s) => ({ pos: V(3.4, gy(0, 0, 1.9), 3.0), look: V(0, gy(0, 0, 0.1), 0), fov: 32 - s * 0.3 })} glass />],
  [S(34), <SurfaceScene shot={craterShot} glass />],
  [S(37), <SurfaceScene shot={(s) => ({ pos: V(-8, gy(-8, 4, 2.5), 4), look: V(0, gy(0, 0, 0.5), 0), fov: 40 - s * 0.3 })}><mesh position={[-1, groundY(-1, 0) + 0.4, 0]}><cylinderGeometry args={[0.35, 0.45, 0.7, 16]} /><meshStandardMaterial color="#D8D8D8" metalness={0.6} roughness={0.3} /></mesh></SurfaceScene>],
  [S(39), <Impact />],
  [S(41), <Seismo />],
  [S(44), <Globe rot={spin(0.4)} dist={() => 26} />],
  [S(46), <Seismo />],
  [S(48), <Globe rot={spin(0.6)} />],
  [S(50), <Globe rot={spin(1.2)} dist={(s) => 34 - s * 0.5} />],
  [S(52), <Photo src="m3water.jpg" credit="Moon Mineralogy Mapper on Chandrayaan-1 · ISRO/NASA/JPL-Caltech/Brown University/USGS" />],
  [S(55), <Globe rot={spin(0.2)} />],
  [S(57), <Tail />],
  [S(60), <Tail close />],
  [S(61), <Globe rot={(s) => interpolate(s, [0, 5], [0, Math.PI], { ...cl, easing: ease })} />],
  [S(62), <Tail />],
  [S(64), <Globe rot={() => -1.03} dist={(s) => 34 - s * 1.2} side={-4} />],
  [S(66), <Photo src="reiner_crop.jpg" credit="Reiner Gamma, cropped from NASA LRO color map (CGI Moon Kit, NASA SVS 4720)" fit="cover" zoom={[1, 1.25]} />],
  [S(69), <Bubble />],
  [S(71), <Photo src="reiner_crop.jpg" credit="Reiner Gamma, cropped from NASA LRO color map (CGI Moon Kit, NASA SVS 4720)" fit="cover" zoom={[1.25, 1.4]} />],
  [S(73), <Globe rot={spin(0, 0.04)} />],
  [S(76), <Globe rot={(s) => interpolate(s, [0, 8], [0, Math.PI], { ...cl, easing: ease })} />],
  [S(78), <Photo src="luna3.jpg" credit="First image of the Moon's far side, Luna 3, 7 October 1959 (public domain)" />],
  [S(80), <Globe rot={spin(Math.PI, 0.04)} />],
  [S(81), <Globe rot={spin(2.85, 0.05)} dist={() => 33} />],
  [S(83), <Crust />],
  [S(85), <Globe rot={spin(Math.PI + 0.4, 0.04)} />],
  [S(88), <Globe rot={spin(0, 0.08)} dist={() => 40} side={8} />],
  [S(96), <Globe rot={spin(0.5, 0.05)} />],
];
const OVER: [number, number, React.ReactNode][] = [
  [S(0), S(1), <Line text="A hut on the Moon?" size={84} y={120} />],
  [S(3), S(4), <Line text="Solved · Best guess · Still unknown" size={56} y={120} />],
  [S(4), S(5), <Chapter n={1} title="The hut" />],
  [S(6), S(7), <Line text="Chang'e 4 · January 2019" sub="first soft landing on the far side (Live Science)" size={56} />],
  [S(8), S(9), <Src name="hut-joke" />],
  [S(11), S(12), <Src name="hut-stooke" width={900} />],
  [S(14), S(15), <Stat big="≈ 1 month" small="to drive to the 'hut' (Live Science)" />],
  [S(16), S(17), <Src name="hut-small" />],
  [S(18), S(19), <Src name="hut-rabbit" />],
  [S(17), S(19), <Sprout pose="wink" x={1520} y={620} />],
  [S(19), S(20), <Src name="hut-38m" />],
  [S(20), S(21), <Stamp v="SOLVED" note="It was a rock." />],
  [S(21), S(22), <Chapter n={2} title="The gel" />],
  [S(24), S(25), <Src name="gel-word" />],
  [S(29), S(30), <Src name="gel-breccia" />],
  [S(31), S(33), <Line text="Like Apollo samples 15466 and 70019" sub="Space.com, on Gou Sheng et al. (2020)" size={54} />],
  [S(34), S(35), <Src name="gel-notdef" width={900} />],
  [S(36), S(37), <Stamp v="SOLVED" note="Rock and glass from an old impact." />],
  [S(37), S(38), <Chapter n={3} title="The Moon that rang" />],
  [S(40), S(41), <Src name="bell-55" y={720} />],
  [S(43), S(44), <Src name="bell-hour" />],
  [S(45), S(46), <Line text="Hollow? No." size={96} />],
  [S(46), S(48), <Src name="quake-damp" y={120} />],
  [S(48), S(49), <Stamp v="SOLVED" note="Not hollow. It just doesn't calm down." />],
  [S(49), S(50), <Chapter n={4} title="The Moon is rusting" />],
  [S(51), S(52), <Src name="rust-puzzle" />],
  [S(54), S(55), <Src name="rust-believe" />],
  [S(56), S(57), <Sprout pose="think" x={1500} y={620} />],
  [S(58), S(59), <Src name="rust-tail" y={110} />],
  [S(59), S(60), <Src name="rust-near" y={110} />],
  [S(60), S(61), <Stat big="> 99%" small="of the solar wind blocked at full Moon (NASA/JPL)" />],
  [S(61), S(62), <Src name="rust-far" y={110} />],
  [S(63), S(64), <Stamp v="BEST GUESS" note="Oxygen from Earth." />],
  [S(64), S(65), <Chapter n={5} title="The swirls" />],
  [S(69), S(70), <Src name="swirl-tan" y={110} />],
  [S(71), S(72), <Src name="swirl-lines" width={1000} />],
  [S(72), S(73), <Stamp v="BEST GUESS" note="Magnetic sunscreen." />],
  [S(73), S(74), <Chapter n={6} title="Two faces" />],
  [S(76), S(77), <Src name="far-82" />],
  [S(77), S(78), <Line text="Not dark. Just unseen." size={70} sub="every place on the Moon gets two weeks of sunlight (Wikipedia)" />],
  [S(81), S(82), <Src name="far-1pct" />],
  [S(84), S(85), <Src name="far-heat" />],
  [S(85), S(87), <Src name="far-change6" />],
  [S(87), S(88), <Stamp v="STILL UNKNOWN" note="Good ideas, no final answer." />],
  [S(88), S(96), <Scoreboard />],
  [S(96), S(97), <Line text="NASA images credited on screen · rover scenes are 3D illustrations" size={40} />],
  [S(97), END, <Line text="Which one surprised you most?" size={70} sub="tell me in the comments" />],
  [S(97), END, <Sprout pose="excited" x={1500} y={620} />],
];

export const Cm04Full: React.FC = () => {
  useFonts();
  const f = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: "#020205" }}>
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
      <Html5Audio src={staticFile("cm04/narration.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
