import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import words from "../../public/cm02s/narration.words.json";
import LINES from "../../public/cm02s/lines.json";
import { BHShot, BlackHole } from "./BlackHole3D";

// Curious Minutes ep02, Short #1 (9:16, under 30 s): small vs giant black hole, 12.8 seconds. ILLUSTRATION.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const O = V(0, 0, 0);

const TL = makeTimeline(words, LINES as string[], [], 50);
export const CMS2_FRAMES = TL.duration;
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
const T_CARD = LS[6];

const orbit = (a: number, r: number, h: number): BHShot => ({ pos: V(Math.sin(a) * r, h, Math.cos(a) * r), look: O, fov: 62 });
const shotAt = (s: number): BHShot => {
  if (s < LS[1]) return orbit(0.4 + s * 0.05, 90, 20); // small and far: "a small black hole"
  if (s < LS[2]) return { ...orbit(0.2 + s * 0.04, 15, 2.2), fov: 70 }; // giant, up close
  if (s < LS[4]) return orbit(1.6 + s * 0.03, 60, 30);
  if (s < LS[5]) return { ...orbit(-0.3 + s * 0.05, 26 - (s - LS[4]) * 2.2, 2.5), fov: 64 }; // drifting in with Sprout
  return { pos: V(0.01, 34 - (s - LS[5]) * 3, 0.01), look: O, up: V(0, 0, -1), fov: 60 };
};

const Box: React.FC<{ children: React.ReactNode; bg?: string; size?: number }> = ({ children, bg = "#FFFFFF", size = 64 }) => (
  <div style={{ display: "inline-block", background: bg, border: `6px solid ${INK}`, borderRadius: 26, padding: "16px 34px", boxShadow: "0 12px 0 rgba(0,0,0,0.35)", fontFamily: "Pretendard", fontWeight: 900, fontSize: size, lineHeight: 1.12, color: INK, textAlign: "center" }}>{children}</div>
);
const Top: React.FC<{ from: number; to: number; y?: number; children: React.ReactNode }> = ({ from, to, y = 300, children }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  if (s < from || s >= to) return null;
  const lf = fr - from * FPS;
  return <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", opacity: interpolate(lf, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf, [0, 9], [0.9, 1], { ...cl, easing: out })})` }}>{children}</div>;
};

// Sprout as the astronaut: drifts, gets stretched near the small hole, crosses the giant one intact
const SproutLayer: React.FC = () => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  const bob = Math.sin(s * 1.4) * 16, rot = Math.sin(s * 0.9) * 8;
  let st = 0, x = 540, y = 1000, size = 300, pose = "happy", op = 1;
  if (s < LS[1]) { x = 300 + s * 60; y = 900; pose = "shock"; st = interpolate(s, [1.2, LS[1]], [0, 0.8], cl); }
  else if (s < LS[2]) { op = 0; }
  else if (s < LS[3]) { x = 540; y = 820; pose = "shock"; st = interpolate(s, [LS[2], LS[3]], [0, 0.45], cl); }
  else if (s < LS[4]) { x = 300 + (s - LS[3]) * 90; y = 1000; pose = "shock"; st = interpolate(s, [LS[3] + 0.6, LS[4]], [0.2, 1], cl); op = interpolate(s, [LS[4] - 0.6, LS[4]], [1, 0], cl); }
  else if (s < LS[5]) { x = 380 + (s - LS[4]) * 40; y = 1050; pose = "excited"; size = interpolate(s, [LS[4], LS[5]], [320, 170], cl); }
  else if (s < T_CARD) { x = 540; y = 900; pose = "shock"; st = interpolate(s, [LS[5] + 1.6, T_CARD], [0, 1], cl); }
  else op = 0;
  if (op <= 0) return null;
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x - size / 2, top: y - size / 2 + bob, width: size, height: size, opacity: op, transform: `rotate(${rot}deg) scale(${1 - st * 0.55}, ${1 + st * 1.6})`, filter: "drop-shadow(0 0 24px rgba(255,170,90,0.4))" }} />;
};

