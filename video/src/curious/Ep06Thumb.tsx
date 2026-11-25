import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import * as THREE from "three";
import { useFonts } from "../StyleFrames";
import { IceStage, Pyramid, Range, Snowfield } from "./Ice3D";

// Curious Minutes ep06 thumbnail: "NOT A PYRAMID" — the four-sided Antarctic peak, lit on the right; Sprout in a corner.
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };

export const CmEp06Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#0B1622" }}>
      <IceStage width={1280} height={720} sky="#2F5878" sun={[200, 90, 160]} shot={{ pos: new THREE.Vector3(-220, 90, 560), look: new THREE.Vector3(-190, 55, 0), fov: 30 }}>
        <Snowfield /><Pyramid />
      </IceStage>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,16,26,0.9) 0%, rgba(8,16,26,0.45) 40%, rgba(8,16,26,0) 58%)" }} />
      <div style={{ ...word, left: 44, top: 150, fontSize: 176, color: "#FFFFFF", textShadow: outline(6) }}>NOT A</div>
      <div style={{ ...word, left: 40, top: 340, fontSize: 176, color: "#FFD23F", textShadow: outline(6), rotate: "-3deg" }}>PYRAMID</div>
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 1060, top: 520, width: 200, height: 200 }} />
    </AbsoluteFill>
  );
};
