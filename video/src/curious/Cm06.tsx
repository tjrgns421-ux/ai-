import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm06/narration.words.json";
import LINES from "../../public/cm06/lines.json";
import CAPS from "../../public/cm06/caps/captures.json";
import { Balloon, BloodGlacier, IceStage, Peak, Pyramid, Range, Ray, SeaIce, ShotI, Snowfield, snowY } from "./Ice3D";
import { OceanStage, SURF } from "./Ocean3D";
import { OceanMap, Pin } from "./OceanMap";

// Curious Minutes ep06 "6 Strange Things Found in Antarctica" — list format, a verdict after each.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71", ORG = "#FFB020", CYAN = "#7FE3FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const TL = makeTimeline(words, LINES as string[], [], 75);
export const CM06_FRAMES = TL.duration;
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
// quote card for pages that can't be captured (text copied from the page, source named)
const Quote: React.FC<{ text: React.ReactNode; source: string; y?: number; w?: number; hold?: number }> = ({ text, source, y = 150, w = 1300, hold = 105 }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [hold, hold + 14], [0, 1], { ...cl, easing: ease });
  return (
    <div style={{ position: "absolute", left: (1920 - w) / 2, top: y, width: w, ...useIn() }}>
      <div style={{ background: "#FFFFFF", padding: "30px 40px", borderRadius: 18, border: `5px solid ${INK}`, boxShadow: "0 14px 0 rgba(0,0,0,0.35)", transformOrigin: "100% 0%", transform: `translate(${(1880 - (1920 + w) / 2) * k}px, ${(36 - y) * k}px) scale(${1 - 0.6 * k})` }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 42, lineHeight: 1.35, color: INK }}>{text}</div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: INK, opacity: 0.65, marginTop: 16 }}>Source: {source}</div>
      </div>
    </div>
  );
};
const Hi: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ background: "rgba(255,210,63,0.75)", padding: "0 6px", borderRadius: 6 }}>{children}</span>;
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
          <Img src={staticFile(`cm06/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: c.h * sc, mixBlendMode: "multiply" }} />
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

const Photo: React.FC<{ src: string; credit: string; fit?: "cover" | "contain"; zoom?: [number, number]; origin?: string }> = ({ src, credit, fit = "cover", zoom = [1.02, 1.14], origin = "50% 50%" }) => {
  const lf = useCurrentFrame();
  const k = Math.floor(lf / (CUT * FPS));
  return (
    <AbsoluteFill style={{ background: "#050507" }}>
      <Img src={staticFile(`cm06/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit, transform: `scale(${interpolate(lf % (CUT * FPS), [0, CUT * FPS], [zoom[0] + 0.08 * (k % 2), zoom[1] + 0.08 * (k % 2)], cl)})`, transformOrigin: k % 3 === 0 ? origin : ["30% 40%", "70% 60%"][k % 2] }} />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text="REAL IMAGE" color="#9FE3B0" />
    </AbsoluteFill>
  );
};

