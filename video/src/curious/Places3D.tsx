import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Curious Minutes ep09: strange places on Earth. All 3D scenes are ILLUSTRATIONS (not to scale).
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export type ShotP = { pos: THREE.Vector3; look: THREE.Vector3; fov?: number; up?: THREE.Vector3 };
const Rig: React.FC<{ sh: ShotP; sky: string; fog: [string, number, number] | null }> = ({ sh, sky, fog }) => {
  const { camera, scene } = useThree();
  camera.up.copy(sh.up ?? new THREE.Vector3(0, 1, 0));
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  const c = camera as THREE.PerspectiveCamera;
  if (sh.fov && c.fov !== sh.fov) {
    c.fov = sh.fov;
    c.updateProjectionMatrix();
  }
  scene.background = new THREE.Color(sky);
  scene.fog = fog ? new THREE.Fog(fog[0], fog[1], fog[2]) : null;
  return null;
};
/** Outdoor stage. night: dark sky, stars, dim moonlight. */
export const LandStage: React.FC<{ shot: ShotP; children?: React.ReactNode; width?: number; height?: number; sky?: string; night?: boolean; sun?: [number, number, number]; fogFar?: number }> = ({ shot, children, width = 1920, height = 1080, sky = "#9CC8E8", night = false, sun = [-120, 90, 60], fogFar = 1600 }) => (
  <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: shot.fov ?? 45, near: 0.2, far: 5000 }}>
    <Rig sh={shot} sky={night ? "#05070F" : sky} fog={night ? ["#05070F", 120, 900] : [sky, 400, fogFar]} />
    {night && <Stars />}
    <hemisphereLight args={[night ? "#2A3550" : "#EAF4FF", night ? "#0A0A10" : "#8A7A60", night ? 0.35 : 0.8]} />
    <ambientLight intensity={night ? 0.12 : 0.3} />
    <directionalLight position={sun} intensity={night ? 0.25 : 2.4} color={night ? "#9FB4FF" : "#FFF1DC"} />
    {children}
  </ThreeCanvas>
);
const STARS = Array.from({ length: 1500 }, (_, i) => { const u = rnd(i) * 0.9 + 0.1, t = rnd(i + 9000) * Math.PI * 2, r = Math.sqrt(1 - u * u); return [r * Math.cos(t) * 1500, u * 1500, r * Math.sin(t) * 1500]; }).flat();
const Stars: React.FC = () => {
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(STARS, 3)); return g; }, []);
  return <points geometry={geo}><pointsMaterial size={1.4} color="#FFFFFF" sizeAttenuation={false} /></points>;
};

const heightPlane = (size: number, seg: number, h: (x: number, z: number) => number, col: (x: number, z: number, y: number, i: number) => [number, number, number]) => {
  const g = new THREE.PlaneGeometry(size, size, seg, seg);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  const c: number[] = [];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = h(x, z); p.setY(i, y); c.push(...col(x, z, y, i)); }
  g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
  g.computeVertexNormals();
  return g;
};

