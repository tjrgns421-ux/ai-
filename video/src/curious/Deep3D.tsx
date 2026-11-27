import React, { useMemo } from "react";
import * as THREE from "three";
import { floorY } from "./Ocean3D";

// Curious Minutes ep08: the deep sea. Pieces placed inside OceanStage (Ocean3D). All ILLUSTRATIONS.
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A remotely operated vehicle with two headlights shining forward (+x). */
export const ROV: React.FC<{ x: number; y: number; z: number; heading?: number; t?: number }> = ({ x, y, z, heading = 0, t = 0 }) => (
  <group position={[x, y + Math.sin(t * 0.8) * 0.15, z]} rotation={[0, heading, 0]}>
    <mesh><boxGeometry args={[2.6, 1.4, 1.8]} /><meshStandardMaterial color="#F2F2F2" roughness={0.5} /></mesh>
    <mesh position={[0, 0.85, 0]}><boxGeometry args={[2.4, 0.4, 1.6]} /><meshStandardMaterial color="#E8A33A" roughness={0.5} /></mesh>
    {[-0.5, 0.5].map((dz) => <mesh key={dz} position={[1.35, 0.1, dz]}><sphereGeometry args={[0.16, 10, 8]} /><meshBasicMaterial color="#FFFBE6" /></mesh>)}
    <mesh position={[1.4, -0.5, 0]} rotation={[0, 0, -0.4]}><cylinderGeometry args={[0.06, 0.06, 1.2, 8]} /><meshStandardMaterial color="#555" /></mesh>
    <spotLight position={[1.4, 0.1, 0]} target-position={[12, -4, 0]} angle={0.5} penumbra={0.6} intensity={180} distance={40} color="#FFF6DA" />
    <pointLight position={[2.5, 0, 0]} intensity={6} distance={10} color="#FFF6DA" />
  </group>
);

/** The golden orb: a smooth gold dome about 10 cm wide (scaled up here) on a rock, among white sponges. */
export const GoldenOrb: React.FC<{ x?: number; z?: number; scale?: number }> = ({ x = 0, z = 0, scale = 1 }) => {
  const y0 = floorY(x, z);
  return (
    <group position={[x, y0, z]} scale={scale}>
      <mesh position={[0, 0.6, 0]} scale={[2.6, 1.2, 2.2]}><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#4A4644" roughness={1} flatShading /></mesh>
      <mesh position={[0.3, 1.75, 0.2]} scale={[0.75, 0.55, 0.75]}><sphereGeometry args={[1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#D9A632" metalness={0.45} roughness={0.25} emissive="#5A3E08" emissiveIntensity={0.3} /></mesh>
      <mesh position={[0.85, 1.85, 0.35]} rotation={[0, 0.4, 0.3]}><circleGeometry args={[0.12, 14]} /><meshBasicMaterial color="#7A5A14" /></mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[(rnd(i) - 0.5) * 6, 0.9 + rnd(i + 3) * 0.5, (rnd(i + 7) - 0.5) * 5]}><cylinderGeometry args={[0.1, 0.16, 0.5 + rnd(i + 9) * 0.6, 8]} /><meshStandardMaterial color="#E9E6DC" roughness={0.9} /></mesh>
      ))}
    </group>
  );
};

/** Lines of holes in flat sediment, each with a little raised rim. */
export const HoleLines: React.FC<{ x?: number; z?: number }> = ({ x = 0, z = 0 }) => {
  const holes = useMemo(() => {
    const out: [number, number][] = [];
    for (let l = 0; l < 5; l++) {
      const ang = 0.2 + (rnd(l) - 0.5) * 0.5, ox = (rnd(l + 9) - 0.5) * 14, oz = -10 + l * 5 + (rnd(l + 3) - 0.5) * 2;
      for (let k = 0; k < 9; k++) out.push([ox + Math.cos(ang) * k * 1.6 + (rnd(l * 20 + k) - 0.5) * 0.3, oz + Math.sin(ang) * k * 1.6 + (rnd(l * 30 + k) - 0.5) * 0.3]);
    }
    return out;
  }, []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, floorY(x, z) + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[22, 48]} /><meshStandardMaterial color="#8E8878" roughness={1} /></mesh>
      {holes.map(([hx, hz], i) => (
        <group key={i} position={[hx, floorY(x, z) + 0.08, hz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.3, 0.55, 18]} /><meshStandardMaterial color="#A49D8A" /></mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><circleGeometry args={[0.3, 16]} /><meshBasicMaterial color="#1A1712" /></mesh>
        </group>
      ))}
    </group>
  );
};

