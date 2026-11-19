import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { simulate } from "./RingSim";
import { Car, Cones, Track, Trees, fwd, pos } from "./Ring3D";

// "One calm car" scene: the ring is already jammed; car 5 switches to a calm controller
// (follows the ring's 40 s average speed, like Stern et al. 2018) and the waves fade. SIMULATION.
const FPS = 30, SPEEDUP = 2, START = 90, CALM_AT = 100, CALM = 5;
const ALL = simulate(START + 84, FPS / SPEEDUP, CALM_AT);
const SIM = ALL.slice((START * FPS) / SPEEDUP);
export const CALM3D_FRAMES = SIM.length;

type Shot = { pos: THREE.Vector3; look: THREE.Vector3 };
const ease = Easing.inOut(Easing.cubic);
const mix = (a: Shot, b: Shot, k: number): Shot => ({ pos: a.pos.clone().lerp(b.pos, k), look: a.look.clone().lerp(b.look, k) });
const aerial = (t: number): Shot => {
  const a = 2.2 + t * 0.05;
  return { pos: new THREE.Vector3(Math.cos(a) * 82, 60, Math.sin(a) * 82), look: new THREE.Vector3(0, 0, 0) };
};
const follow = (x: number): Shot => {
  const p = pos(x), d = fwd(x);
  return { pos: p.clone().addScaledVector(d, -8).add(new THREE.Vector3(0, 7, 0)).addScaledVector(p.clone().normalize(), 4), look: p.clone().addScaledVector(d, 8).add(new THREE.Vector3(0, 1, 0)) };
};
const shotAt = (fr: number): Shot => {
  const f = SIM[Math.min(fr, SIM.length - 1)];
  const s = fr / FPS;
  const k = (a: number, b: number) => ease(Math.min(1, Math.max(0, (s - a) / (b - a))));
  const x = f.x[CALM];
  if (s < 4) return aerial(s);
  if (s < 7) return mix(aerial(s), follow(x), k(4, 7));
  if (s < 24) return follow(x);
  if (s < 28) return mix(follow(x), aerial(s), k(24, 28));
  return aerial(s);
};
const Rig: React.FC<{ fr: number }> = ({ fr }) => {
  const { camera, scene } = useThree();
  const sh = shotAt(fr);
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  scene.background = new THREE.Color("#9ED8FF");
  scene.fog = new THREE.Fog("#BFE6FF", 120, 260);
  return null;
};

export const CmCalmRing3D: React.FC<{ bare?: boolean }> = ({ bare = false }) => {
  useFonts();
  const fr = useCurrentFrame();
  const f = SIM[Math.min(fr, SIM.length - 1)];
  const s = fr / FPS;
  const lines: [number, number, string][] = [
    [0, 4.5, "The jam keeps going. Round and round."],
    [4.5, 11, "Then one car drives differently."],
    [11, 24, "It keeps a gap. It never slams the brakes."],
    [24, 34, "And the waves fade."],
    [34, 42, "One car out of 22."],
  ];
  const line = lines.find(([a, b]) => s >= a && s < b);
  const op = line ? interpolate(s, [line[0], line[0] + 0.4, line[1] - 0.4, line[1]], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.5, far: 600 }}>
        <Rig fr={fr} />
        <hemisphereLight args={["#ffffff", "#6E9C50", 1.1]} />
        <directionalLight position={[60, 90, 40]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-80} shadow-camera-right={80} shadow-camera-top={80} shadow-camera-bottom={-80} />
        <Track />
        <Cones />
        <Trees />
        {f.x.map((_, i) => <Car key={i} f={f} i={i} calm={i === CALM} />)}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: "#14151B", background: "#FFD23F", padding: "6px 16px", borderRadius: 10, border: "4px solid #14151B" }}>SIMULATION</div>
      {s >= 4.5 && (
        <div style={{ position: "absolute", left: 60, top: 110, fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: "#14151B", background: "#FFFFFF", padding: "6px 16px", borderRadius: 10, border: "4px solid #57D6FF" }}>
          <span style={{ color: "#1AA6D6" }}>●</span> AI car: follows the average speed
        </div>
      )}
      {line && !bare && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, textAlign: "center", opacity: op }}>
          <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: "#FFFFFF", background: "rgba(20,21,27,0.72)", padding: "10px 30px", borderRadius: 18 }}>{line[2]}</span>
        </div>
      )}
      <div style={{ position: "absolute", right: 60, ...(bare ? { top: 110 } : { bottom: 36 }), fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: "#FFFFFF", opacity: 0.85, textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>Recreation of Stern et al. (2018)</div>
      {s >= 26 && !bare && <Img src={staticFile("sprout/excited.png")} style={{ position: "absolute", left: 60, bottom: 40, width: 260, height: 260, opacity: interpolate(s, [26, 26.6], [0, 1], { extrapolateRight: "clamp" }) }} />}
    </AbsoluteFill>
  );
};
