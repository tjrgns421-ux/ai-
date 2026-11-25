import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import { Hydrophone, Iceberg, OceanStage, SURF, SeaStage, ShotO, SoundShells, Submarine, Whale } from "./Ocean3D";
import { OceanMap } from "./OceanMap";
import w1 from "../../public/cm05s1/words.full.json";
import l1 from "../../public/cm05s1/lines.json";
import c1 from "../../public/cm05s1/clips.json";
import e1 from "../../public/cm05s1/env.json";
import w2 from "../../public/cm05s2/words.full.json";
import l2 from "../../public/cm05s2/lines.json";
import c2 from "../../public/cm05s2/clips.json";
import e2 from "../../public/cm05s2/env.json";
import w3 from "../../public/cm05s3/words.full.json";
import l3 from "../../public/cm05s3/lines.json";
import c3 from "../../public/cm05s3/clips.json";
import e3 from "../../public/cm05s3/env.json";

// Curious Minutes ep05 Shorts (9:16, under 30 s): 1 = Bloop, 2 = Bio-Duck, 3 = the 52-hertz whale. Real NOAA audio.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71", CYAN = "#7FE3FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Clip = { line: number; file: string; at: number; dur: number };

const DATA = [
  { words: w1, lines: l1 as string[], clips: c1 as Clip[], env: e1 as Record<string, number[]>, dir: "cm05s1" },
  { words: w2, lines: l2 as string[], clips: c2 as Clip[], env: e2 as Record<string, number[]>, dir: "cm05s2" },
  { words: w3, lines: l3 as string[], clips: c3 as Clip[], env: e3 as Record<string, number[]>, dir: "cm05s3" },
];
const build = (k: number) => {
  const d = DATA[k];
  const TL = makeTimeline(d.words, d.lines, [], 45);
  const LS: number[] = [];
  let after = 0;
  for (const l of d.lines) {
    const t = TL.timeOf(l.split(/\s+/).slice(0, 3).join(" "), after);
    LS.push(t);
    after = t + 0.01;
  }
  return { ...d, TL, LS, END: TL.duration / FPS };
};
const B = [build(0), build(1), build(2)];
export const CMS5_FRAMES = B.map((b) => b.TL.duration);

const Box: React.FC<{ children: React.ReactNode; bg?: string; size?: number }> = ({ children, bg = "#FFFFFF", size = 64 }) => (
  <div style={{ display: "inline-block", background: bg, border: `6px solid ${INK}`, borderRadius: 26, padding: "16px 34px", boxShadow: "0 12px 0 rgba(0,0,0,0.35)", fontFamily: "Pretendard", fontWeight: 900, fontSize: size, lineHeight: 1.12, color: INK, textAlign: "center" }}>{children}</div>
);
const Top: React.FC<{ children: React.ReactNode; src?: string; y?: number }> = ({ children, src, y = 300 }) => {
  const lf = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", opacity: interpolate(lf, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf, [0, 9], [0.9, 1], { ...cl, easing: out })})` }}>
      {children}
      {src && <div style={{ marginTop: 18, fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: "#FFFFFF", textShadow: "0 2px 10px rgba(0,0,0,0.9)", opacity: interpolate(lf, [0, 6, 105, 115], [0, 0.9, 0.9, 0], cl) }}>Source: {src}</div>}
    </div>
  );
};
const Badge: React.FC<{ text: string; color?: string }> = ({ text, color = YEL }) => (
  <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "Pretendard", fontWeight: 900, fontSize: 32, color: INK, background: color, padding: "6px 18px", borderRadius: 10, border: `4px solid ${INK}` }}>{text}</div>
);
const Stamp: React.FC<{ v: "SOLVED" | "STILL UNKNOWN" }> = ({ v }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [0, 8], [2.2, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
  const c = v === "SOLVED" ? GRN : RED;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
      <span style={{ display: "inline-block", transform: `scale(${k}) rotate(-8deg)`, opacity: interpolate(lf, [0, 4], [0, 1], cl), border: `12px solid ${c}`, borderRadius: 26, padding: "12px 40px", fontFamily: "Pretendard", fontWeight: 900, fontSize: v === "SOLVED" ? 120 : 96, color: c, background: "rgba(10,10,14,0.75)", letterSpacing: 3 }}>{v}</span>
    </div>
  );
};
const Sprout: React.FC<{ pose: string; x?: number; y?: number; size?: number }> = ({ pose, x = 780, y = 1000, size = 250 }) => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x - size / 2 + Math.sin(s * 0.7) * 24, top: y - size / 2 + Math.sin(s * 1.4) * 16 + interpolate(lf, [0, 5, 10, 14], [60, -26, 6, 0], cl), width: size, height: size, transform: `rotate(${Math.sin(s * 0.9) * 8}deg)`, filter: "drop-shadow(0 0 24px rgba(127,227,255,0.45))" }} />;
};

