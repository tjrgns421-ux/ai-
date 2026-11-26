import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import { Oumuamua, Orbiter, Planet, ShotS, SpaceStage } from "./Space3D";
import w1 from "../../public/cm07s1/narration.words.json";
import l1 from "../../public/cm07s1/lines.json";
import w2 from "../../public/cm07s2/narration.words.json";
import l2 from "../../public/cm07s2/lines.json";

// Curious Minutes ep07 Shorts (9:16, under 30 s), cut from the long-form: 1 the face on Mars · 2 ʻOumuamua.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const RAW = [[w1, l1, "cm07s1"], [w2, l2, "cm07s2"]] as const;
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
export const CMS7_FRAMES = B.map((b) => b.TL.duration);

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
      <Img src={staticFile(`cm07/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${interpolate(lf, [0, 150], zoom, cl)})`, transformOrigin: origin }} />
      <div style={{ position: "absolute", left: 50, top: 1560, right: 50, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text="REAL IMAGE" color="#9FE3B0" />
    </AbsoluteFill>
  );
};
type ShotFn = (s: number) => ShotS;
const Space: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode; badge?: string }> = ({ shot, children, badge = "ILLUSTRATION · not to scale" }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <SpaceStage shot={shot(s)} width={1080} height={1920}>{children(s)}</SpaceStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const orbit = (r: number, h: number, a0 = 0, sp = 0.08, fov = 50): ShotFn => (s) => ({ pos: V(Math.sin(a0 + s * sp) * r, h, Math.cos(a0 + s * sp) * r), look: V(0, 0, 0), fov });
const EndCard: React.FC = () => {
  const lf = useCurrentFrame();
  const inn = (d: number) => ({ opacity: interpolate(lf - d, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf - d, [0, 9], [0.9, 1], { ...cl, easing: out })})` });
  return (
    <AbsoluteFill style={{ background: `rgba(8,16,26,${interpolate(lf, [0, 8], [0, 0.55], cl)})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 360, textAlign: "center", ...inn(0) }}><Box size={74}><span style={{ color: RED }}>6</span> strange things in<br />our solar system</Box></div>
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
  const VIK = "Viking 1, July 1976 · NASA/JPL (public domain)";
  if (n === 1)
    return {
      scenes: [
        [0, <Photo src="face_viking.jpg" credit={VIK} zoom={[1.6, 1.9]} />],
        [L[1], <Space shot={orbit(36, 8, 0.4)}>{(s) => <><Planet tex="mars" r={10} spin={s * 0.1} /><Orbiter pos={[13, 3, 6]} rot={s * 0.2} /></>}</Space>],
        [L[2], <Photo src="face_viking.jpg" credit={VIK} zoom={[2.0, 2.3]} />],
        [L[3], <Photo src="face_mgs.png" credit="Mars Global Surveyor, 2001 · NASA/JPL/MSSS (public domain)" zoom={[1.4, 1.6]} />],
        [L[3] + 2.6, <Photo src="face_hirise.jpg" credit="HiRISE, 2007 · NASA/JPL/University of Arizona (public domain)" zoom={[1.4, 1.6]} />],
        [L[4], <Photo src="face_viking.jpg" credit={VIK} zoom={[1.3, 1.5]} />],
      ],
      over: [
        [0, L[1], <Top><Box size={84}>A face<br />on Mars?</Box></Top>],
        [L[1], L[2], <Top src="NASA"><Box size={64}>1976 · Viking 1<br />1.5 km wide</Box></Top>],
        [L[2], L[3], <Top src="NASA caption, 1976"><Box size={58}>“formed by shadows”</Box></Top>],
        [L[2], L[3], <Sprout pose="think" />],
        [L[3], L[4], <Top src="Wikipedia, quoting NASA"><Box size={60}>sharper cameras:<br />an eroded hill</Box></Top>],
        [L[4], end, <Stamp v="SOLVED" />],
        ...common,
      ],
    };
  return {
    scenes: [
      [0, <Space shot={orbit(22, 3, 0, 0.12)}>{(s) => <Oumuamua t={s} />}</Space>],
      [L[1], <Photo src="oum_real.jpg" credit="ʻOumuamua (centre), William Herschel Telescope, Oct 2017 · A. Fitzsimmons (QUB), public domain" zoom={[1.2, 1.4]} />],
      [L[2], <Photo src="oum_art.jpg" credit="ARTIST'S IMPRESSION · ESO/M. Kornmesser (deriv. nagualdesign), CC BY-SA 4.0" />],
      [L[3], <Space shot={orbit(24, 4, 2, 0.12)}>{(s) => <Oumuamua t={s} gas={1} />}</Space>],
      [L[4], <Space shot={orbit(40, 8, 3, 0.08)}>{(s) => <Oumuamua t={s} gas={0.5} />}</Space>],
    ],
    over: [
      [0, L[1], <Top><Box size={80}>A visitor from<br />another star</Box></Top>],
      [L[1], L[2], <Top src="Wikipedia"><Box size={64}>2017 · ʻOumuamua<br />sped up near the Sun</Box></Top>],
      [L[2], L[3], <Top><Box size={66}>no cloud,<br />no tail</Box></Top>],
      [L[2], L[3], <Sprout pose="shock" />],
      [L[3], L[4], <Top src="Bergner & Seligman, Nature (2023)"><Box size={58}>trapped hydrogen<br />gave it a push?</Box></Top>],
      [L[4], end, <Stamp v="BEST GUESS" />],
      ...common,
    ],
  };
};

export const CmShort7: React.FC<{ n: number }> = ({ n }) => {
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
