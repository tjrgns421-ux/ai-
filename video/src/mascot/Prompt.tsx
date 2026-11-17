import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useFonts } from "../StyleFrames";

// "프프" — the channel's ">_" prompt mascot. Two takes on the same symbol;
// the chosen one is `terminal`.
//  terminal: rounded screen head, the face IS the glowing ">_" (logo = face)
//  glyph:    puffy ">" body riding a "_" bar (silhouette reads ">_")

export type PromptVariant = "terminal" | "glyph";
export type PromptFace = "prompt" | "happy" | "shock";

const LIME = "#CFEF2E";
const GLOW = "#D7FF3A";

const Toy: React.FC<{ color: string; rough?: number; children: React.ReactNode } & React.ComponentProps<"mesh">> = ({ color, rough = 0.35, children, ...p }) => (
  <mesh castShadow receiveShadow {...p}>
    {children}
    <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.8} clearcoatRoughness={0.25} />
  </mesh>
);

const Glow: React.FC<{ children: React.ReactNode } & React.ComponentProps<"mesh">> = ({ children, ...p }) => (
  <mesh {...p}>
    {children}
    <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2.2} toneMapped={false} />
  </mesh>
);

// glowing chevron ">" made of two rounded bars
const Chevron: React.FC<{ size: number; thick: number; pos: [number, number, number] }> = ({ size, thick, pos }) => (
  <group position={pos}>
    <Glow position={[0, size * 0.32, 0]} rotation={[0, 0, Math.PI / 4]}>
      <capsuleGeometry args={[thick, size * 0.75, 8, 16]} />
    </Glow>
    <Glow position={[0, -size * 0.32, 0]} rotation={[0, 0, -Math.PI / 4]}>
      <capsuleGeometry args={[thick, size * 0.75, 8, 16]} />
    </Glow>
  </group>
);

const Bar: React.FC<{ w: number; thick: number; pos: [number, number, number]; on: boolean }> = ({ w, thick, pos, on }) =>
  on ? (
    <Glow position={pos} rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[thick, w, 8, 16]} />
    </Glow>
  ) : null;

const Arc: React.FC<{ pos: [number, number, number]; r: number }> = ({ pos, r }) => (
  <Glow position={pos}>
    <torusGeometry args={[r, 0.045, 12, 32, Math.PI]} />
  </Glow>
);

const Feet: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <>
    {[-1, 1].map((s) => (
      <Toy key={s} color={color} rough={0.45} position={[s * x, y, 0.1]} scale={[1, 0.62, 1.25]}>
        <sphereGeometry args={[0.16, 24, 24]} />
      </Toy>
    ))}
  </>
);

const Arms: React.FC<{ x: number; y: number; color: string; wave?: number; leftLift?: number }> = ({ x, y, color, wave = 0.9, leftLift = 0 }) => (
  <>
    <Toy color={color} position={[-x - 0.03 * leftLift, y + 0.1 * leftLift, 0.05]} rotation={[0, 0, -1.1 + leftLift * 0.9]}>
      <capsuleGeometry args={[0.085, 0.16, 8, 16]} />
    </Toy>
    <Toy color={color} position={[x + 0.03, y + 0.1, 0.05]} rotation={[0, 0, 1.1 - wave]}>
      <capsuleGeometry args={[0.085, 0.16, 8, 16]} />
    </Toy>
  </>
);

const Cheeks: React.FC<{ y: number; x: number; z: number }> = ({ y, x, z }) => (
  <>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * x, y, z]} scale={[0.1, 0.06, 0.02]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#FF8FA3" emissive="#FF6F8A" emissiveIntensity={0.35} />
      </mesh>
    ))}
  </>
);

// Variant 1: terminal head; the face is the prompt.
const Sweat: React.FC<{ o: number }> = ({ o }) =>
  o > 0.01 ? (
    <group position={[-0.62, 0.95 - (1 - o) * 0.1, 0.35]} scale={o}>
      <mesh>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshPhysicalMaterial color="#7FC8FF" roughness={0.05} clearcoat={1} transmission={0.2} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <coneGeometry args={[0.085, 0.16, 24]} />
        <meshPhysicalMaterial color="#7FC8FF" roughness={0.05} clearcoat={1} />
      </mesh>
    </group>
  ) : null;

