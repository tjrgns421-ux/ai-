import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";

// Curious Minutes ep04: the Moon. Globe uses NASA's CGI Moon Kit (LRO color map + LOLA elevation).
// Surface, rover, rocks, impact and Earth's magnetotail are ILLUSTRATIONS.

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Textures: the image is loaded in the DOM first (Remotion waits via delayRender), then wrapped in a THREE.Texture.
const cache: Record<string, THREE.Texture> = {};
export const useMoonTextures = () => {
  const [ready, setReady] = React.useState(() => Boolean(cache.color && cache.dem));
  const [handle] = React.useState(() => (cache.color && cache.dem ? null : delayRender("moon textures")));
  React.useEffect(() => {
    if (ready) return;
    const load = (path: string, srgb: boolean) =>
      new Promise<THREE.Texture>((res, rej) => {
        const img = new Image();
        img.onload = () => {
          const t = new THREE.Texture(img);
          if (srgb) t.colorSpace = THREE.SRGBColorSpace;
          t.needsUpdate = true;
          res(t);
        };
        img.onerror = () => rej(new Error("failed to load " + path));
        img.src = staticFile(path);
      });
    Promise.all([load("cm04/img/moon_color_4k.jpg", true), load("cm04/img/moon_dem.jpg", false)])
      .then(([c, d]) => {
        cache.color = c;
        cache.dem = d;
        setReady(true);
        if (handle !== null) continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        if (handle !== null) continueRender(handle);
      });
  }, [ready, handle]);
  return ready ? { color: cache.color, dem: cache.dem } : null;
};
const TexCtx = React.createContext<{ color: THREE.Texture; dem: THREE.Texture } | null>(null);

export type Shot4 = { pos: THREE.Vector3; look: THREE.Vector3; fov?: number; up?: THREE.Vector3 };
const Rig: React.FC<{ sh: Shot4 }> = ({ sh }) => {
  const { camera, scene } = useThree();
  camera.up.copy(sh.up ?? new THREE.Vector3(0, 1, 0));
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  const c = camera as THREE.PerspectiveCamera;
  if (sh.fov && c.fov !== sh.fov) {
    c.fov = sh.fov;
    c.updateProjectionMatrix();
  }
  scene.background = new THREE.Color("#020205");
  return null;
};

const STARS = Array.from({ length: 1500 }, (_, i) => {
  const u = rnd(i) * 2 - 1, t = rnd(i + 7000) * Math.PI * 2, r = Math.sqrt(1 - u * u);
  return [r * Math.cos(t) * 600, u * 600, r * Math.sin(t) * 600];
}).flat();
const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(STARS, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={1.3} color="#FFFFFF" sizeAttenuation={false} transparent opacity={0.8} />
    </points>
  );
};

/** The real Moon: NASA LRO color map with LOLA elevation. `rotY` turns the near side (0) to the far side (PI). */
export const MoonGlobe: React.FC<{ rotY?: number; pos?: [number, number, number]; radius?: number }> = ({ rotY = 0, pos = [0, 0, 0], radius = 10 }) => {
  const tex = React.useContext(TexCtx);
  if (!tex) return null;
  return (
    <mesh position={pos} rotation={[0, rotY - Math.PI / 2, 0]}>
      <sphereGeometry args={[radius, 160, 120]} />
      <meshStandardMaterial map={tex.color} displacementMap={tex.dem} displacementScale={radius * 0.01} bumpMap={tex.dem} bumpScale={2} roughness={1} />
    </mesh>
  );
};

// ---------- lunar surface ----------
const CRATERS = Array.from({ length: 60 }, (_, i) => ({ x: (rnd(i) - 0.5) * 220, z: (rnd(i + 50) - 0.5) * 220, r: 2 + Math.pow(rnd(i + 99), 3) * 22 }));
const heightAt = (x: number, z: number) => {
  let h = Math.sin(x * 0.05) * 0.6 + Math.cos(z * 0.04) * 0.5 + Math.sin((x + z) * 0.13) * 0.15;
  for (const c of CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z) / c.r;
    if (d < 1) h -= (1 - d * d) * c.r * 0.22;
    else if (d < 1.35) h += Math.sin(((d - 1) / 0.35) * Math.PI) * c.r * 0.07;
  }
  return h;
};
export const Surface: React.FC<{ glass?: boolean }> = ({ glass = false }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(240, 240, 220, 220);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)) + (rnd(i) - 0.5) * 0.08);
    g.computeVertexNormals();
    return g;
  }, []);
  const rocks = useMemo(() => Array.from({ length: 140 }, (_, i) => {
    const x = (rnd(i + 300) - 0.5) * 120, z = (rnd(i + 400) - 0.5) * 120, s = 0.15 + Math.pow(rnd(i + 500), 4) * 1.2;
    return { x, z, s, y: heightAt(x, z) + s * 0.3, r: rnd(i + 600) * 6 };
  }), []);
  return (
    <>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial color="#8E8A84" roughness={1} />
      </mesh>
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.y, r.z]} rotation={[r.r, r.r * 2, 0]} scale={[r.s * 1.3, r.s * 0.8, r.s]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#77736D" roughness={1} flatShading />
        </mesh>
      ))}
      {glass && (
        <mesh position={[0, heightAt(0, 0) + 0.12, 0]} rotation={[-Math.PI / 2, 0, 0.4]} scale={[2.6, 0.8, 1]}>
          <circleGeometry args={[1, 40]} />
          <meshStandardMaterial color="#2F4A36" metalness={0.9} roughness={0.12} emissive="#16261B" />
        </mesh>
      )}
    </>
  );
};
export const groundY = heightAt;

