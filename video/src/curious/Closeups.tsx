import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { CarMesh, PALETTE } from "./Ring3D";
import { Scenery } from "./Highway3D";

// Close-up recreations on the highway set. These are ILLUSTRATIONS of the mechanism, not data.

const Sky: React.FC = () => {
  const { scene } = useThree();
  scene.background = new THREE.Color("#9ED8FF");
  scene.fog = new THREE.Fog("#BFE6FF", 160, 520);
  return null;
};
const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#ffffff", "#6E9C50", 1.1]} />
    <directionalLight position={[80, 120, 60]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-120} shadow-camera-right={120} shadow-camera-top={80} shadow-camera-bottom={-80} />
  </>
);
const Cam: React.FC<{ p: [number, number, number]; l: [number, number, number] }> = ({ p, l }) => {
  const { camera } = useThree();
  camera.position.set(...p);
  camera.lookAt(...l);
  return null;
};

// ---------- 1) brake amplification: 5 cars, each brakes a little harder and a little later ----------
const CARS = 5, GAP = 9, V0 = 12;
const brakeOf = (i: number) => 0.8 + i * 0.55; // m/s^2, grows down the line
const delayOf = (i: number) => i * 0.7; // s
const amp = (() => {
  // integrate each car: brakes for 1.6 s starting at its delay, then recovers to V0
  const dt = 1 / 30, T = 10;
  const xs: number[][] = [], vs: number[][] = [], br: boolean[][] = [];
  for (let i = 0; i < CARS; i++) {
    let x = -i * GAP, v = V0;
    const X: number[] = [], Vv: number[] = [], B: boolean[] = [];
    for (let k = 0; k < T / dt; k++) {
      const t = k * dt - 1;
      const on = t >= delayOf(i) && t < delayOf(i) + 1.6;
      const a = on ? -brakeOf(i) : v < V0 ? 0.9 : 0;
      v = Math.min(V0, Math.max(0, v + a * dt));
      x += v * dt;
      X.push(x); Vv.push(v); B.push(on);
    }
    xs.push(X); vs.push(Vv); br.push(B);
  }
  return { xs, vs, br };
})();
export const AMPLIFY_FRAMES = amp.xs[0].length;

export const AmplifyScene: React.FC = () => {
  useFonts();
  const fr = Math.min(useCurrentFrame(), AMPLIFY_FRAMES - 1);
  const cx = (amp.xs[0][fr] + amp.xs[CARS - 1][fr]) / 2;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: true }} camera={{ fov: 38, near: 0.5, far: 900 }}>
        <Sky />
        <Lights />
        <Cam p={[cx - 200, 9, 44]} l={[cx - 200, 2, 1.85]} />
        <Scenery clearNear />
        {Array.from({ length: CARS }, (_, i) => {
          const on = amp.br[i][fr];
          const h = on ? brakeOf(i) * 1.6 : 0.01;
          return (
            <group key={i}>
              <CarMesh p={[amp.xs[i][fr] - 200, 0, 1.85]} rotY={0} braking={on} color={PALETTE[(i * 2) % PALETTE.length]} />
              {on && (
                <mesh position={[amp.xs[i][fr] - 200, 2.6 + h / 2, 1.85]}>
                  <boxGeometry args={[1.4, h, 0.4]} />
                  <meshStandardMaterial color="#FF3B30" emissive="#FF3B30" emissiveIntensity={0.5} />
                </mesh>
              )}
            </group>
          );
        })}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: "#14151B", background: "#FFFFFF", padding: "6px 16px", borderRadius: 10, border: "4px solid #14151B" }}>ILLUSTRATION</div>
      <div style={{ position: "absolute", left: 60, top: 110, fontFamily: "Pretendard", fontWeight: 800, fontSize: 30, color: "#14151B" }}>
        <span style={{ display: "inline-block", width: 22, height: 22, background: "#FF3B30", borderRadius: 5, marginRight: 10, verticalAlign: -3 }} />
        how hard each driver brakes
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2) reaction time: 0.7 s at 100 km/h = about 19 m ----------
const SPEED = 100 / 3.6; // m/s
const SLOWMO = 6; // the 0.7 s plays over 4.2 s
export const REACTION_FRAMES = 30 * 9;

export const ReactionScene: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  const s = fr / 30;
  // real-time seconds inside the scene: normal speed for 2 s, slow-motion during the reaction, then hold
  const tSee = 2;
  const real = s < tSee ? s : Math.min(tSee + 0.7, tSee + (s - tSee) / SLOWMO);
  const react = Math.max(0, Math.min(0.7, real - tSee));
  const x = real * SPEED * 0.25; // camera dolly (scaled so the scenery is readable)
  const traveled = react * SPEED; // meters during the reaction
  const lead = 14 + x;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: true }} camera={{ fov: 46, near: 0.3, far: 900 }}>
        <Sky />
        <Lights />
        <Cam p={[x - 200 - 7, 2.6, 1.85]} l={[x - 200 + 20, 1.3, 1.85]} />
        <Scenery />
        <CarMesh p={[lead - 200, 0, 1.85]} rotY={0} braking={real >= tSee} color="#FF6B5E" />
        {/* the distance covered during the reaction, painted on the road */}
        {react > 0 && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x - 200 - 1 + (traveled * 0.25) / 2, 0.02, 1.85]}>
            <planeGeometry args={[Math.max(0.01, traveled * 0.25), 3]} />
            <meshStandardMaterial color="#FFD23F" emissive="#FFD23F" emissiveIntensity={0.4} transparent opacity={0.85} />
          </mesh>
        )}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: "#14151B", background: "#FFFFFF", padding: "6px 16px", borderRadius: 10, border: "4px solid #14151B" }}>ILLUSTRATION · 100 km/h</div>
      <div style={{ position: "absolute", right: 80, top: 70, textAlign: "right", fontFamily: "Pretendard", fontWeight: 900, color: "#14151B" }}>
        <div style={{ fontSize: 40, opacity: 0.7 }}>reaction</div>
        <div style={{ fontSize: 150, lineHeight: 1, color: react >= 0.7 ? "#FF3B30" : "#14151B", textShadow: "0 4px 0 #fff" }}>{react.toFixed(2)} s</div>
        <div style={{ fontSize: 64, marginTop: 10, opacity: interpolate(react, [0, 0.05], [0, 1], { extrapolateRight: "clamp" }) }}>
          <span style={{ background: "#FFD23F", padding: "4px 16px", borderRadius: 10, border: "4px solid #14151B" }}>{Math.round(traveled)} m</span>
        </div>
      </div>
      <div style={{ position: "absolute", right: 80, bottom: 50, fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: "#14151B", opacity: 0.75 }}>0.7 s: perceptual-motor reaction time for emergency actions (FHWA, citing Green 2000)</div>
    </AbsoluteFill>
  );
};
