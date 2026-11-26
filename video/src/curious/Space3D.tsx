import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Curious Minutes ep07: our solar system. All 3D scenes are ILLUSTRATIONS (not to scale).
// Planet surfaces are procedural canvas textures (drawn synchronously, so every frame renders the same way).

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export type ShotS = { pos: THREE.Vector3; look: THREE.Vector3; fov?: number; up?: THREE.Vector3 };
const Rig: React.FC<{ sh: ShotS; bg: string }> = ({ sh, bg }) => {
  const { camera, scene } = useThree();
  camera.up.copy(sh.up ?? new THREE.Vector3(0, 1, 0));
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  const c = camera as THREE.PerspectiveCamera;
  if (sh.fov && c.fov !== sh.fov) {
    c.fov = sh.fov;
    c.updateProjectionMatrix();
  }
  scene.background = new THREE.Color(bg);
  scene.fog = null;
  return null;
};
const STARS = Array.from({ length: 2500 }, (_, i) => {
  const u = rnd(i) * 2 - 1, t = rnd(i + 9000) * Math.PI * 2, r = Math.sqrt(1 - u * u);
  return [r * Math.cos(t) * 1500, u * 1500, r * Math.sin(t) * 1500];
}).flat();
const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(STARS, 3));
    return g;
  }, []);
  return <points geometry={geo}><pointsMaterial size={1.4} color="#FFFFFF" sizeAttenuation={false} transparent opacity={0.85} /></points>;
};

/** Space stage: black sky, stars, the Sun as a directional light from `sun`. */
export const SpaceStage: React.FC<{ shot: ShotS; children?: React.ReactNode; width?: number; height?: number; sun?: [number, number, number]; ambient?: number }> = ({ shot, children, width = 1920, height = 1080, sun = [-60, 40, 120], ambient = 0.22 }) => (
  <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: shot.fov ?? 40, near: 0.05, far: 5000 }}>
    <Rig sh={shot} bg="#020207" />
    <Stars />
    <ambientLight intensity={ambient} />
    <directionalLight position={sun} intensity={3} color="#FFF6E6" />
    {children}
  </ThreeCanvas>
);

