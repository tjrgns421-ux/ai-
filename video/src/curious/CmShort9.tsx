import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import { Crater, LandStage, Playa, ShotP } from "./Places3D";
import w1 from "../../public/cm09s1/narration.words.json";
import l1 from "../../public/cm09s1/lines.json";
import w2 from "../../public/cm09s2/narration.words.json";
import l2 from "../../public/cm09s2/lines.json";

// Curious Minutes ep09 Shorts (9:16, under 30 s), cut from the long-form: 1 the sailing stones · 2 the door to hell.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const RAW = [[w1, l1, "cm09s1"], [w2, l2, "cm09s2"]] as const;
const B = RAW.map(([w, l, dir]) => {
  const TL = makeTimeline(w as never, l as unknown as string[], [], 45);
  const LS: number[] = [];
  let after = 0;
  for (const line of l as unknown as string[]) {
    const t = TL.timeOf(line.split(/\s+/).slice(0, 3).join(" "), after);
    LS.push(t);
    after = t + 0.01;
  }
  return { TL, LS, dir, END: TL.duration / FPS };
});
export const CMS9_FRAMES = B.map((b) => b.TL.duration);

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
const Stamp: React.FC<{ v: "SOLVED" | "BEST GUESS" | "STILL UNKNOWN" }> = ({ v }) => {
  const lf = useCurrentFrame();
  const k = interpolate(lf, [0, 8], [2.2, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
  const c = v === "SOLVED" ? GRN : v === "BEST GUESS" ? "#FFB020" : RED;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
      <span style={{ display: "inline-block", transform: `scale(${k}) rotate(-8deg)`, opacity: interpolate(lf, [0, 4], [0, 1], cl), border: `12px solid ${c}`, borderRadius: 26, padding: "12px 40px", fontFamily: "Pretendard", fontWeight: 900, fontSize: v === "SOLVED" ? 120 : 96, color: c, background: "rgba(10,10,14,0.75)", letterSpacing: 3 }}>{v}</span>
    </div>
  );
};
const Sprout: React.FC<{ pose: string; x?: number; y?: number; size?: number }> = ({ pose, x = 800, y = 1080, size = 250 }) => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x - size / 2 + Math.sin(s * 0.7) * 24, top: y - size / 2 + Math.sin(s * 1.4) * 16 + interpolate(lf, [0, 5, 10, 14], [60, -26, 6, 0], cl), width: size, height: size, transform: `rotate(${Math.sin(s * 0.9) * 8}deg)`, filter: "drop-shadow(0 0 24px rgba(127,227,255,0.45))" }} />;
};
const Photo: React.FC<{ src: string; credit: string; zoom?: [number, number]; origin?: string }> = ({ src, credit, zoom = [1.05, 1.2], origin = "50% 50%" }) => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#050507" }}>
      <Img src={staticFile(`cm09/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${interpolate(lf, [0, 150], zoom, cl)})`, transformOrigin: origin }} />
      <div style={{ position: "absolute", left: 50, top: 1560, right: 50, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text="REAL IMAGE" color="#9FE3B0" />
    </AbsoluteFill>
  );
};
type ShotFn = (s: number) => ShotP;
const Land: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode; night?: boolean; badge?: string }> = ({ shot, children, night, badge = "ILLUSTRATION" }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <LandStage shot={shot(s)} width={1080} height={1920} night={night}>{children(s)}</LandStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const orbit = (r: number, h: number, ly: number, a0 = 0, sp = 0.08, fov = 55): ShotFn => (s) => ({ pos: V(Math.sin(a0 + s * sp) * r, ly + h, Math.cos(a0 + s * sp) * r), look: V(0, ly, 0), fov });
const EndCard: React.FC = () => {
  const lf = useCurrentFrame();
  const inn = (d: number) => ({ opacity: interpolate(lf - d, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf - d, [0, 9], [0.9, 1], { ...cl, easing: out })})` });
  return (
    <AbsoluteFill style={{ background: `rgba(8,12,20,${interpolate(lf, [0, 8], [0, 0.55], cl)})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 360, textAlign: "center", ...inn(0) }}><Box size={74}><span style={{ color: RED }}>6</span> strange places<br />on Earth</Box></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1250, textAlign: "center", ...inn(9) }}><Box bg={YEL} size={58}>Full video<br />on the channel</Box></div>
      <Img src={staticFile("sprout/excited.png")} style={{ position: "absolute", left: 660, top: 1500 + interpolate(lf, [0, 6, 12, 16], [80, -30, 8, 0], cl), width: 320, height: 320 }} />
      <div style={{ position: "absolute", left: 60, top: 1640, fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: "#FFFFFF", opacity: interpolate(lf, [8, 14], [0, 1], cl) }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};
