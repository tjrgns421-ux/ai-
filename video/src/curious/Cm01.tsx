import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm01/narration.words.json";
import LINES from "../../public/cm01/lines.json";
import CAPS from "../../public/cm01/caps/captures.json";
import { SimFrame, simulate } from "./RingSim";
import { Car, Cones, Track, Trees, fwd, pos } from "./Ring3D";
import { HighwayCam, HighwayScene } from "./Highway3D";
import { AmplifyScene, ReactionScene } from "./Closeups";
import { CmCalmRing3D } from "./CalmRing3D";

// Curious Minutes ep01 "Why Do Phantom Traffic Jams Happen?" — full 16:9 video on the narration timeline.
const FPS = 30;
const HZ = 20; // ring simulation samples per second
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", CYAN = "#1AA6D6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);

const TL = makeTimeline(words, LINES, [], 75);
export const CM01_FRAMES = TL.duration;

// start time (s) of every script line
const LS: number[] = (() => {
  const res: number[] = [];
  let after = 0;
  for (const l of LINES) {
    const t = TL.timeOf(l.split(/\s+/).slice(0, 4).join(" "), after);
    res.push(t);
    after = t + 0.01;
  }
  return res;
})();
const END = TL.duration / FPS;

// ---------------- ring scenes (real-time, 30 Hz) ----------------
type Shot = { pos: THREE.Vector3; look: THREE.Vector3 };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const mix = (a: Shot, b: Shot, k: number): Shot => ({ pos: a.pos.clone().lerp(b.pos, k), look: a.look.clone().lerp(b.look, k) });
const aerial = (t: number, r = 82, h = 60, a0 = 2.2): Shot => {
  const a = a0 + t * 0.05;
  return { pos: V(Math.cos(a) * r, h, Math.sin(a) * r), look: V(0, 0, 0) };
};
const chase = (x: number): Shot => {
  const p = pos(x), d = fwd(x);
  return { pos: p.clone().addScaledVector(d, -9).add(V(0, 3.6, 0)).addScaledVector(p.clone().normalize(), 1.2), look: p.clone().addScaledVector(d, 14).add(V(0, 1.2, 0)) };
};
const lookBack = (x: number): Shot => {
  const p = pos(x), d = fwd(x);
  return { pos: p.clone().addScaledVector(d, 11).add(V(0, 4.5, 0)).addScaledVector(p.clone().normalize(), 2), look: p.clone().addScaledVector(d, -14).add(V(0, 0.8, 0)) };
};
const jamShot = (x: number): Shot => {
  const p = pos(x);
  return { pos: p.clone().addScaledVector(p.clone().normalize(), 34).add(V(0, 26, 0)), look: p.clone() };
};
const L = 230;
const wrap = (d: number) => ((((d + L / 2) % L) + L) % L) - L / 2;
const jamTrack = (sim: SimFrame[]) => {
  const outp: number[] = [];
  let cur: number | null = null;
  for (const f of sim) {
    const slow = f.x.filter((_, i) => f.v[i] < 3);
    if (slow.length) {
      const ref: number = cur ?? f.x[f.v.indexOf(Math.min(...f.v))];
      const near = slow.filter((x) => Math.abs(wrap(x - ref)) < 25);
      const pick = near.length ? near : [slow.reduce((a, x) => (Math.abs(wrap(x - ref)) < Math.abs(wrap(a - ref)) ? x : a))];
      const target = ref + pick.reduce((s, x) => s + wrap(x - ref), 0) / pick.length;
      cur = cur === null ? target : cur + 0.06 * wrap(target - cur);
    }
    outp.push(cur === null ? 0 : ((cur % L) + L) % L);
  }
  return outp;
};
type Key = [number, (f: SimFrame, s: number, i: number) => Shot];
const schedule = (keys: Key[], f: SimFrame, s: number, i: number, tr = 2.5): Shot => {
  let k = 0;
  while (k + 1 < keys.length && s >= keys[k + 1][0]) k++;
  const cur = keys[k][1](f, s, i);
  if (k === 0 || s >= keys[k][0] + tr) return cur;
  return mix(keys[k - 1][1](f, s, i), cur, ease((s - keys[k][0]) / tr));
};

