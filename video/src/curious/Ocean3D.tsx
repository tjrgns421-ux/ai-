import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Curious Minutes ep05: sounds in the ocean. Every 3D scene here is an ILLUSTRATION (not to scale).
// Pieces: underwater stage (fog, light shafts, marine snow), seafloor, hydrophone mooring, sound shells,
// icebergs (drifting, cracking, grounding), whales (minke, blue), an undersea volcano, a Cold War submarine.

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const SURF = 30; // sea surface height
export const floorY = (x: number, z: number) =>
  -2 + Math.sin(x * 0.07) * 2.2 + Math.cos(z * 0.09 + 1) * 1.8 + Math.sin((x + z) * 0.21) * 0.6;

export type ShotO = { pos: THREE.Vector3; look: THREE.Vector3; fov?: number; up?: THREE.Vector3 };
const Rig: React.FC<{ sh: ShotO; above: boolean; t: number; deep?: boolean }> = ({ sh, above, deep }) => {
  const { camera, scene } = useThree();
  camera.up.copy(sh.up ?? new THREE.Vector3(0, 1, 0));
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  const c = camera as THREE.PerspectiveCamera;
  if (sh.fov && c.fov !== sh.fov) {
    c.fov = sh.fov;
    c.updateProjectionMatrix();
  }
  // depth tint: darker the deeper the camera is
  const depth = Math.max(0, Math.min(1, (SURF - sh.pos.y) / 45));
  const col = above ? new THREE.Color("#8EC9EA") : new THREE.Color("#0E5A86").lerp(new THREE.Color("#031627"), depth);
  if (deep) {
    scene.background = new THREE.Color("#01060C");
    scene.fog = new THREE.FogExp2(0x01060c, 0.025);
    return null;
  }
  scene.background = col;
  scene.fog = above ? new THREE.Fog("#BFE1F2", 120, 700) : new THREE.FogExp2(col.getHex(), 0.009 + depth * 0.006);
  return null;
};

const SNOW = Array.from({ length: 900 }, (_, i) => [(rnd(i) - 0.5) * 160, rnd(i + 3000) * 60 - 8, (rnd(i + 6000) - 0.5) * 160]);
const Snow: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const arr = new Float32Array(SNOW.length * 3);
  SNOW.forEach(([x, y, z], i) => {
    arr[i * 3] = x + Math.sin(t * 0.3 + i) * 0.6;
    arr[i * 3 + 1] = ((((y - t * 0.35) % 60) + 60) % 60) - 8;
    arr[i * 3 + 2] = z;
  });
  geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.18} color="#CFE8F5" transparent opacity={0.55} depthWrite={false} />
    </points>
  );
};

const Shafts: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: 9 }, (_, i) => {
      const x = (rnd(i + 50) - 0.5) * 120, z = (rnd(i + 80) - 0.5) * 120;
      const op = 0.05 + 0.04 * Math.sin(t * 0.7 + i * 1.7);
      return (
        <mesh key={i} position={[x, SURF - 22, z]} rotation={[0.12, 0, 0.18]}>
          <cylinderGeometry args={[2.5, 7, 44, 16, 1, true]} />
          <meshBasicMaterial color="#BFE9FF" transparent opacity={op} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      );
    })}
  </>
);