const SPEED: Record<string, string> = { "bloop.wav": "sped up 16×", "ak52_10x.wav": "sped up 10×", "bioduck_clip.wav": "real speed" };
const NAME: Record<string, string> = { "bloop.wav": "“Bloop” · 1997", "ak52_10x.wav": "52-hertz call", "bioduck_clip.wav": "“Bio-Duck”" };
const Player: React.FC<{ c: Clip; env: number[]; spec: string }> = ({ c, env, spec }) => {
  const lf = useCurrentFrame();
  const p = Math.min(1, lf / FPS / (c.dur - 0.5));
  const W = 960, H = 700, X = 60, Y = 560;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #0E3A5A 0%, #03101C 75%)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 76, color: "#FFFFFF" }}>{NAME[c.file]}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center" }}>
        <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 38, color: INK, background: "#9FE3B0", padding: "8px 18px", borderRadius: 10, border: `4px solid ${INK}` }}>REAL RECORDING · {SPEED[c.file]}</span>
      </div>
      <div style={{ position: "absolute", left: X, top: Y, width: W, height: H, borderRadius: 18, overflow: "hidden", border: "4px solid rgba(255,255,255,0.25)" }}>
        <Img src={staticFile(spec)} style={{ width: W, height: H, objectFit: "fill", opacity: 0.35 }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: W * p, height: H, overflow: "hidden" }}><Img src={staticFile(spec)} style={{ width: W, height: H, objectFit: "fill" }} /></div>
        <div style={{ position: "absolute", left: W * p - 3, top: 0, width: 6, height: H, background: "#FFFFFF", boxShadow: "0 0 20px #FFFFFF" }} />
      </div>
      <svg width={W} height={180} style={{ position: "absolute", left: X, top: Y + H + 40 }}>
        {env.map((e, i) => {
          const h = 10 + e * 160;
          return <rect key={i} x={i * (W / env.length) + 2} y={90 - h / 2} width={W / env.length - 4} height={h} rx={3} fill={i / env.length <= p ? CYAN : "rgba(255,255,255,0.18)"} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1520, textAlign: "center", fontFamily: "Pretendard", fontWeight: 800, fontSize: 30, color: "#FFFFFF", opacity: 0.8 }}>{c.file === "bioduck_clip.wav" ? "Audio: NOAA Fisheries" : "Audio: NOAA PMEL"} · 🔊 sound on</div>
    </AbsoluteFill>
  );
};

type ShotFn = (s: number) => ShotO;
const Under: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode }> = ({ shot, children }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <OceanStage shot={shot(s)} t={s} width={1080} height={1920}>{children(s)}</OceanStage>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const Above: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode }> = ({ shot, children }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <SeaStage shot={shot(s)} t={s} width={1080} height={1920}>{children(s)}</SeaStage>
      <Badge text="ILLUSTRATION" />
    </AbsoluteFill>
  );
};
const MapV: React.FC<{ rot: (s: number) => [number, number]; pins: React.ComponentProps<typeof OceanMap>["pins"]; route?: React.ComponentProps<typeof OceanMap>["route"]; scale?: number }> = (p) => (
  <AbsoluteFill>
    <OceanMap {...p} width={1080} height={1920} cx={540} cy={1000} scale={p.scale ?? 500} />
    <Badge text="MAP · approximate" color="#9FE3B0" />
  </AbsoluteFill>
);
const orbit = (cx: number, cy: number, cz: number, r: number, h: number, a0 = 0, sp = 0.08, fov = 60): ShotFn => (s) => ({ pos: V(cx + Math.sin(a0 + s * sp) * r, cy + h, cz + Math.cos(a0 + s * sp) * r), look: V(cx, cy, cz), fov });
const NET: [number, number][] = [[-20, -14], [6, 8], [24, -10]];
const Net: React.FC<{ s: number }> = ({ s }) => <>{NET.map(([x, z], i) => <Hydrophone key={i} x={x} z={z} hear={((s + i * 0.4) % 1.2) / 1.2} />)}</>;
const tag = (x: number, y: number) => <mesh position={[x - 0.6, y + 0.7, 0]}><boxGeometry args={[0.6, 0.25, 0.35]} /><meshStandardMaterial color="#FF6B2A" /></mesh>;

