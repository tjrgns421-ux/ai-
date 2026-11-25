import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Curious Minutes ep06: Antarctica. All 3D scenes are ILLUSTRATIONS (not to scale):
// snowfield with peaks, the "pyramid" peak, Taylor Glacier with Blood Falls, sea ice with a polynya, the ANITA balloon.

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export type ShotI = { pos: THREE.Vector3; look: THREE.Vector3; fov?: number; up?: THREE.Vector3 };
const Rig: React.FC<{ sh: ShotI; sky: string; fog: string; near: number; far: number }> = ({ sh, sky, fog, near, far }) => {
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
  scene.fog = new THREE.Fog(fog, near, far);
  return null;
};

export const snowY = (x: number, z: number) => Math.sin(x * 0.03) * 3 + Math.cos(z * 0.025 + 1) * 3 + Math.sin((x - z) * 0.08) * 0.8;

/** Antarctic stage: pale sky, low sun, white fog. */
export const IceStage: React.FC<{ shot: ShotI; children?: React.ReactNode; width?: number; height?: number; sky?: string; sun?: [number, number, number]; fogFar?: number }> = ({ shot, children, width = 1920, height = 1080, sky = "#A9CFE8", sun = [-120, 60, 80], fogFar = 900 }) => (
  <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: shot.fov ?? 45, near: 0.2, far: 4000 }}>
    <Rig sh={shot} sky={sky} fog="#DCEBF5" near={200} far={fogFar} />
    <hemisphereLight args={["#EAF6FF", "#7C9BB4", 0.9]} />
    <ambientLight intensity={0.35} />
    <directionalLight position={sun} intensity={2.4} color="#FFF1DC" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-300} shadow-camera-right={300} shadow-camera-top={300} shadow-camera-bottom={-300} />
    {children}
  </ThreeCanvas>
);

export const Snowfield: React.FC<{ size?: number }> = ({ size = 1400 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 160, 160);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, snowY(p.getX(i), p.getZ(i)) + (rnd(i) - 0.5) * 0.4);
    g.computeVertexNormals();
    return g;
  }, [size]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#F3F8FC" roughness={0.9} />
    </mesh>
  );
};

// a rocky peak: cone with jittered vertices, dark rock with snow on gentle faces
const peakGeo = (seed: number, sides: number, jitter: number) => {
  const g = new THREE.ConeGeometry(1, 1, sides, 8);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = 1 + (rnd(seed + i * 1.7) - 0.5) * jitter * (0.5 - y);
    p.setXYZ(i, p.getX(i) * k, y, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
};
export const Peak: React.FC<{ x: number; z: number; h: number; r: number; seed?: number; sides?: number; jitter?: number; rot?: number }> = ({ x, z, h, r, seed = 1, sides = 7, jitter = 0.5, rot = 0 }) => {
  const g = useMemo(() => peakGeo(seed, sides, jitter), [seed, sides, jitter]);
  return (
    <group position={[x, snowY(x, z) + h / 2 - 2, z]} rotation={[0, rot, 0]}>
      <mesh geometry={g} scale={[r, h, r]} castShadow receiveShadow>
        <meshStandardMaterial color="#3E3A38" roughness={1} flatShading />
      </mesh>
      <mesh geometry={g} scale={[r * 1.02, h * 0.35, r * 1.02]} position={[0, -h * 0.33, 0]}>
        <meshStandardMaterial color="#F1F6FA" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
};
/** The "pyramid": a four-sided peak, ~1,265 m (here 126 units), with snow streaks on its faces. */
export const Pyramid: React.FC<{ x?: number; z?: number }> = ({ x = 0, z = 0 }) => <Peak x={x} z={z} h={126} r={110} sides={4} jitter={0.12} seed={9} rot={Math.PI / 4} />;
export const Range: React.FC = () => (
  <>
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + rnd(i) * 0.3, d = 260 + rnd(i + 7) * 260;
      return <Peak key={i} x={Math.cos(a) * d} z={Math.sin(a) * d} h={60 + rnd(i + 3) * 110} r={60 + rnd(i + 5) * 70} seed={i * 13} />;
    })}
  </>
);

