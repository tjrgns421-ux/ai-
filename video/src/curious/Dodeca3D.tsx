import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Curious Minutes ep03: a Roman dodecahedron (ILLUSTRATION based on museum examples).
// Built from 12 pentagonal plates, each with a round hole of a different size, a ring carved around it,
// and a knob on each of the 20 corners. Unit: the circumradius of the solid is ~1.4.

const PHI = (1 + Math.sqrt(5)) / 2;

const dodecaVerts = (): THREE.Vector3[] => {
  const v: THREE.Vector3[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push(new THREE.Vector3(x, y, z));
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    v.push(new THREE.Vector3(0, a / PHI, b * PHI));
    v.push(new THREE.Vector3(a / PHI, b * PHI, 0));
    v.push(new THREE.Vector3(a * PHI, 0, b / PHI));
  }
  return v.map((p) => p.multiplyScalar(0.8));
};
const icoVerts = (): THREE.Vector3[] => {
  const v: THREE.Vector3[] = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    v.push(new THREE.Vector3(0, a * PHI, b), new THREE.Vector3(a * PHI, b, 0), new THREE.Vector3(a, 0, b * PHI));
  }
  return v;
};

type Face = { n: THREE.Vector3; pts: THREE.Vector3[]; d: number };
// faces of a polyhedron given its vertices and face normals: the vertices with the largest dot product
const facesOf = (verts: THREE.Vector3[], normals: THREE.Vector3[], k: number): Face[] =>
  normals.map((n0) => {
    const n = n0.clone().normalize();
    const sorted = [...verts].sort((a, b) => b.dot(n) - a.dot(n)).slice(0, k);
    const c = sorted.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / k);
    const u = sorted[0].clone().sub(c).normalize();
    const w = n.clone().cross(u);
    const pts = sorted.sort((a, b) => Math.atan2(a.clone().sub(c).dot(w), a.clone().sub(c).dot(u)) - Math.atan2(b.clone().sub(c).dot(w), b.clone().sub(c).dot(u)));
    return { n, pts, d: c.dot(n) };
  });

const plate = (f: Face, hole: number, thick: number): { geo: THREE.BufferGeometry; quat: THREE.Quaternion; pos: THREE.Vector3; ring: number } => {
  const c = f.n.clone().multiplyScalar(f.d);
  const u = f.pts[0].clone().sub(c).normalize();
  const w = f.n.clone().cross(u);
  const shape = new THREE.Shape(f.pts.map((p) => new THREE.Vector2(p.clone().sub(c).dot(u), p.clone().sub(c).dot(w))));
  const inR = f.pts[0].clone().sub(c).length() * Math.cos(Math.PI / 5);
  const r = Math.min(hole, inR * 0.78);
  if (r > 0.001) {
    const h = new THREE.Path();
    h.absarc(0, 0, r, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2, curveSegments: 48 });
  geo.translate(0, 0, -thick);
  const m = new THREE.Matrix4().makeBasis(u, w, f.n);
  const quat = new THREE.Quaternion().setFromRotationMatrix(m);
  return { geo, quat, pos: c, ring: r };
};

export type Patina = "bronze" | "green" | "silver" | "gold";
const MAT: Record<Patina, { color: string; metal: number; rough: number }> = {
  bronze: { color: "#9A7340", metal: 0.85, rough: 0.38 },
  green: { color: "#4E7A62", metal: 0.45, rough: 0.6 },
  silver: { color: "#C9CDD3", metal: 0.95, rough: 0.25 },
  gold: { color: "#D9A93A", metal: 1, rough: 0.25 },
};

const DODECA_V = dodecaVerts();
const DODECA_F = facesOf(DODECA_V, icoVerts(), 5);
// hole radii: all different, like the real ones (6-40 mm on a 4-11 cm object)
const HOLES = [0.2, 0.42, 0.28, 0.5, 0.34, 0.24, 0.46, 0.3, 0.38, 0.22, 0.44, 0.36];

