import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { HutRock, Magnetotail, MoonGlobe, Rover, Stage4, Surface, groundY } from "./Moon3D";
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const Cm04Test: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 10);
  if (k === 0) return <AbsoluteFill><Stage4 shot={{ pos: V(0, 0, 32), look: V(0, 0, 0), fov: 40 }} sun={[0, 10, 60]}><MoonGlobe rotY={0} /></Stage4></AbsoluteFill>;
  if (k === 1) return <AbsoluteFill><Stage4 shot={{ pos: V(0, 0, 32), look: V(0, 0, 0), fov: 40 }} sun={[0, 10, 60]}><MoonGlobe rotY={Math.PI} /></Stage4></AbsoluteFill>;
  if (k === 2) return <AbsoluteFill><Stage4 shot={{ pos: V(-9, groundY(-6, 0) + 2.2, 4), look: V(14, groundY(14, -2) + 1, -2), fov: 45 }}><Surface /><Rover x={-5} z={1} heading={0.3} /><HutRock x={22} z={-3} /></Stage4></AbsoluteFill>;
  return <AbsoluteFill><Stage4 shot={{ pos: V(10, 22, 40), look: V(14, 0, 4), fov: 45 }} sun={[-80, 10, 0]}><Magnetotail t={f / 30} moonAngle={0.35} /></Stage4></AbsoluteFill>;
};