const SurfaceFromBelow: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(600, 600, 60, 60), []);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, Math.sin(x * 0.08 + t * 1.2) * 0.6 + Math.cos(y * 0.07 + t) * 0.6);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={[0, SURF, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#9FDDF5" emissive="#4AA8D8" emissiveIntensity={0.55} transparent opacity={0.75} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Floor: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(400, 400, 140, 140);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col: number[] = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      p.setY(i, floorY(x, z) + (rnd(i) - 0.5) * 0.25);
      const k = 0.85 + rnd(i + 99) * 0.2;
      col.push(0.42 * k, 0.45 * k, 0.43 * k);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const rocks = useMemo(() => Array.from({ length: 70 }, (_, i) => [(rnd(i + 400) - 0.5) * 180, (rnd(i + 500) - 0.5) * 180, 0.4 + rnd(i + 600) * 1.6]), []);
  return (
    <>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      {rocks.map(([x, z, r], i) => (
        <mesh key={i} position={[x, floorY(x, z) + r * 0.3, z]} scale={[r, r * 0.6, r * 0.9]} rotation={[rnd(i) * 3, rnd(i + 1) * 3, 0]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#3E4A4E" roughness={1} flatShading />
        </mesh>
      ))}
    </>
  );
};

/** Underwater stage. Children are placed in world units: seafloor ≈ y 0, surface at y = SURF. */
export const OceanStage: React.FC<{ shot: ShotO; t: number; children?: React.ReactNode; width?: number; height?: number; floor?: boolean; deep?: boolean }> = ({ shot, t, children, width = 1920, height = 1080, floor = true, deep = false }) => (
  <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: shot.fov ?? 45, near: 0.1, far: 3000 }}>
    <Rig sh={shot} above={false} t={t} deep={deep} />
    {deep ? (
      <>
        <ambientLight intensity={0.3} color="#4A6A8A" />
        <pointLight position={[shot.pos.x, shot.pos.y + 1, shot.pos.z]} intensity={420} distance={90} decay={1.5} color="#DDEBFF" />
      </>
    ) : (
      <>
        <ambientLight intensity={0.55} color="#7FB6D6" />
        <hemisphereLight args={["#BFE9FF", "#0B2233", 0.9]} />
        <directionalLight position={[20, 80, 10]} intensity={1.6} color="#E6F7FF" />
        <SurfaceFromBelow t={t} />
        <Shafts t={t} />
      </>
    )}
    <Snow t={t} />
    {floor && <Floor />}
    {children}
  </ThreeCanvas>
);

/** Above the water: sky, open sea, sunlight (for icebergs seen from the surface). */
export const SeaStage: React.FC<{ shot: ShotO; t: number; children?: React.ReactNode; width?: number; height?: number }> = ({ shot, t, children, width = 1920, height = 1080 }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(1600, 1600, 90, 90), []);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, Math.sin(x * 0.05 + t * 0.9) * 0.5 + Math.cos(y * 0.06 + t * 0.7) * 0.5 + Math.sin((x - y) * 0.13 + t * 1.6) * 0.18);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: shot.fov ?? 45, near: 0.1, far: 3000 }}>
      <Rig sh={shot} above t={t} />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#DFF3FF", "#1A4D6E", 0.8]} />
      <directionalLight position={[-60, 40, 30]} intensity={2.2} color="#FFF4E0" />
      <mesh geometry={geo} position={[0, SURF, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#1C5C80" metalness={0.35} roughness={0.25} />
      </mesh>
      {children}
    </ThreeCanvas>
  );
};

