import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useFonts } from "../StyleFrames";

// Original channel mascot concepts (not based on any existing character).
// Shared cuteness rules: big glossy eyes set low, blush, stubby limbs, head tilt.

export type Concept = "cursor" | "memo" | "bubble";
export type Mood = "happy" | "shock";

const LIME = "#CFEF2E";
const INK = "#15161A";

const Toy: React.FC<{ color: string; rough?: number; children: React.ReactNode } & React.ComponentProps<"mesh">> = ({ color, rough = 0.35, children, ...p }) => (
  <mesh castShadow receiveShadow {...p}>
    {children}
    <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.8} clearcoatRoughness={0.25} />
  </mesh>
);

const Eye: React.FC<{ pos: [number, number, number]; size?: number; mood: Mood }> = ({ pos, size = 0.12, mood }) => (
  <group position={pos}>
    <mesh scale={mood === "shock" ? [size * 1.15, size * 1.15, size * 0.55] : [size, size * 1.32, size * 0.55]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial color="#0B0B0D" roughness={0.12} clearcoat={1} />
    </mesh>
    <mesh position={[size * 0.32, size * 0.42, size * 0.45]}>
      <sphereGeometry args={[size * 0.3, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh position={[-size * 0.25, -size * 0.35, size * 0.48]}>
      <sphereGeometry args={[size * 0.13, 12, 12]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  </group>
);

const Face: React.FC<{ y: number; z: (x: number, y: number) => number; spread?: number; mood: Mood; eye?: number }> = ({ y, z, spread = 0.22, mood, eye }) => (
  <group>
    <Eye pos={[-spread, y, z(-spread, y)]} mood={mood} size={eye} />
    <Eye pos={[spread, y, z(spread, y)]} mood={mood} size={eye} />
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * (spread + 0.17), y - 0.16, z(s * (spread + 0.17), y - 0.16) - 0.01]} scale={[0.085, 0.055, 0.03]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#FF8FA3" roughness={0.6} emissive="#FF6F8A" emissiveIntensity={0.15} />
      </mesh>
    ))}
    {mood === "happy" ? (
      <mesh position={[0, y - 0.13, z(0, y - 0.13) + 0.005]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.055, 0.016, 12, 32, Math.PI]} />
        <meshStandardMaterial color="#3A1F24" />
      </mesh>
    ) : (
      <mesh position={[0, y - 0.17, z(0, y - 0.17)]} scale={[0.045, 0.06, 0.02]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#3A1F24" />
      </mesh>
    )}
  </group>
);

const Limbs: React.FC<{ armY: number; armX: number; footX: number; footY: number; color: string; wave?: number }> = ({ armY, armX, footX, footY, color, wave = 0 }) => (
  <group>
    <Toy color={color} position={[-armX, armY, 0.05]} rotation={[0, 0, -1.1]}>
      <capsuleGeometry args={[0.085, 0.16, 8, 16]} />
    </Toy>
    <Toy color={color} position={[armX + 0.03, armY + 0.08 + wave * 0.1, 0.05]} rotation={[0, 0, 1.1 - wave]}>
      <capsuleGeometry args={[0.085, 0.16, 8, 16]} />
    </Toy>
    {[-1, 1].map((s) => (
      <Toy key={s} color={INK} rough={0.5} position={[s * footX, footY, 0.12]} scale={[1, 0.62, 1.25]}>
        <sphereGeometry args={[0.15, 24, 24]} />
      </Toy>
    ))}
  </group>
);

// A · Cursor: lime capsule, like a blinking text cursor that came alive.
const CursorBuddy: React.FC<{ mood: Mood }> = ({ mood }) => {
  const r = 0.62;
  return (
    <group>
      <Toy color={LIME} position={[0, 0.45, 0]}>
        <capsuleGeometry args={[r, 0.9, 16, 48]} />
      </Toy>
      <Face y={0.62} z={(x) => Math.sqrt(Math.max(0, r * r - x * x)) - 0.015} mood={mood} />
      <Limbs armY={0.3} armX={0.68} footX={0.26} footY={-0.62} color={LIME} wave={0.9} />
    </group>
  );
};

