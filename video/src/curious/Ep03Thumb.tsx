import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { Dodecahedron, Stage3 } from "./Dodeca3D";

// Curious Minutes ep03 thumbnail: "WHAT IS THIS?" — the bronze dodecahedron under a museum spotlight, Sprout puzzled.
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };

export const CmEp03Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#15110D" }}>
      <div style={{ position: "absolute", left: 360, top: 0, width: 1280, height: 720 }}>
        <Stage3 width={1280} height={720} shot={{ pos: new THREE.Vector3(1.4, 0.9, 5.2), look: new THREE.Vector3(0.25, -0.1, 0), fov: 34 }}>
          <Dodecahedron rot={[0.35, 0.55, 0.1]} />
        </Stage3>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(21,17,13,0.92) 0%, rgba(21,17,13,0.4) 42%, rgba(21,17,13,0) 62%)" }} />
      <div style={{ ...word, left: 44, top: 90, fontSize: 168, color: "#FFFFFF", textShadow: outline(6) }}>WHAT</div>
      <div style={{ ...word, left: 44, top: 250, fontSize: 168, color: "#FFFFFF", textShadow: outline(6) }}>IS</div>
      <div style={{ ...word, left: 40, top: 410, fontSize: 168, color: "#FFD23F", textShadow: outline(6), rotate: "-3deg" }}>THIS?</div>
      <Img src={staticFile("sprout/think.png")} style={{ position: "absolute", left: 980, top: 430, width: 300, height: 300 }} />
    </AbsoluteFill>
  );
};