const Countdown: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  if (s < LS[5] || s >= T_CARD) return null;
  const left = Math.max(0, 12.8 - (s - LS[5]) * 4.5); // sped up ×4.5 to fit the Short
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, color: left < 3 ? RED : "#FFFFFF", fontSize: 130, textShadow: "0 4px 18px rgba(0,0,0,0.8)" }}>
      {left.toFixed(1)} s<div style={{ fontSize: 34, color: "#FFFFFF", opacity: 0.8 }}>after the edge · sped up</div>
    </div>
  );
};

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const ch = TL.chunks;
  const i = ch.findIndex((c, k) => fr >= c.start && fr < (ch[k + 1]?.start ?? c.start + 45));
  if (i < 0 || fr / FPS >= T_CARD) return null;
  const lf = fr - ch[i].start;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1220, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 68, letterSpacing: -1, lineHeight: 1.15, color: "#FFFFFF", background: "rgba(14,15,20,0.8)", padding: "10px 30px", borderRadius: 18, opacity: interpolate(lf, [0, 2], [0, 1], cl), transform: `translateY(${interpolate(lf, [0, 5], [14, 0], { ...cl, easing: out })}px)` }}>{ch[i].text}</span>
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
    <AbsoluteFill style={{ background: `rgba(2,3,10,${interpolate(lf, [0, 8], [0, 0.85], cl)})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 420, textAlign: "center", ...inn(0) }}><Box size={80}>What does your<br />friend <span style={{ color: RED }}>see?</span></Box></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 740, textAlign: "center", ...inn(9) }}><Box bg={YEL} size={60}>Full 9-min video<br />on the channel</Box></div>
      <Img src={staticFile("sprout/think.png")} style={{ position: "absolute", left: 290, top: 1040 + hop, width: 500, height: 500, opacity: interpolate(lf, [0, 5], [0, 1], cl) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1580, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: "#FFFFFF", opacity: interpolate(lf, [8, 14], [0, 1], cl) }}>CURIOUS MINUTES</div>
    </AbsoluteFill>
  );
};

export const CmShort2: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  const s = fr / FPS;
  return (
    <AbsoluteFill style={{ background: "#02030A" }}>
      <BlackHole width={1080} height={1920} shot={shotAt(s)} t={s + 40} />
      <SproutLayer />
      <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "Pretendard", fontWeight: 900, fontSize: 32, color: INK, background: YEL, padding: "6px 18px", borderRadius: 10, border: `4px solid ${INK}` }}>ILLUSTRATION</div>
      <div style={{ position: "absolute", left: 50, top: 212, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "#FFFFFF", opacity: 0.85 }}>Based on NASA Goddard (2024)</div>
      <Top from={0} to={LS[1]}><Box size={80}>SMALL<br />black hole</Box></Top>
      <Top from={LS[1]} to={LS[2]}><Box size={70}>GIANT one:<br /><span style={{ color: RED, fontSize: 130 }}>12.8 s</span></Box></Top>
      <Top from={LS[2]} to={LS[3]}><Box size={60}>feet pulled<br /><span style={{ color: RED }}>harder</span> than head</Box></Top>
      <Top from={LS[3]} to={LS[4]}><Box size={60}>Small: torn apart<br /><span style={{ color: RED }}>before the edge</span></Box></Top>
      <Top from={LS[4]} to={LS[5]}><Box size={60}>Giant: cross the edge<br /><span style={{ color: "#1AA6D6" }}>in one piece</span></Box></Top>
      <Top from={LS[5]} to={T_CARD}><Box size={90}>SPAGHETTI</Box></Top>
      <Countdown />
      <Captions />
      <EndCard />
      <Html5Audio src={staticFile("cm02s/narration.mp3")} />
    </AbsoluteFill>
  );
};