// B · Memo cube: soft paper cube, folded corner, lime sticky tab, tucked pencil.
const MemoBuddy: React.FC<{ mood: Mood }> = ({ mood }) => {
  const body = useMemo(() => new RoundedBoxGeometry(1.45, 1.3, 1.05, 8, 0.24), []);
  const tab = useMemo(() => new RoundedBoxGeometry(0.42, 0.34, 0.06, 4, 0.03), []);
  return (
    <group>
      <mesh geometry={body} position={[0, 0.25, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#F6F1E6" roughness={0.55} clearcoat={0.4} />
      </mesh>
      {/* ruled lines on the side */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.726, 0.05 + i * 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.7, 0.02]} />
          <meshBasicMaterial color="#9DB7D8" />
        </mesh>
      ))}
      <mesh geometry={tab} position={[-0.42, 0.98, 0.15]} rotation={[0.1, 0, -0.15]} castShadow>
        <meshPhysicalMaterial color={LIME} roughness={0.4} clearcoat={0.6} />
      </mesh>
      {/* pencil */}
      <group position={[0.62, 0.9, -0.2]} rotation={[0.2, 0, -0.55]}>
        <Toy color="#FFC93C" position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 6]} />
        </Toy>
        <Toy color="#FF9AA8" position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
        </Toy>
        <Toy color="#E8C9A0" position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.07, 0.15, 6]} />
        </Toy>
      </group>
      <Face y={0.32} z={() => 0.53} spread={0.25} mood={mood} eye={0.13} />
      <Limbs armY={0.15} armX={0.82} footX={0.36} footY={-0.5} color="#F6F1E6" wave={0.7} />
    </group>
  );
};

// C · Bubble: round chat bubble, the tail becomes a little foot.
const BubbleBuddy: React.FC<{ mood: Mood }> = ({ mood }) => {
  const s: [number, number, number] = [0.92, 0.78, 0.74];
  const z = (x: number, y: number) => {
    const yy = y - 0.35;
    const v = 1 - (x / s[0]) ** 2 - (yy / s[1]) ** 2;
    return s[2] * Math.sqrt(Math.max(0, v)) - 0.01;
  };
  return (
    <group>
      <Toy color="#FAFAF7" position={[0, 0.35, 0]} scale={s} rough={0.3}>
        <sphereGeometry args={[1, 64, 64]} />
      </Toy>
      <Toy color="#FAFAF7" position={[-0.5, -0.32, 0.1]} rotation={[0, 0, 0.6]} rough={0.3}>
        <coneGeometry args={[0.2, 0.42, 32]} />
      </Toy>
      {/* typing dots antenna */}
      {[-1, 0, 1].map((i) => (
        <Toy key={i} color={LIME} position={[i * 0.17, 1.2 + (i === 0 ? 0.06 : 0), 0]}>
          <sphereGeometry args={[0.075, 24, 24]} />
        </Toy>
      ))}
      <Face y={0.4} z={z} spread={0.24} mood={mood} />
      <Limbs armY={0.2} armX={0.9} footX={0.3} footY={-0.42} color="#FAFAF7" wave={0.8} />
    </group>
  );
};

const NAME: Record<Concept, [string, string]> = {
  cursor: ["A · 커서", "깜빡이는 글자 커서가 살아난 친구"],
  memo: ["B · 메모 큐브", "연필 꽂은 종이 큐브"],
  bubble: ["C · 말풍선", "꼬리가 발이 된 채팅 말풍선"],
};

export const MascotSheet: React.FC<{ concept: Concept; mood: Mood }> = ({ concept, mood }) => {
  useFonts();
  const { width, height } = useVideoConfig();
  const f = useCurrentFrame();
  const bob = Math.sin(f / 10) * 0.04;
  const Body = concept === "cursor" ? CursorBuddy : concept === "memo" ? MemoBuddy : BubbleBuddy;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 40%, rgba(110,140,60,0.55), #0A0B0D 75%)" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 0.9, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
        <hemisphereLight args={["#ffffff", "#30343a", 0.9]} />
        <directionalLight position={[3, 6, 5]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
        <directionalLight position={[-5, 3, -4]} intensity={2.2} color="#E6FF9A" />
        <pointLight position={[0, 1, 4]} intensity={6} distance={10} color="#ffffff" />
        <group position={[0, 0.05 + bob, 0]} rotation={[0.05, -0.38, 0.07]} scale={0.78}>
          <Body mood={mood} />
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <shadowMaterial opacity={0.45} />
        </mesh>
      </ThreeCanvas>
      <div style={{ position: "absolute", bottom: 300, width: "100%", textAlign: "center", fontFamily: "Pretendard", color: "#F5F5F2" }}>
        <div style={{ fontWeight: 900, fontSize: 84, letterSpacing: -2 }}>{NAME[concept][0]}</div>
        <div style={{ fontWeight: 700, fontSize: 40, opacity: 0.6, marginTop: 10 }}>{NAME[concept][1]}</div>
      </div>
    </AbsoluteFill>
  );
};
