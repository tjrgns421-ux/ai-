import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";

// Mascot concepts for the science channel "Curious Minutes". Same 3D setup as Blip, different
// silhouette and palette so the two channels never look alike.
//  A "Orbi"  — a small planet with a tilted ring
//  B "Flask" — a round-bottom lab flask with glowing liquid
//  C "Atom"  — a round nucleus with orbiting electrons

export type CuriousVariant = "orbi" | "flask" | "atom" | "bulb" | "curl" | "sprout";

const Toy: React.FC<{ color: string; rough?: number; children: React.ReactNode } & React.ComponentProps<"mesh">> = ({ color, rough = 0.35, children, ...p }) => (
  <mesh castShadow receiveShadow {...p}>
    {children}
    <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.8} clearcoatRoughness={0.25} />
  </mesh>
);

// shared face: glossy black eyes with a highlight, a small smile, pink cheeks
const Face: React.FC<{ z: number; y?: number; spread?: number; size?: number }> = ({ z, y = 0, spread = 0.26, size = 1 }) => (
  <group position={[0, y, z]} scale={size}>
    {[-1, 1].map((s) => (
      <group key={s} position={[s * spread, 0.08, 0]}>
        <mesh scale={[0.085, 0.11, 0.05]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshPhysicalMaterial color="#121319" roughness={0.1} clearcoat={1} />
        </mesh>
        <mesh position={[0.025, 0.04, 0.045]} scale={0.025}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, -0.08, 0.01]} rotation={[0, 0, Math.PI]}>
      <torusGeometry args={[0.07, 0.022, 12, 24, Math.PI]} />
      <meshStandardMaterial color="#121319" />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={`c${s}`} position={[s * (spread + 0.13), -0.05, -0.01]} scale={[0.07, 0.042, 0.02]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#FF8FA3" emissive="#FF6F8A" emissiveIntensity={0.3} />
      </mesh>
    ))}
  </group>
);

const Feet: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <>
    {[-1, 1].map((s) => (
      <Toy key={s} color="#1E2026" rough={0.45} position={[s * x, y, 0.1]} scale={[1, 0.62, 1.25]}>
        <sphereGeometry args={[0.15, 24, 24]} />
      </Toy>
    ))}
  </>
);

const Arms: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <>
    {[-1, 1].map((s) => (
      <group key={s} position={[s * x, y, 0.05]} rotation={[0, 0, s * 0.9]}>
        <Toy color={color} position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.075, 0.24, 8, 16]} />
        </Toy>
      </group>
    ))}
  </>
);

const Orbi: React.FC = () => (
  <group>
    <Toy color="#3D8BFF" position={[0, 0.45, 0]}>
      <sphereGeometry args={[0.72, 48, 48]} />
    </Toy>
    {/* continents */}
    {[[-0.35, 0.78, 0.45, 0.16], [0.4, 0.25, 0.5, 0.12], [0.1, 1.0, 0.25, 0.1]].map(([x, y, z, r], i) => (
      <Toy key={i} color="#5BD68A" position={[x, y, z]} scale={[1, 0.55, 0.4]}>
        <sphereGeometry args={[r, 20, 20]} />
      </Toy>
    ))}
    <mesh position={[0, 0.45, 0]} rotation={[1.25, 0.25, 0]} castShadow>
      <torusGeometry args={[1.02, 0.06, 16, 80]} />
      <meshPhysicalMaterial color="#FFB547" roughness={0.3} clearcoat={0.8} />
    </mesh>
    <Face z={0.69} y={0.43} />
    <Arms x={0.66} y={0.32} color="#3D8BFF" />
    <Feet x={0.3} y={-0.28} />
  </group>
);

const Flask: React.FC = () => (
  <group>
    {/* liquid */}
    <Toy color="#B45CFF" rough={0.2} position={[0, 0.38, 0]}>
      <sphereGeometry args={[0.6, 48, 48]} />
    </Toy>
    {/* glass bulb and neck */}
    <mesh position={[0, 0.42, 0]}>
      <sphereGeometry args={[0.7, 48, 48]} />
      <meshPhysicalMaterial color="#DDF3FF" roughness={0.05} transparent opacity={0.32} clearcoat={1} />
    </mesh>
    <mesh position={[0, 1.22, 0]}>
      <cylinderGeometry args={[0.2, 0.24, 0.5, 32]} />
      <meshPhysicalMaterial color="#DDF3FF" roughness={0.05} transparent opacity={0.35} clearcoat={1} />
    </mesh>
    <Toy color="#B07A43" rough={0.6} position={[0, 1.52, 0]}>
      <cylinderGeometry args={[0.2, 0.17, 0.2, 32]} />
    </Toy>
    {/* bubbles */}
    {[[0.18, 0.75, 0.42, 0.06], [-0.22, 0.62, 0.46, 0.045], [0.05, 0.9, 0.3, 0.035]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[r, 16, 16]} />
        <meshStandardMaterial color="#F2E1FF" emissive="#E7C8FF" emissiveIntensity={0.6} />
      </mesh>
    ))}
    <Face z={0.62} y={0.3} />
    <Arms x={0.62} y={0.3} color="#DDF3FF" />
    <Feet x={0.28} y={-0.28} />
  </group>
);

