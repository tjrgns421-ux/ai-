import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { BlackHole } from "./BlackHole3D";

// Curious Minutes ep02 thumbnail: "SPAGHETTIFIED". The 3D black hole on the right, Sprout stretched toward it.
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };

export const CmEp02Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#02030A" }}>
      <div style={{ position: "absolute", left: 330, top: 40, width: 1280, height: 720 }}>
        <BlackHole width={1280} height={720} t={44} shot={{ pos: new THREE.Vector3(9, 3.2, 30), look: new THREE.Vector3(0, 0, 0), fov: 38 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(2,3,10,0.85) 0%, rgba(2,3,10,0.35) 45%, rgba(2,3,10,0) 70%)" }} />
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 640, top: 210, width: 300, height: 300, transform: "rotate(-62deg) scale(0.62, 1.9)", transformOrigin: "50% 50%" }} />
      <div style={{ ...word, left: 44, top: 70, fontSize: 132, color: "#FFFFFF", textShadow: outline(6) }}>SPAGHETTI-</div>
      <div style={{ ...word, left: 44, top: 200, fontSize: 132, color: "#FFD23F", textShadow: outline(6), rotate: "-3deg" }}>FIED</div>
      <div style={{ ...word, left: 48, top: 470, fontSize: 150, color: "#FF3B30", textShadow: outline(6), rotate: "-3deg" }}>12.8 s</div>
    </AbsoluteFill>
  );
};
