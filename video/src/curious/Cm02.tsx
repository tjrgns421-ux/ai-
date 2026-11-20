import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm02/narration.words.json";
import LINES from "../../public/cm02/lines.json";
import CAPS from "../../public/cm02/caps/captures.json";
import { BHShot, BlackHole } from "./BlackHole3D";

// Curious Minutes ep02 "What If You Fell Into a Black Hole?" — full 16:9 video on the narration timeline.
// 3D scenes are ILLUSTRATIONS based on NASA Goddard's 2024 visualization; real images are credited on screen.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", ORG = "#FF9F43";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const O = V(0, 0, 0);

const TL = makeTimeline(words, LINES as string[], [], 75);
export const CM02_FRAMES = TL.duration;
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

// ---------------- overlay pieces ----------------
const useIn = (d = 0) => {
  const lf = useCurrentFrame() - d;
  return { opacity: interpolate(lf, [0, 6], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 10], [24, 0], { ...cl, easing: out })}px) scale(${interpolate(lf, [0, 10], [0.94, 1], { ...cl, easing: out })})` };
};
const Badge: React.FC<{ text: string; color?: string }> = ({ text, color = YEL }) => (
  <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: INK, background: color, padding: "6px 16px", borderRadius: 10, border: `4px solid ${INK}` }}>{text}</div>
);
const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", right: 60, top: 58, fontFamily: "Pretendard", fontWeight: 700, fontSize: 24, color: "#FFFFFF", opacity: 0.85, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{text}</div>
);
const Card: React.FC<{ y?: number; children: React.ReactNode; w?: number; bg?: string; x?: number }> = ({ y = 170, children, w = 1300, bg = "#FFFFFF", x }) => (
  <div style={{ position: "absolute", left: x ?? (1920 - w) / 2, top: y, width: w, display: "flex", justifyContent: "center", ...useIn() }}>
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
type CapInfo = { w: number; h: number; source?: string; marks: Record<string, { x: number; y: number; w: number; h: number }[]> };
const CI = CAPS as unknown as Record<string, CapInfo>;
const Src: React.FC<{ name: string; label?: string; width?: number; y?: number; marks?: string[]; hold?: number }> = ({ name, label, width = 1300, y = 150, marks, hold = 105 }) => {
  const lf = useCurrentFrame();
  const c = CI[name];
  const sc = Math.min(width / c.w, 1.15);
  const w = c.w * sc;
  const ms = marks ?? Object.keys(c.marks);
  return (
    <div style={{ position: "absolute", left: (1920 - w - 60) / 2, top: y, ...useIn() }}>
      <div style={{ background: "#FFFFFF", padding: 30, borderRadius: 18, border: `5px solid ${INK}`, boxShadow: "0 14px 0 rgba(0,0,0,0.35)", transformOrigin: "100% 0%", transform: (() => {
        const k = interpolate(lf, [hold, hold + 14], [0, 1], { ...cl, easing: ease });
        const left = (1920 - w - 60) / 2, right = left + w + 70;
        return `translate(${(1880 - right) * k}px, ${(36 - y) * k}px) scale(${1 - 0.6 * k})`;
      })() }}>
        <div style={{ position: "relative", width: w, height: c.h * sc }}>
          {ms.flatMap((m) => c.marks[m] ?? []).map((b, k) => (
            <div key={k} style={{ position: "absolute", left: b.x * sc - 4, top: b.y * sc, height: b.h * sc, width: (b.w * sc + 8) * interpolate(lf, [12 + k * 6, 26 + k * 6], [0, 1], cl), background: YEL, opacity: 0.75, borderRadius: 6 }} />
          ))}
          <Img src={staticFile(`cm02/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: c.h * sc, mixBlendMode: "multiply" }} />
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: INK, opacity: 0.65, marginTop: 16 }}>Source: {label ?? c.source}</div>
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
export const Label: React.FC<{ x: number; y: number; text: string; dx?: number; dy?: number }> = ({ x, y, text, dx = 160, dy = -120 }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [0, 12], [0, 1], { ...cl, easing: out });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={x} y1={y} x2={x + dx * k} y2={y + dy * k} stroke="#FFFFFF" strokeWidth={4} />
      <circle cx={x} cy={y} r={9} fill={YEL} stroke={INK} strokeWidth={3} />
      <foreignObject x={x + dx - (dx < 0 ? 520 : 0)} y={y + dy - 40} width={520} height={90} opacity={k}>
        <div style={{ display: "flex", justifyContent: dx < 0 ? "flex-end" : "flex-start" }}>
          <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: INK, background: "#FFFFFF", border: `4px solid ${INK}`, borderRadius: 14, padding: "6px 18px" }}>{text}</span>
        </div>
      </foreignObject>
    </svg>
  );
};
const Photo: React.FC<{ src: string; credit: string; fit?: "cover" | "contain"; zoom?: [number, number] }> = ({ src, credit, fit = "cover", zoom = [1.04, 1.14] }) => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile(`cm02/img/${src}`)} style={{ width: "100%", height: "100%", objectFit: fit, transform: `scale(${interpolate(lf, [0, 300], zoom, cl)})` }} />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#FFFFFF", background: "rgba(0,0,0,0.55)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
    </AbsoluteFill>
  );
};

