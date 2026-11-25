import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { makeTimeline } from "../sn02/engine";
import { Balloon, BloodGlacier, IceStage, Pyramid, Range, Ray, SeaIce, ShotI, Snowfield } from "./Ice3D";
import { OceanMap } from "./OceanMap";
import w1 from "../../public/cm06s1/narration.words.json";
import l1 from "../../public/cm06s1/lines.json";
import w2 from "../../public/cm06s2/narration.words.json";
import l2 from "../../public/cm06s2/lines.json";
import w3 from "../../public/cm06s3/narration.words.json";
import l3 from "../../public/cm06s3/lines.json";
import w4 from "../../public/cm06s4/narration.words.json";
import l4 from "../../public/cm06s4/lines.json";
import w5 from "../../public/cm06s5/narration.words.json";
import l5 from "../../public/cm06s5/lines.json";

// Curious Minutes ep06 Shorts (9:16, under 30 s), cut from the long-form:
// 1 pyramid · 2 Blood Falls · 3 the hole in the sea ice · 4 the "ice-free" 1513 map · 5 ANITA's signals.
const FPS = 30;
const INK = "#14151B", YEL = "#FFD23F", RED = "#FF3B30", GRN = "#2FBF71", CYAN = "#7FE3FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const RAW = [[w1, l1, "cm06s1"], [w2, l2, "cm06s2"], [w3, l3, "cm06s3"], [w4, l4, "cm06s4"], [w5, l5, "cm06s5"]] as const;
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
export const CMS6_FRAMES = B.map((b) => b.TL.duration);

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
const Sprout: React.FC<{ pose: string; x?: number; y?: number; size?: number }> = ({ pose, x = 800, y = 1080, size = 250 }) => {
  const lf = useCurrentFrame();
  const s = lf / FPS;
  return <Img src={staticFile(`sprout/${pose}.png`)} style={{ position: "absolute", left: x - size / 2 + Math.sin(s * 0.7) * 24, top: y - size / 2 + Math.sin(s * 1.4) * 16 + interpolate(lf, [0, 5, 10, 14], [60, -26, 6, 0], cl), width: size, height: size, transform: `rotate(${Math.sin(s * 0.9) * 8}deg)`, filter: "drop-shadow(0 0 24px rgba(127,227,255,0.45))" }} />;
};
const Photo: React.FC<{ src: string; credit: string; zoom?: [number, number]; origin?: string }> = ({ src, credit, zoom = [1.05, 1.2], origin = "50% 50%" }) => {
  const lf = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#050507" }}>
      <Img src={staticFile(`cm06/img/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${interpolate(lf, [0, 150], zoom, cl)})`, transformOrigin: origin }} />
      <div style={{ position: "absolute", left: 50, top: 1560, right: 50, fontFamily: "Pretendard", fontWeight: 800, fontSize: 26, color: "#FFFFFF", background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: 8 }}>{credit}</div>
      <Badge text="REAL IMAGE" color="#9FE3B0" />
    </AbsoluteFill>
  );
};
type ShotFn = (s: number) => ShotI;
const Ice: React.FC<{ shot: ShotFn; children: (s: number) => React.ReactNode; sky?: string; badge?: string }> = ({ shot, children, sky, badge = "ILLUSTRATION" }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <IceStage shot={shot(s)} sky={sky} width={1080} height={1920}>{children(s)}</IceStage>
      <Badge text={badge} />
    </AbsoluteFill>
  );
};
const MapV: React.FC<{ rot: (s: number) => [number, number]; pins: React.ComponentProps<typeof OceanMap>["pins"]; scale?: number }> = (p) => (
  <AbsoluteFill>
    <OceanMap {...p} width={1080} height={1920} cx={540} cy={1000} scale={p.scale ?? 500} />
    <Badge text="MAP · approximate" color="#9FE3B0" />
  </AbsoluteFill>
);
const W = () => <><Snowfield /><Range /><Pyramid /></>;
const EndCard: React.FC = () => {
  const lf = useCurrentFrame();
  const inn = (d: number) => ({ opacity: interpolate(lf - d, [0, 5], [0, 1], cl), transform: `scale(${interpolate(lf - d, [0, 9], [0.9, 1], { ...cl, easing: out })})` });
  return (
    <AbsoluteFill style={{ background: `rgba(8,16,26,${interpolate(lf, [0, 8], [0, 0.55], cl)})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 360, textAlign: "center", ...inn(0) }}><Box size={74}><span style={{ color: RED }}>6</span> strange things<br />found in Antarctica</Box></div>
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
  const mid = (i: number) => (L[i] + L[i + 1]) / 2;
  const common: [number, number, React.ReactNode][] = [[end, E, <EndCard />]];
  if (n === 1)
    return {
      scenes: [
        [0, <Ice shot={(s) => ({ pos: V(Math.sin(0.6 + s * 0.05) * 520, 400 - s * 6, Math.cos(0.6 + s * 0.05) * 520), look: V(0, 50, 0), fov: 50 })}>{W}</Ice>],
        [L[1], <Ice shot={(s) => ({ pos: V(0.01, 760 - s * 15, 0.01), look: V(0, 0, 0), up: V(0, 0, -1), fov: 40 })}>{W}</Ice>],
        [L[2], <Ice shot={(s) => ({ pos: V(-300 + s * 5, 20, 300), look: V(0, 70, 0), fov: 50 })}>{W}</Ice>],
        [L[3], <Ice shot={(s) => ({ pos: V(130 - s * 3, 60, 160), look: V(0, 70, 0), fov: 55 })}>{W}</Ice>],
        [L[4], <Ice shot={(s) => ({ pos: V(Math.sin(2 + s * 0.06) * 600, 200, Math.cos(2 + s * 0.06) * 600), look: V(0, 50, 0), fov: 50 })}>{W}</Ice>],
      ],
      over: [
        [0, L[1], <Top><Box size={84}>A pyramid in<br />Antarctica?</Box></Top>],
        [L[1], L[2], <Top src="Live Science"><Box size={70}>1,265 m<br />four steep sides</Box></Top>],
        [L[2], L[3], <Top><Box size={66}>Lost civilization?<br />Aliens?</Box></Top>],
        [L[2], L[3], <Sprout pose="shock" />],
        [L[3], L[4], <Top src="Live Science"><Box size={60}>freeze → expand → crack<br />for 100s of millions of years</Box></Top>],
        [L[4], end, <Stamp v="SOLVED" />],
        [L[4], end, <Top y={1010} src="Eric Rignot, via Live Science"><Box size={58}>“just a mountain that<br />looks like a pyramid”</Box></Top>],
        ...common,
      ],
    };
  if (n === 2)
    return {
      scenes: [
        [0, <Photo src="blood.jpg" credit="Blood Falls · Peter Rejcek / U.S. NSF (public domain)" origin="45% 55%" />],
        [L[1], <Ice shot={(s) => ({ pos: V(-30 + s * 2, 14, 110), look: V(0, 10, 0), fov: 55 })}>{(s) => <><Snowfield /><Range /><BloodGlacier t={s} /></>}</Ice>],
        [L[2], <Ice shot={(s) => ({ pos: V(10, 8, 40 - s), look: V(0, 8, 0), fov: 60 })}>{(s) => <><Snowfield /><BloodGlacier t={s} /></>}</Ice>],
        [L[3], <Photo src="blood.jpg" credit="Blood Falls · Peter Rejcek / U.S. NSF (public domain)" zoom={[1.3, 1.5]} origin="40% 60%" />],
        [L[4], <Ice shot={(s) => ({ pos: V(-40 + s * 2, 20, 130), look: V(0, 10, 0), fov: 55 })}>{(s) => <><Snowfield /><Range /><BloodGlacier t={s} /></>}</Ice>],
      ],
      over: [
        [0, L[1], <Top><Box size={84}>A glacier<br />that <span style={{ color: RED }}>bleeds</span>?</Box></Top>],
        [L[1], L[2], <Top src="National Geographic"><Box size={70}>−17 °C<br />and still flowing</Box></Top>],
        [L[2], L[3], <Top src="National Geographic"><Box size={60}>hidden lake of salty,<br /><span style={{ color: RED }}>iron-rich</span> water</Box></Top>],
        [L[3], L[4], <Top><Box size={66}>iron + air → red<br />like rust</Box></Top>],
        [L[3], L[4], <Sprout pose="think" />],
        [L[4], end, <Stamp v="SOLVED" />],
        ...common,
      ],
    };
  if (n === 3)
    return {
      scenes: [
        [0, <Ice shot={(s) => ({ pos: V(0.01, 900 - s * 15, 0.01), look: V(0, 0, 0), up: V(0, 0, -1), fov: 50 })} sky="#16314A">{(s) => <SeaIce open={interpolate(s, [0.5, 5], [0, 1], cl)} t={s} />}</Ice>],
        [L[1], <Ice shot={(s) => ({ pos: V(-300 + s * 6, 60, 260), look: V(0, 0, 0), fov: 55 })} sky="#8CB8D6">{(s) => <SeaIce open={1} t={s} />}</Ice>],
        [L[2], <MapV rot={(s) => [3 + s, -60]} pins={[{ lon: 3, lat: -65, label: "Maud Rise", ring: true, color: CYAN }]} scale={760} />],
        [L[3], <Ice shot={(s) => ({ pos: V(0.01, 820, 0.01), look: V(0, 0, 0), up: V(0, 0, -1), fov: 50 })} sky="#16314A">{(s) => <SeaIce open={1} t={s} />}</Ice>],
        [L[4], <Ice shot={(s) => ({ pos: V(-260 + s * 6, 90, 260), look: V(0, 0, 0), fov: 55 })} sky="#8CB8D6">{(s) => <SeaIce open={1} t={s} />}</Ice>],
      ],
      over: [
        [0, L[1], <Top><Box size={80}>A hole in<br />the sea ice</Box></Top>],
        [L[1], L[2], <Top src="University of Southampton"><Box size={64}>nearly <span style={{ color: RED }}>2×</span> the size<br />of Wales · 2017</Box></Top>],
        [L[2], L[3], <Top><Box size={66}>over an underwater<br />mountain</Box></Top>],
        [L[3], L[4], <Top src="Science Advances (2024)"><Box size={60}>extra salt →<br />warm water keeps mixing up</Box></Top>],
        [L[3], L[4], <Sprout pose="think" />],
        [L[4], end, <Stamp v="SOLVED" />],
        ...common,
      ],
    };
  if (n === 4)
    return {
      scenes: [
        [0, <Photo src="piri.jpg" credit="Piri Reis map (1513) · public domain" zoom={[1, 1.12]} />],
        [L[1], <Photo src="piri.jpg" credit="Piri Reis map (1513) · public domain" zoom={[1.4, 1.6]} origin="45% 90%" />],
        [L[2], <MapV rot={(s) => [-45 - s, -45]} pins={[{ lon: -43, lat: -23, label: "Rio", color: YEL }, { lon: 0, lat: -72, label: "Queen Maud Land", color: CYAN, delay: 40, dx: -300 }]} />],
        [L[3], <Photo src="piri.jpg" credit="Piri Reis map (1513) · public domain" zoom={[1.2, 1.35]} origin="40% 75%" />],
        [L[4], <Photo src="piri.jpg" credit="Piri Reis map (1513) · public domain" zoom={[1, 1.1]} />],
      ],
      over: [
        [0, L[1], <Top><Box size={80}>Antarctica<br />on a 1513 map?</Box></Top>],
        [L[1], L[2], <Top><Box size={70}>“without its ice”?</Box></Top>],
        [L[2], L[3], <Top><Box size={60}>1960s claim:<br />Charles Hapgood</Box></Top>],
        [L[2], L[3], <Sprout pose="shock" />],
        [L[3], L[4], <Top src="Wikipedia"><Box size={60}>built from older maps<br />→ South America</Box></Top>],
        [L[4], end, <Stamp v="SOLVED" />],
        ...common,
      ],
    };
  const rays = (weird: boolean) => (s: number) => (
    <>
      <Snowfield /><Range /><Balloon y={130} t={s} />
      {weird ? <Ray from={[160, -40, 40]} to={[0, 118, 0]} k={interpolate(s, [0.3, 2.3], [0, 1], cl)} color="#FF5A4A" /> : <><Ray from={[-260, 260, -60]} to={[-40, 0, 0]} k={interpolate(s, [0.3, 1.8], [0, 1], cl)} /><Ray from={[-40, 0, 0]} to={[0, 118, 0]} k={interpolate(s, [1.8, 3], [0, 1], cl)} /></>}
    </>
  );
  return {
    scenes: [
      [0, <Ice shot={() => ({ pos: V(-320, 70, 300), look: V(0, 70, 0), fov: 55 })} sky="#7FB2D6" badge="ILLUSTRATION · the anomaly">{rays(true)}</Ice>],
      [L[1], <MapV rot={(s) => [-69 - s, -45]} pins={[{ lon: -69.3, lat: -35.2, label: "Pierre Auger Observatory", color: "#FFB020", ring: true, dx: -440 }]} scale={600} />],
      [L[2], <Photo src="anita.jpg" credit="ANITA-IV before launch · Drummermean, CC BY-SA 4.0" />],
      [mid(2), <Ice shot={() => ({ pos: V(-320, 70, 300), look: V(0, 70, 0), fov: 55 })} sky="#7FB2D6" badge="ILLUSTRATION · a normal signal">{rays(false)}</Ice>],
      [L[3], <Ice shot={() => ({ pos: V(-320, 70, 300), look: V(0, 70, 0), fov: 55 })} sky="#7FB2D6" badge="ILLUSTRATION · the anomaly">{rays(true)}</Ice>],
      [L[4], <Ice shot={(s) => ({ pos: V(-260 + s * 4, 90, 260), look: V(0, 110, 0), fov: 50 })} sky="#7FB2D6">{(s) => <><Snowfield /><Range /><Balloon y={130} t={s} /></>}</Ice>],
    ],
    over: [
      [0, L[1], <Top><Box size={76}>Signals rising<br />out of the ice?</Box></Top>],
      [L[1], L[2], <Top src="Phys. Rev. Lett. (2025)"><Box size={64}>15 years of data<br />checked in 2025</Box></Top>],
      [L[2], L[3], <Top src="Penn State"><Box size={56}>~30° below the ice ·<br />through thousands of km of rock</Box></Top>],
      [L[3], L[4], <Top><Box size={72}>It didn't see them.</Box></Top>],
      [L[3], L[4], <Sprout pose="shock" />],
      [L[4], end, <Stamp v="STILL UNKNOWN" />],
      ...common,
    ],
  };
};

export const CmShort6: React.FC<{ n: number }> = ({ n }) => {
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