const Captions: React.FC<{ b: (typeof B)[number] }> = ({ b }) => {
  const fr = useCurrentFrame();
  if (fr / FPS >= b.LS[b.LS.length - 1]) return null;
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

import { CRED as CR } from "./Cm09";
const plan = (n: number, L: number[], E: number): { scenes: [number, React.ReactNode][]; over: [number, number, React.ReactNode][] } => {
  const end = L[L.length - 1];
  const common: [number, number, React.ReactNode][] = [[end, E, <EndCard />]];
  if (n === 1)
    return {
      scenes: [
        [0, <Photo src="stones.jpg" credit={CR.stones} zoom={[1.1, 1.3]} />],
        [L[1], <Land shot={(s) => ({ pos: V(-14 + s * 0.8, 3, 18), look: V(0, 0.5, 0), fov: 55 })}>{(s) => <Playa t={s} />}</Land>],
        [L[2], <Land shot={orbit(60, 22, 0, 0.8, 0.06)}>{(s) => <Playa move={Math.min(1, s / 4)} ice={1} water={1} t={s} />}</Land>],
        [L[3], <Land shot={(s) => ({ pos: V(-12 + s, 4, 16), look: V(0, 0.5, 0), fov: 55 })}>{(s) => <Playa move={Math.min(1, s / 5)} ice={1} water={1} t={s} />}</Land>],
        [L[4], <Photo src="stones.jpg" credit={CR.stones} zoom={[1.3, 1.45]} />],
      ],
      over: [
        [0, L[1], <Top><Box size={84}>Rocks that move<br />by themselves?</Box></Top>],
        [L[1], L[2], <Top src="Wikipedia"><Box size={64}>Racetrack Playa<br />Death Valley, USA</Box></Top>],
        [L[2], L[3], <Top src="Wikipedia"><Box size={60}>Dec 20, 2013<br />60+ rocks moved</Box></Top>],
        [L[2], L[3], <Sprout pose="shock" />],
        [L[3], L[4], <Top src="Wikipedia"><Box size={58}>ice a few mm thick<br />+ light wind</Box></Top>],
        [L[4], end, <Stamp v="SOLVED" />],
        ...common,
      ],
    };
  return {
    scenes: [
      [0, <Photo src="darvaza.jpg" credit={CR.darvaza} zoom={[1.1, 1.3]} />],
      [L[1], <Land shot={orbit(70, 26, -12, 0.3, 0.08)} night>{(s) => <Crater t={s} />}</Land>],
      [L[2], <Land shot={orbit(55, 12, -10, 1.6, 0.08)} night>{(s) => <Crater t={s} />}</Land>],
      [L[3], <Photo src="darvaza.jpg" credit={CR.darvaza} zoom={[1.3, 1.5]} />],
      [L[4], <Land shot={orbit(70, 30, -12, 2.6, 0.08)} night>{(s) => <Crater t={s} />}</Land>],
    ],
    over: [
      [0, L[1], <Top><Box size={80}>A crater on fire<br />for decades</Box></Top>],
      [L[1], L[2], <Top src="Wikipedia"><Box size={64}>Darvaza, Turkmenistan<br />60–70 m wide</Box></Top>],
      [L[2], L[3], <Top src="Wikipedia"><Box size={60}>the usual story:<br />1971 drilling</Box></Top>],
      [L[3], L[4], <Top src="Wikipedia"><Box size={58}>records missing<br />1960s? 1980s?</Box></Top>],
      [L[3], L[4], <Sprout pose="think" />],
      [L[4], end, <Stamp v="BEST GUESS" />],
      ...common,
    ],
  };
};

export const CmShort9: React.FC<{ n: number }> = ({ n }) => {
  useFonts();
  const b = B[n - 1];
  const { scenes, over } = plan(n, b.LS, b.END);
  const f = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: "#0B0D14" }}>
      {scenes.map(([t, el], k) => {
        const e = k + 1 < scenes.length ? scenes[k + 1][0] : b.END;
        return <Sequence key={k} from={f(t)} durationInFrames={Math.max(1, f(e) - f(t))} layout="none"><AbsoluteFill>{el}</AbsoluteFill></Sequence>;
      })}
      {over.map(([a, e, el], k) => (
        <Sequence key={`o${k}`} from={f(a)} durationInFrames={Math.max(1, f(e) - f(a) - 3)} layout="none"><AbsoluteFill>{el}</AbsoluteFill></Sequence>
      ))}
      <Captions b={b} />
      <Html5Audio src={staticFile(`${b.dir}/narration.mp3`)} />
    </AbsoluteFill>
  );
};