// ---------------- 3D black hole scenes ----------------
type Float = { pose: string; x: number; y: number; size?: number; flip?: boolean; tilt?: number };
type ShotFn = (s: number) => BHShot & { beta?: number; sprout?: Float; spin?: number };
// Sprout drifting in space next to the black hole (a 2D layer over the 3D view): slow bob, sway and turn
const FloatSprout: React.FC<{ f: Float; s: number }> = ({ f, s }) => {
  const size = f.size ?? 300;
  const bob = Math.sin(s * 1.3) * 18, sway = Math.sin(s * 0.7) * 14, rot = (f.tilt ?? 0) + Math.sin(s * 0.9) * 9;
  return <Img src={staticFile(`sprout/${f.pose}.png`)} style={{ position: "absolute", left: f.x - size / 2 + sway, top: f.y - size / 2 + bob, width: size, height: size, transform: `rotate(${rot}deg) scaleX(${f.flip ? -1 : 1})`, filter: "drop-shadow(0 0 24px rgba(255,170,90,0.35))" }} />;
};
const BH: React.FC<{ shot: ShotFn; credit?: string; badge?: string; children?: React.ReactNode; hideHole?: boolean }> = ({ shot, credit = "Illustration based on NASA Goddard (2024)", badge = "ILLUSTRATION", children, hideHole }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  const sh = shot(s);
  return (
    <AbsoluteFill>
      <BlackHole shot={sh} t={s * (sh.spin ?? 1) + 40} beta={sh.beta ?? 0} hideHole={hideHole}>{children}</BlackHole>
      {sh.sprout && <FloatSprout f={sh.sprout} s={s} />}
      <Badge text={badge} />
      <Credit text={credit} />
    </AbsoluteFill>
  );
};
const orbit = (a: number, r: number, h: number, look = O): BHShot => ({ pos: V(Math.sin(a) * r, h, Math.cos(a) * r), look });
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const prog = (s: number, a: number, b: number) => interpolate(s, [0, b - a], [0, 1], { ...cl, easing: ease });

// hook: slow push-in on the hero view
const hookShot: ShotFn = (s) => orbit(0.25 - s * 0.01, lerp(75, 42, Math.min(1, s / 14)), lerp(9, 4, Math.min(1, s / 14)));
// the approach (lines 9-19): from far away to close enough to see the photon rings
export const approach: ShotFn = (s) => {
  const k = prog(s, S(9), S(20));
  const r = lerp(260, 14, Math.pow(k, 0.8));
  return { ...orbit(0.1 + k * 0.5, r, lerp(30, 1.4, k)), fov: 45 };
};
// the size section: a wide, slowly turning view
export const wide: ShotFn = (s) => orbit(1.2 + s * 0.02, 70, 22);
// the fall (35-42): spiral in, speeding up; the camera looks a little ahead of the hole
const fall: ShotFn = (s) => {
  const k = prog(s, S(35), S(43));
  const a = 2.6 + k * Math.PI * 2 * 1.9; // almost two orbits
  const r = lerp(48, 7.5, k);
  const pos = V(Math.sin(a) * r, lerp(6, 1.1, k), Math.cos(a) * r);
  const ahead = V(Math.sin(a + 0.6) * r * 0.4, 0, Math.cos(a + 0.6) * r * 0.4);
  const beta = s < S(39) - S(35) ? lerp(0.04, 0.19, k / 0.55) : lerp(0.19, 0.55, Math.min(1, (s - (S(39) - S(35))) / (S(43) - S(39))));
  return { pos, look: ahead, beta: Math.min(beta, 0.6), fov: 55 };
};
// crossing (50-53): dive into the shadow
const dive: ShotFn = (s) => {
  const k = prog(s, S(50), S(52) + 0.6);
  return { pos: V(0, lerp(1.2, 0.2, k), lerp(9, 2.2, Math.pow(k, 1.4))), look: O, beta: lerp(0.5, 0.8, k), fov: 60 };
};
// near miss (76-83): slingshot past the horizon and away
const flyby: ShotFn = (s) => {
  const k = prog(s, S(77), S(84));
  const a = -1.2 + k * 3.4;
  const r = 4.2 + Math.pow(Math.abs(k - 0.45) * 2.2, 2) * 30;
  return { pos: V(Math.sin(a) * r, 0.9 + k * 3, Math.cos(a) * r), look: O, beta: 0.3 * (1 - Math.abs(k - 0.45) * 2), fov: 55 };
};
export const recap: ShotFn = (s) => orbit(-0.4 + s * 0.015, 34, 3.2);