// ---------- 1 Racetrack Playa: flat cracked mud, mountains, rocks with trails, optional thin ice panels ----------
export const ROCKS: [number, number, number, number][] = Array.from({ length: 14 }, (_, i) => [(rnd(i) - 0.5) * 70, (rnd(i + 30) - 0.5) * 50, 0.5 + rnd(i + 60) * 0.7, rnd(i + 90) * 0.8 - 0.4]);
export const Playa: React.FC<{ move?: number; ice?: number; water?: number; t?: number }> = ({ move = 1, ice = 0, water = 0, t = 0 }) => {
  const geo = useMemo(() => heightPlane(600, 200, (x, z) => (Math.abs(x) > 120 || Math.abs(z) > 90 ? Math.min(60, (Math.max(Math.abs(x) - 120, Math.abs(z) - 90)) * 0.7) * (0.6 + 0.4 * Math.sin(x * 0.05 + z * 0.04)) : 0), (x, z, y, i) => { const k = 0.9 + rnd(i) * 0.12; return y > 1 ? [0.45 * k, 0.38 * k, 0.32 * k] : [0.8 * k, 0.74 * k, 0.64 * k]; }), []);
  const cracks = useMemo(() => Array.from({ length: 220 }, (_, i) => [(rnd(i + 3) - 0.5) * 220, (rnd(i + 7) - 0.5) * 170, rnd(i + 11) * Math.PI, 2 + rnd(i + 13) * 4]), []);
  return (
    <>
      <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={1} /></mesh>
      {cracks.map(([x, z, a, l], i) => <mesh key={i} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, a]}><planeGeometry args={[l, 0.06]} /><meshBasicMaterial color="#9A8F7C" /></mesh>)}
      {ROCKS.map(([x0, z0, r, dir], i) => {
        const len = 8 + rnd(i + 5) * 18;
        const k = Math.max(0, Math.min(1, move));
        const x = x0 + Math.cos(dir) * len * k, z = z0 + Math.sin(dir) * len * k;
        return (
          <group key={i}>
            <mesh position={[(x0 + x) / 2, 0.02, (z0 + z) / 2]} rotation={[-Math.PI / 2, 0, -dir]}><planeGeometry args={[len * k + 0.01, r * 1.2]} /><meshBasicMaterial color="#B7AA94" /></mesh>
            <mesh position={[x, r * 0.5, z]} scale={[r, r * 0.7, r * 0.9]} rotation={[0, rnd(i) * 3, 0]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#3E3A36" roughness={1} flatShading /></mesh>
          </group>
        );
      })}
      {water > 0 && <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[240, 180]} /><meshStandardMaterial color="#8FB8D0" transparent opacity={0.45 * water} metalness={0.3} roughness={0.15} /></mesh>}
      {ice > 0 && Array.from({ length: 26 }, (_, i) => (
        <mesh key={`i${i}`} position={[(rnd(i + 100) - 0.5) * 120 + t * 1.2, 0.14, (rnd(i + 200) - 0.5) * 90 + t * 0.4]} rotation={[-Math.PI / 2, 0, rnd(i + 300) * 3]}>
          <circleGeometry args={[6 + rnd(i + 400) * 8, 5]} />
          <meshStandardMaterial color="#E8F4FA" transparent opacity={0.55 * ice} roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
    </>
  );
};

// ---------- 2 Richat Structure: concentric ridges eroded from a dome ----------
export const Richat: React.FC = () => {
  const geo = useMemo(() => heightPlane(1600, 300, (x, z) => {
    const r = Math.hypot(x, z * 1.08) / 400; // 1 = outer rim
    const rings = r < 1.15 ? Math.max(0, Math.cos(r * Math.PI * 7)) * 14 * (1 - r * 0.4) : 0;
    return rings + (r > 1.1 ? 6 + Math.sin(x * 0.01) * 4 : 0) + rnd(Math.round(x) * 7 + Math.round(z)) * 0.6;
  }, (x, z, y, i) => { const k = 0.9 + rnd(i) * 0.1; const r = Math.hypot(x, z) / 400; return y > 8 ? [0.45 * k, 0.32 * k, 0.24 * k] : r < 0.25 ? [0.6 * k, 0.55 * k, 0.5 * k] : [0.9 * k, 0.72 * k, 0.48 * k]; }), []);
  return <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={1} flatShading /></mesh>;
};

// ---------- 3 Lake Hillier: pink lake, sand rim, woodland, ocean ----------
export const PinkLake: React.FC<{ fade?: number }> = ({ fade = 0 }) => {
  const trees = useMemo(() => Array.from({ length: 420 }, (_, i) => { const a = rnd(i) * Math.PI * 2, r = 95 + rnd(i + 1) * 90; return [Math.cos(a) * r * 1.6, Math.sin(a) * r * 0.9 - 20, 2 + rnd(i + 2) * 3]; }).filter(([x, z]) => z > -140), []);
  const pink = new THREE.Color("#F26DA8").lerp(new THREE.Color("#C9A0B0"), fade);
  return (
    <>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3000, 3000]} /><meshStandardMaterial color="#1F5E8C" roughness={0.3} metalness={0.2} /></mesh>
      <mesh position={[0, 0.2, 40]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.7, 1, 1]}><circleGeometry args={[200, 64]} /><meshStandardMaterial color="#3E6B3A" roughness={1} /></mesh>
      <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.6, 0.85, 1]}><circleGeometry args={[92, 64]} /><meshStandardMaterial color="#E9DCC2" roughness={1} /></mesh>
      <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.55, 0.8, 1]}><circleGeometry args={[86, 64]} /><meshStandardMaterial color={pink} roughness={0.25} /></mesh>
      <mesh position={[0, 0.5, -150]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[420, 30]} /><meshStandardMaterial color="#E9DCC2" /></mesh>
      {trees.map(([x, z, h], i) => <mesh key={i} position={[x, 0.2 + h / 2, z + 40]}><coneGeometry args={[2.2, h, 6]} /><meshStandardMaterial color={i % 3 ? "#2E5A2A" : "#3F6E33"} roughness={1} /></mesh>)}
    </>
  );
};

