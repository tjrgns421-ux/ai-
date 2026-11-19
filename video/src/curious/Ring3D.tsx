import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useFonts } from "../StyleFrames";
import { RING, SimFrame, simulate } from "./RingSim";

// 3D version of the ring-road recreation with a moving camera.
// World units are meters. The ring is the paper's 230 m circuit (radius ~36.6 m).

const R = RING.L / (2 * Math.PI);
const FPS = 30;
const SPEEDUP = 2;
const SIM = simulate(72, FPS / SPEEDUP, null);
export const RING3D_FRAMES = SIM.length;

const PALETTE = ["#FF6B5E", "#FFD23F", "#4FA3FF", "#5BD68A", "#FF9F43", "#B07CFF", "#7FE3FF", "#FF8FC7"];
export const ang = (x: number) => (x / RING.L) * Math.PI * 2;
export const pos = (x: number): THREE.Vector3 => new THREE.Vector3(R * Math.cos(ang(x)), 0, R * Math.sin(ang(x)));
export const fwd = (x: number): THREE.Vector3 => new THREE.Vector3(-Math.sin(ang(x)), 0, Math.cos(ang(x)));

// ---------- world ----------
const rand = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const Trees: React.FC = () => {
  const trees = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const a = rand(i) * Math.PI * 2;
        const inner = i % 4 === 0;
        const d = inner ? 8 + rand(i + 7) * 18 : R + 10 + rand(i + 3) * 45;
        return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.8 + rand(i + 11) * 0.9, c: ["#3FAE5A", "#4CC26A", "#2F9A4E"][i % 3] };
      }),
    [],
  );
  return (
    <>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.35, 2.2, 8]} />
            <meshStandardMaterial color="#8A5A2B" />
          </mesh>
          <mesh position={[0, 3.3, 0]} castShadow>
            <coneGeometry args={[1.7, 3.6, 10]} />
            <meshStandardMaterial color={t.c} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export const Cones: React.FC = () => (
  <>
    {Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2;
      const d = R - 4.6;
      return (
        <mesh key={i} position={[Math.cos(a) * d, 0.35, Math.sin(a) * d]} castShadow>
          <coneGeometry args={[0.28, 0.7, 12]} />
          <meshStandardMaterial color="#FF7A1A" />
        </mesh>
      );
    })}
  </>
);

export const Track: React.FC = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#8FD16B" roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <ringGeometry args={[R - 3.6, R + 3.6, 160]} />
      <meshStandardMaterial color="#454B58" roughness={0.9} />
    </mesh>
    {[R - 3.3, R + 3.3].map((r) => (
      <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[r - 0.12, r + 0.12, 160]} />
        <meshStandardMaterial color="#F5F5F2" />
      </mesh>
    ))}
  </>
);

// ---------- cars ----------
export const Car: React.FC<{ f: SimFrame; i: number; calm?: boolean }> = ({ f, i, calm = false }) => {
  const body = useMemo(() => new RoundedBoxGeometry(4.2, 1.1, 1.9, 4, 0.3), []);
  const cabin = useMemo(() => new RoundedBoxGeometry(2.2, 0.8, 1.7, 4, 0.25), []);
  const x = f.x[i];
  const p = pos(x);
  const braking = f.a[i] < -0.6;
  const rotY = -ang(x) - Math.PI / 2;
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, rotY, 0]}>
      <mesh geometry={body} position={[0, 0.85, 0]} castShadow>
        <meshPhysicalMaterial color={calm ? "#F7F7F5" : PALETTE[i % PALETTE.length]} roughness={0.35} clearcoat={0.8} />
      </mesh>
      <mesh geometry={cabin} position={[-0.2, 1.7, 0]} castShadow>
        <meshPhysicalMaterial color="#CFEFFF" roughness={0.1} clearcoat={1} />
      </mesh>
      {[-1.35, 1.35].map((wx) =>
        [-0.95, 0.95].map((wz) => (
          <mesh key={`${wx}${wz}`} position={[wx, 0.42, wz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.35, 16]} />
            <meshStandardMaterial color="#1E2026" />
          </mesh>
        )),
      )}
      {[-0.6, 0.6].map((z) => (
        <mesh key={z} position={[-2.12, 1.0, z]}>
          <boxGeometry args={[0.08, 0.28, 0.42]} />
          <meshStandardMaterial color={braking ? "#FF2A1F" : "#6E1712"} emissive={braking ? "#FF2A1F" : "#000000"} emissiveIntensity={braking ? 3 : 0} toneMapped={false} />
        </mesh>
      ))}
      {braking && <pointLight position={[-2.6, 1.0, 0]} color="#FF2A1F" intensity={6} distance={6} />}
      {calm && (
        <>
          <mesh position={[-0.2, 2.25, 0]}>
            <cylinderGeometry args={[0.28, 0.32, 0.22, 20]} />
            <meshStandardMaterial color="#57D6FF" emissive="#57D6FF" emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
          <pointLight position={[-0.2, 2.8, 0]} color="#57D6FF" intensity={8} distance={8} />
        </>
      )}
    </group>
  );
};