const RingRig: React.FC<{ sh: Shot }> = ({ sh }) => {
  const { camera, scene } = useThree();
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  scene.background = new THREE.Color("#9ED8FF");
  scene.fog = new THREE.Fog("#BFE6FF", 120, 260);
  return null;
};
// the simulation is sampled at 20 Hz (its step is 0.05 s); frames in between are interpolated
const frameAt = (sim: SimFrame[], t: number): { f: SimFrame; i: number } => {
  const u = Math.min(t * HZ, sim.length - 1.001);
  const i = Math.floor(u), k = u - i;
  const a = sim[i], b = sim[i + 1];
  return { i, f: { x: a.x.map((x, n) => (((x + wrap(b.x[n] - x) * k) % L) + L) % L), v: a.v.map((v, n) => v + (b.v[n] - v) * k), a: a.a } };
};
const RingScene: React.FC<{ sim: SimFrame[]; keys: Key[]; calm?: number; credit: string }> = ({ sim, keys, calm, credit }) => {
  const fr = useCurrentFrame();
  const { f, i } = frameAt(sim, fr / FPS);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.5, far: 600 }}>
        <RingRig sh={schedule(keys, f, fr / FPS, i)} />
        <hemisphereLight args={["#ffffff", "#6E9C50", 1.1]} />
        <directionalLight position={[60, 90, 40]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-80} shadow-camera-right={80} shadow-camera-top={80} shadow-camera-bottom={-80} />
        <Track />
        <Cones />
        <Trees />
        {f.x.map((_, k) => <Car key={k} f={f} i={k} calm={k === calm} />)}
      </ThreeCanvas>
      <Badge text="SIMULATION" />
      <Credit text={credit} />
    </AbsoluteFill>
  );
};

// A: the experiment (starts at line 2). The first driver eases off when the narration says so (line 9).
const A0 = LS[2];
const SIM_A = simulate(LS[17] - A0 + 2, HZ, null, { kickAt: LS[9] - A0 });
const JAM_A = jamTrack(SIM_A);
const rel = (t: number) => t - A0;
const KEYS_A: Key[] = [
  [0, (_, s) => aerial(s, 95, 70)],
  [rel(LS[4]), (_, s) => aerial(s, 62, 34, 1.6)],
  [rel(LS[6]), (f) => chase(f.x[3])],
  [rel(LS[8]), (_, s) => aerial(s, 70, 40, 1.2)],
  [rel(LS[9]), (f) => lookBack(f.x[0])],
  [rel(LS[13]), (_, __, i) => jamShot(JAM_A[i])],
  [rel(LS[15]), (_, s) => aerial(s, 90, 62, 1.0)],
];
// G: the jam moves backward (lines 35-44), a fully developed jam
const SIM_G = simulate(175, HZ, null).slice(120 * HZ);
const JAM_G = jamTrack(SIM_G);
const G0 = LS[35];
const KEYS_G: Key[] = [
  [0, (_, s) => aerial(s, 90, 62, 0.4)],
  [LS[36] - G0, (f) => chase(f.x[4])],
  [LS[37] - G0, (_, __, i) => jamShot(JAM_G[i])],
  [LS[42] - G0, (_, s) => aerial(s, 88, 60, 2.6)],
];
// N: the ending, a calm ring with the AI car
const SIM_N = simulate(300, HZ, 100).slice(268 * HZ);
const KEYS_N: Key[] = [
  [0, (_, s) => aerial(s, 84, 52, 3.4)],
  [LS[101] - LS[99], (_, s) => aerial(s, 110, 80, 3.6)],
];
const KEYS_SAD: Key[] = [[0, (_, s) => aerial(s, 80, 55, 5)]];

