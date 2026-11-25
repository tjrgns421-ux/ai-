import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm04s/narration.words.json";
import LINES from "../../public/cm04s/lines.json";
import { HutRock, Rover, Shot4, Stage4, Surface, groundY } from "./Moon3D";
import { Globe2D } from "./Globe2D";

// Curious Minutes ep04, Short #1 (9:16, under 30 s): the "hut" on the far side that turned out to be a rock.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF5B";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const gy = (x: number, z: number, h: number) => groundY(x, z) + h;

const TL = makeTimeline(words, LINES as string[], [], 50);
export const CMS4_FRAMES = TL.duration;
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
const T_CARD = LS[7];
const MID1 = TL.timeOf("What was it", LS[1]);
const MID5 = TL.timeOf("Small, round", LS[5]);

// ---- camera shots (u = seconds since the shot began) ----
type Sh = (u: number) => Shot4;
const tele: Sh = (u) => ({ pos: V(-9 + u * 0.3, gy(-6, 0, 2.2), 4), look: V(22, gy(22, -3, 1.2), -3), fov: 22 - u * 1.2 });
const teleTight: Sh = (u) => ({ pos: V(-4, gy(-4, 1, 1.6), 1.5), look: V(22, gy(22, -3, 1.2), -3), fov: 9 - u * 0.6 });
const drive: Sh = (u) => { const x = -6 + u * 2.4; return { pos: V(x - 7, gy(x - 7, 3, 3), 4), look: V(x + 6, gy(x + 6, 0, 0.6), -1), fov: 58 }; };
const driveLow: Sh = (u) => { const x = 4 + u * 2.4; return { pos: V(x + 4, gy(x + 4, -4, 0.8), -4), look: V(x, gy(x, 0, 0.6), 0), fov: 50 }; };
const topDown: Sh = (u) => ({ pos: V(8, 70 - u * 4, 0.01), look: V(8, 0, 0), up: V(0, 0, -1), fov: 40 });
const closeRock: Sh = (u) => ({ pos: V(15.5 + u * 0.3, gy(15.5, 1.5, 2.2), 1.5 - u * 0.2), look: V(22.2, gy(22.2, -3, 0.4), -3), fov: 34 });
const orbitRock: Sh = (u) => { const a = -1.0 + u * 0.12; return { pos: V(22 + Math.sin(a) * 7.5, gy(22, -3, 2.6), -3 + Math.cos(a) * 7.5), look: V(22.2, gy(22, -3, 0.4), -3), fov: 36 }; };
const macroRock: Sh = (u) => ({ pos: V(19.0 + u * 0.1, gy(19.0, -0.6, 1.0), -0.6), look: V(22.3, gy(22.3, -3, 0.45), -3), fov: 34 - u * 0.8 });

type Scene = { at: number; kind: "surf" | "globe"; shot?: Sh; hut?: "far" | "close"; rover?: (u: number) => [number, number, number] | null; rot?: (u: number) => number };
const parked = (x: number, z: number, h: number) => () => [x, z, h] as [number, number, number];
const rolling = (x0: number) => (u: number) => [x0 + u * 2.4, 0, 0.05] as [number, number, number];
const SCENES: Scene[] = [
  { at: 0, kind: "surf", shot: tele, hut: "far", rover: parked(-5, 1, 0.3) },
  { at: LS[1], kind: "surf", shot: drive, hut: "far", rover: rolling(-6) },
  { at: MID1, kind: "surf", shot: teleTight, hut: "far" },
  { at: LS[2], kind: "globe", rot: (u) => Math.PI - 0.6 + u * 0.18 },
  { at: LS[3], kind: "surf", shot: tele, hut: "far", rover: parked(-5, 1, 0.3) },
  { at: LS[4], kind: "surf", shot: topDown, hut: "far", rover: rolling(-2) },
  { at: LS[4] + 1.0, kind: "surf", shot: driveLow, hut: "far", rover: rolling(4) },
  { at: LS[5], kind: "surf", shot: closeRock, hut: "close", rover: parked(17.5, 2.6, 0.3) },
  { at: MID5, kind: "surf", shot: macroRock, hut: "close" },
  { at: LS[6], kind: "surf", shot: orbitRock, hut: "close" },
  { at: LS[7], kind: "globe", rot: (u) => 0.4 + u * 0.2 },
];