// ---- shot library: the same black hole from many angles, cut every few seconds ----
const UP = V(0, 1, 0);
const offset = (pos: THREE.Vector3, side: number): THREE.Vector3 => {
  // look a little to one side so the hole sits on a third of the frame (side > 0: hole on the left)
  const d = O.clone().sub(pos).normalize();
  const right = d.clone().cross(UP).normalize();
  return O.clone().addScaledVector(right, side * pos.length() * 0.22);
};
type Gen = (u: number, r: number) => BHShot & { sprout?: Float; spin?: number };
const G: Record<string, Gen> = {
  front: (u, r) => ({ ...orbit(0.15 + u * 0.03, r, r * 0.12), fov: 45 }),
  leftThird: (u, r) => { const p = orbit(0.9 + u * 0.025, r, r * 0.16).pos; return { pos: p, look: offset(p, 1), fov: 45, sprout: { pose: "happy", x: 1450, y: 560, size: 300 } }; },
  rightThird: (u, r) => { const p = orbit(-0.7 - u * 0.025, r, r * 0.1).pos; return { pos: p, look: offset(p, -1), fov: 45, sprout: { pose: "wink", x: 470, y: 600, size: 280, flip: true } }; },
  top: (u, r) => ({ pos: V(0.01, r * 1.1 - u * 0.4, 0.01), look: O, up: V(Math.sin(u * 0.05), 0, Math.cos(u * 0.05)), fov: 50 }),
  low: (u, r) => ({ ...orbit(2.1 + u * 0.035, r * 0.8, -r * 0.18), fov: 48 }),
  skim: (u, r) => { const a = 1.6 + u * 0.06, rr = Math.max(7, r * 0.35); const p = V(Math.sin(a) * rr, 0.45, Math.cos(a) * rr); return { pos: p, look: V(Math.sin(a + 1.1) * rr * 0.5, 0, Math.cos(a + 1.1) * rr * 0.5), fov: 55 }; },
  close: (u, r) => { const p = orbit(0.5 + u * 0.04, Math.max(9, r * 0.3), 1.6).pos; return { pos: p, look: offset(p, 0.6), fov: 40, sprout: { pose: "excited", x: 1520, y: 300, size: 220, tilt: -12 } }; },
};
const cuts = (names: string[], r: (s: number) => number, every = 5): ShotFn => (s) => {
  const k = Math.floor(s / every);
  const sh = G[names[k % names.length]](s - k * every, r(s));
  return sh;
};

// the fall, intercut: POV (stars shift) and a chase view with Sprout as the falling astronaut
const fallCut: ShotFn = (s) => {
  const k = Math.floor(s / 4.5);
  const base = fall(s);
  if (k % 2 === 0) return base;
  const kk = prog(s, S(35), S(43));
  const a = 2.6 + kk * Math.PI * 2 * 1.9 - 0.25, r = lerp(48, 7.5, kk) + 6;
  return { pos: V(Math.sin(a) * r, lerp(7, 2, kk), Math.cos(a) * r), look: O, beta: 0, fov: 50, sprout: { pose: kk > 0.6 ? "shock" : "side", x: 760, y: 640, size: lerp(260, 200, kk), tilt: -10 } };
};


// a small probe for the friend's view: it slows, reddens and freezes just shy of the horizon
const Probe: React.FC<{ s: number }> = ({ s }) => {
  const r = 2.75 + 26 * Math.exp(-s / 2.2);
  const red = 1 - Math.exp(-s / 3.5);
  const col = new THREE.Color().setRGB(1, 1 - red * 0.75, 1 - red * 0.9);
  return (
    <group position={[r * 0.72, 0.3, r * 0.7]}>
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color={col} transparent opacity={1 - red * 0.6} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshBasicMaterial color={col} transparent opacity={0.18 * (1 - red)} />
      </mesh>
    </group>
  );
};
const FriendScene: React.FC = () => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  return (
    <BH shot={cuts(["friendA", "friendB"], () => 0, 6)}>
      <Probe s={s} />
    </BH>
  );
};

