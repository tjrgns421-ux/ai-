import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Curious Minutes ep02: a stylized black hole (ILLUSTRATION, based on NASA Goddard's 2024 visualization).
// Units: 1 = event horizon radius. Shadow edge / photon ring ~2.6, disk 3..14.
// Not a ray tracer: the lensed far side of the disk is drawn as a camera-facing halo, like the classic look.

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------- star sky with relativistic aberration + Doppler brightening ----------
const N_STARS = 2600;
const STAR_DIRS = Array.from({ length: N_STARS }, (_, i) => {
  const u = rnd(i) * 2 - 1, t = rnd(i + 9000) * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return { d: new THREE.Vector3(r * Math.cos(t), u, r * Math.sin(t)), m: 0.35 + Math.pow(rnd(i + 5000), 6) * 2.6, c: rnd(i + 777) };
});

const Stars: React.FC<{ beta: number; fwd: THREE.Vector3; cam: THREE.Vector3 }> = ({ beta, fwd, cam }) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = new Float32Array(N_STARS * 3), col = new Float32Array(N_STARS * 3), size = new Float32Array(N_STARS);
  const f = fwd.clone().normalize();
  const g = 1 / Math.sqrt(1 - beta * beta);
  STAR_DIRS.forEach((s, i) => {
    // angle from the direction of travel, then aberrate: cos t' = (cos t + b) / (1 + b cos t)
    const c = THREE.MathUtils.clamp(s.d.dot(f), -1, 1);
    const c2 = (c + beta) / (1 + beta * c);
    const perp = s.d.clone().addScaledVector(f, -c);
    const pl = perp.length() || 1;
    const sin2 = Math.sqrt(Math.max(0, 1 - c2 * c2));
    const dir = f.clone().multiplyScalar(c2).addScaledVector(perp, sin2 / pl);
    const D = 1 / (g * (1 - beta * c2)); // Doppler factor seen by the moving camera
    const b = Math.min(4, Math.pow(D, 1.6));
    const p = cam.clone().addScaledVector(dir, 900);
    pos.set([p.x, p.y, p.z], i * 3);
    const warm = s.c < 0.3, white = Math.min(1, (D - 1) * 0.8);
    const base = warm ? [1, 0.85, 0.7] : s.c > 0.8 ? [0.75, 0.85, 1] : [1, 1, 1];
    col.set(base.map((x) => Math.min(1, x * (0.55 + 0.45 * b) + white * 0.3)), i * 3);
    size[i] = s.m * (0.7 + 0.5 * b);
  });
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        vertexShader: `attribute float size; varying vec3 vC; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=size*3.2; gl_Position=projectionMatrix*mv; }`,
        fragmentShader: `varying vec3 vC; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.0,d); gl_FragColor=vec4(vC, a); }`,
      }),
    [],
  );
  return <points geometry={geo} material={mat} />;
};