// ---------------- overlay pieces ----------------
const useIn = (d = 0) => {
  const lf = useCurrentFrame() - d;
  return { opacity: interpolate(lf, [0, 6], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 10], [24, 0], { ...cl, easing: out })}px) scale(${interpolate(lf, [0, 10], [0.94, 1], { ...cl, easing: out })})` };
};
const Badge: React.FC<{ text: string; color?: string }> = ({ text, color = YEL }) => (
  <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: INK, background: color, padding: "6px 16px", borderRadius: 10, border: `4px solid ${INK}` }}>{text}</div>
);
const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", right: 60, top: 58, fontFamily: "Pretendard", fontWeight: 700, fontSize: 24, color: "#FFFFFF", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{text}</div>
);
const Card: React.FC<{ y?: number; children: React.ReactNode; w?: number; bg?: string }> = ({ y = 170, children, w = 1300, bg = "#FFFFFF" }) => (
  <div style={{ position: "absolute", left: (1920 - w) / 2, top: y, width: w, display: "flex", justifyContent: "center", ...useIn() }}>
    <div style={{ background: bg, border: `5px solid ${INK}`, borderRadius: 26, padding: "24px 40px", boxShadow: "0 12px 0 rgba(20,21,27,0.25)", fontFamily: "Pretendard", color: INK, textAlign: "center" }}>{children}</div>
  </div>
);
const Stat: React.FC<{ big: string; small: string; y?: number; color?: string }> = ({ big, small, y = 170, color = INK }) => (
  <Card y={y}>
    <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1, color, letterSpacing: -2 }}>{big}</div>
    <div style={{ fontSize: 34, fontWeight: 700, marginTop: 12, opacity: 0.75 }}>{small}</div>
  </Card>
);
const Line: React.FC<{ text: string; sub?: string; y?: number; size?: number }> = ({ text, sub, y = 170, size = 62 }) => (
  <Card y={y}>
    <div style={{ fontSize: size, fontWeight: 900, lineHeight: 1.15 }}>{text}</div>
    {sub && <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12, opacity: 0.7 }}>{sub}</div>}
  </Card>
);
type CapInfo = { w: number; h: number; marks: Record<string, { x: number; y: number; w: number; h: number }[]> };
const CI = CAPS as unknown as Record<string, CapInfo>;
const Src: React.FC<{ name: string; label: string; width?: number; y?: number; marks?: string[] }> = ({ name, label, width = 1400, y = 150, marks = [] }) => {
  const lf = useCurrentFrame();
  const c = CI[name];
  const sc = width / c.w;
  return (
    <div style={{ position: "absolute", left: (1920 - width - 60) / 2, top: y, ...useIn() }}>
      <div style={{ background: "#FFFFFF", padding: 30, borderRadius: 18, border: `5px solid ${INK}`, boxShadow: "0 14px 0 rgba(20,21,27,0.25)" }}>
        <div style={{ position: "relative", width, height: c.h * sc }}>
          {marks.flatMap((m) => c.marks[m] ?? []).map((b, k) => (
            <div key={k} style={{ position: "absolute", left: b.x * sc - 4, top: b.y * sc, height: b.h * sc, width: (b.w * sc + 8) * interpolate(lf, [12 + k * 6, 26 + k * 6], [0, 1], cl), background: YEL, opacity: 0.75, borderRadius: 6 }} />
          ))}
          <Img src={staticFile(`cm01/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width, height: c.h * sc, mixBlendMode: "multiply" }} />
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: INK, opacity: 0.65, marginTop: 16 }}>Source: {label}</div>
      </div>
    </div>
  );
};
const Quote: React.FC<{ text: string; who: string; y?: number }> = ({ text, who, y = 170 }) => (
  <Card y={y} w={1500}>
    <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.25, fontStyle: "italic" }}>“{text}”</div>
    <div style={{ fontSize: 30, fontWeight: 700, marginTop: 16, opacity: 0.7 }}>{who}</div>
  </Card>
);
const Sprout: React.FC<{ pose: string; x?: number; y?: number; size?: number }> = ({ pose, x = 40, y = 640, size = 300 }) => {
  const lf = useCurrentFrame();
  const hop = interpolate(lf, [0, 5, 10, 14], [60, -26, 6, 0], cl);
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x, top: y + hop, width: size, height: size, opacity: interpolate(lf, [0, 4], [0, 1], cl) }} />;
};

