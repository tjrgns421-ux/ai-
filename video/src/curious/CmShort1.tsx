import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Easing, Html5Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm01s/narration.words.json";
import LINES from "../../public/cm01s/lines.json";
import { SimFrame, simulate } from "./RingSim";
import { Car, Cones, Track, Trees, fwd, pos } from "./Ring3D";

// Curious Minutes ep01, Short #1 (9:16, under 30 s): the 2008 ring experiment, told on its own.
const FPS = 30, HZ = 20, L = 230;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);

const END_CARD = 2.6; // seconds of end card after the narration
const TL = makeTimeline(words, LINES as string[], [], Math.round(END_CARD * FPS));
export const CMS1_FRAMES = TL.duration;
const LS: number[] = (() => {
  const res: number[] = [];
  let after = 0;
  for (const l of LINES as string[]) {
    const t = TL.timeOf(l.split(/\s+/).slice(0, 3).join(" "), after);
    res.push(t);
    after = t + 0.01;
  }
  return res;
})();
const END = TL.duration / FPS;
const T_CARD = TL.timeOf("jam moves backward", LS[6]) - 0.25; // end card starts with "the jam moves backward"

// one simulation: steady flow, one driver eases off when the narration says so, then it plays sped up
const TK = LS[2]; // "Somewhere, one driver eased off."
const FAST = 3.5;
const simT = (s: number) => (s < TK ? s : TK + (s - TK) * FAST);
const SIM = simulate(simT(END) + 2, HZ, null, { kickAt: TK + 0.3 });
const HOOK = simulate(100, HZ, null).slice(70 * HZ); // a fully formed jam, for the opening seconds

const wrap = (d: number) => ((((d + L / 2) % L) + L) % L) - L / 2;
const frameAt = (sim: SimFrame[], t: number): SimFrame => {
  const u = Math.max(0, Math.min(t * HZ, sim.length - 1.001));
  const i = Math.floor(u), k = u - i;
  const a = sim[i], b = sim[i + 1];
  return { x: a.x.map((x, n) => (((x + wrap(b.x[n] - x) * k) % L) + L) % L), v: a.v.map((v, n) => v + (b.v[n] - v) * k), a: a.a };
};
const slowest = (f: SimFrame) => f.x[f.v.indexOf(Math.min(...f.v))];

type Shot = { pos: THREE.Vector3; look: THREE.Vector3 };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const mix = (a: Shot, b: Shot, k: number): Shot => ({ pos: a.pos.clone().lerp(b.pos, k), look: a.look.clone().lerp(b.look, k) });
const aerial = (s: number, r: number, h: number, a0: number): Shot => {
  const a = a0 + s * 0.06;
  return { pos: V(Math.cos(a) * r, h, Math.sin(a) * r), look: V(0, 0, 0) };
};
const lookBack = (x: number, back = 12, h = 5): Shot => {
  const p = pos(x), d = fwd(x);
  return { pos: p.clone().addScaledVector(d, back).add(V(0, h, 0)).addScaledVector(p.clone().normalize(), 2.5), look: p.clone().addScaledVector(d, -16).add(V(0, 0.5, 0)) };
};
const jamShot = (x: number): Shot => {
  const p = pos(x);
  return { pos: p.clone().addScaledVector(p.clone().normalize(), 30).add(V(0, 34, 0)), look: p.clone() };
};

// smoothed position of the jam in the main sim (for the jam camera)
const JAM: number[] = (() => {
  const res: number[] = [];
  let cur: number | null = null;
  for (const f of SIM) {
    if (Math.min(...f.v) < 3) {
      const target = slowest(f);
      cur = cur === null ? target : cur + 0.05 * wrap(target - cur);
    }
    res.push(cur === null ? 0 : ((cur % L) + L) % L);
  }
  return res;
})();

// camera keys in video seconds
type Key = [number, (s: number) => Shot];
const KEYS: Key[] = [
  [0, (s) => lookBack(slowest(frameAt(HOOK, s)) + 4, 14, 4)],
  [LS[1], (s) => aerial(s, 30, 112, 2.2)],
  [LS[2] - 0.4, () => lookBack(frameAt(SIM, simT(LS[2] - 0.4)).x[0], 13, 5)],
  [LS[2] + 0.01, (s) => lookBack(frameAt(SIM, simT(s)).x[0] - 6, 16, 6)],
  [LS[4], (s) => jamShot(JAM[Math.min(JAM.length - 1, Math.round(simT(s) * HZ))])],
  [LS[5], (s) => aerial(s, 34, 100, 1.4)],
];
const TR = [0, 0.01, 0.01, 1.4, 1.6, 1.8]; // transition length into each key (0.01 = hard cut)
const shotAt = (s: number): Shot => {
  let k = 0;
  while (k + 1 < KEYS.length && s >= KEYS[k + 1][0]) k++;
  const cur = KEYS[k][1](s);
  const tr = TR[k];
  if (k === 0 || s >= KEYS[k][0] + tr) return cur;
  return mix(KEYS[k - 1][1](s), cur, ease((s - KEYS[k][0]) / tr));
};

const Rig: React.FC<{ sh: Shot }> = ({ sh }) => {
  const { camera, scene } = useThree();
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  scene.background = new THREE.Color("#9ED8FF");
  scene.fog = new THREE.Fog("#BFE6FF", 140, 300);
  return null;
};