const Atom: React.FC = () => (
  <group>
    <Toy color="#FF7A45" position={[0, 0.45, 0]}>
      <sphereGeometry args={[0.6, 48, 48]} />
    </Toy>
    {[0, 1, 2].map((i) => {
      const rot: [number, number, number] = [Math.PI / 2 + (i - 1) * 0.9, i * 1.05, 0];
      return (
        <group key={i} position={[0, 0.45, 0]} rotation={rot}>
          <mesh>
            <torusGeometry args={[1.0, 0.025, 12, 80]} />
            <meshStandardMaterial color="#7FE3FF" emissive="#57D6FF" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[Math.cos(i * 2.1) * 1.0, Math.sin(i * 2.1) * 1.0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#E9FBFF" emissive="#9BEBFF" emissiveIntensity={1.4} />
          </mesh>
        </group>
      );
    })}
    <Face z={0.58} y={0.44} />
    <Arms x={0.56} y={0.33} color="#FF7A45" />
    <Feet x={0.27} y={-0.2} />
  </group>
);

// ---- round 2: cuter, not tied to one field (symbols of curiosity) ----
// big sparkly eyes, wide squishy body, pastel, short limbs
const CuteFace: React.FC<{ z: number; y?: number }> = ({ z, y = 0 }) => (
  <group position={[0, y, z]}>
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 0.27, 0.06, 0]}>
        <mesh scale={[0.13, 0.155, 0.06]}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshPhysicalMaterial color="#17181F" roughness={0.08} clearcoat={1} />
        </mesh>
        <mesh position={[0.04, 0.06, 0.055]} scale={0.042}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
        <mesh position={[-0.035, -0.05, 0.055]} scale={0.02}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, -0.12, 0.02]} rotation={[0, 0, Math.PI]} scale={[1, 0.8, 1]}>
      <torusGeometry args={[0.05, 0.018, 12, 24, Math.PI]} />
      <meshStandardMaterial color="#17181F" />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={`c${s}`} position={[s * 0.46, -0.1, -0.03]} scale={[0.09, 0.05, 0.02]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#FF8FA3" emissive="#FF6F8A" emissiveIntensity={0.35} />
      </mesh>
    ))}
  </group>
);

const Nubs: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[-1, 1].map((s) => (
      <Toy key={s} color={color} position={[s * 0.8, 0.22, 0.1]} rotation={[0, 0, s * 0.5]} scale={[0.75, 1, 0.75]}>
        <sphereGeometry args={[0.14, 20, 20]} />
      </Toy>
    ))}
    {[-1, 1].map((s) => (
      <Toy key={`f${s}`} color={color} rough={0.45} position={[s * 0.3, -0.22, 0.15]} scale={[1.1, 0.6, 1.2]}>
        <sphereGeometry args={[0.14, 20, 20]} />
      </Toy>
    ))}
  </>
);

const CuteBody: React.FC<{ color: string; children?: React.ReactNode }> = ({ color, children }) => (
  <group>
    <Toy color={color} rough={0.5} position={[0, 0.4, 0]} scale={[1.12, 0.92, 1]}>
      <sphereGeometry args={[0.72, 48, 48]} />
    </Toy>
    <CuteFace z={0.68} y={0.38} />
    <Nubs color={color} />
    {children}
  </group>
);