const STARS = Array.from({ length: 300 }, (_, i) => [((Math.sin(i * 91.7) * 0.5 + 0.5) * 1080), ((Math.sin(i * 47.3 + 1) * 0.5 + 0.5) * 1920), 1 + (i % 3)]);
const Badge: React.FC<{ text: string; color?: string; sub?: string }> = ({ text, color = YEL, sub }) => (
  <>
    <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "Pretendard", fontWeight: 900, fontSize: 32, color: INK, background: color, padding: "6px 18px", borderRadius: 10, border: `4px solid ${INK}` }}>{text}</div>
    {sub && <div style={{ position: "absolute", left: 50, top: 212, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "#FFFFFF", opacity: 0.85 }}>{sub}</div>}
  </>
);

const World: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  let k = 0;
  for (let i = 0; i < SCENES.length; i++) if (s >= SCENES[i].at) k = i;
  const sc = SCENES[k];
  const u = s - sc.at;
  if (sc.kind === "globe") {
    const size = 760 + u * 30;
    return (
      <AbsoluteFill style={{ background: "#020205" }}>
        {STARS.map(([x, y, r], i) => <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: r, background: "#FFFFFF", opacity: 0.55 }} />)}
        <Globe2D rotY={sc.rot!(u)} size={size} cx={540} cy={900} tilt={0.08} />
        <Badge text="NASA LRO MAP" color="#9FE3B0" sub="NASA SVS CGI Moon Kit" />
      </AbsoluteFill>
    );
  }
  const r = sc.rover?.(u);
  return (
    <AbsoluteFill>
      <Stage4 shot={sc.shot!(u)} width={1080} height={1920}>
        <Surface />
        <HutRock x={22} z={-3} close={sc.hut === "close"} />
        {r && <Rover x={r[0]} z={r[1]} heading={r[2]} t={s} />}
      </Stage4>
      <Badge text="ILLUSTRATION" sub="Based on Live Science, Space.com reports" />
    </AbsoluteFill>
  );
};

const Box: React.FC<{ children: React.ReactNode; bg?: string; size?: number }> = ({ children, bg = "#FFFFFF", size = 64 }) => (
  <div style={{ display: "inline-block", background: bg, border: `6px solid ${INK}`, borderRadius: 26, padding: "16px 34px", boxShadow: "0 12px 0 rgba(0,0,0,0.35)", fontFamily: "Pretendard", fontWeight: 900, fontSize: size, lineHeight: 1.12, color: INK, textAlign: "center" }}>{children}</div>
);
const Top: React.FC<{ from: number; to: number; y?: number; src?: string; children: React.ReactNode }> = ({ from, to, y = 300, src, children }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  if (s < from || s >= to) return null;
  const lf = fr - from * FPS;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", opacity: interpolate(lf, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf, [0, 9], [0.9, 1], { ...cl, easing: out })})` }}>
      {children}
      {src && <div style={{ marginTop: 18, fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: "#FFFFFF", textShadow: "0 2px 10px rgba(0,0,0,0.9)", opacity: interpolate(lf, [0, 6, 105, 115], [0, 0.9, 0.9, 0], cl) }}>Source: {src}</div>}
    </div>
  );
};