// ---- a star torn apart (ILLUSTRATION of a tidal disruption, after ESO's description) ----
const TDE_N = 1400;
const TdeStar: React.FC<{ u: number }> = ({ u }) => {
  const P = 11, t0 = 4.5; // orbit parameter; disruption starts at u = t0
  const th = (x: number) => -2.5 + Math.min(x, t0) * (2.5 / t0) + Math.max(0, x - t0) * 0.35; // true anomaly of the star's centre
  const at = (theta: number, shrink: number) => { const r = (P / (1 + Math.cos(theta))) * shrink; return V(r * Math.cos(theta), 0.2, r * Math.sin(theta)); };
  const k = Math.max(0, u - t0);
  const geo = React.useMemo(() => new THREE.BufferGeometry(), []);
  const pos = new Float32Array(TDE_N * 3), col = new Float32Array(TDE_N * 3);
  for (let i = 0; i < TDE_N; i++) {
    const f = i / (TDE_N - 1) - 0.5; // -0.5 trailing .. +0.5 leading
    const spread = Math.min(1, k / 6);
    const theta = th(u) + f * 2.6 * spread + (f > 0 ? f * k * 0.5 : 0);
    const lead = Math.max(0, f) * 2; // leading half falls inward toward the disk
    const p = at(Math.min(theta, 3.0), 1 - 0.75 * lead * Math.min(1, k / 7));
    const j = Math.sin(i * 12.9898) * 0.35 * spread;
    pos.set([p.x + j, p.y + Math.cos(i * 4.1) * 0.25 * spread, p.z - j], i * 3);
    const hot = 0.55 + 0.45 * (1 - Math.abs(f) * 1.6);
    col.set([1, 0.55 + 0.4 * hot, 0.25 + 0.6 * hot * hot], i * 3);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const core = at(th(u), 1);
  const starR = Math.max(0, 1.3 * (1 - Math.min(1, k / 3)));
  return (
    <>
      {starR > 0.02 && (
        <mesh position={core} scale={[1 + Math.min(1, k) * 0.8, 1, 1]}>
          <sphereGeometry args={[starR, 32, 32]} />
          <meshBasicMaterial color="#FFE7B0" />
        </mesh>
      )}
      {k > 0 && (
        <points geometry={geo}>
          <pointsMaterial size={0.32} vertexColors transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      )}
    </>
  );
};
const TdeScene: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  return (
    <BH shot={cuts(["tdeWide", "tdeClose", "tdeTop"], () => 46, 6)} credit="Illustration based on ESO (2020)">
      <TdeStar u={s * 0.55} />
    </BH>
  );
};
G.tdeWide = (u) => ({ ...orbit(0.95 + u * 0.02, 44, 13), look: V(4, 0, 2), fov: 45 });
G.tdeClose = (u) => ({ pos: V(16 + u * 0.3, 5, 14), look: V(3, 0, 3), fov: 45, sprout: { pose: "shock", x: 1600, y: 760, size: 240 } });
G.tdeTop = (u) => ({ pos: V(2, 52 - u * 0.5, 0.01), look: V(2, 0, 0), up: V(0, 0, -1), fov: 50 });
const PhotoCard: React.FC<{ src: string; credit: string }> = ({ src, credit }) => (
  <div style={{ position: "absolute", left: 1230, top: 430, width: 600, ...useIn() }}>
    <div style={{ background: "#FFFFFF", border: `5px solid ${INK}`, borderRadius: 18, padding: 12, boxShadow: "0 12px 0 rgba(0,0,0,0.35)" }}>
      <Img src={staticFile(`cm02/img/${src}`)} style={{ width: "100%", borderRadius: 10, display: "block" }} />
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 22, color: INK, marginTop: 8, opacity: 0.75 }}>{credit}</div>
    </div>
  </div>
);