// ---------- 3D scenes ----------
const CUT = 4.5;
const vary = (shot: (s: number) => ShotI, s: number): ShotI => {
  const b = shot(s);
  const k = Math.floor(s / CUT) % 3;
  if (k === 0) return b;
  const off = b.pos.clone().sub(b.look);
  if (k === 1) off.applyAxisAngle(V(0, 1, 0), 0.7);
  else off.multiplyScalar(1.45).add(V(0, 20, 0));
  return { ...b, pos: b.look.clone().add(off) };
};
type ShotFn = (s: number) => ShotI;
const Ice: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode; badge?: string; still?: boolean; sky?: string }> = ({ shot, children, badge = "ILLUSTRATION", still, sky }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <IceStage shot={still ? shot(s) : vary(shot, s)} sky={sky}>{children(s)}</IceStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const orbit = (cx: number, cy: number, cz: number, r: number, h: number, a0 = 0, sp = 0.04, fov = 45): ShotFn => (s) => ({ pos: V(cx + Math.sin(a0 + s * sp) * r, cy + h, cz + Math.cos(a0 + s * sp) * r), look: V(cx, cy, cz), fov });
const World: React.FC<{ s: number }> = () => <><Snowfield /><Range /><Pyramid /></>;
const pyrAerial: ShotFn = (s) => ({ pos: V(Math.sin(0.6 + s * 0.03) * 520, 420 - s * 4, Math.cos(0.6 + s * 0.03) * 520), look: V(0, 40, 0), fov: 32 });
const pyrTop: ShotFn = (s) => ({ pos: V(0.01, 700 - s * 12, 0.01), look: V(0, 0, 0), up: V(0, 0, -1), fov: 30 });
const pyrGround: ShotFn = (s) => ({ pos: V(-380 + s * 4, 18, 240), look: V(0, 70, 0), fov: 36 });
const pyrFace: ShotFn = (s) => ({ pos: V(120 - s * 2, 60, 150), look: V(0, 70, 0), fov: 45 });
const camp: ShotFn = (s) => ({ pos: V(-40 + s * 2, 12, 460), look: V(0, 60, 0), fov: 30 });
const Tents: React.FC = () => <>{[-20, 0, 18].map((x, i) => <mesh key={i} position={[x, snowY(x, 400) + 3, 400]}><coneGeometry args={[5, 7, 4]} /><meshStandardMaterial color={["#E8533A", "#F2B33D", "#E8533A"][i]} /></mesh>)}</>;
// freeze-thaw: crack opening on a rock block (2D diagram)
const FreezeThaw: React.FC = () => {
  const lf = useCurrentFrame();
  const cyc = (lf / FPS) % 3;
  const ice = cyc > 1.5;
  const w = 6 + Math.floor(lf / FPS / 3) * 6 + (ice ? 6 : 0);
  return (
    <AbsoluteFill style={{ background: "#0B1622" }}>
      <svg width={1920} height={1080}>
        <rect x={560} y={260} width={800} height={600} fill="#4A4542" rx={20} />
        <path d={`M 960 260 L ${960 - w} 420 L ${960 + w * 0.6} 560 L ${960 - w * 0.4} 700 L 960 860`} fill="none" stroke={ice ? "#BFE9FF" : "#5DA9E9"} strokeWidth={w} strokeLinejoin="round" />
        <text x={960} y={190} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={62} fill={ice ? "#BFE9FF" : "#5DA9E9"}>{ice ? "freezes → expands" : "water gets in"}</text>
        <text x={960} y={960} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={40} fill="#FFFFFF" opacity={0.8}>over and over, for hundreds of millions of years</text>
      </svg>
      <Badge text="ILLUSTRATION · freeze-thaw erosion" />
    </AbsoluteFill>
  );
};
const glacierShot: ShotFn = (s) => ({ pos: V(-60 + s * 2, 14, 120), look: V(0, 10, 0), fov: 40 });
const glacierClose: ShotFn = (s) => ({ pos: V(8, 8, 34 - s * 0.6), look: V(0, 8, 0), fov: 45 });
// under the glacier: radar slice with the brine network (2D)
const RadarSlice: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [6, 60], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ background: "#0B1622" }}>
      <svg width={1920} height={1080}>
        <path d="M 0 300 Q 600 250 1200 320 T 1920 360 L 1920 700 L 0 700 Z" fill="#CFE6F3" />
        <rect x={0} y={700} width={1920} height={380} fill="#4A4542" />
        <path d={`M 200 690 C 500 ${690 - 60 * k} 800 ${700 + 40 * k} 1100 680 S 1500 ${650 - 30 * k} 1780 560`} fill="none" stroke="#B2451F" strokeWidth={18 * k + 2} strokeLinecap="round" />
        <ellipse cx={560} cy={700} rx={230 * k} ry={30 * k} fill="#B2451F" />
        <path d="M 1780 560 L 1800 330" stroke="#B2451F" strokeWidth={14 * k} />
        <text x={560} y={790} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={44} fill="#FFFFFF" opacity={k}>salty, iron-rich lake</text>
        <text x={1780} y={280} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={44} fill={RED} opacity={k}>Blood Falls</text>
        <text x={960} y={250} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={38} fill="#FFFFFF" opacity={0.8}>Taylor Glacier (radar, 2017)</text>
      </svg>
      <Badge text="ILLUSTRATION · based on National Geographic" />
    </AbsoluteFill>
  );
};
const iceTop: ShotFn = (s) => ({ pos: V(0.01, 900 - s * 10, 0.01), look: V(0, 0, 0), up: V(0, 0, -1), fov: 40 });
const iceLow: ShotFn = (s) => ({ pos: V(-300 + s * 6, 60, 260), look: V(0, 0, 0), fov: 42 });
// Maud Rise from below: an underwater mountain, warm salty water rising, salt carried on top
const MaudRise: React.FC<{ step?: "warm" | "salt" }> = ({ step = "warm" }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <OceanStage shot={vary((u) => ({ pos: V(-60 + u * 2, 12, 70), look: V(0, 10, 0), fov: 55 }), s)} t={s}>
        <mesh position={[0, -2, 0]}><coneGeometry args={[40, 26, 40, 6]} /><meshStandardMaterial color="#3A3F44" roughness={1} flatShading /></mesh>
        {Array.from({ length: 60 }, (_, i) => {
          const ph = ((s * 0.25 + i / 60) % 1);
          const a = i * 2.4;
          const warm = step === "warm" || i % 2 === 0;
          const x = warm ? Math.cos(a) * 30 * (1 - ph * 0.5) : -50 + ph * 70;
          const y = warm ? -2 + ph * (SURF + 2) : 14 + Math.sin(i) * 2;
          const z = warm ? Math.sin(a) * 30 * (1 - ph * 0.5) : Math.sin(a) * 10;
          return <mesh key={i} position={[x, y, z]}><sphereGeometry args={[0.7, 8, 6]} /><meshBasicMaterial color={warm ? "#FF9A5A" : "#FFFFFF"} transparent opacity={0.85} /></mesh>;
        })}
      </OceanStage>
      <Badge text="ILLUSTRATION · not to scale" />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 30, color: "#FFFFFF" }}>
        <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 9, background: "#FF9A5A", marginRight: 10 }} />warm, salty deep water
        {step === "salt" && <><span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 9, background: "#FFFFFF", margin: "0 10px 0 30px" }} />salt carried by eddies and Ekman transport</>}
      </div>
    </AbsoluteFill>
  );
};
// Lake Vostok cross-section (2D)
const Vostok: React.FC<{ drill?: boolean }> = ({ drill }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [6, 90], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ background: "#0B1622" }}>
      <svg width={1920} height={1080}>
        <rect x={0} y={150} width={1920} height={560} fill="#CFE6F3" />
        <path d="M 260 700 Q 960 640 1660 700 L 1660 820 Q 960 900 260 820 Z" fill="#1B5E8C" />
        <rect x={0} y={700} width={260} height={380} fill="#4A4542" /><rect x={1660} y={700} width={260} height={380} fill="#4A4542" />
        <path d="M 260 820 Q 960 900 1660 820 L 1920 820 L 1920 1080 L 0 1080 L 0 820 Z" fill="#4A4542" />
        <text x={960} y={430} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={64} fill={INK}>≈ 4 km of ice</text>
        <text x={960} y={770} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={48} fill="#FFFFFF">Lake Vostok · about the size of Lake Ontario</text>
        {drill && <rect x={1320} y={120} width={14} height={30 + 560 * k} fill="#FF6B2A" />}
        {drill && <text x={1350} y={140} fontFamily="Pretendard" fontWeight={900} fontSize={36} fill="#FFFFFF">Russian borehole · Feb 2012</text>}
        <text x={960} y={110} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={36} fill="#FFFFFF" opacity={0.85}>sealed off for maybe ~15 million years (Wikipedia)</text>
      </svg>
      <Badge text="ILLUSTRATION · not to scale" />
    </AbsoluteFill>
  );
};
const balloonShot: ShotFn = (s) => ({ pos: V(-260 + s * 3, 90, 260), look: V(0, 110, 0), fov: 40 });
// ANITA: normal (down from sky, bounce up) vs anomalous (up from below at a steep angle)
const AnitaRays: React.FC<{ weird?: boolean }> = ({ weird }) => {
  const s = useCurrentFrame() / FPS;
  const k = interpolate(s, [0.3, 2.3], [0, 1], cl);
  const k2 = interpolate(s, [2.3, 4], [0, 1], cl);
  return (
    <AbsoluteFill>
      <IceStage shot={{ pos: V(-320, 70, 300), look: V(0, 60, 0), fov: 42 }} sky="#7FB2D6">
        <Snowfield /><Range /><Balloon x={0} y={130} z={0} t={s} />
        {!weird && <><Ray from={[-260, 260, -60]} to={[-40, 0, 0]} k={k} /><Ray from={[-40, 0, 0]} to={[0, 118, 0]} k={k2} /></>}
        {weird && <Ray from={[160, -40, 40]} to={[0, 118, 0]} k={k} color="#FF5A4A" />}
      </IceStage>
      <Badge text={weird ? "ILLUSTRATION · the anomaly" : "ILLUSTRATION · a normal signal"} color={weird ? "#FF8A7A" : YEL} />
    </AbsoluteFill>
  );
};
// a signal coming up through the Earth (2D cross-section)
const ThroughEarth: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [6, 70], [0, 1], { ...cl, easing: ease });
  const x = 960 + 600 * Math.cos(Math.PI * 1.5 - 0.95), y = 1380 + 600 * Math.sin(Math.PI * 1.5 - 0.95);
  return (
    <AbsoluteFill style={{ background: "#08101A" }}>
      <svg width={1920} height={1080}>
        <circle cx={960} cy={1380} r={1100} fill="#5A3A28" />
        <circle cx={960} cy={1380} r={1100} fill="none" stroke="#E8F2F8" strokeWidth={26} />
        <line x1={x} y1={y + 600} x2={960 + (x - 960) * (1 - k) + 0 * k} y2={(y + 600) + (280 - (y + 600)) * k} stroke="#FF5A4A" strokeWidth={10} />
        <circle cx={960} cy={240} r={22} fill="#FFFFFF" />
        <text x={1000} y={230} fontFamily="Pretendard" fontWeight={900} fontSize={40} fill="#FFFFFF">ANITA</text>
        <text x={960} y={760} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={54} fill="#FFFFFF">thousands of km of rock</text>
        <text x={960} y={840} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={38} fill="#FFFFFF" opacity={0.8}>should have absorbed the signal (Penn State)</text>
      </svg>
      <Badge text="ILLUSTRATION · not to scale" />
    </AbsoluteFill>
  );
};
// ---------- maps ----------
const Map: React.FC<{ rot: (s: number) => [number, number]; pins?: Pin[]; scale?: number }> = (p) => (
  <AbsoluteFill>
    <OceanMap {...p} />
    <Badge text="MAP · positions approximate" color="#9FE3B0" />
  </AbsoluteFill>
);
const pan = (a: [number, number], b: [number, number], d = 6) => (s: number): [number, number] => {
  const k = Math.min(1, s / d);
  const e = k * k * (3 - 2 * k);
  return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
};
const ANT: [number, number] = [0, -75];
const P_PYR: Pin = { lon: -81.96, lat: -79.98, label: "the “pyramid”", color: YEL, ring: true };
const P_BLOOD: Pin = { lon: 162.27, lat: -77.72, label: "Blood Falls", color: RED, ring: true, dx: -250 };
const P_MAUD: Pin = { lon: 3, lat: -65, label: "Maud Rise polynya", color: CYAN, ring: true };
const P_VOS: Pin = { lon: 106, lat: -77.5, label: "Lake Vostok", color: "#7FB2FF", ring: true };
const P_AUGER: Pin = { lon: -69.3, lat: -35.2, label: "Pierre Auger Observatory", color: ORG, ring: true, dx: -470 };