const Ring: React.FC = () => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  const f = s < LS[1] ? frameAt(HOOK, s) : frameAt(SIM, simT(s));
  return (
    <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true }} camera={{ fov: 62, near: 0.5, far: 600 }}>
      <Rig sh={shotAt(s)} />
      <hemisphereLight args={["#ffffff", "#6E9C50", 1.1]} />
      <directionalLight position={[60, 90, 40]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-80} shadow-camera-right={80} shadow-camera-top={80} shadow-camera-bottom={-80} />
      <Track />
      <Cones />
      <Trees />
      {f.x.map((_, k) => <Car key={k} f={f} i={k} />)}
    </ThreeCanvas>
  );
};

// ---------- overlays ----------
const inAt = (fr: number, t: number) => {
  const lf = fr - t * FPS;
  return { opacity: interpolate(lf, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf, [0, 9], [0.9, 1], { ...cl, easing: out })})` };
};
const Box: React.FC<{ children: React.ReactNode; bg?: string; size?: number; style?: React.CSSProperties }> = ({ children, bg = "#FFFFFF", size = 64, style }) => (
  <div style={{ display: "inline-block", background: bg, border: `6px solid ${INK}`, borderRadius: 26, padding: "16px 34px", boxShadow: "0 12px 0 rgba(20,21,27,0.25)", fontFamily: "Pretendard", fontWeight: 900, fontSize: size, lineHeight: 1.12, color: INK, textAlign: "center", ...style }}>{children}</div>
);
const Top: React.FC<{ from: number; to: number; children: React.ReactNode; y?: number }> = ({ from, to, children, y = 300 }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  if (s < from || s >= to) return null;
  return <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", ...inAt(fr, from) }}>{children}</div>;
};

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const ch = TL.chunks;
  const i = ch.findIndex((c, k) => fr >= c.start && fr < (ch[k + 1]?.start ?? c.start + 45));
  if (i < 0 || fr / FPS >= T_CARD) return null;
  const lf = fr - ch[i].start;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1250, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 70, letterSpacing: -1, lineHeight: 1.15, color: "#FFFFFF", background: "rgba(14,15,20,0.8)", padding: "10px 30px", borderRadius: 18, opacity: interpolate(lf, [0, 2], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 5], [14, 0], { ...cl, easing: out })}px)` }}>{ch[i].text}</span>
    </div>
  );
};

const Labels: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const fast = s >= TK && s < T_CARD;
  return (
    <>
      <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "Pretendard", fontWeight: 900, fontSize: 32, color: INK, background: YEL, padding: "6px 18px", borderRadius: 10, border: `4px solid ${INK}` }}>
        SIMULATION{fast ? ` · ${FAST}× speed` : ""}
      </div>
      <div style={{ position: "absolute", left: 50, top: 212, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "#FFFFFF", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>Recreation of Sugiyama et al. (2008), New J. Phys.</div>
    </>
  );
};

const EndCard: React.FC = () => {
  const fr = useCurrentFrame();
  const t0 = T_CARD;
  const lf = fr - t0 * FPS;
  if (lf < 0) return null;
  const hop = interpolate(lf, [0, 6, 12, 16], [80, -30, 8, 0], cl);
  return (
    <AbsoluteFill style={{ background: `rgba(158,216,255,${interpolate(lf, [0, 8], [0, 0.88], cl)})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 430, textAlign: "center", ...inAt(fr, t0) }}>
        <Box size={84}>Why does the jam<br />move <span style={{ color: RED }}>backward?</span></Box>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 760, textAlign: "center", ...inAt(fr, t0 + 0.3) }}>
        <Box bg={YEL} size={62}>Full 9-min video<br />on the channel</Box>
      </div>
      <Img src={staticFile("sprout/excited.png")} style={{ position: "absolute", left: 290, top: 1060 + hop, width: 500, height: 500, opacity: interpolate(lf, [0, 5], [0, 1], cl) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1590, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: INK, opacity: interpolate(lf, [8, 14], [0, 1], cl) }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};

export const CmShort1: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#9ED8FF" }}>
      <Ring />
      <Labels />
      <Top from={0} to={LS[1]}><Box size={88}>NO CRASH.<br />NO ROADWORK.</Box></Top>
      <Top from={LS[1]} to={LS[2]}><Box size={58}>2008 · <span style={{ color: RED }}>22 cars</span><br />230 m circle<br /><span style={{ fontSize: 44 }}>one rule: drive steady</span></Box></Top>
      <Top from={LS[2]} to={LS[3]}><Box size={60}>One driver eases off</Box></Top>
      <Top from={LS[3]} to={LS[4]}><Box size={60}>…the next brakes <span style={{ color: RED }}>harder</span></Box></Top>
      <Top from={LS[4]} to={LS[5]}><Box size={60}>Cars <span style={{ color: RED }}>stop</span>.<br />Empty road.</Box></Top>
      <Top from={LS[5]} to={T_CARD}><Box size={80}>Nobody crashed.<br /><span style={{ color: RED }}>Somebody braked.</span></Box></Top>
      <Captions />
      <EndCard />
      <Html5Audio src={staticFile("cm01s/narration.mp3")} />
    </AbsoluteFill>
  );
};