// ---------- procedural textures (equirectangular, 1024×512) ----------
const W = 1024, H = 512;
const canvas = (draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const blotches = (g: CanvasRenderingContext2D, n: number, cols: string[], seed: number, rMax = 40) => {
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[i % cols.length];
    g.globalAlpha = 0.15 + rnd(seed + i) * 0.35;
    g.beginPath();
    g.ellipse(rnd(seed + i * 3) * W, rnd(seed + i * 7) * H, 4 + rnd(seed + i * 5) * rMax, 3 + rnd(seed + i * 11) * rMax * 0.6, rnd(i) * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
};
const latY = (lat: number) => ((90 - lat) / 180) * H;
export const TEX = {
  mars: () => canvas((g) => {
    g.fillStyle = "#B5542F"; g.fillRect(0, 0, W, H);
    blotches(g, 900, ["#8A3A20", "#C9714A", "#6E2C18", "#D58B5E"], 11, 60);
    g.fillStyle = "#F2ECE6"; g.fillRect(0, 0, W, 14); g.fillRect(0, H - 12, W, 12);
  }),
  saturn: () => canvas((g) => {
    const bands = ["#E3CFA0", "#D7BE88", "#C9AA74", "#E8D6AC", "#BFA06A", "#DCC596", "#CDB07C"];
    for (let y = 0; y < H; y += 6) { g.fillStyle = bands[Math.floor((y / 6 + Math.sin(y * 0.05) * 2) % bands.length + bands.length) % bands.length]; g.fillRect(0, y, W, 6); }
    // north polar hexagon: a six-lobed band near 78°N, darker bluish cap inside
    g.fillStyle = "#7C8C94"; g.fillRect(0, 0, W, latY(80));
    g.strokeStyle = "#5E6E78"; g.lineWidth = 8; g.beginPath();
    for (let x = 0; x <= W; x += 4) { const lon = (x / W) * Math.PI * 2; const y = latY(77 + 2.2 * Math.cos(6 * lon)); x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
  }),
  iapetus: () => canvas((g) => {
    g.fillStyle = "#EDE8DF"; g.fillRect(0, 0, W, H);
    // leading hemisphere (centre of the map) dark, with a ragged edge
    for (let x = 0; x < W; x++) {
      const d = Math.abs(x - W / 2) / (W / 2);
      for (let y = 0; y < H; y += 2) {
        const lat = Math.abs(y - H / 2) / (H / 2);
        const edge = 0.5 + 0.12 * Math.sin(y * 0.09 + x * 0.02) + 0.05 * rnd(x * 7 + y);
        if (d + lat * 0.45 < edge) { g.fillStyle = rnd(x + y * 3) > 0.5 ? "#2A2119" : "#3A2D22"; g.fillRect(x, y, 1, 2); }
      }
    }
    blotches(g, 300, ["#BDB6AA", "#6B5A48"], 31, 18);
    g.strokeStyle = "#1E1812"; g.lineWidth = 5; g.beginPath(); g.moveTo(W * 0.25, H / 2); g.lineTo(W * 0.75, H / 2 + 3); g.stroke();
  }),
  venus: () => canvas((g) => {
    g.fillStyle = "#E3C78E"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { g.strokeStyle = i % 2 ? "#F1DDAE" : "#C9A86A"; g.globalAlpha = 0.35; g.lineWidth = 6 + rnd(i) * 14; g.beginPath(); const y0 = rnd(i + 3) * H; g.moveTo(0, y0); for (let x = 0; x <= W; x += 32) g.lineTo(x, y0 + Math.sin(x * 0.012 + i) * 18 - (x / W) * 40 * (y0 / H - 0.5)); g.stroke(); }
    g.globalAlpha = 1;
  }),
  earth: () => canvas((g) => {
    g.fillStyle = "#1E5B9C"; g.fillRect(0, 0, W, H);
    blotches(g, 160, ["#3E7B3A", "#6C8F45", "#B49B66"], 51, 70);
    g.fillStyle = "#FFFFFF"; g.globalAlpha = 0.5; blotches(g, 120, ["#FFFFFF"], 77, 50); g.globalAlpha = 1;
  }),
  rock: () => canvas((g) => {
    g.fillStyle = "#7A4E3A"; g.fillRect(0, 0, W, H);
    blotches(g, 500, ["#5A3628", "#9B6A52", "#4A2C20"], 91, 50);
  }),
};
const useTex = (k: keyof typeof TEX) => useMemo(() => TEX[k](), [k]);

/** A textured planet/moon. `spin` = rotation about its axis (radians). */
export const Planet: React.FC<{ tex: keyof typeof TEX; r: number; pos?: [number, number, number]; spin?: number; tilt?: number; rough?: number }> = ({ tex, r, pos = [0, 0, 0], spin = 0, tilt = 0, rough = 0.95 }) => {
  const t = useTex(tex);
  return (
    <group position={pos} rotation={[tilt, 0, 0]}>
      <mesh rotation={[0, spin, 0]}><sphereGeometry args={[r, 96, 64]} /><meshStandardMaterial map={t} roughness={rough} /></mesh>
    </group>
  );
};
export const Saturn: React.FC<{ spin?: number; pos?: [number, number, number]; r?: number; tilt?: number }> = ({ spin = 0, pos = [0, 0, 0], r = 20, tilt = 0.45 }) => {
  const ringTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 4;
    const g = c.getContext("2d")!;
    for (let x = 0; x < 512; x++) { const k = x / 512; const gap = (k > 0.62 && k < 0.66) ? 0.1 : 1; g.fillStyle = `rgba(${200 + 30 * Math.sin(x * 0.2)},${180 + 25 * Math.sin(x * 0.13)},${140},${(0.35 + 0.5 * rnd(x)) * gap})`; g.fillRect(x, 0, 1, 4); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const ringGeo = useMemo(() => {
    const g = new THREE.RingGeometry(r * 1.25, r * 2.3, 160, 1);
    const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, (d - r * 1.25) / (r * 1.05), 0.5); }
    return g;
  }, [r]);
  return (
    <group position={pos} rotation={[tilt, 0, 0.1]}>
      <Planet tex="saturn" r={r} spin={spin} rough={0.8} />
      <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]}><meshStandardMaterial map={ringTex} transparent side={THREE.DoubleSide} roughness={0.9} /></mesh>
    </group>
  );
};
/** ʻOumuamua as an elongated tumbling rock (shape uncertain), with a faint hydrogen push shown as particles. */
export const Oumuamua: React.FC<{ t: number; pos?: [number, number, number]; gas?: number }> = ({ t, pos = [0, 0, 0], gas = 0 }) => {
  const tex = useTex("rock");
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 3);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const k = 0.85 + rnd(Math.round(p.getX(i) * 50) * 7 + Math.round(p.getY(i) * 50) * 3 + Math.round(p.getZ(i) * 50)) * 0.25; p.setXYZ(i, p.getX(i) * k * 5, p.getY(i) * k, p.getZ(i) * k * 0.9); }
    g.computeVertexNormals(); return g;
  }, []);
  return (
    <group position={pos}>
      <mesh geometry={geo} rotation={[t * 0.9, t * 0.35, t * 0.6]}><meshStandardMaterial map={tex} roughness={1} flatShading /></mesh>
      {gas > 0 && Array.from({ length: 40 }, (_, i) => {
        const ph = (t * 0.6 + i / 40) % 1;
        return <mesh key={i} position={[-2 - ph * 14, Math.sin(i * 2.3) * ph * 3, Math.cos(i * 1.7) * ph * 3]}><sphereGeometry args={[0.18, 6, 4]} /><meshBasicMaterial color="#9FD8FF" transparent opacity={(1 - ph) * 0.5 * gas} /></mesh>;
      })}
    </group>
  );
};
/** A simple Viking-style orbiter (body, dish, solar panels). */
export const Orbiter: React.FC<{ pos: [number, number, number]; rot?: number }> = ({ pos, rot = 0 }) => (
  <group position={pos} rotation={[0.2, rot, 0]}>
    <mesh><cylinderGeometry args={[0.6, 0.6, 0.5, 8]} /><meshStandardMaterial color="#C9A24B" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, 0.6, 0]} rotation={[0.3, 0, 0]}><coneGeometry args={[0.7, 0.3, 24, 1, true]} /><meshStandardMaterial color="#E8E8E8" side={THREE.DoubleSide} /></mesh>
    {[0, 1, 2, 3].map((k) => <mesh key={k} position={[Math.cos(k * Math.PI / 2) * 1.6, 0, Math.sin(k * Math.PI / 2) * 1.6]} rotation={[0, -k * Math.PI / 2, 0]}><boxGeometry args={[1.8, 0.05, 0.7]} /><meshStandardMaterial color="#1E2A55" metalness={0.5} roughness={0.35} /></mesh>)}
  </group>
);