// ---------- scoreboard ----------
const Scoreboard: React.FC = () => {
  const lf = useCurrentFrame();
  const rows: [number, string, Verd][] = [[68, "The pyramid", "SOLVED"], [69, "Blood Falls", "SOLVED"], [70, "The hole in the ice", "SOLVED"], [71, "The ice-free map", "SOLVED"], [72, "Life in Lake Vostok", "BEST GUESS"], [73, "Signals from inside the Earth", "STILL UNKNOWN"]];
  const t0 = S(67);
  return (
    <div style={{ position: "absolute", left: 100, top: 130, width: 1500 }}>
      {rows.map(([i, name, v]) => {
        const d = (S(i) - t0) * FPS;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 20, opacity: interpolate(lf, [d, d + 8], [0, 1], cl), transform: `translateX(${interpolate(lf, [d, d + 10], [-30, 0], { ...cl, easing: out })}px)` }}>
            <div style={{ width: 720, fontFamily: "Pretendard", fontWeight: 900, fontSize: 50, color: "#FFFFFF", textShadow: "0 4px 14px rgba(0,0,0,0.85)" }}>{name}</div>
            <div style={{ border: `6px solid ${VCOL[v]}`, color: VCOL[v], borderRadius: 14, padding: "4px 22px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, background: "rgba(10,10,14,0.75)", rotate: "-3deg" }}>{v}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------- the edit ----------------
const W = (s: number) => <World s={s} />;
const SCENES: [number, React.ReactNode][] = [
  [0, <Ice shot={pyrAerial}>{W}</Ice>],
  [S(1), <Ice shot={pyrFace} still>{W}</Ice>],
  [S(2), <Map rot={pan([-40, -60], ANT)} pins={[P_PYR, { ...P_BLOOD, delay: 20 }, { ...P_MAUD, delay: 40 }, { ...P_VOS, delay: 60 }]} />],
  [S(3), <Ice shot={pyrGround}>{W}</Ice>],
  [S(4), <Ice shot={pyrTop} still>{W}</Ice>],
  [S(6), <Ice shot={pyrAerial}>{W}</Ice>],
  [S(7), <Map rot={pan([-60, -60], [-82, -78])} pins={[P_PYR]} scale={900} />],
  [S(8), <Ice shot={pyrGround}>{W}</Ice>],
  [S(9), <Ice shot={camp} still>{(s) => <><World s={s} /><Tents /></>}</Ice>],
  [S(10), <Ice shot={pyrFace}>{W}</Ice>],
  [S(11), <FreezeThaw />],
  [S(12), <Ice shot={pyrAerial}>{W}</Ice>],
  [S(13), <Ice shot={orbit(0, 30, 0, 600, 140, 2, 0.05, 40)} still>{W}</Ice>],
  [S(15), <Photo src="blood.jpg" credit="Blood Falls, Taylor Glacier · Peter Rejcek / U.S. National Science Foundation (public domain)" />],
  [S(16) + 3, <Ice shot={glacierShot}>{(s) => <><Snowfield /><Range /><BloodGlacier t={s} /></>}</Ice>],
  [S(17), <Photo src="blood.jpg" credit="Blood Falls · Peter Rejcek / U.S. National Science Foundation (public domain)" zoom={[1.2, 1.35]} origin="40% 55%" />],
  [S(18), <Ice shot={glacierClose} still>{(s) => <><Snowfield /><BloodGlacier t={s} /></>}</Ice>],
  [S(19), <Ice shot={glacierShot}>{(s) => <><Snowfield /><Range /><BloodGlacier t={s} /></>}</Ice>],
  [S(20), <RadarSlice />],
  [S(22), <Ice shot={glacierClose} still>{(s) => <><Snowfield /><BloodGlacier t={s} flow={interpolate(s, [0, 3], [0.2, 1], cl)} /></>}</Ice>],
  [S(23), <Photo src="blood.jpg" credit="Blood Falls · Peter Rejcek / U.S. National Science Foundation (public domain)" />],
  [S(25), <Ice shot={iceTop} sky="#16314A" still>{(s) => <SeaIce open={0} t={s} />}</Ice>],
  [S(27), <Ice shot={iceLow} sky="#8CB8D6">{(s) => <SeaIce open={0.05} t={s} />}</Ice>],
  [S(28), <Ice shot={iceTop} sky="#16314A" still>{(s) => <SeaIce open={interpolate(s, [0, 5], [0.05, 1], cl)} t={s} />}</Ice>],
  [S(29), <Map rot={pan([20, -50], [3, -65])} pins={[P_MAUD]} scale={760} />],
  [S(30), <Ice shot={iceLow} sky="#8CB8D6">{(s) => <SeaIce open={1} t={s} />}</Ice>],
  [S(31), <Ice shot={iceTop} sky="#16314A">{(s) => <SeaIce open={0.8} t={s} />}</Ice>],
  [S(32), <MaudRise step="warm" />],
  [S(34), <Ice shot={iceTop} sky="#16314A" still>{(s) => <SeaIce open={1} t={s} />}</Ice>],
  [S(35), <MaudRise step="salt" />],
  [S(37), <Ice shot={iceLow} sky="#8CB8D6">{(s) => <SeaIce open={1} t={s} />}</Ice>],
  [S(38), <Photo src="piri.jpg" credit="Piri Reis map (1513), Topkapı Palace Library · public domain" fit="contain" />],
  [S(40), <Photo src="piri.jpg" credit="Piri Reis map (1513) · public domain" zoom={[1.6, 1.8]} origin="45% 92%" />],
  [S(41), <Map rot={pan([-40, -20], [-50, -45])} pins={[{ lon: -43, lat: -23, label: "Rio de Janeiro", color: YEL }, { lon: 0, lat: -72, label: "Queen Maud Land (Antarctica)", color: CYAN, delay: 40 }]} scale={520} />],
  [S(42), <Photo src="piri.jpg" credit="Piri Reis map (1513) · public domain" fit="contain" zoom={[1, 1.08]} />],
  [S(43), <Photo src="piri.jpg" credit="Piri Reis map (1513) · public domain" zoom={[1.5, 1.7]} origin="40% 85%" />],
  [S(44), <Photo src="piri.jpg" credit="Piri Reis map (1513) · public domain" fit="contain" />],
  [S(46), <Map rot={pan([60, -60], [106, -77])} pins={[P_VOS]} scale={760} />],
  [S(47), <Vostok />],
  [S(49), <Ice shot={orbit(0, 0, 0, 500, 160, 0.4, 0.04, 40)}>{() => <><Snowfield /><Range /></>}</Ice>],
  [S(50), <Vostok drill />],
  [S(52), <Ice shot={(s) => ({ pos: V(-30 + s, 8, 40), look: V(0, 4, 0), fov: 45 })} still>{() => <><Snowfield /><mesh position={[0, 8, 0]}><cylinderGeometry args={[0.6, 0.6, 16, 10]} /><meshStandardMaterial color="#FF6B2A" /></mesh><mesh position={[0, 1, 0]}><boxGeometry args={[14, 2, 10]} /><meshStandardMaterial color="#8A8F96" /></mesh></>}</Ice>],
  [S(54), <Vostok drill />],
  [S(56), <Ice shot={balloonShot} sky="#7FB2D6">{(s) => <><Snowfield /><Range /><Balloon y={130} t={s} /></>}</Ice>],
  [S(57), <Photo src="anita.jpg" credit="ANITA-IV before launch · Drummermean, CC BY-SA 4.0 (Wikimedia Commons)" />],
  [S(58), <Ice shot={(s) => ({ pos: V(30, 140, 50), look: V(0, 120, 0), fov: 45 })} sky="#7FB2D6">{(s) => <><Snowfield /><Balloon y={130} t={s} /></>}</Ice>],
  [S(59), <AnitaRays />],
  [S(59) + 4.5, <AnitaRays weird />],
  [S(60), <ThroughEarth />],
  [S(61), <AnitaRays weird />],
  [S(62), <Map rot={pan([-80, -60], [-69, -35])} pins={[P_AUGER]} scale={700} />],
  [S(64), <Ice shot={balloonShot} sky="#7FB2D6">{(s) => <><Snowfield /><Range /><Balloon y={130} t={s} /></>}</Ice>],
  [S(67), <Ice shot={pyrAerial}>{W}</Ice>],
  [S(74), <Ice shot={orbit(0, 30, 0, 700, 200, 1, 0.04, 40)}>{W}</Ice>],
];
const OVER: [number, number, React.ReactNode][] = [
  [S(0), S(1), <Line text="A pyramid in Antarctica?" size={84} y={120} />],
  [S(1), S(2), <Stat big="1,265 m" small="four steep sides (Live Science)" y={120} />],
  [S(3), S(4), <Line text="Solved · Best guess · Still unknown" size={56} y={120} />],
  [S(4), S(5), <Chapter n={1} title="The pyramid" />],
  [S(6), S(7), <Line text="Lost civilization? Aliens?" size={76} y={120} />],
  [S(6), S(7), <Sprout pose="shock" x={1480} y={600} />],
  [S(8), S(9), <Stat big="1,265 m" small="about one-fifth of Denali (Live Science)" y={120} />],
  [S(9), S(10), <Src name="pyr-camp" y={110} />],
  [S(10), S(11), <Src name="pyr-erosion" y={110} />],
  [S(12), S(14), <Src name="pyr-rignot" y={110} />],
  [S(14), S(15), <Stamp v="SOLVED" note="It's a mountain." />],
  [S(15), S(16), <Chapter n={2} title="The waterfall of blood" />],
  [S(17), S(18), <Src name="blood-algae" y={110} width={1500} />],
  [S(18), S(19), <Stat big="−17 °C" small="average temperature there (National Geographic)" y={120} />],
  [S(18), S(19), <Sprout pose="think" x={1500} y={620} />],
  [S(20), S(21), <Src name="blood-brine" y={110} width={1500} />],
  [S(22), S(23), <Line text="iron + oxygen → red" sub="the same reaction as rust" size={72} y={120} />],
  [S(23), S(24), <Src name="blood-coldest" y={110} width={1500} />],
  [S(24), S(25), <Stamp v="SOLVED" note="Salty, iron-rich water, rusting in the air." />],
  [S(25), S(26), <Chapter n={3} title="The hole in the ice" />],
  [S(26), S(27), <Line text="Sea ice ≈ 2× the continental U.S." sub="University of Southampton" size={62} y={120} />],
  [S(28), S(29), <Line text="Far out at sea · 2016 and 2017" size={66} y={120} />],
  [S(29), S(30), <Src name="poly-wales" y={110} width={900} />],
  [S(31), S(32), <Line text="Seen in the 1970s · then only rarely" sub="University of Southampton" size={60} y={120} />],
  [S(33), S(34), <Src name="poly-salt" y={110} width={1500} />],
  [S(33), S(34), <Sprout pose="think" x={1500} y={620} />],
  [S(34), S(35), <Line text="2024 · Science Advances" sub="Southampton · Gothenburg · UC San Diego" size={66} y={120} />],
  [S(36), S(37), <Src name="poly-ekman" y={110} width={1500} />],
  [S(37), S(38), <Stamp v="SOLVED" note="Wind, currents, and an underwater mountain." />],
  [S(38), S(39), <Chapter n={4} title="The ice-free map" />],
  [S(40), S(41), <Line text="Charles Hapgood · 1960s" sub="claimed: Antarctica's coast, without ice" size={62} y={120} />],
  [S(42), S(43), <Line text="Built from older maps" sub="incl. one by Columbus (Wikipedia)" size={66} y={120} />],
  [S(44), S(45), <Src name="piri-mcintosh" y={110} />],
  [S(45), S(46), <Stamp v="SOLVED" note="An early map of South America." />],
  [S(46), S(47), <Chapter n={5} title="The lake under the ice" />],
  [S(49), S(50), <Line text="Anything alive down there?" size={76} y={120} />],
  [S(49), S(50), <Sprout pose="think" x={1500} y={620} />],
  [S(51), S(52), <Line text="Microbes in the ice above the lake" sub="first reported in 1999 (Wikipedia)" size={60} y={120} />],
  [S(52), S(53), <Src name="vost-claim" y={110} width={1500} />],
  [S(53), S(54), <Src name="vost-doubt" y={110} width={1300} />],
  [S(54), S(55), <Src name="vost-time" y={110} width={1500} />],
  [S(55), S(56), <Stamp v="BEST GUESS" note="Probably microbes. Bigger claims unproven." />],
  [S(56), S(57), <Chapter n={6} title="Signals from inside the Earth" />],
  [S(57), S(58), <Stat big="≈ 37 km" small="balloon altitude (Wikipedia)" y={120} />],
  [S(59), S(60), <Src name="anita-below" y={110} width={1300} />],
  [S(60), S(61), <Src name="anita-30" y={110} width={1300} />],
  [S(61), S(62), <Sprout pose="shock" x={1500} y={620} />],
  [S(62), S(63), <Stat big="15 years" small="of Pierre Auger data · Phys. Rev. Lett. (2025)" y={120} />],
  [S(63), S(64), <Line text="It didn't." size={110} y={160} />],
  [S(64), S(65), <Src name="anita-noexpl" y={110} width={1300} />],
  [S(65), S(66), <Line text="Next: PUEO" sub="a new balloon experiment (Penn State)" size={70} y={120} />],
  [S(66), S(67), <Stamp v="STILL UNKNOWN" />],
  [S(67), S(75), <Scoreboard />],
  [S(75), S(76), <Line text="3D scenes are illustrations · photos credited on screen" size={44} y={140} />],
  [S(76), END, <Line text="Which one surprised you most?" size={70} sub="tell me in the comments" y={140} />],
  [S(76), END, <Sprout pose="excited" x={1500} y={620} />],
];

export const Cm06Full: React.FC = () => {
  useFonts();
  const f = (s: number) => Math.round(s * FPS);
  const sc = [...SCENES].sort((a, b) => a[0] - b[0]);
  return (
    <AbsoluteFill style={{ background: "#08101A" }}>
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
      <Html5Audio src={staticFile("cm06/narration.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
