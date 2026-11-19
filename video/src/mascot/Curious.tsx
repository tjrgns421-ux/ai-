import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";

// Mascot concepts for the science channel "Curious Minutes". Same 3D setup as Blip, different
// silhouette and palette so the two channels never look alike.
//  A "Orbi"  — a small planet with a tilted ring
//  B "Flask" — a round-bottom lab flask with glowing liquid
//  C "Atom"  — a round nucleus with orbiting electrons

export type CuriousVariant = "orbi" | "flask" | "atom";

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

export const CuriousStage: React.FC<{ width: number; height: number; v: CuriousVariant; rotY?: number }> = ({ width, height, v, rotY = -0.3 }) => (
  <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 0.9, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
    <hemisphereLight args={["#ffffff", "#30343a", 0.9]} />
    <directionalLight position={[3, 6, 5]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
    <directionalLight position={[-5, 3, -4]} intensity={2.0} color="#CFE6FF" />
    <pointLight position={[0, 1, 4]} intensity={5} distance={10} color="#ffffff" />
    <group position={[0, -0.35, 0]} rotation={[0.05, rotY, 0.04]}>
      {v === "orbi" ? <Orbi /> : v === "flask" ? <Flask /> : <Atom />}
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
