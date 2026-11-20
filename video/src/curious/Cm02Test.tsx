import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { BlackHole } from "./BlackHole3D";
// stills harness: frame -> camera preset
const P = [
  { pos: new THREE.Vector3(0, 6, 60), beta: 0 },
  { pos: new THREE.Vector3(0, 2.2, 26), beta: 0 },
  { pos: new THREE.Vector3(14, 4, 14), beta: 0.19 },
  { pos: new THREE.Vector3(0, 1.2, 9), beta: 0.6 },
];
export const Cm02Test: React.FC = () => {
  const f = useCurrentFrame();
  const p = P[Math.min(P.length - 1, Math.floor(f / 10))];
  return <AbsoluteFill><BlackHole shot={{ pos: p.pos, look: new THREE.Vector3(0, 0, 0) }} t={f / 30} beta={p.beta} /></AbsoluteFill>;
};
