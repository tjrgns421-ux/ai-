import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Dodecahedron, Icosahedron, Stage3 } from "./Dodeca3D";
export const Cm03Test: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 10);
  const pos = [new THREE.Vector3(0, 0.6, 6), new THREE.Vector3(2.5, 1.2, 3.2), new THREE.Vector3(0, 0.4, 6), new THREE.Vector3(-1, 3, 4)][k];
  return (
    <AbsoluteFill>
      <Stage3 shot={{ pos, look: new THREE.Vector3(0, 0, 0) }}>
        {k === 2 ? (<><Dodecahedron pos={[-1.6, 0, 0]} rot={[0.3, f * 0.02, 0]} patina="green" scale={0.8} /><Icosahedron pos={[1.6, 0, 0]} rot={[0.2, 0.5, 0]} /></>) : <Dodecahedron rot={[0.35, 0.4 + f * 0.02, 0.1]} patina={k === 3 ? "gold" : "bronze"} />}
      </Stage3>
    </AbsoluteFill>
  );
};