// D "Bulb": an idea lightbulb on its antenna
const Bulb: React.FC = () => (
  <CuteBody color="#9EE6D2">
    <Toy color="#2A2D36" position={[0.05, 1.18, 0]} rotation={[0, 0, -0.15]}>
      <cylinderGeometry args={[0.025, 0.025, 0.36, 12]} />
    </Toy>
    <mesh position={[0.1, 1.45, 0]}>
      <sphereGeometry args={[0.16, 28, 28]} />
      <meshStandardMaterial color="#FFE27A" emissive="#FFD23F" emissiveIntensity={1.1} />
    </mesh>
    <Toy color="#C9CED8" position={[0.08, 1.3, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
    </Toy>
  </CuteBody>
);

// E "Curl": a question-mark curl on top
const Curl: React.FC = () => (
  <CuteBody color="#FFD98A">
    <mesh position={[0.02, 1.32, 0]} rotation={[0, 0, -0.6]}>
      <torusGeometry args={[0.15, 0.05, 14, 32, Math.PI * 1.45]} />
      <meshPhysicalMaterial color="#FF9F43" roughness={0.4} clearcoat={0.8} />
    </mesh>
    <Toy color="#FF9F43" position={[-0.05, 1.1, 0]}>
      <sphereGeometry args={[0.055, 14, 14]} />
    </Toy>
  </CuteBody>
);

// F "Sprout": a tiny sprout (a growing idea) on top
const Sprout: React.FC = () => (
  <CuteBody color="#C8B6FF">
    <Toy color="#3FAE5A" position={[0, 1.18, 0]}>
      <cylinderGeometry args={[0.025, 0.03, 0.22, 10]} />
    </Toy>
    {[-1, 1].map((s) => (
      <Toy key={s} color="#5BD68A" position={[s * 0.13, 1.3, 0]} rotation={[0, 0, s * -0.7]} scale={[1.6, 0.55, 0.5]}>
        <sphereGeometry args={[0.1, 18, 18]} />
      </Toy>
    ))}
  </CuteBody>
);

export const CuriousStage: React.FC<{ width: number; height: number; v: CuriousVariant; rotY?: number }> = ({ width, height, v, rotY = -0.3 }) => (
  <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 0.9, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
    <hemisphereLight args={["#ffffff", "#30343a", 0.9]} />
    <directionalLight position={[3, 6, 5]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
    <directionalLight position={[-5, 3, -4]} intensity={2.0} color="#CFE6FF" />
    <pointLight position={[0, 1, 4]} intensity={5} distance={10} color="#ffffff" />
    <group position={[0, -0.35, 0]} rotation={[0.05, rotY, 0.04]}>
      {v === "orbi" ? <Orbi /> : v === "flask" ? <Flask /> : v === "atom" ? <Atom /> : v === "bulb" ? <Bulb /> : v === "curl" ? <Curl /> : <Sprout />}
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <shadowMaterial opacity={0.35} />
    </mesh>
  </ThreeCanvas>
);

export const CuriousStill: React.FC<{ v: CuriousVariant }> = ({ v }) => (
  <AbsoluteFill>
    <CuriousStage width={800} height={800} v={v} />
  </AbsoluteFill>
);

// ---- Sprout (chosen 2026-11-19): poseable version for thumbnails and reaction beats ----
export type SproutFace = "happy" | "shock" | "think" | "sad" | "wink" | "excited";
export type SproutPose = { face: SproutFace; arms?: number; jump?: number; droop?: number; rotY?: number; rotZ?: number; sx?: number; sy?: number };

const SPROUT = "#BFA8FF"; // pastel lilac (more saturated so it does not read grey)

const Eye: React.FC<{ x: number; mode: "open" | "wide" | "arc" | "line" | "up" }> = ({ x, mode }) => {
  const black = <meshPhysicalMaterial color="#17181F" roughness={0.08} clearcoat={1} />;
  const shine = (px: number, py: number, r: number) => (
    <mesh position={[px, py, 0.055]} scale={r}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
    </mesh>
  );
  if (mode === "arc")
    return (
      <mesh position={[x, 0.04, 0]}>
        <torusGeometry args={[0.09, 0.028, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#17181F" />
      </mesh>
    );
  if (mode === "line")
    return (
      <mesh position={[x, 0.06, 0]} rotation={[0, 0, Math.PI / 2 + (x > 0 ? -0.3 : 0.3)]}>
        <capsuleGeometry args={[0.024, 0.13, 8, 12]} />
        <meshStandardMaterial color="#17181F" />
      </mesh>
    );
  const sc: [number, number, number] = mode === "wide" ? [0.15, 0.19, 0.06] : [0.13, 0.155, 0.06];
  const dy = mode === "up" ? 0.04 : 0;
  return (
    <group position={[x, 0.06 + dy, 0]}>
      <mesh scale={sc}>
        <sphereGeometry args={[1, 28, 28]} />
        {black}
      </mesh>
      {shine(0.04, mode === "up" ? 0.09 : 0.06, 0.042)}
      {shine(-0.035, -0.05, 0.02)}
    </group>
  );
};

const Mouth: React.FC<{ face: SproutFace }> = ({ face }) => {
  const m = <meshStandardMaterial color="#17181F" />;
  if (face === "shock")
    return (
      <mesh position={[0, -0.14, 0.02]} scale={[0.05, 0.065, 0.02]}>
        <sphereGeometry args={[1, 16, 16]} />
        {m}
      </mesh>
    );
  if (face === "sad" || face === "think")
    return (
      <mesh position={[face === "think" ? 0.05 : 0, -0.15, 0.02]} scale={[face === "think" ? 0.6 : 1, 0.8, 1]}>
        <torusGeometry args={[0.05, 0.018, 12, 24, Math.PI]} />
        {m}
      </mesh>
    );
  return (
    <mesh position={[0, -0.12, 0.02]} rotation={[0, 0, Math.PI]} scale={[face === "excited" ? 1.5 : 1, face === "excited" ? 1.2 : 0.8, 1]}>
      <torusGeometry args={[0.05, 0.018, 12, 24, Math.PI]} />
      {m}
    </mesh>
  );
};

const SproutBody: React.FC<{ pose: SproutPose }> = ({ pose }) => {
  const { face, arms = 0, droop = 0 } = pose;
  const eye = (face === "happy" || face === "excited" ? "arc" : face === "shock" ? "wide" : face === "think" ? "up" : face === "sad" ? "line" : "open") as Parameters<typeof Eye>[0]["mode"];
  const eyes = face === "wink" ? [["open", -0.27], ["arc", 0.27]] : [[eye, -0.27], [eye, 0.27]];
  return (
    <group>
      <Toy color={SPROUT} rough={0.55} position={[0, 0.4, 0]} scale={[1.12, 0.92, 1]}>
        <sphereGeometry args={[0.72, 48, 48]} />
      </Toy>
      <group position={[0, 0.38, 0.68]}>
        {eyes.map(([m, x]) => <Eye key={String(x)} x={x as number} mode={m as Parameters<typeof Eye>[0]["mode"]} />)}
        <Mouth face={face} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.46, -0.1, -0.03]} scale={[0.09, 0.05, 0.02]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#FF8FA3" emissive="#FF6F8A" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>
      {/* arms: 0 = resting at the sides, 1 = raised up */}
      {[-1, 1].map((s) => (
        <Toy key={s} color={SPROUT} position={[s * (0.8 - arms * 0.08), 0.22 + arms * 0.55, 0.1]} rotation={[0, 0, s * (0.5 + arms * 0.6)]} scale={[0.75, 1, 0.75]}>
          <sphereGeometry args={[0.14, 20, 20]} />
        </Toy>
      ))}
      {[-1, 1].map((s) => (
        <Toy key={`f${s}`} color={SPROUT} rough={0.45} position={[s * 0.3, -0.22, 0.15]} scale={[1.1, 0.6, 1.2]}>
          <sphereGeometry args={[0.14, 20, 20]} />
        </Toy>
      ))}
      {/* sprout: droop 0 = perky, 1 = wilted */}
      <group position={[0, 1.08, 0]} rotation={[0, 0, droop * 0.5]}>
        <Toy color="#3FAE5A" position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.22, 10]} />
        </Toy>
        {[-1, 1].map((s) => (
          <Toy key={s} color="#5BD68A" position={[s * 0.13, 0.22 - droop * 0.1, 0]} rotation={[0, 0, s * (-0.7 + droop * 1.4)]} scale={[1.6, 0.55, 0.5]}>
            <sphereGeometry args={[0.1, 18, 18]} />
          </Toy>
        ))}
      </group>
    </group>
  );
};

export const SproutStage: React.FC<{ width: number; height: number; pose: SproutPose }> = ({ width, height, pose }) => {
  const { jump = 0, rotY = -0.25, rotZ = 0.04, sx = 1, sy = 1 } = pose;
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 0.9, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <hemisphereLight args={["#ffffff", "#5a5f6e", 1.25]} />
      <directionalLight position={[3, 6, 5]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <directionalLight position={[-5, 3, -4]} intensity={1.6} color="#E8E0FF" />
      <pointLight position={[0, 1, 4]} intensity={6} distance={10} color="#ffffff" />
      <group position={[0, -0.35 + jump, 0]} rotation={[0.05, rotY, rotZ]} scale={[sx, sy, sx]}>
        <SproutBody pose={pose} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </ThreeCanvas>
  );
};

export const SproutStill: React.FC<{ pose: SproutPose }> = ({ pose }) => (
  <AbsoluteFill>
    <SproutStage width={800} height={800} pose={pose} />
  </AbsoluteFill>
);
