import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm08/narration.words.json";
import LINES from "../../public/cm08/lines.json";
import CAPS from "../../public/cm08/caps/captures.json";
import { OceanStage, ShotO, floorY } from "./Ocean3D";
import { Chamber, GiantSquid, GoldenOrb, HoleLines, Isopod, Nodules, ROV } from "./Deep3D";

// Curious Minutes ep08 "6 Strange Things Found in the Deep Sea" — list format, a verdict after each.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71", ORG = "#FFB020";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const TL = makeTimeline(words, LINES as string[], [], 75);
export const CM08_FRAMES = TL.duration;
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
          <Img src={staticFile(`cm08/caps/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: c.h * sc, mixBlendMode: "multiply" }} />
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
      <Img src={staticFile(`cm08/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit, transform: `scale(${interpolate(lf % (CUT * FPS), [0, CUT * FPS], [zoom[0] + 0.08 * (k % 2), zoom[1] + 0.08 * (k % 2)], cl)})`, transformOrigin: k % 3 === 0 ? origin : ["35% 45%", "65% 55%"][k % 2] }} />
      <div style={{ position: "absolute", left: 60, bottom: 130, fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text={badge} color="#9FE3B0" />
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
  if (k === 1) off.applyAxisAngle(V(0, 1, 0), 0.75);
  else off.multiplyScalar(1.4).add(V(0, 2, 0));
  return { ...b, pos: b.look.clone().add(off) };
};
type ShotFn = (s: number) => ShotO;
// deep stage: camera near the floor (dark, far below the lit surface)
const Deep: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode; badge?: string; still?: boolean }> = ({ shot, children, badge = "ILLUSTRATION", still }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <OceanStage shot={still ? shot(s) : vary(shot, s)} t={s} deep>{children(s)}</OceanStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const orbit = (r: number, h: number, look: [number, number, number], a0 = 0, sp = 0.06, fov = 45): ShotFn => (s) => ({ pos: V(look[0] + Math.sin(a0 + s * sp) * r, look[1] + h, look[2] + Math.cos(a0 + s * sp) * r), look: V(...look), fov });
const orbY = floorY(0, 0) + 1.8;
const OrbScene = (s: number) => <><GoldenOrb /><ROV x={-7 + Math.min(4, s * 0.6)} y={orbY + 2} z={1} t={s} /></>;
const squidY = 14;
const SquidScene = (s: number) => <GiantSquid x={-10 + s * 0.8} y={squidY} z={0} t={s} scale={1.4} />;
// milky sea at night, as seen from a ship and from orbit (2D)
const MilkySea: React.FC<{ orbit?: boolean }> = ({ orbit: fromSpace }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [0, 60], [0, 1], cl);
  if (fromSpace)
    return (
      <AbsoluteFill style={{ background: "#05060C" }}>
        <svg width={1920} height={1080}>
          <defs><radialGradient id="mg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#E4F2FF" stopOpacity={0.35 + 0.6 * k} /><stop offset="1" stopColor="#CFE8FF" stopOpacity="0" /></radialGradient></defs>
          <path d="M 0 0 L 620 0 Q 760 300 640 520 Q 560 700 700 1080 L 0 1080 Z" fill="#1A1A1A" />
          <ellipse cx={1180} cy={560} rx={430} ry={260} fill="url(#mg)" />
          <text x={1180} y={180} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={44} fill="#FFFFFF">≈ 15,400 km² · about the size of Connecticut</text>
          <text x={300} y={200} textAnchor="middle" fontFamily="Pretendard" fontWeight={800} fontSize={34} fill="#FFFFFF" opacity={0.7}>land</text>
        </svg>
        <Badge text="ILLUSTRATION · satellite view at night (Wikipedia)" />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#03040A 0%, #070B18 45%, #0B1A2A 55%)" }}>
      <svg width={1920} height={1080}>
        <rect x={0} y={560} width={1920} height={520} fill={`rgba(190,225,255,${0.25 + 0.45 * k})`} />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={(i * 97 + lf) % 1920} y={580 + (i * 37) % 480} width={120} height={3} fill="#FFFFFF" opacity={0.15} />)}
        <path d="M 760 600 L 1160 600 L 1110 650 L 810 650 Z" fill="#0A0A0A" />
        <rect x={900} y={520} width={80} height={80} fill="#0A0A0A" />
        {Array.from({ length: 120 }, (_, i) => <circle key={`s${i}`} cx={(i * 211) % 1920} cy={(i * 53) % 500} r={1.4} fill="#FFFFFF" opacity={0.7} />)}
      </svg>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