// ---------- icebergs ----------
const bergGeo = (seed: number, detail = 2) => {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position as THREE.BufferAttribute;
  const seen = new Map<string, number>();
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (!seen.has(key)) seen.set(key, 0.78 + rnd(seed + seen.size * 3.7) * 0.4);
    const k = seen.get(key)!;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
};
/** A drifting iceberg: flat white top above SURF, big blue body below. `split` 0..1 opens a crack and drops a chunk. */
export const Iceberg: React.FC<{ x: number; z: number; size?: number; seed?: number; y?: number; split?: number; tilt?: number }> = ({ x, z, size = 10, seed = 1, y = SURF, split = 0, tilt = 0 }) => {
  const g1 = useMemo(() => bergGeo(seed), [seed]);
  const g2 = useMemo(() => bergGeo(seed + 40, 1), [seed]);
  const ice = <meshStandardMaterial color="#DDF3FF" emissive="#2F7FA8" emissiveIntensity={0.18} roughness={0.55} flatShading />;
  const deep = <meshStandardMaterial color="#C4EEFF" emissive="#3A9CCB" emissiveIntensity={0.35} roughness={0.4} flatShading />;
  return (
    <group position={[x, y, z]} rotation={[0, seed, tilt]}>
      <mesh geometry={g1} position={[0, size * 0.35, 0]} scale={[size * 1.1, size * 0.45, size * 0.9]}>{ice}</mesh>
      <mesh geometry={g1} position={[0, -size * 0.9, 0]} scale={[size * 1.45, size * 1.6, size * 1.25]}>{deep}</mesh>
      {split > 0 && (
        <mesh geometry={g2} position={[size * (1.3 + split * 0.8), size * 0.2 - split * split * size * 1.6, size * 0.3]} rotation={[0, 0, -split * 1.4]} scale={[size * 0.5, size * 0.55, size * 0.5]}>{ice}</mesh>
      )}
      {split > 0 && (
        <mesh position={[size * 0.95, size * 0.2, 0]} rotation={[0, 0, 0.1]} scale={[0.25 + split, size * 1.4, size * 0.8]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#0B3550" />
        </mesh>
      )}
    </group>
  );
};

// ---------- sound ----------
/** Expanding sound shells from a point; a new shell every `every` seconds. */
export const SoundShells: React.FC<{ at: [number, number, number]; t: number; color?: string; every?: number; speed?: number; max?: number; from?: number }> = ({ at, t, color = "#FFD23F", every = 1.2, speed = 14, max = 90, from = 0 }) => {
  const n = Math.ceil(max / speed / every) + 1;
  const tt = t - from;
  if (tt < 0) return null;
  return (
    <group position={at}>
      {Array.from({ length: n }, (_, i) => {
        const age = ((tt - i * every) % (n * every) + n * every) % (n * every);
        if (tt - i * every < 0) return null;
        const r = 0.5 + age * speed;
        if (r > max) return null;
        const op = 0.35 * (1 - r / max);
        return (
          <mesh key={i} scale={r}>
            <sphereGeometry args={[1, 40, 24]} />
            <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Hydrophone mooring: anchor on the floor, cable, float; the sensor blinks when `hear` > 0. */
export const Hydrophone: React.FC<{ x: number; z: number; h?: number; hear?: number }> = ({ x, z, h = 16, hear = 0 }) => {
  const y0 = floorY(x, z);
  return (
    <group position={[x, y0, z]}>
      <mesh position={[0, 0.4, 0]}><boxGeometry args={[1.6, 0.8, 1.6]} /><meshStandardMaterial color="#5B5B5B" roughness={0.9} /></mesh>
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.05, 0.05, h, 6]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0, h * 0.62, 0]}><cylinderGeometry args={[0.32, 0.32, 1.6, 16]} /><meshStandardMaterial color="#2A2F38" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[0, h * 0.62 + 0.95, 0]}><sphereGeometry args={[0.22, 12, 10]} /><meshBasicMaterial color={hear > 0 ? "#FF5A4A" : "#5A1A16"} /></mesh>
      {hear > 0 && (
        <mesh position={[0, h * 0.62, 0]} scale={1 + hear * 3}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshBasicMaterial color="#FF6B5E" transparent opacity={0.4 * (1 - hear)} depthWrite={false} />
        </mesh>
      )}
      <mesh position={[0, h + 0.9, 0]}><sphereGeometry args={[1.1, 20, 14]} /><meshStandardMaterial color="#FFB020" roughness={0.5} /></mesh>
    </group>
  );
};

// ---------- whales ----------
/** Simple whale (ILLUSTRATION). kind: minke (dark grey, white belly) or blue (long, mottled blue-grey). Faces +x. */
export const Whale: React.FC<{ x: number; y: number; z: number; t: number; heading?: number; kind?: "minke" | "blue"; scale?: number; call?: number }> = ({ x, y, z, t, heading = 0, kind = "minke", scale = 1, call = 0 }) => {
  const L = kind === "blue" ? 12 : 4.5;
  const col = kind === "blue" ? "#5D7C93" : "#3E4550";
  const belly = kind === "blue" ? "#8AA6B8" : "#E8ECEF";
  const sw = Math.sin(t * 2.2);
  return (
    <group position={[x, y + Math.sin(t * 0.9) * 0.3, z]} rotation={[0, heading, 0]} scale={scale}>
      <mesh scale={[L * 0.5, L * 0.11, L * 0.12]}><sphereGeometry args={[1, 32, 20]} /><meshStandardMaterial color={col} roughness={0.55} /></mesh>
      <mesh position={[L * 0.05, -L * 0.035, 0]} scale={[L * 0.4, L * 0.07, L * 0.1]}><sphereGeometry args={[1, 28, 16]} /><meshStandardMaterial color={belly} roughness={0.6} /></mesh>
      <mesh position={[L * 0.38, 0.02 * L, 0]} scale={[L * 0.16, L * 0.08, L * 0.1]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={col} roughness={0.55} /></mesh>
      <group position={[-L * 0.45, 0, 0]} rotation={[0, 0, sw * 0.18]}>
        <mesh position={[-L * 0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.55]}><coneGeometry args={[L * 0.07, L * 0.25, 14]} /><meshStandardMaterial color={col} roughness={0.55} /></mesh>
        <group position={[-L * 0.22, 0, 0]} rotation={[0, 0, sw * 0.35]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[-L * 0.03, 0, s * L * 0.08]} rotation={[0, s * 0.5, 0]} scale={[L * 0.09, L * 0.012, L * 0.1]}><sphereGeometry args={[1, 16, 8]} /><meshStandardMaterial color={col} roughness={0.55} /></mesh>
          ))}
        </group>
      </group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[L * 0.18, -L * 0.07, s * L * 0.12]} rotation={[s * 0.6, s * 0.4, -0.5]} scale={[L * 0.09, L * 0.012, L * 0.035]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color={col} roughness={0.55} /></mesh>
      ))}
      <mesh position={[-L * 0.22, L * 0.1, 0]} rotation={[0, 0, 0.6]} scale={[L * 0.05, L * 0.04, L * 0.01]}><coneGeometry args={[1, 1.5, 3]} /><meshStandardMaterial color={col} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[L * 0.36, -L * 0.005, s * L * 0.085]}><sphereGeometry args={[L * 0.008, 8, 6]} /><meshBasicMaterial color="#0A0A0A" /></mesh>
      ))}
      {call > 0 && <SoundShells at={[L * 0.5, 0, 0]} t={t} color="#7FE3FF" every={1.0} speed={8} max={30} />}
    </group>
  );
};