/** A Roman dodecahedron. `holesOnly` = only these face indices get a hole (for the icosahedron-style cousin, not used here). */
export const Dodecahedron: React.FC<{ patina?: Patina; rot?: [number, number, number]; pos?: [number, number, number]; scale?: number; highlightHole?: number; glow?: number }> = ({ patina = "bronze", rot = [0, 0, 0], pos = [0, 0, 0], scale = 1, highlightHole = -1, glow = 0 }) => {
  const m = MAT[patina];
  const plates = useMemo(() => DODECA_F.map((f, i) => plate(f, HOLES[i], 0.07)), []);
  return (
    <group position={pos} rotation={rot} scale={scale}>
      {plates.map((p, i) => (
        <group key={i} position={p.pos} quaternion={p.quat}>
          <mesh geometry={p.geo} castShadow receiveShadow>
            <meshStandardMaterial color={m.color} metalness={m.metal} roughness={m.rough} emissive={i === highlightHole ? "#FFB347" : "#000000"} emissiveIntensity={i === highlightHole ? glow : 0} />
          </mesh>
          {/* the carved rings around the hole */}
          {[1.25, 1.45].map((k) => (
            <mesh key={k} position={[0, 0, 0.012]}>
              <torusGeometry args={[p.ring * k, 0.008, 6, 64]} />
              <meshStandardMaterial color={m.color} metalness={m.metal} roughness={m.rough + 0.15} />
            </mesh>
          ))}
        </group>
      ))}
      {DODECA_V.map((v, i) => (
        <mesh key={`k${i}`} position={v.clone().multiplyScalar(1.07)} castShadow>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={m.color} metalness={m.metal} roughness={m.rough} />
        </mesh>
      ))}
    </group>
  );
};

// the Arloff icosahedron (Bonn): 20 faces, knobs on the corners, holes in only two opposite faces
const ICO_V = icoVerts().map((p) => p.clone().multiplyScalar(0.62));
const ICO_F = facesOf(ICO_V, dodecaVerts(), 3);
export const Icosahedron: React.FC<{ rot?: [number, number, number]; pos?: [number, number, number]; scale?: number }> = ({ rot = [0, 0, 0], pos = [0, 0, 0], scale = 1 }) => {
  const m = MAT.green;
  const plates = useMemo(() => ICO_F.map((f, i) => plate(f, i === 0 || i === 19 ? 0.18 : 0, 0.06)), []);
  return (
    <group position={pos} rotation={rot} scale={scale}>
      {plates.map((p, i) => (
        <mesh key={i} geometry={p.geo} position={p.pos} quaternion={p.quat} castShadow>
          <meshStandardMaterial color={m.color} metalness={m.metal} roughness={m.rough} />
        </mesh>
      ))}
      {ICO_V.map((v, i) => (
        <mesh key={`k${i}`} position={v.clone().multiplyScalar(1.08)}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color={m.color} metalness={m.metal} roughness={m.rough} />
        </mesh>
      ))}
    </group>
  );
};

export type Shot3 = { pos: THREE.Vector3; look: THREE.Vector3; fov?: number };
const Rig: React.FC<{ sh: Shot3; bg: string }> = ({ sh, bg }) => {
  const { camera, scene } = useThree();
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  if (sh.fov && (camera as THREE.PerspectiveCamera).fov !== sh.fov) {
    (camera as THREE.PerspectiveCamera).fov = sh.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }
  scene.background = new THREE.Color(bg);
  return null;
};

/** Museum-style stage: dark background, a plinth, warm key light and cool rim light. */
export const Stage3: React.FC<{ shot: Shot3; bg?: string; plinth?: boolean; children: React.ReactNode; width?: number; height?: number }> = ({ shot, bg = "#15110D", plinth = true, children, width = 1920, height = 1080 }) => (
  <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: shot.fov ?? 35, near: 0.05, far: 200 }}>
    <Rig sh={shot} bg={bg} />
    <ambientLight intensity={0.35} />
    <spotLight position={[3, 6, 4]} angle={0.5} penumbra={0.6} intensity={90} color="#FFE2B8" castShadow shadow-mapSize={[2048, 2048]} />
    <pointLight position={[-4, 2, -3]} intensity={25} color="#8FB8FF" />
    <pointLight position={[0, -2, 4]} intensity={6} color="#FFD7A0" />
    {plinth && (
      <mesh position={[0, -1.85, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.3, 0.6, 64]} />
        <meshStandardMaterial color="#2A231C" roughness={0.9} />
      </mesh>
    )}
    {children}
  </ThreeCanvas>
);