export const TerminalBuddy: React.FC<{ face: PromptFace; blink: boolean; wave?: number; leftLift?: number; sweat?: number }> = ({ face, blink, wave = 0.9, leftLift = 0, sweat = 0 }) => {
  const head = useMemo(() => new RoundedBoxGeometry(1.5, 1.3, 1.0, 8, 0.3), []);
  const screen = useMemo(() => new RoundedBoxGeometry(1.22, 0.98, 0.06, 6, 0.2), []);
  const z = 0.53;
  return (
    <group>
      <mesh geometry={head} position={[0, 0.3, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={LIME} roughness={0.32} clearcoat={0.9} clearcoatRoughness={0.2} />
      </mesh>
      <mesh geometry={screen} position={[0, 0.3, 0.49]}>
        <meshPhysicalMaterial color="#0C0D10" roughness={0.15} clearcoat={1} />
      </mesh>
      {/* soft screen glow */}
      {face === "prompt" && (
        <>
          <Chevron size={0.42} thick={0.055} pos={[-0.22, 0.36, z]} />
          <Bar w={0.26} thick={0.055} pos={[0.2, 0.15, z]} on={!blink} />
        </>
      )}
      {face === "happy" && (
        <>
          <Arc pos={[-0.27, 0.3, z]} r={0.13} />
          <Arc pos={[0.27, 0.3, z]} r={0.13} />
          <Bar w={0.16} thick={0.045} pos={[0, 0.08, z]} on />
        </>
      )}
      {face === "shock" && (
        <>
          {[-1, 1].map((s) => (
            <Glow key={s} position={[s * 0.27, 0.36, z]}>
              <torusGeometry args={[0.11, 0.045, 12, 32]} />
            </Glow>
          ))}
          <Bar w={0.1} thick={0.045} pos={[0, 0.1, z]} on />
        </>
      )}
      <Cheeks y={0.12} x={0.45} z={z + 0.005} />
      <Toy color="#1E2026" position={[0.42, 1.03, 0]} rotation={[0, 0, -0.35]}>
        <capsuleGeometry args={[0.05, 0.22, 8, 12]} />
      </Toy>
      <Toy color={LIME} position={[0.5, 1.2, 0]}>
        <sphereGeometry args={[0.1, 24, 24]} />
      </Toy>
      <Arms x={0.85} y={0.12} color={LIME} wave={wave} leftLift={leftLift} />
      <Feet x={0.36} y={-0.47} color="#1E2026" />
      <Sweat o={sweat} />
    </group>
  );
};

// Variant 2: puffy ">" body riding the blinking "_" bar.
const GlyphBuddy: React.FC<{ face: PromptFace; blink: boolean }> = ({ face, blink }) => {
  const r = 0.34;
  const len = 0.95;
  return (
    <group>
      <group position={[-0.35, 0.25, 0]} scale={0.72}>
        <Toy color={LIME} position={[0, 0.36, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[r, len, 16, 32]} />
        </Toy>
        <Toy color={LIME} position={[0, -0.36, 0]} rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[r, len, 16, 32]} />
        </Toy>
        <Toy color={LIME} position={[0.36, 0, 0]}>
          <sphereGeometry args={[r * 1.05, 32, 32]} />
        </Toy>
        {/* face on the tip */}
        {[-1, 1].map((s) => (
          <group key={s} position={[0.36 + 0.06 * s, 0.06, r * 1.05 - 0.04]}>
            <mesh scale={face === "happy" ? [0.07, 0.035, 0.04] : [0.065, 0.09, 0.05]} position={[s * 0.07, 0, 0]}>
              <sphereGeometry args={[1, 24, 24]} />
              <meshPhysicalMaterial color="#0B0B0D" roughness={0.1} clearcoat={1} />
            </mesh>
            <mesh position={[s * 0.07 + 0.02, 0.035, 0.05]}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
          </group>
        ))}
        <Cheeks y={-0.07} x={0.2} z={r * 0.9} />
      </group>
      {/* the "_" skateboard bar */}
      <Toy color="#1E2026" position={[0.25, -0.42, 0.1]} rotation={[0, 0, Math.PI / 2]} rough={0.25}>
        <capsuleGeometry args={[0.11, 1.2, 12, 24]} />
      </Toy>
      {!blink && (
        <Glow position={[0.25, -0.3, 0.1]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.5]}>
          <capsuleGeometry args={[0.03, 1.05, 8, 16]} />
        </Glow>
      )}
    </group>
  );
};

const LABEL: Record<PromptVariant, [string, string]> = {
  terminal: ["유형 1 · 터미널 얼굴형", "얼굴이 곧 로고 — 깜빡이는 >_"],
  glyph: ["유형 2 · 기호 몸통형", "> 몸통이 _ 위에 올라탄 실루엣"],
};

export const PromptMascot: React.FC<{ variant: PromptVariant; face: PromptFace; label?: boolean }> = ({ variant, face, label = true }) => {
  useFonts();
  const { width, height } = useVideoConfig();
  const f = useCurrentFrame();
  const blink = f % 30 >= 18;
  const bob = Math.sin(f / 10) * 0.04;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 40%, rgba(110,140,60,0.5), #0A0B0D 75%)" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 0.9, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
        <hemisphereLight args={["#ffffff", "#30343a", 0.9]} />
        <directionalLight position={[3, 6, 5]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
        <directionalLight position={[-5, 3, -4]} intensity={2.2} color="#E6FF9A" />
        <pointLight position={[0, 1, 4]} intensity={5} distance={10} color="#ffffff" />
        <group position={[0, 0.05 + bob, 0]} rotation={[0.05, -0.32, 0.06]} scale={0.8}>
          {variant === "terminal" ? <TerminalBuddy face={face} blink={blink} /> : <GlyphBuddy face={face} blink={blink} />}
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <shadowMaterial opacity={0.45} />
        </mesh>
      </ThreeCanvas>
      {label && (
        <div style={{ position: "absolute", bottom: 300, width: "100%", textAlign: "center", fontFamily: "Pretendard", color: "#F5F5F2" }}>
          <div style={{ fontWeight: 900, fontSize: 76, letterSpacing: -2 }}>{LABEL[variant][0]}</div>
          <div style={{ fontWeight: 700, fontSize: 40, opacity: 0.6, marginTop: 10 }}>{LABEL[variant][1]}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Reusable stage: 프프 in a transparent 3D canvas, driven entirely by props.
export type PeupeuPose = {
  face: PromptFace;
  blink?: boolean;
  wave?: number; // right arm: 0 = down, ~1.6 = straight up
  leftLift?: number; // left arm: 0 = down, 1 = up
  sweat?: number; // 0..1
  jump?: number; // world units up
  sx?: number; // squash/stretch
  sy?: number;
  rotY?: number;
  rotZ?: number;
  scale?: number;
};

export const PeupeuStage: React.FC<{ width: number; height: number; pose: PeupeuPose }> = ({ width, height, pose }) => {
  const { face, blink = false, wave = 0.9, leftLift = 0, sweat = 0, jump = 0, sx = 1, sy = 1, rotY = -0.32, rotZ = 0.06, scale = 1 } = pose;
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 0.9, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <hemisphereLight args={["#ffffff", "#30343a", 0.9]} />
      <directionalLight position={[3, 6, 5]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <directionalLight position={[-5, 3, -4]} intensity={2.2} color="#E6FF9A" />
      <pointLight position={[0, 1, 4]} intensity={5} distance={10} color="#ffffff" />
      <group position={[0, -0.47 * scale + jump, 0]}>
        <group scale={[scale * sx, scale * sy, scale * sx]} rotation={[0.05, rotY, rotZ]}>
          <group position={[0, 0.47, 0]}>
            <TerminalBuddy face={face} blink={blink} wave={wave} leftLift={leftLift} sweat={sweat} />
          </group>
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47 * scale - 0.02, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
    </ThreeCanvas>
  );
};
