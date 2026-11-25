import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm05/words.full.json";
import LINES from "../../public/cm05/lines.json";
import CLIPS from "../../public/cm05/clips.json";
import ENV from "../../public/cm05/env.json";
import CAPS from "../../public/cm05/caps/captures.json";
import { Hydrophone, Iceberg, OceanStage, SURF, SeaStage, ShotO, SoundShells, Submarine, Volcano, Whale, floorY } from "./Ocean3D";
import { OceanMap, Pin } from "./OceanMap";

// Curious Minutes ep05 "6 Strange Sounds Recorded in the Ocean" — list format, real NOAA recordings, a verdict after each.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71", ORG = "#FFB020", CYAN = "#7FE3FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const TL = makeTimeline(words, LINES as string[], [], 75);
export const CM05_FRAMES = TL.duration;
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
type Clip = { line: number; file: string; at: number; dur: number };
const CL = CLIPS as Clip[];
const clipAfter = (line: number) => CL.find((c) => c.line === line)!;

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
          <Img src={staticFile(`cm05/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: c.h * sc, mixBlendMode: "multiply" }} />
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

// ---------- real recording player: spectrogram made from the NOAA file + moving playhead ----------
const SPEED: Record<string, string> = {
  "bloop.wav": "sped up 16×", "julia_sound.wav": "sped up 16×", "noise97139.wav": "sped up 16×", "whistle16x.wav": "sped up 16×",
  "upsweep20x.wav": "sped up 20×", "ak52_10x.wav": "sped up 10×", "bioduck_clip.wav": "real speed",
};
const NAME: Record<string, string> = {
  "bloop.wav": "“Bloop” · 1997", "julia_sound.wav": "“Julia” · 1999", "noise97139.wav": "“Slow Down” · 1997", "whistle16x.wav": "“Whistle” · 1997",
  "upsweep20x.wav": "“Upsweep” · since 1991", "ak52_10x.wav": "The 52-hertz whale", "bioduck_clip.wav": "“Bio-Duck”",
};
const SRCN: Record<string, string> = { "bioduck_clip.wav": "NOAA Fisheries (On the Line podcast)" };
const Player: React.FC<{ c: Clip }> = ({ c }) => {
  const lf = useCurrentFrame();
  const keep = c.dur - 0.5;
  const p = Math.min(1, lf / FPS / keep);
  const env = (ENV as Record<string, number[]>)[c.file];
  const W = 1600, H = 560, X = 160, Y = 230;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #0E3A5A 0%, #03101C 75%)" }}>
      <div style={{ position: "absolute", left: X, top: 90, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: "#FFFFFF" }}>{NAME[c.file]}</div>
      <div style={{ position: "absolute", right: X, top: 108, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: INK, background: "#9FE3B0", padding: "8px 18px", borderRadius: 10, border: `4px solid ${INK}` }}>REAL RECORDING · {SPEED[c.file]}</div>
      <div style={{ position: "absolute", left: X, top: Y, width: W, height: H, borderRadius: 16, overflow: "hidden", border: "4px solid rgba(255,255,255,0.25)" }}>
        <Img src={staticFile(`cm05/img/spec_${c.file.replace(/\.\w+$/, "")}.jpg`)} style={{ width: W, height: H, opacity: 0.35 }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: W * p, height: H, overflow: "hidden" }}>
          <Img src={staticFile(`cm05/img/spec_${c.file.replace(/\.\w+$/, "")}.jpg`)} style={{ width: W, height: H }} />
        </div>
        <div style={{ position: "absolute", left: W * p - 3, top: 0, width: 6, height: H, background: "#FFFFFF", boxShadow: "0 0 20px #FFFFFF" }} />
      </div>
      <div style={{ position: "absolute", left: X, top: Y + H + 10, fontFamily: "Pretendard", fontWeight: 700, fontSize: 24, color: "#FFFFFF", opacity: 0.6 }}>time →   ·   pitch ↑ (spectrogram of the recording)</div>
      <svg width={W} height={150} style={{ position: "absolute", left: X, top: Y + H + 60 }}>
        {env.map((e, i) => {
          const on = i / env.length <= p;
          const h = 8 + e * 130;
          return <rect key={i} x={i * (W / env.length) + 3} y={75 - h / 2} width={W / env.length - 6} height={h} rx={4} fill={on ? CYAN : "rgba(255,255,255,0.18)"} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: X, bottom: 40, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "#FFFFFF", opacity: 0.75 }}>Audio: {SRCN[c.file] ?? "NOAA Pacific Marine Environmental Laboratory (PMEL)"}</div>
      <Img src={staticFile("sprout/side.png")} style={{ position: "absolute", right: 90, bottom: 30, width: 190, height: 190, transform: `rotate(${Math.sin(lf / 9) * 6}deg)` }} />
    </AbsoluteFill>
  );
};

// ---------- 3D scenes ----------
const CUT = 4.5;
const vary = (shot: (s: number) => ShotO, s: number): ShotO => {
  const b = shot(s);
  const k = Math.floor(s / CUT) % 3;
  if (k === 0) return b;
  const off = b.pos.clone().sub(b.look);
  if (k === 1) off.applyAxisAngle(V(0, 1, 0), 0.8);
  else off.multiplyScalar(1.5).add(V(0, 4, 0));
  return { ...b, pos: b.look.clone().add(off) };
};
type ShotFn = (s: number) => ShotO;
const Under: React.FC<{ shot: ShotFn; badge?: string; children: (s: number) => React.ReactNode; still?: boolean }> = ({ shot, badge = "ILLUSTRATION", children, still }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <OceanStage shot={still ? shot(s) : vary(shot, s)} t={s}>{children(s)}</OceanStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const Above: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode }> = ({ shot, children }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <SeaStage shot={vary(shot, s)} t={s}>{children(s)}</SeaStage>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const orbit = (cx: number, cy: number, cz: number, r: number, h: number, a0 = 0, sp = 0.05, fov = 50): ShotFn => (s) => ({ pos: V(cx + Math.sin(a0 + s * sp) * r, cy + h, cz + Math.cos(a0 + s * sp) * r), look: V(cx, cy, cz), fov });

// moorings of a listening network
const NET: [number, number][] = [[-30, -20], [0, 10], [28, -12], [45, 25]];
const Net: React.FC<{ s: number; src?: [number, number, number]; speed?: number }> = ({ s, src = [-80, 12, -40], speed = 14 }) => (
  <>
    {NET.map(([x, z], i) => {
      const d = Math.hypot(x - src[0], z - src[2]) / speed;
      const ph = ((s - d) % 1.2 + 1.2) % 1.2;
      return <Hydrophone key={i} x={x} z={z} hear={s > d ? Math.min(1, ph) : 0} />;
    })}
  </>
);
const BigShadow: React.FC<{ s: number }> = ({ s }) => (
  <group position={[-30 + s * 2.5, 18, -12]}>
    <mesh scale={[26, 5, 6]}><sphereGeometry args={[1, 32, 20]} /><meshBasicMaterial color="#01060C" fog={false} transparent opacity={0.8} /></mesh>
    <mesh position={[-28, 0, 0]} scale={[7, 0.8, 9]}><sphereGeometry args={[1, 16, 10]} /><meshBasicMaterial color="#01060C" fog={false} transparent opacity={0.8} /></mesh>
  </group>
);
// iceberg grounding: drifts in, scrapes the floor, slows to a stop; pitch-drop rings
const Grounding: React.FC<{ s: number }> = ({ s }) => {
  // a 12-unit berg reaches ~30 units below the waterline, so its keel drags along the seafloor
  const x = -30 + 26 * (1 - Math.exp(-s / 3.5));
  const keel = x + 4;
  return (
    <>
      <Iceberg x={x} z={0} size={8} seed={3} y={SURF - 6} tilt={Math.min(0.08, s * 0.015)} />
      <SoundShells at={[keel, floorY(keel, 0) + 2, 0]} t={s} every={1.6 + s * 0.15} speed={10} color={CYAN} max={70} from={1} />
      {Array.from({ length: 22 }, (_, i) => {
        const ph = (s * 0.6 + i * 0.37) % 3;
        return (
          <mesh key={i} position={[keel + 4 + Math.sin(i * 7) * 3 + ph, floorY(keel + 4, 0) + 0.3 + ph * 0.8, Math.cos(i * 3) * 5]}>
            <sphereGeometry args={[0.5 + (i % 3) * 0.3, 8, 6]} />
            <meshStandardMaterial color="#9A9688" transparent opacity={0.5 * (1 - ph / 3)} />
          </mesh>
        );
      })}
    </>
  );
};
// ---------- maps ----------
const HYD: Pin = { lon: -105, lat: 0, label: "NOAA hydrophones (approx.)", color: "#FF6B5E", area: 9, dy: -30 };
const Map: React.FC<{ rot: (s: number) => [number, number]; pins?: Pin[]; route?: { pts: [number, number][]; color?: string }; scale?: number; title?: string }> = (p) => (
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
const still = (a: [number, number], drift = 1.2) => (s: number): [number, number] => [a[0] + s * drift, a[1]];
const BLOOP: Pin = { lon: -100, lat: -50, label: "Bloop source (approx.)", ring: true, color: YEL };
const routeCalAK: [number, number][] = [[-123, 36], [-128, 41], [-135, 46], [-145, 51], [-155, 53], [-165, 53]];
const routeMar: [number, number][] = Array.from({ length: 30 }, (_, i) => [145 + (250 - 145) * (i / 29), 15 - 7 * (i / 29)]);

// ---------- scoreboard ----------
const Scoreboard: React.FC = () => {
  const lf = useCurrentFrame();
  const rows: [number, string, Verd][] = [[73, "The Bloop", "SOLVED"], [74, "Julia & Slow Down", "SOLVED"], [75, "The Bio-Duck", "SOLVED"], [76, "The Whistle", "BEST GUESS"], [77, "The Upsweep", "STILL UNKNOWN"], [78, "The 52-hertz whale", "STILL UNKNOWN"]];
  const t0 = S(72);
  return (
    <div style={{ position: "absolute", left: 120, top: 130, width: 1300 }}>
      {rows.map(([i, name, v]) => {
        const d = (S(i) - t0) * FPS;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 20, opacity: interpolate(lf, [d, d + 8], [0, 1], cl), transform: `translateX(${interpolate(lf, [d, d + 10], [-30, 0], { ...cl, easing: out })}px)` }}>
            <div style={{ width: 560, fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: "#FFFFFF", textShadow: "0 4px 14px rgba(0,0,0,0.8)" }}>{name}</div>
            <div style={{ border: `6px solid ${VCOL[v]}`, color: VCOL[v], borderRadius: 14, padding: "4px 22px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, background: "rgba(10,10,14,0.75)", rotate: "-3deg" }}>{v}</div>
          </div>
        );
      })}
    </div>
  );
};

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  if (CL.some((c) => s >= c.at && s < c.at + c.dur)) return null;
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

// ---------------- the edit ----------------
const deep = (s: number): ShotO => ({ pos: V(-40 + s * 1.2, 10, 30), look: V(10, 8, -10), fov: 55 });
const netShot = orbit(10, 6, 0, 55, 12, 0.6, 0.04, 50);
const bergUnder = orbit(0, 14, 0, 45, -4, 0.3, 0.05, 55);
const minkeShot = (s: number): ShotO => ({ pos: V(-18 + s * 1.6, SURF - 6, 16), look: V(-4 + s * 1.6, SURF - 7, 0), fov: 50 });
const pod = (s: number) => (
  <>
    <Whale x={-8 + s * 1.6} y={SURF - 6} z={0} t={s} kind="minke" scale={1.3} />
    <Whale x={-14 + s * 1.6} y={SURF - 9} z={-6} t={s + 1} kind="minke" scale={1.2} />
    <Whale x={-2 + s * 1.6} y={SURF - 10} z={-12} t={s + 2} kind="minke" scale={1.1} />
  </>
);

const C = (line: number) => clipAfter(line).at;
const SCENES: [number, React.ReactNode][] = [
  [0, <Under shot={deep} still>{(s) => <><SoundShells at={[-90, 12, -60]} t={s} every={1.4} speed={18} max={140} /><Net s={s} src={[-90, 12, -60]} speed={18} /></>}</Under>],
  [C(0), <Player c={clipAfter(0)} />],
  [S(1), <Map rot={pan([-100, 0], [-110, -20])} pins={[HYD, { ...BLOOP, delay: 30 }]} />],
  [S(2), <Under shot={orbit(0, 10, 0, 60, 6, 0, 0.06)}>{(s) => <><Iceberg x={-30} z={-30} size={9} seed={2} /><Whale x={10 + s} y={18} z={10} t={s} kind="blue" /><Volcano x={40} z={-40} t={s} /><Net s={s} /></>}</Under>],
  [S(4), <Under shot={(s) => ({ pos: V(6, 10, 12 - s * 0.4), look: V(0, 10, 0), fov: 45 })} still>{(s) => <><Hydrophone x={0} z={0} hear={(s % 1.2) / 1.2} /><SoundShells at={[-60, 10, -30]} t={s} every={1.2} speed={16} max={80} color={CYAN} /></>}</Under>],
  [S(5), <Under shot={orbit(0, 8, 0, 70, 20, 1, 0.05)}>{(s) => <Net s={s} />}</Under>],
  [S(6), <Under shot={(s) => ({ pos: V(-30 + s * 1.5, 18, 22), look: V(-10 + s * 1.5, 16, 0), fov: 50 })} badge="ILLUSTRATION · Cold War">{(s) => <><Submarine x={-10 + s * 1.5} y={16} z={0} /><Net s={s} src={[-10 + s * 1.5, 16, 0]} /></>}</Under>],
  [S(7), <Under shot={(s) => ({ pos: V(5 - s * 0.2, 9, 7), look: V(0, 9.5, 0), fov: 40 })} still>{(s) => <><Hydrophone x={0} z={0} hear={(s % 1.5) / 1.5} /><Whale x={-25 + s * 1.5} y={14} z={-20} t={s} kind="blue" /></>}</Under>],
  [S(8), <Under shot={netShot}>{(s) => <><SoundShells at={[-80, 12, -40]} t={s} every={1.0} speed={18} max={150} /><Net s={s} speed={18} /></>}</Under>],
  [S(10), <Under shot={(s) => ({ pos: V(4, 9.5, 6), look: V(0, 9.8, 0), fov: 38 + s })} still>{(s) => <><Hydrophone x={0} z={0} hear={(s % 1.0)} /><SoundShells at={[-70, 10, -40]} t={s} every={0.8} speed={22} max={120} /></>}</Under>],
  [S(11), <Map rot={still([-105, -18])} pins={[{ ...BLOOP, delay: 0 }, HYD]} />],
  [S(12), <Map rot={pan([-105, -18], [-100, -45], 5)} pins={[{ ...BLOOP, delay: 0 }]} scale={620} />],
  [C(13), <Player c={clipAfter(13)} />],
  [S(14), <Under shot={(s) => ({ pos: V(10, 4, 30), look: V(-10, 16, -30), fov: 60 })} still>{(s) => <><BigShadow s={s} /><Net s={s} /></>}</Under>],
  [S(15), <Under shot={orbit(0, 12, -20, 50, -6, 2, 0.04)}>{(s) => <BigShadow s={s} />}</Under>],
  [S(16), <Above shot={(s) => ({ pos: V(-60 + s * 1.5, SURF + 12, 50), look: V(0, SURF + 4, 0), fov: 45 })}>{() => <><Iceberg x={0} z={0} size={14} seed={5} /><Iceberg x={60} z={-80} size={8} seed={7} /></>}</Above>],
  [S(17), <Map rot={pan([-60, -40], [-38, -55])} pins={[{ lon: -36.5, lat: -54.3, label: "Iceberg A53a, 2008", color: CYAN, ring: true, delay: 20 }]} scale={640} />],
  [S(18), <Above shot={(s) => ({ pos: V(-40, SURF + 8, 40), look: V(8, SURF + 3, 0), fov: 42 })}>{(s) => <Iceberg x={0} z={0} size={14} seed={5} split={interpolate(s, [1, 5], [0, 1], cl)} />}</Above>],
  [S(18) + 3.5, <Under shot={bergUnder}>{(s) => <><Iceberg x={0} z={0} size={12} seed={5} split={interpolate(s, [0, 4], [0.3, 1], cl)} /><SoundShells at={[12, SURF - 8, 0]} t={s} every={0.9} speed={16} max={110} /></>}</Under>],
  [S(19), <Map rot={pan([-80, -60], [-150, -75])} pins={[{ lon: -59, lat: -63, label: "Bransfield Strait", color: YEL, delay: 6 }, { lon: -175, lat: -76, label: "Ross Sea", color: YEL, delay: 40 }, { lon: 170.2, lat: -71.3, label: "Cape Adare", color: YEL, delay: 70, dx: -260 }]} scale={560} />],
  [S(20), <Under shot={bergUnder}>{(s) => <><Iceberg x={0} z={0} size={12} seed={5} split={0.6} /><SoundShells at={[12, SURF - 8, 0]} t={s} every={0.8} speed={18} max={120} /></>}</Under>],
  [S(22), <Under shot={orbit(0, 12, 0, 50, 2, 0.5, 0.05)}>{(s) => <><Iceberg x={-20} z={-10} size={10} seed={8} /><Net s={s} /></>}</Under>],
  [S(23), <Map rot={still([-100, -30], -1)} pins={[HYD, { lon: -120, lat: -68, label: "Julia: off Antarctica", color: CYAN, area: 10, delay: 30 }]} />],
  [C(24), <Player c={clipAfter(24)} />],
  [S(25), <Under shot={orbit(-8, 13, 0, 85, 2, 1.2, 0.05)}>{(s) => <Grounding s={s} />}</Under>],
  [C(25), <Player c={clipAfter(25)} />],
  [S(26), <Under shot={(s) => ({ pos: V(-12 + s * 0.4, 14, 80), look: V(-10, 13, 0), fov: 50 })}>{(s) => <Grounding s={s} />}</Under>],
  [S(27), <Under shot={(s) => ({ pos: V(16 + s * 0.3, 3, 36), look: V(-2, 4, 0), fov: 50 })} still>{(s) => <Grounding s={s + 2} />}</Under>],
  [S(28), <Under shot={orbit(-8, 13, 0, 85, 2, 2.4, 0.05)}>{(s) => <Grounding s={s + 6} />}</Under>],
  [S(29), <Under shot={(s) => ({ pos: V(-12, 14, 80), look: V(-8, 13, 0), fov: 55 })} still>{(s) => <Grounding s={s + 3} />}</Under>],
  [S(31), <Under shot={(s) => ({ pos: V(-30 + s, 14, 26), look: V(0, 13, 0), fov: 50 })} badge="ILLUSTRATION · 1960s">{(s) => <><Submarine x={-4 + s * 0.8} y={13} z={0} /><SoundShells at={[40, SURF - 6, -30]} t={s} every={0.9} speed={14} max={90} color={CYAN} /></>}</Under>],
  [C(33), <Player c={clipAfter(33)} />],
  [S(34), <Under shot={orbit(0, 10, 0, 40, 4, 0.3, 0.06)}>{(s) => <><Submarine x={0} y={12} z={0} heading={s * 0.05} /><SoundShells at={[30, 18, -20]} t={s} every={0.8} speed={14} max={70} color={CYAN} /></>}</Under>],
  [S(35), <Map rot={pan([-60, -50], [-30, -70])} pins={[{ lon: 0, lat: -65, label: "Southern Ocean, every winter", color: CYAN, area: 14, delay: 10 }]} scale={520} />],
  [S(36), <Map rot={still([-62, -64], 0.3)} pins={[{ lon: -62.2, lat: -64.6, label: "Wilhelmina Bay, Feb 2013", color: YEL, ring: true }]} scale={1400} />],
  [S(36) + 4, <Under shot={minkeShot} still>{pod}</Under>],
  [S(37), <Under shot={(s) => ({ pos: V(-4 + s * 1.6, SURF - 3, 6), look: V(-8 + s * 1.6, SURF - 6, 0), fov: 40 })} still>{(s) => <><Whale x={-8 + s * 1.6} y={SURF - 6} z={0} t={s} kind="minke" scale={1.3} /><mesh position={[-8 + s * 1.6 - 0.6, SURF - 6 + 0.7, 0]}><boxGeometry args={[0.6, 0.25, 0.35]} /><meshStandardMaterial color="#FF6B2A" /></mesh></>}</Under>],
  [S(38), <Under shot={orbit(0, SURF - 8, 0, 22, 2, 0.4, 0.07)}>{(s) => <><Whale x={0} y={SURF - 8} z={0} t={s} kind="minke" scale={1.3} call={1} /><mesh position={[-0.6, SURF - 7.3, 0]}><boxGeometry args={[0.6, 0.25, 0.35]} /><meshStandardMaterial color="#FF6B2A" /></mesh></>}</Under>],
  [S(39), <Under shot={minkeShot} still>{pod}</Under>],
  [S(40), <Under shot={(s) => ({ pos: V(-30 + s * 1.6, SURF - 16, -26), look: V(-4 + s * 1.6, SURF - 7, 0), fov: 50 })} still>{pod}</Under>],
  [S(42), <Under shot={orbit(30, 6, -10, 60, 8, 0.2, 0.05)}>{(s) => <><Volcano x={30} z={-10} t={s} erupt={0.3} /><Hydrophone x={-10} z={10} hear={(s % 1.3) / 1.3} /></>}</Under>],
  [S(43), <Map rot={still([-110, 6], -0.8)} pins={[{ lon: -110, lat: 8, label: "the only hydrophone that heard it · 8°N 110°W", color: "#FF6B5E", ring: true }]} />],
  [C(44), <Player c={clipAfter(44)} />],
  [S(45), <Under shot={orbit(0, 8, 0, 48, 8, 0, 0.06)}>{(s) => <Volcano x={0} z={0} t={s} />}</Under>],
  [S(46), <Map rot={pan([150, 10], [210, 8], 8)} pins={[{ lon: 145.6, lat: 16, label: "Mariana arc", color: ORG, ring: true }, { lon: -110, lat: 8, label: "hydrophone", color: "#FF6B5E", delay: 120 }]} route={{ pts: routeMar, color: ORG }} scale={430} />],
  [S(47), <Under shot={netShot} >{(s) => <><Volcano x={-70} z={-40} t={s} /><Hydrophone x={10} z={0} hear={(s % 1.2) / 1.2} /><SoundShells at={[-70, 14, -40]} t={s} every={1.2} speed={16} max={120} color={ORG} /></>}</Under>],
  [S(48), <Under shot={(s) => ({ pos: V(10, 4, 26), look: V(-20, 12, -30), fov: 55 })} still>{(s) => <><Volcano x={-40} z={-60} t={s} erupt={0.6} /><Hydrophone x={0} z={0} hear={(s % 1.2) / 1.2} /></>}</Under>],
  [S(50), <Under shot={netShot}>{(s) => <><SoundShells at={[-90, 8, -60]} t={s} every={1.6} speed={14} max={150} color="#C38BFF" /><Net s={s} src={[-90, 8, -60]} /></>}</Under>],
  [S(51), <Under shot={(s) => ({ pos: V(-30 + s * 1.5, 18, 22), look: V(-10 + s * 1.5, 16, 0), fov: 50 })} badge="ILLUSTRATION · SOSUS">{(s) => <><Submarine x={-10 + s * 1.5} y={16} z={0} /><Net s={s} /></>}</Under>],
  [S(52), <Map rot={still([-140, -25], 1)} pins={[{ lon: -140, lat: -54, label: "Upsweep (approx.)", color: "#C38BFF", ring: true }, HYD]} scale={430} />],
  [C(53), <Player c={clipAfter(53)} />],
  [S(54), <Under shot={orbit(0, 14, 0, 40, 2, 1, 0.06)}>{(s) => <Whale x={0} y={14} z={0} t={s} kind="blue" />}</Under>],
  [S(55), <Under shot={netShot}>{(s) => <><SoundShells at={[-90, 8, -60]} t={s} every={1.6} speed={14} max={150} color="#C38BFF" /><Net s={s} src={[-90, 8, -60]} /></>}</Under>],
  [S(56), <Map rot={pan([-140, -20], [-140, -50], 5)} pins={[{ lon: -140, lat: -54, label: "54°S 140°W", color: "#C38BFF", area: 6 }]} scale={700} />],
  [S(57), <Under shot={(s) => ({ pos: V(4, 9.5, 6), look: V(0, 9.8, 0), fov: 40 })} still>{(s) => <><Hydrophone x={0} z={0} hear={(s % 1.6) / 1.6} /><SoundShells at={[-70, 10, -40]} t={s} every={1.6} speed={14} max={110} color="#C38BFF" /></>}</Under>],
  [S(58), <Under shot={orbit(-20, 6, -20, 70, 10, 2, 0.04)}>{(s) => <><Volcano x={-40} z={-40} t={s} erupt={0.2} /><SoundShells at={[-40, 14, -40]} t={s} every={1.6} speed={14} max={100} color="#C38BFF" /></>}</Under>],
  [S(60), <Under shot={(s) => ({ pos: V(-40 + s * 2, 16, 34), look: V(-10 + s * 2, 15, 0), fov: 50 })}>{(s) => <Whale x={-10 + s * 2} y={15} z={0} t={s} kind="blue" />}</Under>],
  [S(62), <Under shot={orbit(0, 15, 0, 30, 2, 0.5, 0.06)}>{(s) => <Whale x={0} y={15} z={0} t={s} kind="blue" call={1} />}</Under>],
  [C(63), <Player c={clipAfter(63)} />],
  [S(64), <Under shot={netShot}>{(s) => <><Whale x={-40 + s * 2} y={14} z={-20} t={s} kind="blue" call={1} /><Net s={s} src={[-40 + s * 2, 14, -20]} speed={10} /></>}</Under>],
  [S(65), <Map rot={pan([-135, 35], [-150, 48], 6)} pins={[{ lon: -123, lat: 36, label: "California", color: CYAN }, { lon: -165, lat: 53, label: "Aleutian Islands", color: CYAN, delay: 80, dx: -330 }]} route={{ pts: routeCalAK }} scale={760} />],
  [S(66), <Under shot={(s) => ({ pos: V(-10 + s * 1.8, 30, 60), look: V(-10 + s * 1.8, 15, 0), fov: 60 })} still>{(s) => <Whale x={-10 + s * 1.8} y={15} z={0} t={s} kind="blue" call={1} />}</Under>],
  [S(67), <Under shot={orbit(0, 15, 0, 34, -4, 3, 0.05)}>{(s) => <Whale x={0} y={15} z={0} t={s} kind="blue" />}</Under>],
  [S(69), <Under shot={(s) => ({ pos: V(0, 30, 90), look: V(0, 14, 0), fov: 60 })} still>{(s) => <><Whale x={-40 + s} y={15} z={0} t={s} kind="blue" call={1} /><Whale x={40 - s} y={13} z={-20} t={s + 3} kind="blue" call={1} heading={Math.PI} /></>}</Under>],
  [S(70), <Under shot={orbit(0, 15, 0, 28, 3, 1.5, 0.06)}>{(s) => <Whale x={0} y={15} z={0} t={s} kind="blue" />}</Under>],
  [S(72), <Under shot={orbit(0, 10, 0, 70, 10, 0, 0.04)}>{(s) => <><Iceberg x={-30} z={-30} size={9} seed={2} /><Whale x={10 + s} y={18} z={10} t={s} kind="blue" /><Whale x={-5 + s} y={SURF - 6} z={20} t={s} kind="minke" scale={1.3} /><Volcano x={40} z={-40} t={s} erupt={0.5} /><Net s={s} /></>}</Under>],
  [S(80), <Under shot={deep}>{(s) => <><Net s={s} /><SoundShells at={[-90, 12, -60]} t={s} every={1.4} speed={18} max={140} color={CYAN} /></>}</Under>],
];
const OVER: [number, number, React.ReactNode][] = [
  [S(0), C(0), <Line text="What made this sound?" size={84} y={120} />],
  [S(1), S(2), <Stat big="> 5,000 km" small="sensors that picked it up (NOAA PMEL)" y={120} />],
  [S(2), S(4), <Line text="6 sounds · real NOAA recordings" sub="verdict: solved · best guess · still unknown" size={58} y={120} />],
  [S(4), S(5), <Line text="Too low to hear → sped up" sub="exactly as NOAA published them" size={62} y={120} />],
  [S(4), S(5), <Sprout pose="think" x={1520} y={600} />],
  [S(6), S(7), <Line text="SOSUS · U.S. Navy" sub="hydrophones built to hear Soviet submarines (WHOI Oceanus)" size={66} y={120} />],
  [S(7), S(8), <Line text="NOAA listens for" sub="undersea quakes · volcanoes · ice · whales" size={62} y={120} />],
  [S(9), S(10), <Chapter n={1} title="The Bloop" />],
  [S(11), S(12), <Src name="bloop-5000" y={120} />],
  [S(14), S(15), <Line text="A giant animal?" size={90} y={140} />],
  [S(14), S(16), <Sprout pose="shock" x={1480} y={560} />],
  [S(17), S(18), <Src name="bloop-a53" y={110} />],
  [S(19), S(20), <Src name="bloop-ice" y={110} width={1500} />],
  [S(20), S(21), <Line text="Not a monster." size={96} y={140} />],
  [S(20), S(21), <Sprout pose="wink" x={1500} y={600} />],
  [S(21), S(22), <Stamp v="SOLVED" note="It was breaking ice." />],
  [S(22), S(23), <Chapter n={2} title="Julia & the Slow Down" />],
  [S(25), C(25), <Line text="“Slow Down” · May 1997" sub="the pitch falls over about 7 minutes" size={62} y={120} />],
  [S(27), S(28), <Line text="Iceberg + seafloor = groan" size={70} y={120} />],
  [S(28), S(29), <Src name="julia-ice" y={110} width={1500} />],
  [S(29), S(30), <Src name="slow-7min" y={110} width={1000} />],
  [S(30), S(31), <Stamp v="SOLVED" note="Icebergs running aground." />],
  [S(31), S(32), <Chapter n={3} title="The Bio-Duck" />],
  [S(32), C(33), <Src name="duck-1960" y={110} width={1100} />],
  [S(34), S(35), <Src name="duck-military" y={110} />],
  [S(35), S(36), <Line text="Every year · same months · near Antarctica" sub="National Geographic (2014)" size={52} y={120} />],
  [S(37), S(38), <Stat big="first" small="acoustic tags ever on Antarctic minke whales (NOAA)" y={120} />],
  [S(38), S(39), <Src name="duck-quack" y={110} />],
  [S(39), S(40), <Src name="duck-heart" y={110} />],
  [S(39), S(40), <Sprout pose="excited" x={1500} y={640} />],
  [S(41), S(42), <Stamp v="SOLVED" note="Antarctic minke whales." />],
  [S(42), S(43), <Chapter n={4} title="The Whistle" />],
  [S(45), S(46), <Src name="whistle-volc" y={110} width={1500} />],
  [S(46), S(47), <Stat big="≈ 14,000 km" small="volcano sounds from the Mariana arc (NOAA PMEL)" y={110} />],
  [S(47), S(48), <Src name="whistle-three" y={110} width={1500} />],
  [S(48), S(49), <Sprout pose="think" x={1500} y={620} />],
  [S(49), S(50), <Stamp v="BEST GUESS" note="An undersea eruption, never located." />],
  [S(50), S(51), <Chapter n={5} title="The Upsweep" />],
  [S(51), S(52), <Line text="There since August 1991" sub="NOAA PMEL" size={66} y={120} />],
  [S(54), S(55), <Line text="Whales? Too regular." size={80} y={120} />],
  [S(55), S(56), <Src name="upsweep-seasonal" y={110} width={1500} />],
  [S(57), S(58), <Src name="upsweep-decline" y={110} width={1500} />],
  [S(58), S(59), <Src name="upsweep-unresolved" y={110} width={1500} />],
  [S(58), S(59), <Sprout pose="shock" x={1500} y={640} />],
  [S(59), S(60), <Stamp v="STILL UNKNOWN" note="Volcanic? Nobody has found the source." />],
  [S(60), S(61), <Chapter n={6} title="The loneliest whale" />],
  [S(61), S(62), <Quote text={<>In 1989, a team of WHOI biologists first detected an unusual sound in the North Pacific Ocean. It had all the repetitive, low-frequency earmarks of a whale call, but at a unique frequency—<Hi>52 hertz</Hi>.</>} source="WHOI Oceanus (2005)" y={110} />],
  [S(62), C(63), <Stat big="52 Hz" small="vs 15–25 Hz for blue and fin whales (WHOI)" y={110} color="#1A7FB8" />],
  [S(65), S(66), <Stat big="11,062 km" small="farthest it was tracked in one season, 2002–03 (WHOI)" y={110} />],
  [S(66), S(67), <Sprout pose="sad" x={1500} y={640} />],
  [S(67), S(68), <Quote text={<>“It is perhaps difficult to accept that if this was a whale, that there could have been <Hi>only one of this kind in this large oceanic expanse</Hi>…”</>} source="Watkins et al., Deep-Sea Research, via WHOI Oceanus" y={110} />],
  [S(68), S(69), <Line text="“Whalien 52” · BTS (2015)" sub="inspired by the 52-hertz whale (Billboard, via Wikipedia)" size={66} y={120} />],
  [S(69), S(70), <Src name="w52-two" y={110} width={1500} />],
  [S(70), S(71), <Quote text={<>The 52-hertz call may be due to a malformation, or the whale may be <Hi>a hybrid of two species</Hi>, the scientists speculated…</>} source="WHOI Oceanus (2005)" y={110} />],
  [S(71), S(72), <Stamp v="STILL UNKNOWN" note="A whale, but nobody knows what kind." />],
  [S(72), S(80), <Scoreboard />],
  [S(80), S(81), <Line text="Audio: NOAA · 3D scenes are illustrations" size={44} y={140} />],
  [S(81), END, <Line text="Which sound surprised you most?" size={70} sub="tell me in the comments" y={140} />],
  [S(81), END, <Sprout pose="excited" x={1500} y={620} />],
];

export const Cm05Full: React.FC = () => {
  useFonts();
  const f = (s: number) => Math.round(s * FPS);
  const sc = [...SCENES].sort((a, b) => a[0] - b[0]);
  return (
    <AbsoluteFill style={{ background: "#03101C" }}>
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
      <Html5Audio src={staticFile("cm05/full.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
