import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import { OceanStage, ShotO, floorY } from "./Ocean3D";
import { GoldenOrb, HoleLines, ROV } from "./Deep3D";
import w1 from "../../public/cm08s1/narration.words.json";
import l1 from "../../public/cm08s1/lines.json";
import w2 from "../../public/cm08s2/narration.words.json";
import l2 from "../../public/cm08s2/lines.json";

// Curious Minutes ep08 Shorts (9:16, under 30 s), cut from the long-form: 1 the golden orb · 2 the holes in the seafloor.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const RAW = [[w1, l1, "cm08s1"], [w2, l2, "cm08s2"]] as const;
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
export const CMS8_FRAMES = B.map((b) => b.TL.duration);

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
      <Img src={staticFile(`cm08/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${interpolate(lf, [0, 150], zoom, cl)})`, transformOrigin: origin }} />
      <div style={{ position: "absolute", left: 50, top: 1560, right: 50, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text="REAL IMAGE" color="#9FE3B0" />
    </AbsoluteFill>
  );
};
type ShotFn = (s: number) => ShotO;
const Deep: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode; badge?: string }> = ({ shot, children, badge = "ILLUSTRATION" }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <OceanStage shot={shot(s)} t={s} width={1080} height={1920} deep>{children(s)}</OceanStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const fy = floorY(0, 0);
const orbit = (r: number, h: number, ly: number, a0 = 0, sp = 0.08, fov = 55): ShotFn => (s) => ({ pos: V(Math.sin(a0 + s * sp) * r, ly + h, Math.cos(a0 + s * sp) * r), look: V(0, ly, 0), fov });
const EndCard: React.FC = () => {
  const lf = useCurrentFrame();
  const inn = (d: number) => ({ opacity: interpolate(lf - d, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf - d, [0, 9], [0.9, 1], { ...cl, easing: out })})` });
  return (
    <AbsoluteFill style={{ background: `rgba(8,16,26,${interpolate(lf, [0, 8], [0, 0.55], cl)})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 360, textAlign: "center", ...inn(0) }}><Box size={74}><span style={{ color: RED }}>6</span> strange things found<br />in the deep sea</Box></div>
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

const plan = (n: number, L: number[], E: number): { scenes: [number, React.ReactNode][]; over: [number, number, React.ReactNode][] } => {
  const end = L[L.length - 1];
  const common: [number, number, React.ReactNode][] = [[end, E, <EndCard />]];
  const N = "NOAA Ocean Exploration (public domain)";
  if (n === 1)
    return {
      scenes: [
        [0, <Photo src="orb.jpg" credit={`Golden orb, Gulf of Alaska, 2023 · ${N}`} zoom={[1.5, 1.7]} />],
        [L[1], <Deep shot={orbit(14, 4, fy + 1.8, 0.4)}>{(s) => <><GoldenOrb /><ROV x={-7 + Math.min(4, s * 0.6)} y={fy + 3.8} z={1} t={s} /></>}</Deep>],
        [L[2], <Photo src="orb_specimen.jpg" credit={`The orb in the ship's lab · ${N}`} zoom={[1.4, 1.6]} />],
        [L[3], <Deep shot={orbit(7, 1.5, fy + 1.8, 1.4, 0.1)}>{() => <GoldenOrb />}</Deep>],
        [L[4], <Photo src="orb.jpg" credit={`Golden orb · ${N}`} zoom={[1.3, 1.45]} />],
      ],
      over: [
        [0, L[1], <Top><Box size={84}>A golden orb<br />on the seafloor?</Box></Top>],
        [L[1], L[2], <Top src="NOAA"><Box size={64}>2023 · Gulf of Alaska<br />~3,300 m deep</Box></Top>],
        [L[2], L[3], <Top><Box size={60}>sponge? coral?<br />egg case?</Box></Top>],
        [L[2], L[3], <Sprout pose="think" />],
        [L[3], L[4], <Top src="NOAA (2026)"><Box size={58}>base of a giant<br />deep-sea anemone</Box></Top>],
        [L[4], end, <Stamp v="SOLVED" />],
        ...common,
      ],
    };
  return {
    scenes: [
      [0, <Photo src="holes_sets.jpg" credit={`Lines of holes, Mid-Atlantic Ridge, 2022 · ${N}`} zoom={[1.3, 1.5]} />],
      [L[1], <Deep shot={(s) => ({ pos: V(0.01, fy + 24 - s * 0.6, 0.01), look: V(0, 0, 0), up: V(0, 0, -1), fov: 60 })}>{() => <HoleLines />}</Deep>],
      [L[2], <Photo src="holes_close.jpg" credit={`Close-up, laser dots 10 cm apart · ${N}`} zoom={[1.3, 1.5]} />],
      [L[3], <Deep shot={orbit(9, 3, fy, 0.6, 0.08)}>{(s) => <><HoleLines /><ROV x={-3} y={fy + 2.5} z={2} t={s} /></>}</Deep>],
      [L[4], <Photo src="holes_series.jpg" credit={`A series of holes · ${N}`} zoom={[1.3, 1.45]} />],
    ],
    over: [
      [0, L[1], <Top><Box size={80}>Lines of holes<br />on the seafloor</Box></Top>],
      [L[1], L[2], <Top src="NOAA"><Box size={64}>2022 · Mid-Atlantic Ridge<br />~2,540 m deep</Box></Top>],
      [L[2], L[3], <Top src="NOAA"><Box size={60}>“look almost<br />human made”</Box></Top>],
      [L[2], L[3], <Sprout pose="shock" />],
      [L[3], L[4], <Top src="NOAA"><Box size={58}>sediment samples:<br />no clues</Box></Top>],
      [L[4], end, <Stamp v="STILL UNKNOWN" />],
      ...common,
    ],
  };
};

export const CmShort8: React.FC<{ n: number }> = ({ n }) => {
  useFonts();
  const b = B[n - 1];
  const { scenes, over } = plan(n, b.LS, b.END);
  const f = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: "#08101A" }}>
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