// ---------------- 2D explainers ----------------
const Clock: React.FC<{ x: number; y: number; label: string; speed: number; color?: string; sub?: string }> = ({ x, y, label, speed, color = "#FFFFFF", sub }) => {
  const lf = useCurrentFrame();
  const a = (lf / FPS) * speed * 360 * 0.25;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 420, textAlign: "center", fontFamily: "Pretendard", color: "#FFFFFF", ...useIn() }}>
      <svg width={260} height={260}>
        <circle cx={130} cy={130} r={115} fill="#11131F" stroke={color} strokeWidth={10} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={130 + 95 * Math.sin((i * Math.PI) / 6)} y1={130 - 95 * Math.cos((i * Math.PI) / 6)} x2={130 + 105 * Math.sin((i * Math.PI) / 6)} y2={130 - 105 * Math.cos((i * Math.PI) / 6)} stroke="#FFFFFF" strokeWidth={5} />)}
        <line x1={130} y1={130} x2={130 + 90 * Math.sin((a * Math.PI) / 180)} y2={130 - 90 * Math.cos((a * Math.PI) / 180)} stroke={color} strokeWidth={8} strokeLinecap="round" />
        <circle cx={130} cy={130} r={10} fill={color} />
      </svg>
      <div style={{ fontSize: 44, fontWeight: 900, marginTop: 10 }}>{label}</div>
      {sub && <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.8 }}>{sub}</div>}
    </div>
  );
};
const Countdown: React.FC = () => {
  const lf = useCurrentFrame();
  const left = Math.max(0, 12.8 - lf / FPS);
  return (
    <div style={{ position: "absolute", right: 90, top: 150, textAlign: "right", fontFamily: "Pretendard", fontWeight: 900, color: "#FFFFFF", ...useIn() }}>
      <div style={{ fontSize: 40, opacity: 0.8 }}>after the horizon</div>
      <div style={{ fontSize: 170, lineHeight: 1, color: left < 3 ? RED : "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{left.toFixed(1)} s</div>
    </div>
  );
};
// spaghettification: Sprout stretched along the pull, with arrows (feet pulled harder than head)
const Noodle: React.FC<{ stretch?: [number, number] }> = ({ stretch = [0, 1] }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [20, 150], stretch, { ...cl, easing: ease });
  const sy = 1 + k * 0.95, sx = 1 - k * 0.42;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 80% at 50% 110%, #3A1C08 0%, #05060C 60%)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: -380, margin: "0 auto", width: 900, height: 600, borderRadius: "50%", background: "#000", boxShadow: "0 -10px 120px 40px rgba(255,140,40,0.55)" }} />
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 960 - 160, top: 440, width: 320, height: 320, transform: `scale(${sx}, ${sy})`, transformOrigin: "50% 50%" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={ORG} /></marker></defs>
        <line x1={1240} y1={380} x2={1240} y2={440} stroke={ORG} strokeWidth={10} markerEnd="url(#ah)" />
        <text x={1280} y={425} fontFamily="Pretendard" fontWeight={900} fontSize={40} fill="#FFFFFF">head: pulled less</text>
        <line x1={1240} y1={700} x2={1240} y2={880} stroke={ORG} strokeWidth={16} markerEnd="url(#ah)" />
        <text x={1280} y={810} fontFamily="Pretendard" fontWeight={900} fontSize={40} fill="#FFFFFF">feet: pulled more</text>
        <text x={960} y={1000} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={30} fill="#FFFFFF" opacity={0.7}>toward the black hole ↓</text>
      </svg>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
// small vs giant black hole: the danger zone (where tides tear you) is outside the small one's edge
const SizeCompare: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [0, 20], [0, 1], { ...cl, easing: out });
  const Hole: React.FC<{ cx: number; r: number; zone: number; title: string; sub: string; zoneIn: boolean }> = ({ cx, r, zone, title, sub, zoneIn }) => (
    <g>
      <circle cx={cx} cy={520} r={zone * k} fill={RED} opacity={0.22} stroke={RED} strokeWidth={4} strokeDasharray="14 10" />
      <circle cx={cx} cy={520} r={r * k} fill="#000" stroke="#FFB060" strokeWidth={6} />
      <text x={cx} y={860} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={52} fill="#FFFFFF">{title}</text>
      <text x={cx} y={915} textAnchor="middle" fontFamily="Pretendard" fontWeight={700} fontSize={32} fill="#FFFFFF" opacity={0.8}>{sub}</text>
      <text x={cx} y={zoneIn ? 530 : 520 - zone - 18} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={zoneIn ? 40 : 34} fill={zoneIn ? "#FF8A80" : RED}>{zoneIn ? "torn apart inside" : "torn apart out here"}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 80% at 50% 40%, #1A1D33 0%, #05060C 70%)" }}>
      <svg width={1920} height={1080}>
        <Hole cx={520} r={46} zone={190} title="Small (stellar-mass)" sub="up to ~30 Suns" zoneIn={false} />
        <Hole cx={1400} r={250} zone={150} title="Giant (supermassive)" sub="millions of Suns" zoneIn />
      </svg>
      {(() => {
        // small hole: stretched and gone before the edge
        const xa = interpolate(lf, [60, 260], [110, 440], { ...cl, easing: Easing.in(Easing.quad) });
        const st = interpolate(xa, [330, 440], [0, 1], cl);
        const sa = <Img key="a" src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: xa - 90, top: 520 - 90, width: 180, height: 180, opacity: lf < 60 ? 0 : 1 - st, transform: `scale(${1 + st * 2.4}, ${1 - st * 0.75})`, transformOrigin: "100% 50%" }} />;
        // giant hole: reaches the edge in one piece, then disappears inside
        const xb = interpolate(lf, [330, 560], [880, 1180], { ...cl, easing: Easing.in(Easing.quad) });
        const sb = interpolate(lf, [560, 640], [1, 0], cl);
        const b2 = <Img key="b" src={staticFile("sprout/happy.png")} style={{ position: "absolute", left: xb - 90, top: 520 - 90, width: 180, height: 180, opacity: lf < 330 ? 0 : 1, transform: `scale(${sb})` }} />;
        return [sa, b2];
      })()}
      <Badge text="ILLUSTRATION · not to scale" />
    </AbsoluteFill>
  );
};
const SkyWindow: React.FC = () => {
  const lf = useCurrentFrame();
  const r = interpolate(lf, [0, 200], [700, 220], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 960 - r, top: 470 - r, width: r * 2, height: r * 2, borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 80px 20px rgba(200,220,255,0.35)" }}>
        <Img src={staticFile("cm02/img/nasa-ahead.jpg")} style={{ position: "absolute", left: r - 960, top: r - 540, width: 1920, height: 1080, objectFit: "cover", filter: "brightness(1.3)" }} />
      </div>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const Singularity: React.FC = () => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 960 - 6, top: 540 - 6, width: 12, height: 12, borderRadius: "50%", background: "#FFFFFF", boxShadow: `0 0 ${40 + Math.sin(lf / 8) * 15}px 16px rgba(255,255,255,0.55)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 120, color: "#FFFFFF", opacity: interpolate(lf, [30, 50], [0, 0.9], cl) }}>?</div>
    </AbsoluteFill>
  );
};
const EarthSun: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [10, 40], [0, 1], { ...cl, easing: out });
  const x0 = 260, x1 = 1660, y = 760;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...useIn() }}>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke="#FFFFFF" strokeWidth={4} strokeDasharray="10 10" opacity={0.6} />
      <circle cx={x0} cy={y} r={22} fill="#4FA3FF" />
      <circle cx={x1} cy={y} r={60} fill="#FFD23F" />
      <rect x={x0} y={y - 22} width={(x1 - x0) * 0.17 * k} height={44} rx={10} fill="#000" stroke="#FFB060" strokeWidth={4} />
      <text x={x0} y={y + 70} fontFamily="Pretendard" fontWeight={900} fontSize={34} fill="#FFFFFF">Earth</text>
      <text x={x1} y={y + 110} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={34} fill="#FFFFFF">Sun</text>
      <text x={x0 + (x1 - x0) * 0.085} y={y - 44} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={34} fill="#FFB060" opacity={k}>horizon: ~17%</text>
    </svg>
  );
};
const Teasers: React.FC = () => (
  <div style={{ position: "absolute", left: 180, right: 180, top: 640, display: "flex", gap: 40 }}>
    {[["36 min", "younger than her crew"], ["a real star", "torn into spaghetti"]].map(([a, b], k) => (
      <div key={k} style={{ flex: 1, background: "#FFFFFF", border: `5px solid ${INK}`, borderRadius: 24, padding: "20px 30px", fontFamily: "Pretendard", color: INK, textAlign: "center", ...useIn(k * 40) }}>
        <div style={{ fontSize: 76, fontWeight: 900, color: k ? RED : "#1AA6D6" }}>{a}</div>
        <div style={{ fontSize: 38, fontWeight: 800 }}>{b}</div>
      </div>
    ))}
  </div>
);
const Recap: React.FC = () => {
  const items: [number, string][] = [[90, "400 million miles out · 3 hours · 2 orbits"], [91, "The sky ahead turns bright and squeezes forward"], [92, "Your friend sees you freeze at the edge"], [93, "Cross the horizon: light in, nothing out"], [94, "12.8 s later: spaghetti"], [95, "Or skim the edge: 36 min younger"]];
  const lf = useCurrentFrame();
  const t0 = S(89);
  return (
    <div style={{ position: "absolute", left: 120, top: 150, width: 980 }}>
      {items.map(([i, t]) => {
        const d = (S(i) - t0) * FPS;
        return (
          <div key={i} style={{ opacity: interpolate(lf, [d, d + 8], [0, 1], cl), transform: `translateX(${interpolate(lf, [d, d + 10], [-30, 0], { ...cl, easing: out })}px)`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 44, color: INK, background: "#FFFFFF", border: `4px solid ${INK}`, borderRadius: 16, padding: "10px 24px", marginBottom: 18, display: "inline-block" }}>{t}</div>
        );
      })}
    </div>
  );
};
const NextTime: React.FC = () => {
  const lf = useCurrentFrame();
  const cloud = (x: number, y: number, s: number, k: number) => (
    <div key={k} style={{ position: "absolute", left: x + Math.sin(lf / 40 + k) * 20, top: y, width: 300 * s, height: 110 * s, background: "#FFFFFF", borderRadius: 999, boxShadow: `${60 * s}px ${-40 * s}px 0 ${10 * s}px #FFFFFF, ${-50 * s}px ${-25 * s}px 0 0 #FFFFFF` }} />
  );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#6EC1FF, #CFEFFF)" }}>
      {cloud(1180, 220, 1.3, 1)}{cloud(1450, 520, 0.9, 2)}{cloud(980, 640, 0.7, 3)}
      <div style={{ position: "absolute", left: 140, top: 230, width: 900, fontFamily: "Pretendard", color: INK, ...useIn(6) }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#1A6FB5" }}>NEXT TIME</div>
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05, marginTop: 10 }}>Every type of cloud, explained</div>
        <div style={{ marginTop: 40, display: "inline-block", background: RED, color: "#FFFFFF", borderRadius: 16, padding: "14px 34px", fontSize: 46, fontWeight: 900, opacity: interpolate(lf, [40, 50], [0, 1], cl) }}>SUBSCRIBE</div>
      </div>
      <Img src={staticFile("sprout/excited.png")} style={{ position: "absolute", left: 1320, top: 560, width: 420, height: 420 }} />
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
const rApproach = (s: number) => lerp(260, 14, Math.pow(prog(s, S(9), S(20)), 0.8));
const withSprout = (fn: ShotFn, f: Float): ShotFn => (s) => ({ ...fn(s), sprout: f });
const spinTop: ShotFn = (s) => ({ ...G.top(s, 40), spin: 7 });
G.recapRight = (u, r) => ({ ...G.rightThird(u, r), sprout: { pose: "happy", x: 1640, y: 800, size: 220 } });
G.friendA = () => ({ ...orbit(0.8, 46, 5), fov: 40 });
G.friendB = (u) => ({ ...orbit(0.25 + u * 0.01, 40, 15), fov: 42 });
const SCENES: [number, React.ReactNode][] = [
  [0, <BH shot={hookShot} />],
  [S(1), <BH shot={cuts(["close"], () => 32)} />],
  [S(2), <Photo src="nasa-allsky.jpg" credit="NASA's Goddard Space Flight Center / J. Schnittman and B. Powell (2024)" fit="cover" />],
  [S(4), <BH shot={cuts(["top", "rightThird"], () => 44)} />],
  [S(5), <BH shot={cuts(["leftThird", "top", "skim", "rightThird", "low"], () => 60)} />],
  [S(9), <BH shot={cuts(["front", "leftThird", "low", "rightThird", "top", "front", "close", "skim", "leftThird", "front", "rightThird", "close"], rApproach)} />],
  [S(20), <BH shot={cuts(["leftThird", "top", "rightThird", "low"], () => 70)} />],
  [S(24), <Photo src="sgra.jpg" credit="EHT Collaboration (CC BY 4.0), via ESO" fit="contain" zoom={[1, 1.08]} />],
  [S(26), <BH shot={cuts(["front", "close"], () => 30)} />],
  [S(27), <Photo src="sgra.jpg" credit="EHT Collaboration (CC BY 4.0), via ESO" fit="contain" zoom={[1.08, 1.2]} />],
  [S(28), <BH shot={spinTop} />],
  [S(29), <Photo src="m87.jpg" credit="EHT Collaboration (CC BY 4.0), via ESO" fit="contain" zoom={[1, 1.08]} />],
  [S(30), <BH shot={cuts(["rightThird", "front", "leftThird", "low", "top", "skim"], () => 110)} />],
  [S(35), <BH shot={fallCut} />],
  [S(44), <FriendScene />],
  [S(50), <BH shot={dive} />],
  [S(53), <SkyWindow />],
  [S(54), <BH shot={cuts(["close", "skim"], () => 16, 4)} />],
  [S(56), <Noodle />],
  [S(60), <Singularity />],
  [S(61), <SizeCompare />],
  [S(68), <TdeScene />],
  [S(76), <BH shot={withSprout(flyby, { pose: "excited", x: 1500, y: 720, size: 240 })} />],
  [S(80), <BH shot={cuts(["top", "low"], () => 40)} />],
  [S(84), <Singularity />],
  [S(89), <BH shot={cuts(["recapRight", "top", "close", "low", "skim", "front"], () => 34)} />],
  [S(97), <Photo src="nasa-allsky.jpg" credit="NASA's Goddard Space Flight Center / J. Schnittman and B. Powell (2024)" />],
  [S(98), <NextTime />],
];
const OVER: [number, number, React.ReactNode][] = [
  [S(0), S(1), <Line text={<>Small black hole: <span style={{ color: RED }}>torn apart</span> before the edge?</>} sub="NASA Goddard (2024)" />],
  [S(1), S(2), <Stat big="12.8 s" small="past the edge of a giant one (NASA Goddard, 2024)" color={RED} />],
  [S(2), S(4), <Line text="NASA, 2024: a simulated fall into a black hole" sub="Discover supercomputer, NASA Goddard" y={140} />],
  [S(4), S(5), <Teasers />],
  [S(5), S(7), <Src name="n-scen" />],
  [S(7), S(8), <Src name="n-dc" />],
  [S(8), S(9), <Line text="The camera = you" sub="“a stand-in for a daring astronaut” (NASA)" />],
  [S(9), S(11), <Src name="n-start" width={1200} />],
  [S(11), S(12), <Line text="Event horizon" sub="the edge of the black hole" size={56} />],
  [S(12), S(14), <Src name="an-light" width={1200} y={120} />],
  [S(15), S(16), <Line text="Accretion disk" sub="hot, spinning gas" size={56} />],
  [S(16), S(17), <Src name="an-blue" width={1200} y={120} />],
  [S(18), S(20), <Line text="Photon rings" sub="light that went around the black hole" size={56} />],
  [S(21), S(22), <Src name="n-mass" />],
  [S(22), S(23), <Src name="n-horizon" y={120} />],
  [S(22), S(23), <EarthSun />],
  [S(24), S(25), <Src name="eht-8" width={1200} y={60} />],
  [S(25), S(26), <Src name="eht-donut" width={1200} y={60} />],
  [S(26), S(27), <Src name="eht-shadow" width={1100} y={60} />],
  [S(27), S(28), <Src name="an-shadow" width={1200} y={60} />],
  [S(28), S(29), <Src name="eht-minutes" width={1200} y={60} />],
  [S(29), S(30), <Src name="eht-m87" width={1200} y={60} />],
  [S(30), S(31), <Stat big="4 million Suns" small="Sagittarius A*: small for a supermassive black hole" />],
  [S(31), S(32), <Src name="types-holm" />],
  [S(32), S(33), <Line text="Stellar-mass black holes" sub="the small kind" size={76} />],
  [S(33), S(34), <Src name="types-stellar" y={120} />],
  [S(33), S(34), <Src name="types-100m" y={420} />],
  [S(34), S(35), <Sprout pose="think" x={1500} y={640} />],
  [S(37), S(38), <Src name="n-3h" width={1250} y={110} marks={["about 3 hours", "almost two complete 30-minute orbits"]} />],
  [S(39), S(40), <Stat big="19% of light speed" small="about 70 million miles from the horizon (NASA SVS 14585)" />],
  [S(41), S(42), <Src name="n-bright" />],
  [S(42), S(43), <Quote text="The sky is shrinking before our eyes." who="NASA Goddard explainer (2024)" />],
  [S(43), S(44), <Sprout pose="shock" x={1520} y={620} />],
  [S(45), S(47), <Clock x={150} y={260} label="YOU" speed={1} color="#5BD68A" sub="your watch: normal" />],
  [S(46), S(49), <Clock x={1350} y={260} label="FRIEND SEES" speed={0.25} color={ORG} sub="you: slower… slower…" />],
  [S(49), S(50), <Src name="n-3h" width={1250} y={110} marks={["seem to freeze just shy of it"]} />],
  [S(52), S(53), <Src name="n-inward" />],
  [S(53), S(54), <Quote text="Light from the outside universe still shines in, but can never leave." who="NASA Goddard explainer (2024)" y={760} />],
  [S(54), S(56), <Countdown />],
  [S(55), S(56), <Src name="n-128" y={600} />],
  [S(57), S(59), <Src name="n-noodle" width={1150} y={60} />],
  [S(60), S(61), <Stat big="79,500 miles" small="from there to the center: microseconds (NASA)" />],
  [S(63), S(65), <Src name="n-super" width={1250} y={60} marks={["rip apart approaching objects before they get to the horizon"]} />],
  [S(67), S(68), <Src name="n-super" width={1250} y={60} marks={["you want to fall into a supermassive black hole"]} />],
  [S(69), S(71), <Src name="eso-215" width={1250} y={110} />],
  [S(69), S(72), <PhotoCard src="tde.jpg" credit="Artist’s impression: ESO / M. Kornmesser (CC BY 4.0)" />],
  [S(71), S(72), <Src name="eso-shred" width={1150} y={110} />],
  [S(72), S(73), <Src name="eso-half" width={1250} y={110} />],
  [S(73), S(74), <Stat big="10,000 km/s" small="debris blasted outward (ESO, 2020)" />],
  [S(74), S(75), <Stat big="6 months" small="the flare rose and faded (ESO, 2020)" />],
  [S(75), S(76), <Sprout pose="excited" x={1500} y={620} />],
  [S(78), S(79), <Src name="n-scen" width={1250} y={110} marks={["just misses the event horizon and slingshots back out"]} />],
  [S(80), S(81), <Clock x={250} y={240} label="ASTRONAUT" speed={1} color="#5BD68A" sub="6-hour trip" />],
  [S(80), S(81), <Clock x={1250} y={240} label="CREW" speed={1.1} color={ORG} sub="6 h 36 min passed" />],
  [S(81), S(82), <Src name="n-36" width={1250} y={110} />],
  [S(82), S(83), <Src name="n-inter" width={1250} y={110} />],
  [S(83), S(84), <Line text="It bends time." size={84} />],
  [S(85), S(87), <Line text="Singularity" sub="where physics as we know it stops working (NASA)" size={76} />],
  [S(87), S(88), <Src name="an-sing" width={1150} y={120} />],
  [S(88), S(89), <Sprout pose="think" x={1500} y={640} />],
  [S(89), S(96), <Recap />],
  [S(96), S(97), <Src name="n-super" width={1250} y={150} marks={["you want to fall into a supermassive black hole"]} />],
  [S(97), S(98), <Line text="3D scenes: illustrations based on NASA's simulation" sub="watch the real one: svs.gsfc.nasa.gov/14576" y={150} />],
];

export const Cm02Full: React.FC = () => {
  useFonts();
  const f = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: "#02030A" }}>
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
      <Html5Audio src={staticFile("cm02/narration.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