// the "hut": from far away a cube-like silhouette; up close a small rounded rock with two little rocks ("carrots")
export const HutRock: React.FC<{ x: number; z: number; close?: boolean }> = ({ x, z, close = false }) => {
  const y = heightAt(x, z);
  return close ? (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.35, 0]} scale={[0.75, 0.5, 0.55]} castShadow><sphereGeometry args={[1, 18, 14]} /><meshStandardMaterial color="#7D7973" roughness={1} flatShading /></mesh>
      <mesh position={[0.55, 0.5, 0.15]} scale={[0.32, 0.3, 0.3]} castShadow><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color="#7D7973" roughness={1} flatShading /></mesh>
      {[-0.15, 0.15].map((dz) => <mesh key={dz} position={[0.95, 0.12, dz]} rotation={[0, 0, 1.2]} scale={[0.08, 0.28, 0.08]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#6E6A64" /></mesh>)}
    </group>
  ) : (
    <mesh position={[x, y + 1.2, z]} castShadow>
      <boxGeometry args={[2.2, 2.2, 2.2]} />
      <meshStandardMaterial color="#77736D" roughness={1} />
    </mesh>
  );
};

// a Yutu-style rover (illustration): gold-wrapped body, two solar wings, six wheels, camera mast
export const Rover: React.FC<{ x: number; z: number; heading?: number; t?: number }> = ({ x, z, heading = 0, t = 0 }) => {
  const y = heightAt(x, z) + 0.55;
  return (
    <group position={[x, y, z]} rotation={[0, heading, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.5, 0.6, 1.0]} /><meshStandardMaterial color="#C9A24B" metalness={0.8} roughness={0.3} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.8, s * 1.0]} rotation={[s * 0.25, 0, 0]} castShadow><boxGeometry args={[1.4, 0.04, 0.9]} /><meshStandardMaterial color="#1E2A55" metalness={0.5} roughness={0.35} /></mesh>
      ))}
      <mesh position={[0.55, 1.1, 0]}><cylinderGeometry args={[0.04, 0.04, 0.8, 8]} /><meshStandardMaterial color="#DDDDDD" /></mesh>
      <mesh position={[0.6, 1.5, 0]}><boxGeometry args={[0.18, 0.2, 0.45]} /><meshStandardMaterial color="#EEEEEE" /></mesh>
      {[-0.55, 0, 0.55].flatMap((wx) => [-0.6, 0.6].map((wz) => (
        <mesh key={`${wx}${wz}`} position={[wx, 0, wz]} rotation={[Math.PI / 2, t * 2, 0]} castShadow><cylinderGeometry args={[0.2, 0.2, 0.15, 14]} /><meshStandardMaterial color="#3A3A3A" /></mesh>
      )))}
    </group>
  );
};

/** Earth with its magnetotail trailing away from the Sun, and oxygen riding it to the Moon (ILLUSTRATION, not to scale). */
export const Magnetotail: React.FC<{ t: number; moonAngle?: number }> = ({ t, moonAngle = 0 }) => {
  const parts = useMemo(() => Array.from({ length: 260 }, (_, i) => ({ o: rnd(i), r: rnd(i + 5) * 2.2, a: rnd(i + 9) * Math.PI * 2 })), []);
  const moon = new THREE.Vector3(26 * Math.cos(moonAngle), 0, 26 * Math.sin(moonAngle));
  return (
    <>
      <mesh><sphereGeometry args={[3, 64, 48]} /><meshStandardMaterial color="#2E6FD8" emissive="#0B2A66" roughness={0.6} /></mesh>
      <mesh scale={1.04}><sphereGeometry args={[3, 48, 32]} /><meshBasicMaterial color="#8CC8FF" transparent opacity={0.18} /></mesh>
      {/* the tail: a widening translucent cone pointing away from the Sun (Sun is at -x) */}
      <mesh position={[22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[7, 40, 48, 1, true]} />
        <meshBasicMaterial color="#7FB8FF" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {parts.map((p, i) => {
        const k = (p.o + t * 0.08) % 1;
        const base = new THREE.Vector3(3 + k * 30, Math.sin(p.a) * p.r * (0.4 + k), Math.cos(p.a) * p.r * (0.4 + k));
        const pos = base.lerp(moon, Math.max(0, k - 0.6) * 1.6);
        return <mesh key={i} position={pos}><sphereGeometry args={[0.08, 6, 6]} /><meshBasicMaterial color="#FF6B5E" /></mesh>;
      })}
      <MoonGlobe radius={1.6} pos={[moon.x, moon.y, moon.z]} />
    </>
  );
};

/** Stage for all ep04 3D scenes. `sun` = direction the light comes from. */
export const Stage4: React.FC<{ shot: Shot4; children: React.ReactNode; sun?: [number, number, number]; width?: number; height?: number }> = ({ shot, children, sun = [-40, 30, 20], width = 1920, height = 1080 }) => {
  const tex = useMoonTextures();
  return (
  <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: shot.fov ?? 40, near: 0.05, far: 2000 }}>
    <Rig sh={shot} />
    <Stars />
    <ambientLight intensity={0.08} />
    <directionalLight position={sun} intensity={3.2} color="#FFF6E8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-60} shadow-camera-right={60} shadow-camera-top={60} shadow-camera-bottom={-60} />
    <TexCtx.Provider value={tex}>{children}</TexCtx.Provider>
  </ThreeCanvas>
  );
};
