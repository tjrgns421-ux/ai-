import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { simulate } from "./RingSim";
import { CarMesh, PALETTE } from "./Ring3D";

// A straight 3-lane highway. Each lane is its own long Optimal Velocity loop (1 km, 90 cars),
// drawn as a straight road; waves form on their own and drift backward. SIMULATION.
const LEN = 1000, PER = 90, LANES = [-3.7, 0, 3.7], HZ = 15; // 15 Hz sim samples = 2x speed at 30 fps
const SIMS = LANES.map((_, k) => simulate(240, HZ, null, { L: LEN, N: PER, kickAt: 4 + k * 7, kickCar: (k * 31) % PER }));
const SIMS_AI = LANES.map((_, k) => simulate(240, HZ, 60, { L: LEN, N: PER, kickAt: 4 + k * 7, kickCar: (k * 31) % PER, calm: (k * 23 + 11) % PER }));
const AI_CAR = LANES.map((_, k) => (k * 23 + 11) % PER);

const rnd = (i: number) => {
  const s = Math.sin(i * 91.7 + 17.3) * 24634.6345;
  return s - Math.floor(s);
};

export const Scenery: React.FC = () => {
  const trees = useMemo(() => Array.from({ length: 220 }, (_, i) => ({ x: -520 + rnd(i) * 1040, z: (i % 2 ? 1 : -1) * (16 + rnd(i + 5) * 70), s: 0.9 + rnd(i + 9) * 1.1, c: ["#3FAE5A", "#4CC26A", "#2F9A4E"][i % 3] })), []);
  const dashes = useMemo(() => Array.from({ length: 84 }, (_, i) => -500 + i * 12), []);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[2400, 1200]} />
        <meshStandardMaterial color="#8FD16B" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1100, 13]} />
        <meshStandardMaterial color="#454B58" roughness={0.9} />
      </mesh>
      {[-6.2, 6.2].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[1100, 0.25]} />
          <meshStandardMaterial color="#F5F5F2" />
        </mesh>
      ))}
      {[-1.85, 1.85].map((z) =>
        dashes.map((x) => (
          <mesh key={`${z}${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
            <planeGeometry args={[4, 0.2]} />
            <meshStandardMaterial color="#F5F5F2" />
          </mesh>
        )),
      )}
      {[-7.4, 7.4].map((z) => (
        <mesh key={`g${z}`} position={[0, 0.55, z]} castShadow>
          <boxGeometry args={[1100, 0.35, 0.25]} />
          <meshStandardMaterial color="#C9CED8" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.25, 0.35, 2.2, 6]} />
            <meshStandardMaterial color="#8A5A2B" />
          </mesh>
          <mesh position={[0, 3.3, 0]} castShadow>
            <coneGeometry args={[1.7, 3.6, 8]} />
            <meshStandardMaterial color={t.c} roughness={0.8} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`m${i}`} position={[-500 + i * 130, 0, -260 - rnd(i + 40) * 60]}>
          <coneGeometry args={[90 + rnd(i) * 40, 70 + rnd(i + 2) * 40, 6]} />
          <meshStandardMaterial color="#A9C9B0" roughness={1} />
        </mesh>
      ))}
    </>
  );
};

export type HighwayCam = "dolly" | "high" | "chase";

const Rig: React.FC<{ cam: HighwayCam; t: number; chaseX: number }> = ({ cam, t, chaseX }) => {
  const { camera, scene } = useThree();
  if (cam === "dolly") {
    camera.position.set(-140 + t * 6, 20, 34);
    camera.lookAt(-80 + t * 6, 0, 0);
  } else if (cam === "high") {
    camera.position.set(-60 + t * 2, 95, 95);
    camera.lookAt(20 + t * 2, 0, 0);
  } else {
    camera.position.set(chaseX - 11, 4.2, 1.5);
    camera.lookAt(chaseX + 20, 1.2, 0);
  }
  scene.background = new THREE.Color("#9ED8FF");
  scene.fog = new THREE.Fog("#BFE6FF", 160, 520);
  return null;
};

/** Highway scene. `from` = sim seconds to start at; `ai` shows the white AI cars (calm from sim 60 s). */
export const HighwayScene: React.FC<{ from?: number; cam?: HighwayCam; ai?: boolean }> = ({ from = 40, cam = "dolly", ai = false }) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const idx = Math.min(Math.round(from * HZ) + fr, SIMS[0].length - 1);
  const sims = ai ? SIMS_AI : SIMS;
  const chase = sims[1][idx].x[(AI_CAR[1] + 4) % PER] - LEN / 2;
  const camX = cam === "chase" ? chase : cam === "dolly" ? -80 + t * 6 : 20 + t * 2;
  return (
    <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.5, far: 900 }}>
      <Rig cam={cam} t={t} chaseX={chase} />
      <hemisphereLight args={["#ffffff", "#6E9C50", 1.1]} />
      <directionalLight position={[80, 120, 60]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-200} shadow-camera-right={200} shadow-camera-top={120} shadow-camera-bottom={-120} />
      <Scenery />
      {LANES.map((z, k) => {
        const f = sims[k][idx];
        return f.x.map((x, i) => {
          const wx = x - LEN / 2;
          if (Math.abs(wx - camX) > 330) return null;
          return <CarMesh key={`${k}-${i}`} p={[wx, 0, z]} rotY={0} braking={f.a[i] < -0.6} color={PALETTE[(i + k * 3) % PALETTE.length]} calm={ai && i === AI_CAR[k]} />;
        });
      })}
    </ThreeCanvas>
  );
};