// ---------- accretion disk (Doppler: the side moving toward the camera is brighter and bluer) ----------
const diskVert = `varying vec2 vP; varying vec3 vW; varying vec3 vV; void main(){ vP=position.xy; vW=(modelMatrix*vec4(position,1.)).xyz; vV=normalize((modelMatrix*vec4(-position.y,position.x,0.,0.)).xyz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const diskFrag = `
uniform float uT; uniform vec3 uCam; uniform float uDop; uniform float uIn; uniform float uOut;
varying vec2 vP; varying vec3 vW; varying vec3 vV;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
void main(){
  float r=length(vP); if(r<uIn||r>uOut) discard;
  float a=atan(vP.y,vP.x);
  float x=(r-uIn)/(uOut-uIn);
  float sw=a + uT*1.6/pow(r,1.5)*6.;            // inner gas orbits faster
  float bands=.6+.4*n(vec2(sw*2.2,r*1.1)); bands*= .82+.18*n(vec2(sw*5.,r*2.4));
  vec3 hot=vec3(1.,.97,.9), mid=vec3(1.,.66,.25), cool=vec3(.75,.22,.08);
  vec3 c = x<.25 ? mix(hot,mid,x/.25) : mix(mid,cool,(x-.25)/.75);
  // disk plane is local xy; world position of this point
  vec3 toCam=normalize(uCam-vW);
  float d=dot(normalize(vV),toCam);
  float boost=1.+uDop*d*1.1/sqrt(r/uIn);
  c*=max(.15,boost); c=mix(c, vec3(.95,.97,1.)*length(c)*.75, clamp(.45*uDop*max(0.,d),0.,.5));
  float alpha=smoothstep(0.,.06,x)*smoothstep(1.,.55,x)*bands;
  gl_FragColor=vec4(c*bands*1.6, alpha);
}`;

const Disk: React.FC<{ t: number; tilt: number; dop: number }> = ({ t, tilt, dop }) => {
  const { camera } = useThree();
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uDop: { value: 1 }, uIn: { value: 3 }, uOut: { value: 14 } }, vertexShader: diskVert, fragmentShader: diskFrag, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    [],
  );
  mat.uniforms.uT.value = t;
  mat.uniforms.uCam.value.copy(camera.position);
  mat.uniforms.uDop.value = dop;
  return (
    <mesh rotation={[-Math.PI / 2 + tilt, 0, 0]} material={mat}>
      <planeGeometry args={[30, 30, 64, 64]} />
    </mesh>
  );
};

// ---------- camera-facing halo: lensed far side of the disk + photon rings ----------
const haloFrag = `
uniform float uT; varying vec2 vUv;
float h(float x){ return fract(sin(x*91.7)*4373.5); }
void main(){
  vec2 p=(vUv-.5)*2.*8.;               // plane spans 16 units
  float r=length(p); float a=atan(p.y,p.x);
  // lensed image of the far disk: a bright band hugging the shadow, stronger on top and bottom
  float band=exp(-pow((r-3.25)/.55,2.))*(.55+.45*abs(sin(a)));
  // photon rings: thin, layered, each one thinner and fainter
  float ring=exp(-pow((r-2.62)/.045,2.))*1.3+exp(-pow((r-2.74)/.025,2.))*.6+exp(-pow((r-2.8)/.012,2.))*.35;
  float flick=.85+.15*sin(a*7.+uT*2.);
  vec3 c=vec3(1.,.72,.35)*band*1.1*flick + vec3(1.,.93,.8)*ring;
  float glow=exp(-pow((r-2.9)/2.2,2.))*.18;
  c+=vec3(1.,.55,.2)*glow;
  if(r<2.55) c*=smoothstep(2.35,2.55,r);     // the shadow
  gl_FragColor=vec4(c, clamp(max(max(band,ring),glow*2.),0.,1.));
}`;

const Halo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const mat = useMemo(() => new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 } }, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: haloFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  mat.uniforms.uT.value = t;
  const q = camera.quaternion.clone();
  return (
    <mesh quaternion={q} material={mat} renderOrder={2}>
      <planeGeometry args={[16, 16]} />
    </mesh>
  );
};

// the black shadow itself (occludes the disk behind it)
const Shadow: React.FC = () => (
  <mesh renderOrder={3}>
    <sphereGeometry args={[2.5, 64, 64]} />
    <meshBasicMaterial color="#000000" />
  </mesh>
);

export type BHShot = { pos: THREE.Vector3; look: THREE.Vector3; up?: THREE.Vector3; fov?: number };

const Rig: React.FC<{ sh: BHShot }> = ({ sh }) => {
  const { camera, scene } = useThree();
  if (sh.up) camera.up.copy(sh.up);
  else camera.up.set(0, 1, 0);
  camera.position.copy(sh.pos);
  camera.lookAt(sh.look);
  if (sh.fov && (camera as THREE.PerspectiveCamera).fov !== sh.fov) {
    (camera as THREE.PerspectiveCamera).fov = sh.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }
  scene.background = new THREE.Color("#02030A");
  return null;
};

/** The black hole. `beta` = camera speed (fraction of light) for the star-sky effects. */
export const BlackHole: React.FC<{ shot: BHShot; t: number; beta?: number; tilt?: number; dop?: number; width?: number; height?: number; children?: React.ReactNode; hideHole?: boolean }> = ({ shot, t, beta = 0, tilt = 0.08, dop = 0.9, width = 1920, height = 1080, children, hideHole = false }) => {
  const fwd = shot.look.clone().sub(shot.pos).normalize();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: shot.fov ?? 45, near: 0.05, far: 2000 }}>
      <Rig sh={shot} />
      <Stars beta={beta} fwd={fwd} cam={shot.pos} />
      {!hideHole && (
        <>
          <Disk t={t} tilt={tilt} dop={dop} />
          <Shadow />
          <Halo t={t} />
        </>
      )}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 6, 0]} intensity={60} color="#FFB060" />
      {children}
    </ThreeCanvas>
  );
};