// quorum sensing: dots light up together once there are enough (2D)
const Quorum: React.FC = () => {
  const lf = useCurrentFrame();
  const n = Math.min(160, Math.floor(lf * 1.5));
  const on = n > 120;
  return (
    <AbsoluteFill style={{ background: "#050812" }}>
      <svg width={1920} height={1080}>
        {Array.from({ length: n }, (_, i) => <circle key={i} cx={360 + ((i * 97) % 1200)} cy={180 + ((i * 61) % 700)} r={10} fill={on ? "#BFE8FF" : "#3A4A5A"} style={{ filter: on ? "drop-shadow(0 0 10px #BFE8FF)" : undefined }} />)}
        <text x={960} y={200} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={48} fill="#FFFFFF">{on ? "enough bacteria → they all light up" : "bacteria gathering…"}</text>
      </svg>
      <Badge text="ILLUSTRATION · based on Miller et al. (2021)" />
    </AbsoluteFill>
  );
};
// size line-up (2D): shallow relative vs deep giant
const SizeUp: React.FC = () => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [10, 60], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ background: "#071624" }}>
      <svg width={1920} height={1080}>
        <ellipse cx={520} cy={640} rx={40} ry={22} fill="#8A8A8A" />
        <text x={520} y={760} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={40} fill="#FFFFFF">pill bug (garden)</text>
        <ellipse cx={1260} cy={600} rx={40 + 380 * k} ry={22 + 150 * k} fill="#C9B8A0" />
        <text x={1260} y={900} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={40} fill="#FFFFFF">giant isopod (deep sea)</text>
      </svg>
      <Badge text="ILLUSTRATION · not to scale" />
    </AbsoluteFill>
  );
};
const Ideas: React.FC = () => {
  const lf = useCurrentFrame();
  const items = ["cold water", "scarce food", "fewer predators", "more oxygen"];
  return (
    <AbsoluteFill style={{ background: "#0B0D14" }}>
      <svg width={1920} height={1080}>
        {items.map((t, i) => { const on = interpolate(lf, [i * 25, i * 25 + 10], [0, 1], cl); return <g key={i} opacity={on}><rect x={260 + (i % 2) * 760} y={260 + Math.floor(i / 2) * 300} width={640} height={180} rx={24} fill="#FFFFFF" /><text x={580 + (i % 2) * 760} y={370 + Math.floor(i / 2) * 300} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={60} fill={INK}>{t}</text></g>; })}
        <text x={960} y={160} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={56} fill={YEL}>why so big? (Wikipedia)</text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scoreboard ----------
const Scoreboard: React.FC = () => {
  const lf = useCurrentFrame();
  const rows: [number, string, Verd][] = [[82, "The golden orb", "SOLVED"], [83, "The holes in the seafloor", "STILL UNKNOWN"], [84, "The kraken", "SOLVED"], [85, "The milky seas", "BEST GUESS"], [86, "Dark oxygen", "STILL UNKNOWN"], [87, "The giants of the deep", "BEST GUESS"]];
  const t0 = S(81);
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
const N = "NOAA Ocean Exploration";
const SCENES: [number, React.ReactNode][] = [
  [0, <Photo src="orb.jpg" credit={`Golden orb, Gulf of Alaska, Aug 30, 2023 · ${N}, Seascape Alaska (public domain)`} />],
  [S(2), <Deep shot={orbit(18, 4, [0, orbY, 0], 0.4)}>{OrbScene}</Deep>],
  [S(4), <Photo src="orb.jpg" credit={`Golden orb · ${N} (public domain)`} zoom={[1.2, 1.35]} />],
  [S(5), <Deep shot={(s) => ({ pos: V(-26 + s, orbY + 8, 16), look: V(0, orbY, 0), fov: 45 })}>{OrbScene}</Deep>],
  [S(6), <Deep shot={orbit(9, 2, [0, orbY, 0], 1.2, 0.08)}>{OrbScene}</Deep>],
  [S(7), <Photo src="orb.jpg" credit={`Golden orb, a little over 10 cm wide · ${N} (public domain)`} zoom={[1.5, 1.7]} />],
  [S(9), <Deep shot={orbit(6, 1, [0.3, orbY + 0.2, 0.2], 2, 0.1, 40)} still>{OrbScene}</Deep>],
  [S(11), <Photo src="orb_sampling.jpg" credit={`Collecting the orb with a suction sampler · ${N} (public domain)`} />],
  [S(12), <Photo src="orb_specimen.jpg" credit={`The orb in the ship's wet lab · ${N} (public domain)`} />],
  [S(14), <Deep shot={orbit(7, 1.5, [0.3, orbY, 0.2], 3, 0.1)} still>{OrbScene}</Deep>],
  [S(17), <Photo src="orb.jpg" credit={`Golden orb · ${N} (public domain)`} zoom={[1.05, 1.15]} />],
  [S(19), <Deep shot={orbit(10, 3, [0, orbY, 0], 0.2, 0.08)}>{OrbScene}</Deep>],
  [S(22), <Photo src="holes_sets.jpg" credit="Lines of holes, Mid-Atlantic Ridge, 2022 · NOAA Ocean Exploration, Voyage to the Ridge 2022 (public domain)" fit="cover" />],
  [S(24), <Deep shot={(s) => ({ pos: V(-24 + s, floorY(0, 0) + 10, 14), look: V(0, floorY(0, 0), 0), fov: 45 })}>{(s) => <><HoleLines /><ROV x={-14 + s * 0.8} y={floorY(0, 0) + 4} z={4} t={s} /></>}</Deep>],
  [S(25), <Photo src="holes_series.jpg" credit="A series of holes · NOAA Ocean Exploration, Voyage to the Ridge 2022 (public domain)" fit="cover" />],
  [S(27), <Photo src="holes_close.jpg" credit="Close-up, laser dots 10 cm apart · NOAA Ocean Exploration, Voyage to the Ridge 2022 (public domain)" fit="cover" />],
  [S(29), <Deep shot={(s) => ({ pos: V(0.01, floorY(0, 0) + 26 - s * 0.6, 0.01), look: V(0, 0, 0), up: V(0, 0, -1), fov: 50 })} still>{() => <HoleLines />}</Deep>],
  [S(30), <Deep shot={orbit(10, 3, [0, floorY(0, 0), 0], 0.6, 0.07)}>{(s) => <><HoleLines /><ROV x={-3} y={floorY(0, 0) + 2.5} z={2} t={s} /></>}</Deep>],
  [S(32), <Photo src="holes_sets.jpg" credit="NOAA Ocean Exploration, Voyage to the Ridge 2022 (public domain)" fit="cover" zoom={[1.2, 1.35]} />],
  [S(34), <Deep shot={(s) => ({ pos: V(-12 + s * 0.8, squidY + 2, 13), look: V(-6 + s * 0.8, squidY, 0), fov: 50 })}>{SquidScene}</Deep>],
  [S(37), <Photo src="squid.jpg" credit="Giant squid, Ranheim, Norway · NTNU Vitenskapsmuseet, CC BY 2.0 (Wikimedia Commons)" fit="cover" />],
  [S(38), <Deep shot={orbit(12, 2, [-4, squidY, 0], 0.4, 0.06)}>{SquidScene}</Deep>],
  [S(40), <Deep shot={(s) => ({ pos: V(-1 + s * 0.8, squidY + 1.5, 11), look: V(-9 + s * 0.8, squidY, 0), fov: 50 })} still>{(s) => <>{SquidScene(s)}<mesh position={[4, squidY, 0]}><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial color="#333" /></mesh><pointLight position={[4, squidY, 0]} intensity={30} distance={20} color="#FFF6DA" /></>}</Deep>],
  [S(42), <Deep shot={orbit(13, 3, [-2, squidY, 0], 2, 0.05)}>{SquidScene}</Deep>],
  [S(44), <MilkySea />],
  [S(47), <MilkySea orbit />],
  [S(48), <MilkySea />],
  [S(50), <MilkySea orbit />],
  [S(51), <Photo src="milky.jpg" credit="Milky sea seen by satellite (DMSP), 1995 · Steven Miller, U.S. Naval Research Laboratory (public domain)" />],
  [S(54), <Quorum />],
  [S(55), <MilkySea />],
  [S(57), <Deep shot={orbit(14, 3, [0, floorY(0, 0), 0], 0.3, 0.06)}>{(s) => <><Nodules /><Chamber t={s} /></>}</Deep>],
  [S(60), <Deep shot={(s) => ({ pos: V(4, floorY(0, 0) + 2.5, 5), look: V(0, floorY(0, 0), 0), fov: 45 })} still>{() => <Nodules />}</Deep>],
  [S(61), <Deep shot={orbit(7, 1.6, [0, floorY(0, 0) + 1, 0], 1, 0.08)} still>{(s) => <><Nodules /><Chamber t={s} o2={1} /></>}</Deep>],
  [S(63), <Deep shot={orbit(10, 2, [0, floorY(0, 0), 0], 2, 0.06)}>{(s) => <><Nodules /><Chamber t={s} o2={0.8} /></>}</Deep>],
  [S(65), <Deep shot={orbit(5, 1, [0, floorY(0, 0), 0], 2.2, 0.08)} still>{() => <Nodules />}</Deep>],
  [S(67), <Deep shot={orbit(16, 4, [0, floorY(0, 0), 0], 2.6, 0.05)}>{(s) => <><Nodules /><Chamber t={s} /><ROV x={-6} y={floorY(0, 0) + 4} z={3} t={s} /></>}</Deep>],
  [S(70), <Deep shot={orbit(10, 2, [0, floorY(0, 0), 0], 0.4, 0.07)}>{(s) => <Isopod x={-2} z={0} t={s} scale={1.6} />}</Deep>],
  [S(71), <Photo src="isopod.jpg" credit="Giant isopod (Bathynomus giganteus) · Eric Polk, CC BY-SA 4.0 (Wikimedia Commons)" />],
  [S(72), <SizeUp />],
  [S(73), <Deep shot={(s) => ({ pos: V(-12 + s * 0.8, squidY + 2, 13), look: V(-6 + s * 0.8, squidY, 0), fov: 50 })}>{SquidScene}</Deep>],
  [S(74), <Deep shot={orbit(8, 1, [0, floorY(0, 0), 0], 1.8, 0.08)} still>{(s) => <Isopod x={-2} z={0} t={s} scale={1.6} />}</Deep>],
  [S(75), <Ideas />],
  [S(79), <Deep shot={(s) => ({ pos: V(-20 + s, 4, 20), look: V(0, 2, 0), fov: 55 })}>{(s) => <><Isopod x={-4} z={2} t={s} scale={1.4} /><GoldenOrb x={8} z={-6} scale={0.7} /></>}</Deep>],
  [S(81), <Deep shot={orbit(30, 8, [0, 6, 0], 0, 0.04, 50)}>{(s) => <><GoldenOrb x={-8} z={-4} scale={0.8} /><HoleLines x={8} z={4} /><GiantSquid x={-4} y={16} z={-10} t={s} /><Isopod x={4} z={-8} t={s} scale={1.2} /><Nodules r={10} /></>}</Deep>],
];
const OVER: [number, number, React.ReactNode][] = [
  [S(0), S(1), <Line text="A golden orb on the seafloor?" size={76} y={120} />],
  [S(1), S(2), <Stat big="~3,300 m" small="deep · Gulf of Alaska, 2023 (NOAA)" y={120} />],
  [S(3), S(4), <Line text="Solved · Best guess · Still unknown" size={56} y={120} />],
  [S(4), S(5), <Chapter n={1} title="The golden orb" />],
  [S(8), S(9), <Src name="orb-yellow" y={110} width={1500} />],
  [S(9), S(10), <Line text="Sponge? Coral? Egg case?" size={76} y={120} />],
  [S(9), S(10), <Sprout pose="think" x={1500} y={620} />],
  [S(11), S(12), <Src name="orb-bio" y={110} width={1500} />],
  [S(15), S(16), <Line text="Spirocysts" sub="stinging cells found in only one group of animals (NOAA)" size={80} y={120} />],
  [S(18), S(19), <Line text="April 2026 · NOAA" sub="about 2½ years later" size={74} y={120} />],
  [S(19), S(20), <Src name="orb-anemone" y={110} width={1500} />],
  [S(20), S(21), <Sprout pose="wink" x={1500} y={620} />],
  [S(21), S(22), <Stamp v="SOLVED" note="Part of a deep-sea anemone." />],
  [S(22), S(23), <Chapter n={2} title="The holes in the seafloor" />],
  [S(26), S(27), <Stat big="~2,540 m" small="deep · Dive 04, 2022 (NOAA)" y={120} />],
  [S(27), S(28), <Src name="holes-human" y={110} width={1500} />],
  [S(30), S(31), <Src name="holes-noclue" y={110} width={1400} />],
  [S(31), S(32), <Line text="“Life traces”" sub="Vecchione & Bergstad, via NOAA" size={84} y={120} />],
  [S(32), S(33), <Sprout pose="shock" x={1500} y={620} />],
  [S(33), S(34), <Stamp v="STILL UNKNOWN" note="Something digs them. Nobody has caught it." />],
  [S(34), S(35), <Chapter n={3} title="The real kraken" />],
  [S(36), S(37), <Src name="squid-kraken" y={110} width={1200} />],
  [S(38), S(39), <Stat big="~12 m" small="long, incl. feeding tentacles · eyes up to 27+ cm (Wikipedia)" y={120} />],
  [S(40), S(41), <Line text="2004 · first photos of a live giant squid" sub="Tsunemi Kubodera's team, Japan (Wikipedia)" size={56} y={120} />],
  [S(41), S(42), <Line text="July 2012 · first video in the deep" sub="Wikipedia" size={66} y={120} />],
  [S(43), S(44), <Stamp v="SOLVED" note="The kraken was probably the giant squid." />],
  [S(44), S(45), <Chapter n={4} title="The milky seas" />],
  [S(46), S(47), <Line text="“sailing through a sea of milk”" sub="Jules Verne, Twenty Thousand Leagues Under the Seas" size={62} y={120} />],
  [S(47), S(48), <Stat big="235" small="sightings, 1915–1993 (Wikipedia)" y={120} />],
  [S(49), S(50), <Line text="1985 · Arabian Sea" sub="water samples: glowing bacteria (Wikipedia)" size={70} y={120} />],
  [S(53), S(54), <Line text="Moonlight is hundreds of times brighter" sub="Miller et al., Scientific Reports (2021)" size={56} y={120} />],
  [S(55), S(56), <Sprout pose="think" x={1500} y={620} />],
  [S(56), S(57), <Stamp v="BEST GUESS" note="Probably glowing bacteria." />],
  [S(57), S(58), <Chapter n={5} title="Dark oxygen" />],
  [S(59), S(60), <Line text="2024 · Nature Geoscience" sub="Sweetman et al." size={72} y={120} />],
  [S(62), S(63), <Stat big="> 3×" small="oxygen in two days, in sealed chambers (Sweetman et al., 2024)" y={120} />],
  [S(65), S(66), <Src name="dark-thermo" y={110} width={1400} />],
  [S(67), S(68), <Src name="dark-evidence" y={110} width={1400} />],
  [S(69), S(70), <Stamp v="STILL UNKNOWN" note="Disputed. New measurements on the way." />],
  [S(70), S(71), <Chapter n={6} title="The giants of the deep" />],
  [S(73), S(74), <Line text="Colossal squid: up to ~14 m" sub="Wikipedia" size={66} y={120} />],
  [S(76), S(77), <Src name="giant-why" y={110} width={1000} />],
  [S(79), S(80), <Sprout pose="think" x={1500} y={620} />],
  [S(80), S(81), <Stamp v="BEST GUESS" note="Several good ideas, no single answer." />],
  [S(81), S(88), <Scoreboard />],
  [S(89), S(90), <Line text="NOAA images credited on screen · 3D scenes are illustrations" size={42} y={140} />],
  [S(90), END, <Line text="Which one surprised you most?" size={70} sub="tell me in the comments" y={140} />],
  [S(90), END, <Sprout pose="excited" x={1500} y={620} />],
];

export const Cm08Full: React.FC = () => {
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
      <Html5Audio src={staticFile("cm08/narration.mp3")} />
      <Captions />
      <div style={{ position: "absolute", right: 40, bottom: 130, fontFamily: "Pretendard", fontWeight: 900, fontSize: 22, color: INK, background: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 8 }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