const SproutLayer: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const bob = Math.sin(s * 1.4) * 16, rot = Math.sin(s * 0.9) * 8;
  let pose = "", x = 820, y = 1020, size = 260;
  if (s < LS[1]) { pose = "think"; x = 800; }
  else if (s >= LS[3] && s < LS[4]) { pose = "excited"; x = 260; y = 1000; }
  else if (s >= MID5 && s < LS[6]) { pose = "shock"; x = 820; y = 980; }
  else if (s >= LS[6] && s < T_CARD) { pose = "happy"; x = 250; y = 1020; size = 240; }
  if (!pose) return null;
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x - size / 2, top: y - size / 2 + bob, width: size, height: size, transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 0 24px rgba(255,190,110,0.4))" }} />;
};

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const ch = TL.chunks;
  const i = ch.findIndex((c, k) => fr >= c.start && fr < (ch[k + 1]?.start ?? c.start + 45));
  if (i < 0 || fr / FPS >= T_CARD) return null;
  const lf = fr - ch[i].start;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1300, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 68, letterSpacing: -1, lineHeight: 1.15, color: "#FFFFFF", background: "rgba(14,15,20,0.8)", padding: "10px 30px", borderRadius: 18, opacity: interpolate(lf, [0, 2], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 5], [14, 0], { ...cl, easing: out })}px)` }}>{ch[i].text}</span>
    </div>
  );
};

const Stamp: React.FC = () => {
  const fr = useCurrentFrame();
  const lf = fr - LS[5] * FPS;
  if (lf < 0 || fr / FPS >= MID5) return null;
  const k = interpolate(lf, [0, 8], [2.2, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
      <span style={{ display: "inline-block", transform: `scale(${k}) rotate(-8deg)`, opacity: interpolate(lf, [0, 4], [0, 1], cl), border: `12px solid ${GRN}`, borderRadius: 26, padding: "12px 40px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 120, color: GRN, background: "rgba(10,10,14,0.75)", letterSpacing: 3 }}>SOLVED</span>
    </div>
  );
};

const EndCard: React.FC = () => {
  const fr = useCurrentFrame();
  const lf = fr - T_CARD * FPS;
  if (lf < 0) return null;
  const hop = interpolate(lf, [0, 6, 12, 16], [80, -30, 8, 0], cl);
  const inn = (d: number) => ({ opacity: interpolate(lf - d, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf - d, [0, 9], [0.9, 1], { ...cl, easing: out })})` });
  return (
    <AbsoluteFill style={{ background: `rgba(2,3,10,${interpolate(lf, [0, 8], [0, 0.3], cl)})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 330, textAlign: "center", ...inn(0) }}><Box size={78}><span style={{ color: RED }}>6</span> strange things<br />found on the Moon</Box></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1290, textAlign: "center", ...inn(9) }}><Box bg={YEL} size={60}>Full 9-min video<br />on the channel</Box></div>
      <Img src={staticFile("sprout/excited.png")} style={{ position: "absolute", left: 640, top: 1500 + hop, width: 340, height: 340, opacity: interpolate(lf, [0, 5], [0, 1], cl) }} />
      <div style={{ position: "absolute", left: 60, top: 1640, fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: "#FFFFFF", opacity: interpolate(lf, [8, 14], [0, 1], cl) }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};

export const CmShort4: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#02030A" }}>
      <World />
      <SproutLayer />
      <Top from={0} to={LS[1]}><Box size={84}>A <span style={{ color: RED }}>HUT</span><br />on the Moon?</Box></Top>
      <Top from={LS[1]} to={MID1}><Box size={64}>2021 · a rover drives<br /><span style={{ color: RED }}>≈ 1 month</span> to it</Box></Top>
      <Top from={MID1} to={LS[2]}><Box size={90}>What was it?</Box></Top>
      <Top from={LS[2]} to={LS[3]} y={250}><Box size={60}>Yutu 2 · far side<br />a <span style={{ color: RED }}>cube-shaped blur</span></Box></Top>
      <Top from={LS[3]} to={LS[4]} src="Live Science, Jan 2022"><Box size={60}>Team's joke:<br />"hut of <span style={{ color: RED }}>alien pioneers</span>"</Box></Top>
      <Top from={LS[4]} to={LS[5]}><Box size={70}>So it drove there</Box></Top>
      <Top from={MID5} to={LS[6]} src="Live Science, Jan 2022"><Box size={62}>A small, round rock<br />shaped like a <span style={{ color: RED }}>rabbit</span></Box></Top>
      <Top from={LS[6]} to={T_CARD} src="Live Science: Yutu = 'jade rabbit'"><Box size={66}>"Jade rabbit"<br />= <span style={{ color: RED }}>Yutu</span> (玉兔)</Box></Top>
      <Stamp />
      <Captions />
      <EndCard />
      <Html5Audio src={staticFile("cm04s/narration.mp3")} />
    </AbsoluteFill>
  );
};