// ---------- camera choreography ----------
type Shot = { pos: THREE.Vector3; look: THREE.Vector3 };
const ease = Easing.inOut(Easing.cubic);
const lerpShot = (a: Shot, b: Shot, k: number): Shot => ({ pos: a.pos.clone().lerp(b.pos, k), look: a.look.clone().lerp(b.look, k) });

const CHASE = 17; // a car a few places behind the one that brakes first

const aerial = (t: number): Shot => {
  const a = 0.6 + t * 0.06;
  return { pos: new THREE.Vector3(Math.cos(a) * 85, 62, Math.sin(a) * 85), look: new THREE.Vector3(0, 0, 0) };
};
const chase = (f: SimFrame): Shot => {
  const x = f.x[CHASE];
  const p = pos(x), d = fwd(x);
  return { pos: p.clone().addScaledVector(d, -9).add(new THREE.Vector3(0, 3.6, 0)).addScaledVector(p.clone().normalize(), 1.2), look: p.clone().addScaledVector(d, 14).add(new THREE.Vector3(0, 1.2, 0)) };
};
// Smoothed position of ONE jam, precomputed for every frame. Following "the slowest car" made the camera
// jump whenever a different car became the slowest, and between two jams later on.
const wrap = (d: number) => ((((d + RING.L / 2) % RING.L) + RING.L) % RING.L) - RING.L / 2;
const JAM_X: number[] = (() => {
  const out: number[] = [];
  let cur: number | null = null;
  for (const f of SIM) {
    const slow = f.x.filter((_, i) => f.v[i] < 3);
    if (slow.length) {
      const ref: number = cur ?? f.x[f.v.indexOf(Math.min(...f.v))];
      const near = slow.filter((x) => Math.abs(wrap(x - ref)) < 25);
      const pick = near.length ? near : [slow.reduce((a, x) => (Math.abs(wrap(x - ref)) < Math.abs(wrap(a - ref)) ? x : a))];
      const target = ref + pick.reduce((sum, x) => sum + wrap(x - ref), 0) / pick.length;
      cur = cur === null ? target : cur + 0.06 * wrap(target - cur);
    }
    out.push(cur === null ? 0 : ((cur % RING.L) + RING.L) % RING.L);
  }
  return out;
})();
let jamFrame = 0;
const jamCam = (f: SimFrame): Shot => {
  const x = JAM_X[jamFrame];
  const p = pos(x);
  const out = p.clone().normalize();
  return { pos: p.clone().addScaledVector(out, 34).add(new THREE.Vector3(0, 26, 0)), look: p.clone() };
};

const shotAt = (fr: number): Shot => {
  const f = SIM[Math.min(fr, SIM.length - 1)];
  jamFrame = Math.min(fr, SIM.length - 1);
  const s = fr / FPS;
  const k = (a: number, b: number) => ease(Math.min(1, Math.max(0, (s - a) / (b - a))));
  if (s < 5) return aerial(s);
  if (s < 8) return lerpShot(aerial(s), chase(f), k(5, 8));
  if (s < 20) return chase(f);
  if (s < 23) return lerpShot(chase(f), jamCam(f), k(20, 23));
  if (s < 31) return jamCam(f);
  return lerpShot(jamCam(f), aerial(s), k(31, 35));
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

export const CmRing3D: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  const f = SIM[Math.min(fr, SIM.length - 1)];
  const s = fr / FPS;
  const simT = s * SPEEDUP;
  const jam = f.v.filter((q) => q < 2.2).length > 0;
  const lines: [number, number, string][] = [
    [0, 5, "22 cars. One circle. Same speed."],
    [5, 9, "Then one driver eases off…"],
    [9, 20, jam ? "…and the car in front stops." : "Brake lights, one after another."],
    [20, 31, "The jam moves backward."],
    [31, 36, "No crash. No obstacle. Just us."],
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
        {f.x.map((_, i) => <Car key={i} f={f} i={i} />)}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: "#14151B", background: "#FFD23F", padding: "6px 16px", borderRadius: 10, border: "4px solid #14151B" }}>SIMULATION</div>
      <div style={{ position: "absolute", right: 60, top: 56, fontFamily: "Pretendard", fontWeight: 800, fontSize: 28, color: "#FFFFFF", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{`t = ${Math.floor(simT)} s`}</div>
      {line && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, textAlign: "center", opacity: op }}>
          <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: "#FFFFFF", background: "rgba(20,21,27,0.72)", padding: "10px 30px", borderRadius: 18 }}>{line[2]}</span>
        </div>
      )}
      <div style={{ position: "absolute", right: 60, bottom: 36, fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: "#FFFFFF", opacity: 0.85, textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>Recreation of Sugiyama et al. (2008)</div>
      {s >= 20 && s < 31 && (
        <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 60, bottom: 40, width: 260, height: 260, opacity: interpolate(s, [20, 20.5], [0, 1], { extrapolateRight: "clamp" }) }} />
      )}
    </AbsoluteFill>
  );
};