const EndCard: React.FC = () => {
  const lf = useCurrentFrame();
  const inn = (d: number) => ({ opacity: interpolate(lf - d, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf - d, [0, 9], [0.9, 1], { ...cl, easing: out })})` });
  return (
    <AbsoluteFill style={{ background: `rgba(2,10,18,${interpolate(lf, [0, 8], [0, 0.55], cl)})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 360, textAlign: "center", ...inn(0) }}><Box size={74}><span style={{ color: RED }}>6</span> strange sounds<br />recorded in the ocean</Box></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1250, textAlign: "center", ...inn(9) }}><Box bg={YEL} size={58}>Full 9-min video<br />on the channel</Box></div>
      <Img src={staticFile("sprout/excited.png")} style={{ position: "absolute", left: 660, top: 1500 + interpolate(lf, [0, 6, 12, 16], [80, -30, 8, 0], cl), width: 320, height: 320 }} />
      <div style={{ position: "absolute", left: 60, top: 1640, fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: "#FFFFFF", opacity: interpolate(lf, [8, 14], [0, 1], cl) }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};

const Captions: React.FC<{ b: (typeof B)[number] }> = ({ b }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  if (b.clips.some((c) => s >= c.at && s < c.at + c.dur) || s >= b.LS[b.LS.length - 1]) return null;
  const ch = b.TL.chunks;
  const i = ch.findIndex((c, k) => fr >= c.start && fr < (ch[k + 1]?.start ?? c.start + 45));
  if (i < 0) return null;
  const lf = fr - ch[i].start;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1320, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 66, letterSpacing: -1, lineHeight: 1.15, color: "#FFFFFF", background: "rgba(14,15,20,0.8)", padding: "10px 30px", borderRadius: 18, opacity: interpolate(lf, [0, 2], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 5], [14, 0], { ...cl, easing: out })}px)` }}>{ch[i].text}</span>
    </div>
  );
};

// scenes and boxes per Short: [start, scene] and [start, end, overlay]
const plan = (n: number, b: (typeof B)[number]): { scenes: [number, React.ReactNode][]; over: [number, number, React.ReactNode][] } => {
  const L = b.LS, c = b.clips[0], E = b.END;
  const P = <Player c={c} env={b.env[c.file]} spec={`${b.dir}/img/spec_${c.file.replace(/\.\w+$/, "")}.jpg`} />;
  const end = L[L.length - 1];
  if (n === 1)
    return {
      scenes: [
        [0, <Under shot={(s) => ({ pos: V(-30 + s * 2, 10, 40), look: V(0, 9, 0), fov: 62 })}>{(s) => <><SoundShells at={[-70, 12, -50]} t={s} every={1.0} speed={22} max={140} /><Net s={s} /></>}</Under>],
        [c.at, P],
        [L[1], <MapV rot={(s) => [-105 + s, -25]} pins={[{ lon: -100, lat: -50, label: "Bloop (approx.)", ring: true }, { lon: -105, lat: 0, label: "NOAA hydrophones", color: "#FF6B5E", area: 9, delay: 25, dy: -30 }]} />],
        [L[2], <Under shot={(s) => ({ pos: V(10, 4, 40), look: V(-10, 16, -20), fov: 66 })}>{(s) => <group position={[-30 + s * 3, 18, -12]}><mesh scale={[26, 5, 6]}><sphereGeometry args={[1, 32, 20]} /><meshBasicMaterial color="#01060C" fog={false} transparent opacity={0.8} /></mesh><mesh position={[-28, 0, 0]} scale={[7, 0.8, 9]}><sphereGeometry args={[1, 16, 10]} /><meshBasicMaterial color="#01060C" fog={false} transparent opacity={0.8} /></mesh></group>}</Under>],
        [L[3], <Above shot={(s) => ({ pos: V(-36, SURF + 8, 44), look: V(6, SURF + 4, 0), fov: 58 })}>{(s) => <Iceberg x={0} z={0} size={14} seed={5} split={interpolate(s, [0.8, 4], [0, 1], cl)} />}</Above>],
        [L[3] + 3.2, <Under shot={orbit(0, 14, 0, 55, -4, 0.3, 0.08, 62)}>{(s) => <><Iceberg x={0} z={0} size={12} seed={5} split={0.8} /><SoundShells at={[12, SURF - 8, 0]} t={s} every={0.8} speed={18} max={120} /></>}</Under>],
        [end, <Under shot={orbit(0, 12, 0, 60, 6, 1, 0.06)}>{(s) => <><Iceberg x={-20} z={-20} size={9} seed={2} /><Whale x={10 + s} y={18} z={10} t={s} kind="blue" /><Net s={s} /></>}</Under>],
      ],
      over: [
        [0, c.at, <Top><Box size={84}>What made<br />this sound?</Box></Top>],
        [L[1], L[2], <Top src="NOAA PMEL"><Box size={64}>Heard by sensors<br /><span style={{ color: RED }}>&gt; 5,000 km</span> apart</Box></Top>],
        [L[2], L[3], <Top><Box size={80}>A giant<br />animal?</Box></Top>],
        [L[2], L[3], <Sprout pose="shock" x={800} y={1050} />],
        [L[3], L[4], <Top src="NOAA PMEL"><Box size={60}>2008 · iceberg A53a<br /><span style={{ color: "#1A7FB8" }}>icequakes</span> = very similar</Box></Top>],
        [L[4], end, <Stamp v="SOLVED" />],
        [L[4], end, <Top y={1010}><Box size={62}>It was <span style={{ color: "#1A7FB8" }}>ice</span>, cracking</Box></Top>],
        [end, E, <EndCard />],
      ],
    };
  if (n === 2)
    return {
      scenes: [
        [0, <Under shot={(s) => ({ pos: V(-14 + s * 1.6, SURF - 6, 22), look: V(-4 + s * 1.6, SURF - 8, 0), fov: 60 })}>{(s) => <><Whale x={-6 + s * 1.6} y={SURF - 7} z={0} t={s} kind="minke" scale={1.4} /><Whale x={-12 + s * 1.6} y={SURF - 10} z={-7} t={s + 1} kind="minke" scale={1.2} /></>}</Under>],
        [L[1], <Under shot={orbit(0, 12, 0, 40, 4, 0.3, 0.08)}>{(s) => <><Submarine x={0} y={12} z={0} /><SoundShells at={[30, 18, -20]} t={s} every={0.8} speed={14} max={70} color={CYAN} /></>}</Under>],
        [L[2], <Under shot={(s) => ({ pos: V(-30 + s * 1.5, 14, 30), look: V(-6 + s * 1.5, 13, 0), fov: 60 })}>{(s) => <Submarine x={-6 + s * 1.5} y={13} z={0} />}</Under>],
        [c.at, P],
        [L[3], <MapV rot={(s) => [-62 + s * 0.3, -60]} pins={[{ lon: -62.2, lat: -64.6, label: "Wilhelmina Bay", ring: true, dx: -330 }]} scale={1300} />],
        [L[3] + 2.6, <Under shot={orbit(0, SURF - 8, 0, 22, -5, 0.4, 0.1, 58)}>{(s) => <><Whale x={0} y={SURF - 8} z={0} t={s} kind="minke" scale={1.4} call={1} />{tag(0, SURF - 8)}</>}</Under>],
        [end, <Under shot={(s) => ({ pos: V(-18 + s * 1.6, SURF - 6, 24), look: V(-4 + s * 1.6, SURF - 8, 0), fov: 60 })}>{(s) => <><Whale x={-6 + s * 1.6} y={SURF - 7} z={0} t={s} kind="minke" scale={1.4} /><Whale x={-12 + s * 1.6} y={SURF - 10} z={-7} t={s + 1} kind="minke" scale={1.2} /></>}</Under>],
      ],
      over: [
        [0, L[1], <Top><Box size={80}>What's <span style={{ color: RED }}>quacking</span><br />under Antarctica?</Box></Top>],
        [L[1], L[2], <Top src="Wikipedia · National Geographic"><Box size={66}>~50 years<br />nobody knew</Box></Top>],
        [L[2], c.at, <Top src="Wikipedia"><Box size={60}>First heard by<br />submarine crews · 1960s</Box></Top>],
        [L[2], c.at, <Sprout pose="think" x={800} y={1050} />],
        [L[3], L[4], <Top src="National Geographic (2014)"><Box size={58}>2013 · recorders on<br /><span style={{ color: "#1A7FB8" }}>Antarctic minke whales</span></Box></Top>],
        [L[4], end, <Stamp v="SOLVED" />],
        [L[4], end, <Top y={1010}><Box size={62}>It's a <span style={{ color: "#1A7FB8" }}>whale</span></Box></Top>],
        [L[4], end, <Sprout pose="excited" x={800} y={1150} />],
        [end, E, <EndCard />],
      ],
    };
  return {
    scenes: [
      [0, <Under shot={(s) => ({ pos: V(-30 + s * 2, 26, 60), look: V(-10 + s * 2, 15, 0), fov: 62 })}>{(s) => <Whale x={-10 + s * 2} y={15} z={0} t={s} kind="blue" call={1} />}</Under>],
      [c.at, P],
      [L[1], <Under shot={orbit(0, 15, 0, 30, 2, 0.5, 0.1, 60)}>{(s) => <Whale x={0} y={15} z={0} t={s} kind="blue" call={1} />}</Under>],
      [L[1] + 3.2, <MapV rot={(s) => [-140 - s, 45]} pins={[{ lon: -123, lat: 36, label: "California" }, { lon: -165, lat: 53, label: "Aleutians", delay: 60, dx: -250 }]} route={{ pts: [[-123, 36], [-128, 41], [-135, 46], [-145, 51], [-155, 53], [-165, 53]] }} scale={760} />],
      [L[2], <Under shot={(s) => ({ pos: V(0, 30, 90), look: V(0, 14, 0), fov: 62 })}>{(s) => <><Whale x={-30 + s} y={15} z={0} t={s} kind="blue" call={1} /><Net s={s} /></>}</Under>],
      [L[3], <Under shot={orbit(0, 15, 0, 26, 3, 1.5, 0.1, 58)}>{(s) => <Whale x={0} y={15} z={0} t={s} kind="blue" />}</Under>],
      [end, <Under shot={(s) => ({ pos: V(-10 + s * 1.8, 30, 70), look: V(-10 + s * 1.8, 15, 0), fov: 62 })}>{(s) => <Whale x={-10 + s * 1.8} y={15} z={0} t={s} kind="blue" call={1} />}</Under>],
    ],
    over: [
      [0, c.at, <Top><Box size={80}>What made<br />this call?</Box></Top>],
      [L[1], L[1] + 3.2, <Top src="WHOI Oceanus (2005)"><Box size={64}>One whale · <span style={{ color: "#1A7FB8" }}>52 Hz</span><br />tracked 12 years</Box></Top>],
      [L[1] + 3.2, L[2], <Top src="WHOI Oceanus (2005)"><Box size={56}>California ↔ Alaska<br />every season</Box></Top>],
      [L[2], L[3], <Top src="WHOI Oceanus (2005)"><Box size={58}>Blue & fin whales:<br />15–25 Hz · <span style={{ color: RED }}>only one</span> at 52</Box></Top>],
      [L[2], L[3], <Sprout pose="sad" x={800} y={1080} />],
      [L[3], L[4], <Top src="WHOI Oceanus (2005)"><Box size={58}>Malformation? Hybrid?<br /><span style={{ color: RED }}>not confirmed</span></Box></Top>],
      [L[4], end, <Stamp v="STILL UNKNOWN" />],
      [end, E, <EndCard />],
    ],
  };
};

export const CmShort5: React.FC<{ n: number }> = ({ n }) => {
  useFonts();
  const b = B[n - 1];
  const { scenes, over } = plan(n, b);
  const f = (s: number) => Math.round(s * FPS);
  const sc = [...scenes].sort((x, y) => x[0] - y[0]);
  return (
    <AbsoluteFill style={{ background: "#03101C" }}>
      {sc.map(([t, el], k) => {
        const e = k + 1 < sc.length ? sc[k + 1][0] : b.END;
        return <Sequence key={k} from={f(t)} durationInFrames={Math.max(1, f(e) - f(t))} layout="none"><AbsoluteFill>{el}</AbsoluteFill></Sequence>;
      })}
      {over.map(([a, e, el], k) => (
        <Sequence key={`o${k}`} from={f(a)} durationInFrames={Math.max(1, f(e) - f(a) - 3)} layout="none"><AbsoluteFill>{el}</AbsoluteFill></Sequence>
      ))}
      <Captions b={b} />
      <Html5Audio src={staticFile(`${b.dir}/full.mp3`)} />
    </AbsoluteFill>
  );
};