// ---------- 4 Darvaza: crater in sand with gas fires ----------
export const Crater: React.FC<{ t: number; fire?: number }> = ({ t, fire = 1 }) => {
  const geo = useMemo(() => heightPlane(800, 220, (x, z) => { const r = Math.hypot(x, z); return r < 32 ? -24 + Math.pow(r / 32, 3) * 22 : r < 36 ? -2 + (r - 32) * 0.6 : Math.sin(x * 0.03) * 2 + Math.cos(z * 0.025) * 2; }, (x, z, y, i) => { const k = 0.9 + rnd(i) * 0.12; return y < -3 ? [0.42 * k, 0.33 * k, 0.26 * k] : [0.86 * k, 0.72 * k, 0.52 * k]; }), []);
  const flames = useMemo(() => Array.from({ length: 140 }, (_, i) => { const a = rnd(i) * Math.PI * 2, r = 4 + rnd(i + 1) * 28; return [Math.cos(a) * r, Math.sin(a) * r, i]; }), []);
  return (
    <>
      <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={1} /></mesh>
      <pointLight position={[0, -10, 0]} intensity={2500 * fire} distance={160} decay={1.6} color="#FF7A2A" />
      {flames.map(([x, z, i]) => {
        const r = Math.hypot(x, z); const y = r < 32 ? -24 + Math.pow(r / 32, 3) * 22 : 0;
        const h = (1.2 + rnd(i + 3) * 2.5) * (0.7 + 0.3 * Math.sin(t * 9 + i)) * fire;
        return <mesh key={i} position={[x, y + h / 2, z]}><coneGeometry args={[0.6, h, 6]} /><meshBasicMaterial color={i % 3 ? "#FFB020" : "#FF5A1A"} transparent opacity={0.85} /></mesh>;
      })}
    </>
  );
};

// ---------- 5 Fairy circles: grassland dotted with bare round patches and taller rims ----------
export const FairyField: React.FC = () => {
  const circles = useMemo(() => { const out: [number, number, number][] = []; for (let gx = -12; gx <= 12; gx++) for (let gz = -12; gz <= 12; gz++) { const x = gx * 22 + (rnd(gx * 31 + gz) - 0.5) * 9, z = gz * 22 + (rnd(gx * 17 + gz * 3) - 0.5) * 9; out.push([x, z, 5 + rnd(gx + gz * 5) * 3]); } return out; }, []);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2000, 2000]} /><meshStandardMaterial color="#B8A36A" roughness={1} /></mesh>
      {circles.map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r, r + 1.6, 28]} /><meshStandardMaterial color="#C9B47A" roughness={1} /></mesh>
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[r, 28]} /><meshStandardMaterial color="#C97A4A" roughness={1} /></mesh>
        </group>
      ))}
    </>
  );
};

// ---------- 6 Hessdalen: night valley with floating lights ----------
export const Valley: React.FC<{ t: number; lights?: number }> = ({ t, lights = 3 }) => {
  const geo = useMemo(() => heightPlane(1600, 200, (x, z) => Math.pow(Math.abs(z) / 120, 2) * 30 + Math.sin(x * 0.02) * 6 + Math.cos(z * 0.05 + x * 0.01) * 4, (x, z, y, i) => { const k = 0.6 + rnd(i) * 0.2; return y > 40 ? [0.85 * k, 0.88 * k, 0.92 * k] : [0.12 * k, 0.2 * k, 0.12 * k]; }), []);
  const trees = useMemo(() => Array.from({ length: 300 }, (_, i) => [(rnd(i) - 0.5) * 900, (rnd(i + 1) - 0.5) * 300]), []);
  return (
    <>
      <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={1} /></mesh>
      {trees.map(([x, z], i) => { const y = Math.pow(Math.abs(z) / 120, 2) * 30 + Math.sin(x * 0.02) * 6 + Math.cos(z * 0.05 + x * 0.01) * 4; return <mesh key={i} position={[x, y + 4, z]}><coneGeometry args={[2, 9, 6]} /><meshStandardMaterial color="#0E1A12" /></mesh>; })}
      {[0, 1, 2, 3].slice(0, lights).map((k) => {
        const x = -60 + k * 50 + Math.sin(t * (0.2 + k * 0.1) + k) * 30, y = 40 + k * 8 + Math.sin(t * 0.5 + k * 2) * 6, z = -20 + k * 12;
        const col = ["#FFFFFF", "#FFD27A", "#FF5A4A", "#FFFFFF"][k];
        return (
          <group key={k} position={[x, y, z]}>
            <mesh><sphereGeometry args={[2.2, 20, 14]} /><meshBasicMaterial color={col} /></mesh>
            <mesh scale={4}><sphereGeometry args={[1.6, 20, 14]} /><meshBasicMaterial color={col} transparent opacity={0.18} depthWrite={false} /></mesh>
            <pointLight intensity={300} distance={120} color={col} />
          </group>
        );
      })}
    </>
  );
};