/** Taylor Glacier's tongue with a red-brown stain (Blood Falls) running down its face; `flow` 0..1 grows the stain. */
export const BloodGlacier: React.FC<{ flow?: number; t?: number }> = ({ flow = 1, t = 0 }) => {
  const face = useMemo(() => {
    const g = new THREE.BoxGeometry(160, 22, 60, 40, 10, 10);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + (rnd(i) - 0.5) * 1.6, p.getY(i) + (rnd(i + 3) - 0.5) * 1.2, p.getZ(i) + (rnd(i + 5) - 0.5) * 1.6);
    g.computeVertexNormals();
    return g;
  }, []);
  const k = Math.max(0, Math.min(1, flow));
  return (
    <group>
      <mesh geometry={face} position={[0, 11, -30]} castShadow receiveShadow>
        <meshStandardMaterial color="#DDEEF7" emissive="#5C93B4" emissiveIntensity={0.12} roughness={0.6} flatShading />
      </mesh>
      {/* the red cascade down the face and a fan of stain on the lake ice */}
      <mesh position={[0, 11, 0.6]} scale={[7 + 2 * k, 22 * k, 1]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <meshStandardMaterial color="#8E2A14" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, 10]} rotation={[-Math.PI / 2, 0, 0]} scale={[14 * k + 1, 18 * k + 1, 1]}>
        <circleGeometry args={[1, 40]} />
        <meshStandardMaterial color="#A7401E" roughness={0.8} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const ph = ((t * 0.4 + i / 12) % 1);
        return <mesh key={i} position={[(rnd(i) - 0.5) * 6, 22 * k * (1 - ph), 1.2]}><sphereGeometry args={[0.6, 8, 6]} /><meshStandardMaterial color="#B2451F" /></mesh>;
      })}
      {/* frozen lake in front */}
      <mesh position={[0, 0.1, 60]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 120]} />
        <meshStandardMaterial color="#CFE4F0" roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  );
};

/** Sea ice seen from above with an open-water hole (polynya); `open` 0..1 grows the hole. */
export const SeaIce: React.FC<{ open?: number; t?: number }> = ({ open = 1, t = 0 }) => {
  const r = 10 + 110 * Math.max(0, Math.min(1, open));
  const floes = useMemo(() => Array.from({ length: 700 }, (_, i) => [(rnd(i) - 0.5) * 900, (rnd(i + 900) - 0.5) * 900, 3 + rnd(i + 1800) * 9, rnd(i + 2700) * 3]), []);
  return (
    <group>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#0D2C44" roughness={0.3} metalness={0.2} />
      </mesh>
      {floes.map(([x, z, s, a], i) => {
        const d = Math.hypot(x, z * 1.3);
        if (d < r) return null;
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, a]}>
            <circleGeometry args={[s, 6]} />
            <meshStandardMaterial color={d < r + 30 ? "#C9DFEB" : "#EDF5FA"} roughness={0.8} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1 / 1.3, 1]}>
        <ringGeometry args={[r - 6, r + 26, 64]} />
        <meshStandardMaterial color="#E8F2F8" transparent opacity={0.35} />
      </mesh>
      {/* swirl hints in the open water */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = i * 0.9 + t * 0.25, rr = r * (0.2 + (i % 6) * 0.13);
        return <mesh key={`s${i}`} position={[Math.cos(a) * rr, 0.2, Math.sin(a) * rr / 1.3]} rotation={[-Math.PI / 2, 0, a]}><planeGeometry args={[10, 1.2]} /><meshBasicMaterial color="#3B7EA8" transparent opacity={0.5} /></mesh>;
      })}
    </group>
  );
};

/** NASA's ANITA: a huge zero-pressure balloon with a gondola of horn antennas, ~37 km up (not to scale). */
export const Balloon: React.FC<{ x?: number; y?: number; z?: number; t?: number }> = ({ x = 0, y = 120, z = 0, t = 0 }) => (
  <group position={[x, y + Math.sin(t * 0.5) * 1.5, z]} rotation={[0, t * 0.05, 0]}>
    <mesh position={[0, 34, 0]} scale={[26, 22, 26]}><sphereGeometry args={[1, 40, 28]} /><meshStandardMaterial color="#F4F6F8" roughness={0.35} /></mesh>
    <mesh position={[0, 6, 0]}><cylinderGeometry args={[0.15, 0.15, 24, 6]} /><meshStandardMaterial color="#888" /></mesh>
    <mesh position={[0, -6, 0]}><cylinderGeometry args={[3, 4.2, 8, 8]} /><meshStandardMaterial color="#C9CDD2" metalness={0.5} roughness={0.4} /></mesh>
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2, ring = i % 2 ? 4.4 : 3.6, yy = i % 2 ? -4 : -8;
      return <mesh key={i} position={[Math.cos(a) * ring, yy, Math.sin(a) * ring]} rotation={[0.5, -a + Math.PI / 2, 0]}><boxGeometry args={[1.4, 1.4, 1.4]} /><meshStandardMaterial color="#E9C56A" metalness={0.6} roughness={0.35} /></mesh>;
    })}
  </group>
);

/** Radio rays: thin glowing lines from a point toward a target, drawn progressively with `k`. */
export const Ray: React.FC<{ from: [number, number, number]; to: [number, number, number]; k: number; color?: string }> = ({ from, to, k, color = "#FFD23F" }) => {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const end = a.clone().lerp(b, Math.max(0.001, Math.min(1, k)));
  const mid = a.clone().add(end).multiplyScalar(0.5);
  const len = a.distanceTo(end);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.6, 0.6, len, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
};