// ---------- Mars surface (for the methane story) ----------
export const marsY = (x: number, z: number) => Math.sin(x * 0.05) * 2 + Math.cos(z * 0.04 + 1) * 2 + Math.sin((x + z) * 0.13) * 0.5;
export const MarsGround: React.FC<{ night?: number }> = ({ night = 0 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(600, 600, 140, 140); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute; const col: number[] = [];
    for (let i = 0; i < p.count; i++) { p.setY(i, marsY(p.getX(i), p.getZ(i)) + (rnd(i) - 0.5) * 0.3); const k = 0.8 + rnd(i + 5) * 0.3; col.push(0.72 * k, 0.36 * k, 0.2 * k); }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  }, []);
  const rocks = useMemo(() => Array.from({ length: 90 }, (_, i) => [(rnd(i + 1) - 0.5) * 200, (rnd(i + 2) - 0.5) * 200, 0.3 + rnd(i + 3) * 1.4]), []);
  return (
    <>
      <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={1} /></mesh>
      {rocks.map(([x, z, r], i) => <mesh key={i} position={[x, marsY(x, z) + r * 0.3, z]} scale={[r, r * 0.6, r]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#6B3A25" roughness={1} flatShading /></mesh>)}
      <mesh position={[0, 0, -250]}><boxGeometry args={[600, 40, 10]} /><meshStandardMaterial color={night > 0.5 ? "#2A1810" : "#9A5A3A"} roughness={1} /></mesh>
    </>
  );
};
/** Mars surface stage: butterscotch sky by day, dark by night (`night` 0..1). */
export const MarsStage: React.FC<{ shot: ShotS; night?: number; children?: React.ReactNode; width?: number; height?: number }> = ({ shot, night = 0, children, width = 1920, height = 1080 }) => {
  const sky = new THREE.Color("#D9A77A").lerp(new THREE.Color("#0B0A12"), night);
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: shot.fov ?? 45, near: 0.1, far: 3000 }}>
      <Rig sh={shot} bg={"#" + sky.getHexString()} />
      {night > 0.5 && <Stars />}
      <ambientLight intensity={0.25 + 0.35 * (1 - night)} color={night > 0.5 ? "#8090C0" : "#FFE2C8"} />
      <directionalLight position={[-80, 60 * (1 - night) + 5, 40]} intensity={2.6 * (1 - night) + 0.2} color="#FFE8D0" />
      <MarsGround night={night} />
      {children}
    </ThreeCanvas>
  );
};
/** Methane as faint particles: hugging the ground at night (`spread` 0), mixed high and thin by day (`spread` 1). */
export const Methane: React.FC<{ t: number; spread: number }> = ({ t, spread }) => (
  <>
    {Array.from({ length: 160 }, (_, i) => {
      const x = (rnd(i) - 0.5) * 80, z = (rnd(i + 400) - 0.5) * 80;
      const h = 0.5 + rnd(i + 800) * (1.5 + spread * 60) + Math.sin(t * 0.8 + i) * 0.3;
      return <mesh key={i} position={[x + Math.sin(t * 0.3 + i) * spread * 6, marsY(x, z) + h, z]}><sphereGeometry args={[0.35, 6, 4]} /><meshBasicMaterial color="#9AF0C8" transparent opacity={0.55 * (1 - spread * 0.75)} /></mesh>;
    })}
  </>
);