/** Giant squid (Architeuthis): mantle, fins, eight arms and two long feeding tentacles that sway. Faces +x. */
export const GiantSquid: React.FC<{ x: number; y: number; z: number; t: number; heading?: number; scale?: number }> = ({ x, y, z, t, heading = 0, scale = 1 }) => {
  const col = "#A8452E";
  const mat = <meshStandardMaterial color={col} roughness={0.55} emissive="#3A0E06" emissiveIntensity={0.25} />;
  return (
    <group position={[x, y, z]} rotation={[0, heading, 0]} scale={scale}>
      <mesh position={[-1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.7, 2.2, 0.7]}><coneGeometry args={[1, 2, 20]} />{mat}</mesh>
      <mesh position={[-3.6, 0, 0]} scale={[0.5, 0.06, 1.1]}><sphereGeometry args={[1, 16, 8]} />{mat}</mesh>
      <mesh position={[0.1, 0, 0]} scale={[0.7, 0.62, 0.62]}><sphereGeometry args={[1, 20, 14]} />{mat}</mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[0.25, 0.1, s * 0.58]}><sphereGeometry args={[0.24, 14, 10]} /><meshStandardMaterial color="#101418" metalness={0.3} roughness={0.2} /></mesh>)}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2, long = i === 2 || i === 7;
        const len = long ? 9 : 3.2;
        const sw = Math.sin(t * 1.3 + i) * (long ? 0.25 : 0.15);
        return (
          <group key={i} position={[0.6, Math.cos(a) * 0.35, Math.sin(a) * 0.35]} rotation={[a, 0, -Math.PI / 2 + sw]}>
            <mesh position={[0, -len / 2, 0]}><cylinderGeometry args={[0.03, 0.12, len, 6]} />{mat}</mesh>
            {long && <mesh position={[0, -len + 0.4, 0]} scale={[0.18, 0.7, 0.18]}><sphereGeometry args={[1, 8, 6]} />{mat}</mesh>}
          </group>
        );
      })}
    </group>
  );
};

/** Potato-size metal nodules scattered on the seafloor. */
export const Nodules: React.FC<{ r?: number }> = ({ r = 18 }) => {
  const n = useMemo(() => Array.from({ length: 160 }, (_, i) => [(rnd(i) - 0.5) * r * 2, (rnd(i + 500) - 0.5) * r * 2, 0.18 + rnd(i + 900) * 0.2]), [r]);
  return <>{n.map(([x, z, s], i) => <mesh key={i} position={[x, floorY(x, z) + s * 0.5, z]} scale={[s, s * 0.7, s * 0.9]} rotation={[rnd(i), rnd(i + 1) * 3, 0]}><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#2A2420" roughness={0.6} metalness={0.3} flatShading /></mesh>)}</>;
};
/** A benthic chamber lander on the seafloor, with oxygen bubbles rising inside when `o2` > 0. */
export const Chamber: React.FC<{ x?: number; z?: number; t: number; o2?: number }> = ({ x = 0, z = 0, t, o2 = 0 }) => {
  const y0 = floorY(x, z);
  return (
    <group position={[x, y0, z]}>
      <mesh position={[0, 0.9, 0]}><boxGeometry args={[2.4, 1.8, 2.4]} /><meshStandardMaterial color="#9FD8FF" transparent opacity={0.25} roughness={0.1} /></mesh>
      {[[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].map(([a, b], i) => <mesh key={i} position={[a, 2.2, b]} rotation={[0, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 4.4, 6]} /><meshStandardMaterial color="#C8C8C8" /></mesh>)}
      <mesh position={[0, 4.4, 0]}><boxGeometry args={[3.2, 0.4, 3.2]} /><meshStandardMaterial color="#E8A33A" /></mesh>
      {o2 > 0 && Array.from({ length: 30 }, (_, i) => { const ph = (t * 0.4 + i / 30) % 1; return <mesh key={i} position={[(rnd(i) - 0.5) * 2, 0.2 + ph * 1.5, (rnd(i + 3) - 0.5) * 2]}><sphereGeometry args={[0.08, 6, 4]} /><meshBasicMaterial color="#BFF0FF" transparent opacity={o2 * (1 - ph)} /></mesh>; })}
    </group>
  );
};
/** Giant isopod: segmented armored body with legs and antennae. Faces +x. */
export const Isopod: React.FC<{ x: number; z: number; t: number; scale?: number; heading?: number }> = ({ x, z, t, scale = 1, heading = 0 }) => {
  const y0 = floorY(x, z);
  return (
    <group position={[x + t * 0.15, y0 + 0.35 * scale, z]} rotation={[0, heading, 0]} scale={scale}>
      {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[1.2 - i * 0.38, 0.05 * Math.sin(i), 0]} scale={[0.22, 0.32, 0.62 - Math.abs(i - 3) * 0.04]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color="#C9B8A0" roughness={0.6} /></mesh>)}
      <mesh position={[-1.6, 0, 0]} scale={[0.35, 0.18, 0.5]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#BBA88E" /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[1.75, 0.15, s * 0.25]} rotation={[0, s * 0.4, -1.2]}><cylinderGeometry args={[0.02, 0.03, 1.2, 5]} /><meshStandardMaterial color="#A8957C" /></mesh>)}
      {Array.from({ length: 7 }, (_, i) => [-1, 1].map((s) => <mesh key={`${i}${s}`} position={[1.1 - i * 0.36, -0.22, s * 0.6]} rotation={[s * (0.9 + Math.sin(t * 3 + i) * 0.15), 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.5, 5]} /><meshStandardMaterial color="#A8957C" /></mesh>))}
    </group>
  );
};