// ---------- volcano ----------
export const Volcano: React.FC<{ x: number; z: number; t: number; erupt?: number }> = ({ x, z, t, erupt = 1 }) => {
  const y0 = floorY(x, z);
  const bubbles = Array.from({ length: 70 }, (_, i) => {
    const ph = ((t * 0.5 + rnd(i)) % 1 + 1) % 1;
    return [Math.sin(i * 2.1) * (0.6 + ph * 3), 13 + ph * 26, Math.cos(i * 1.3) * (0.6 + ph * 3), 0.2 + rnd(i + 9) * 0.35, ph] as const;
  });
  return (
    <group position={[x, y0, z]}>
      <mesh position={[0, 6, 0]}><coneGeometry args={[16, 13, 40, 6, true]} /><meshStandardMaterial color="#2C2A2A" roughness={1} flatShading /></mesh>
      <mesh position={[0, 12.6, 0]}><cylinderGeometry args={[1.8, 1.8, 0.3, 24]} /><meshBasicMaterial color="#FF7A2A" transparent opacity={0.6 + 0.3 * Math.sin(t * 6) * erupt} /></mesh>
      <pointLight position={[0, 14, 0]} intensity={40 * erupt} distance={40} color="#FF8A3A" />
      {erupt > 0 && bubbles.map(([bx, by, bz, r, ph], i) => (
        <mesh key={i} position={[bx, by, bz]}><sphereGeometry args={[r, 8, 6]} /><meshStandardMaterial color="#CFEFFF" transparent opacity={0.55 * (1 - ph) * erupt} /></mesh>
      ))}
    </group>
  );
};

// ---------- submarine ----------
export const Submarine: React.FC<{ x: number; y: number; z: number; heading?: number }> = ({ x, y, z, heading = 0 }) => (
  <group position={[x, y, z]} rotation={[0, heading, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}><capsuleGeometry args={[1.4, 12, 8, 20]} /><meshStandardMaterial color="#26292E" metalness={0.5} roughness={0.5} /></mesh>
    <mesh position={[2, 2, 0]}><boxGeometry args={[2.4, 2.2, 0.9]} /><meshStandardMaterial color="#26292E" metalness={0.5} roughness={0.5} /></mesh>
    <mesh position={[-7.4, 0, 0]}><boxGeometry args={[0.6, 3.4, 0.15]} /><meshStandardMaterial color="#26292E" /></mesh>
    <mesh position={[-7.4, 0, 0]}><boxGeometry args={[0.6, 0.15, 3.4]} /><meshStandardMaterial color="#26292E" /></mesh>
  </group>
);