// explainer graphics
const Sonic: React.FC = () => {
  const lf = useCurrentFrame();
  const glow = 0.55 + Math.sin(lf / 6) * 0.15;
  return (
    <AbsoluteFill style={{ opacity: interpolate(lf, [0, 12], [0, 1], cl) }}>
      <div style={{ position: "absolute", left: 1020, top: 180, width: 46, height: 560, background: `linear-gradient(${RED}00, ${RED}, ${RED}00)`, opacity: glow, filter: "blur(2px)", borderRadius: 20 }} />
      <div style={{ position: "absolute", left: 1090, top: 230, fontFamily: "Pretendard", color: INK, background: "#FFFFFF", border: `5px solid ${INK}`, borderRadius: 22, padding: "18px 28px", width: 560 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: RED }}>SONIC POINT</div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>News of the clear road ahead can't get back through to the cars behind.</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 10, opacity: 0.6 }}>Flynn et al., Phys. Rev. E (2009), via MIT News</div>
      </div>
      <div style={{ position: "absolute", left: 640, top: 330, fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: "#FFFFFF", textShadow: "0 3px 10px rgba(0,0,0,0.7)" }}>you are here →</div>
    </AbsoluteFill>
  );
};
const VSL: React.FC = () => {
  const lf = useCurrentFrame();
  const sign = (n: string, k: number) => (
    <div key={k} style={{ opacity: interpolate(lf, [8 + k * 8, 16 + k * 8], [0, 1], cl), display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 200, height: 200, background: "#1B1D24", borderRadius: 22, border: `6px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 160, height: 160, borderRadius: "50%", border: `14px solid ${RED}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 70, color: "#FFFFFF" }}>{n}</div>
      </div>
      <div style={{ width: 16, height: 70, background: "#C9CED8", border: `4px solid ${INK}` }} />
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 360, top: 150, width: 1200, display: "flex", justifyContent: "space-between" }}>{["100", "80", "60"].map(sign)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", ...useIn(30) }}>
        <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: INK, background: "#FFFFFF", border: `5px solid ${INK}`, borderRadius: 18, padding: "10px 26px" }}>Variable speed limits · signs every 500–1000 m (e.g. the Netherlands)</span>
      </div>
    </AbsoluteFill>
  );
};
const JAD: React.FC = () => {
  const lf = useCurrentFrame();
  const steps = ["Sees a wave ahead", "Slows early and gently: “slow-in”", "Wave clears → speeds back up: “fast-out”"];
  return (
    <div style={{ position: "absolute", left: 160, right: 160, top: 150, display: "flex", gap: 24 }}>
      {steps.map((s, k) => (
        <div key={k} style={{ flex: 1, opacity: interpolate(lf, [k * 75, k * 75 + 10], [0, 1], cl), background: "#FFFFFF", border: `5px solid ${INK}`, borderRadius: 22, padding: "20px 24px", fontFamily: "Pretendard", color: INK }}>
          <div style={{ fontSize: 60, fontWeight: 900, color: CYAN }}>{k + 1}</div>
          <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2 }}>{s}</div>
        </div>
      ))}
    </div>
  );
};
const Bilateral: React.FC = () => {
  const lf = useCurrentFrame();
  const car = (c: string, label?: string) => (
    <div style={{ width: 220, height: 100, background: c, border: `6px solid ${INK}`, borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: INK }}>{label}</div>
  );
  const gap = (k: number) => (
    <div style={{ width: 260, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: INK, opacity: interpolate(lf, [10 + k * 10, 20 + k * 10], [0, 1], cl) }}>
      ← gap →<div style={{ height: 8, background: INK, borderRadius: 4, marginTop: 6 }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 160, right: 160, top: 160, background: "rgba(255,255,255,0.94)", border: `5px solid ${INK}`, borderRadius: 26, padding: "30px 0", ...useIn() }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {car("#FF9F43")}
        {gap(0)}
        {car("#FFFFFF", "YOU")}
        {gap(1)}
        {car("#4FA3FF")}
      </div>
      <div style={{ textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, color: INK, marginTop: 24 }}>Bilateral control: gap behind ≈ gap ahead</div>
      <div style={{ textAlign: "center", fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, color: INK, opacity: 0.6, marginTop: 6 }}>Berthold Horn, MIT CSAIL (2017)</div>
    </div>
  );
};
const Tips: React.FC<{ n: number }> = ({ n }) => {
  const tips = ["Leave a bigger gap", "Look further ahead", "Roll instead of stopping"];
  return (
    <div style={{ position: "absolute", right: 90, top: 150, display: "flex", flexDirection: "column", gap: 20 }}>
      {tips.slice(0, n).map((t, k) => (
        <div key={k} style={{ background: "#FFFFFF", border: `5px solid ${INK}`, borderRadius: 20, padding: "16px 28px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: INK, ...(k === n - 1 ? {} : {}) }}>
          <span style={{ color: CYAN, marginRight: 18 }}>{k + 1}</span>
          {t}
        </div>
      ))}
    </div>
  );
};
const NextTime: React.FC = () => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(60% 70% at 50% 45%, #2A2F5C 0%, #0B0D1C 75%)" }}>
      {Array.from({ length: 90 }, (_, i) => {
        const x = (Math.sin(i * 12.9898) * 43758.5453) % 1, y = (Math.sin(i * 78.233) * 12543.21) % 1;
        return <div key={i} style={{ position: "absolute", left: Math.abs(x) * 1920, top: Math.abs(y) * 1080, width: 4, height: 4, borderRadius: 2, background: "#FFFFFF", opacity: 0.3 + 0.5 * Math.abs(Math.sin(lf / 20 + i)) }} />;
      })}
      <div style={{ position: "absolute", left: 1020, top: 260, width: 360, height: 360, borderRadius: "50%", background: "#000", boxShadow: "0 0 0 18px rgba(255,170,60,0.55), 0 0 120px 40px rgba(255,140,40,0.45)", transform: `scale(${interpolate(lf, [0, 40], [0.6, 1], { ...cl, easing: out })})` }} />
      <div style={{ position: "absolute", left: 140, top: 230, width: 820, fontFamily: "Pretendard", color: "#FFFFFF", ...useIn(6) }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: YEL }}>NEXT TIME</div>
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05, marginTop: 10 }}>What if you fell into a black hole?</div>
        <div style={{ marginTop: 40, display: "inline-block", background: RED, borderRadius: 16, padding: "14px 34px", fontSize: 46, fontWeight: 900, opacity: interpolate(lf, [40, 50], [0, 1], cl) }}>SUBSCRIBE</div>
      </div>
      <Img src={staticFile("sprout/think.png")} style={{ position: "absolute", left: 1380, top: 560, width: 420, height: 420 }} />
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
const HW: React.FC<{ from: number; cam: HighwayCam; ai?: boolean }> = (p) => (
  <AbsoluteFill>
    <HighwayScene {...p} />
    <Badge text="SIMULATION" />
  </AbsoluteFill>
);
const SCENES: [number, React.ReactNode][] = [
  [0, <HW from={90} cam="high" />],
  [LS[2], <RingScene sim={SIM_A} keys={KEYS_A} credit="Recreation of Sugiyama et al. (2008)" />],
  [LS[17], <HW from={60} cam="chase" />],
  [LS[20], <AmplifyScene />],
  [LS[23], <HW from={30} cam="high" />],
  [LS[27], <HW from={70} cam="chase" />],
  [LS[29] - 4.5, <ReactionScene />],
  [LS[30], <AmplifyScene />],
  [LS[33], <HW from={100} cam="dolly" />],
  [LS[35], <RingScene sim={SIM_G} keys={KEYS_G} credit="Recreation of Sugiyama et al. (2008)" />],
  [LS[45], <HW from={120} cam="dolly" />],
  [LS[50], <HW from={160} cam="high" />],
  [LS[53], <HW from={140} cam="high" />],
  [LS[58], <HW from={100} cam="chase" />],
  [LS[61], <HW from={150} cam="dolly" />],
  [LS[63], <RingScene sim={SIM_G} keys={KEYS_SAD} credit="Recreation of Sugiyama et al. (2008)" />],
  [LS[65], <CmCalmRing3D bare />],
  [LS[72], <HW from={50} cam="chase" ai />],
  [LS[76], <HW from={90} cam="high" ai />],
  [LS[79], <HW from={60} cam="dolly" />],
  [LS[81], <HW from={70} cam="chase" ai />],
  [LS[85], <HW from={120} cam="high" ai />],
  [LS[89], <HW from={40} cam="chase" />],
  [LS[93], <HW from={150} cam="dolly" ai />],
  [LS[99], <RingScene sim={SIM_N} keys={KEYS_N} calm={5} credit="Recreation of Stern et al. (2018)" />],
  [LS[103], <NextTime />],
];
const S = (i: number, d = 0) => LS[i] + d;
const OVER: [number, number, React.ReactNode][] = [
  [S(1), S(2), <Sprout pose="shock" />],
  [S(2), S(4), <Line text="2008 · Japan · an empty circle" sub="Sugiyama et al., New Journal of Physics" />],
  [S(4), S(5), <Stat big="230 m" small="around the circle" />],
  [S(5), S(6), <Stat big="22 cars" small="spaced almost evenly" />],
  [S(6), S(8), <Stat big="~30 km/h" small="the only instruction: keep it steady" />],
  [S(9), S(10), <Line text="One driver eases off…" />],
  [S(10), S(12), <Line text="…the next brakes a little harder" />],
  [S(13), S(15), <Line text="Several cars stop completely" sub="with nothing in the way" />],
  [S(15), S(16), <Sprout pose="shock" />],
  [S(16), S(17), <Src name="sugiyama" label="Sugiyama et al., New J. Phys. 10, 033001 (2008)" width={1720} marks={["a bottleneck is only a trigger and not the essential origin of a traffic jam"]} />],
  [S(17), S(20), <Line text="It's us." size={90} />],
  [S(18), S(20), <Sprout pose="think" />],
  [S(23), S(25), <Line text="Instability" sub="a small disturbance that doesn't fade. It grows." size={80} />],
  [S(25), S(27), <Stat big="~25 cars/km" small="where smooth highway traffic tends to break down (highway data, Sugiyama et al. 2008)" />],
  [S(28), S(29, -4.5), <Src name="fhwa" label="FHWA-HRT-06-033, Appendix A (citing Green 2000)" width={1300} marks={["0.70"]} />],
  [S(31), S(33), <Line text="Every link: a little later, a little harder" />],
  [S(33), S(34), <Line text="Not one big mistake. A small delay, repeated." />],
  [S(34), S(35), <Line text="The denser the traffic, the faster the jams formed." sub="MIT News (2009), on the Japanese experiment" />],
  [S(36), S(37), <Line text="Every car → forward" />],
  [S(38), S(39), <Line text="← The jam moves BACKWARD" size={80} />],
  [S(38), S(40), <Sprout pose="shock" />],
  [S(39), S(40), <Stat big="~20 km/h ←" small="jam drifting backward · cars outside it ~40 km/h →" />],
  [S(40), S(42), <Line text="Cars leave the front. New cars join the back." sub="the jam survives, like a wave" />],
  [S(42), S(44), <Line text="Reach the front… nothing there." />],
  [S(44), S(45), <Stat big="5 cars" small="tiny jam, same behavior as on highways (Sugiyama et al. 2008)" />],
  [S(46), S(48), <Src name="review" label="Review of VSL and jam-absorption driving, arXiv 2504.11372 (2025)" marks={["propagate against the traffic direction at a speed of 10"]} />],
  [S(48), S(49), <Stat big="tens of km" small="many waves keep their shape that long" />],
  [S(49), S(50), <Stat big="up to 50 km" small="tracked moving upstream (same review)" color={RED} />],
  [S(49), S(51), <Sprout pose="shock" />],
  [S(50), S(51), <Line text="Triggers: a merge · an on-ramp · a lane that ends" />],
  [S(51), S(53), <Stat big="up to 25% lower" small="flow out of a stop-and-go wave vs. normal capacity (same review)" />],
  [S(54), S(57), <Src name="mit2009" label="MIT News, June 9, 2009 (Flynn, Kasimov, Nave, Rosales, Seibold, Phys. Rev. E)" />],
  [S(58), S(61), <Sonic />],
  [S(59), S(61), <Sprout pose="think" />],
  [S(61), S(62), <Quote text="You're stuck in traffic until all of the sudden it just clears." who="Morris Flynn, MIT News (2009)" />],
  [S(62), S(63), <Line text="Once formed: almost impossible to break up" sub="MIT News (2009)" />],
  [S(63), S(64), <Sprout pose="sad" />],
  [S(64), S(65), <Sprout pose="wink" />],
  [S(65), S(66), <Src name="stern" label="Stern et al., Transportation Research Part C 89 (2018), arXiv 1705.01693" width={1300} y={130} />],
  [S(67), S(69), <Line text="One car: computer-controlled" sub="job: stay calm, keep extra room, smooth its speed" />],
  [S(69), S(70), <Sprout pose="excited" />],
  [S(70), S(72), <Stat big="up to −40% fuel · +15% flow" small="with waves present, on a test track (Stern et al. 2018)" />],
  [S(73), S(75), <Line text="Mid-November 2022 · I-24 near Nashville" sub="100 automated vehicles (MegaVanderTest, arXiv 2404.15533)" />],
  [S(75), S(76), <Line text="Smooth the speed. Don't chase the car ahead." />],
  [S(76), S(77), <Line text="I-24 MOTION: tracks every vehicle on the road" sub="so the effect could be measured" />],
  [S(77), S(78), <Quote text="a single vehicle driving differently in one of the four lanes of I-24…" who="Hayat et al., “Traffic smoothing using explicit local controllers” (OSTI 2341544)" />],
  [S(78), S(79), <Line text="An early result from one stretch of road" sub="not a cure for rush hour" />],
  [S(79), S(80), <Line text="Two ways to fight the waves" size={76} />],
  [S(80), S(81), <VSL />],
  [S(81), S(82), <Line text="2. Jam-absorption driving" size={76} />],
  [S(82), S(85), <JAD />],
  [S(85), S(86), <Line text="A popular-science article → rigorous study since 2013" sub="review, arXiv 2504.11372" />],
  [S(86), S(87), <Line text="Limits" sub="works only when inflow is low enough · open question: secondary waves" size={76} />],
  [S(88), S(89), <Src name="stern" label="Stern et al. (2018), abstract — the researchers' argument" width={1300} y={130} marks={["5%"]} />],
  [S(90), S(91), <Tips n={1} />],
  [S(91), S(92), <Tips n={2} />],
  [S(92), S(93), <Tips n={3} />],
  [S(90), S(92), <Sprout pose="happy" />],
  [S(94), S(95), <Line text="Watch the car behind, too." size={76} />],
  [S(95), S(97), <Bilateral />],
  [S(97), S(98), <Src name="csail" label="MIT CSAIL News (2017) — the team's projection" width={1100} marks={["bilateral control", "twice as quickly"]} />],
  [S(98), S(99), <Line text="Give the chain room on both sides." />],
  [S(99), S(101), <Line text="One driver fixing a highway alone? No evidence." sub="but calm driving did calm the test track" />],
  [S(101), S(102), <Line text="Nobody crashed. Somebody braked." size={84} />],
  [S(102), S(103), <Line text="Your worst phantom jam? Tell me in the comments." />],
  [S(102), S(103), <Sprout pose="wink" />],
];

export const Cm01Full: React.FC = () => {
  useFonts();
  const f = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: "#9ED8FF" }}>
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
      <Html5Audio src={staticFile("cm01/narration.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
