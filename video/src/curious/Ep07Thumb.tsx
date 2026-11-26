import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// Curious Minutes ep07 thumbnail: "NOT A FACE" — the real 1976 Viking 1 "face on Mars" photo on the right (public domain).
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };

export const CmEp07Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#0B0705" }}>
      <Img src={staticFile("cm07/img/face_viking.jpg")} style={{ position: "absolute", right: -60, top: -140, width: 900, height: 1000, objectFit: "cover", objectPosition: "50% 45%", filter: "contrast(1.25) brightness(1.1) sepia(0.45) saturate(1.6) hue-rotate(-12deg)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(11,7,5,0.95) 0%, rgba(11,7,5,0.6) 38%, rgba(11,7,5,0) 58%)" }} />
      <div style={{ position: "absolute", right: 300, top: 250, width: 230, height: 230, border: "8px solid #FFD23F", borderRadius: 120 }} />
      <div style={{ ...word, left: 44, top: 170, fontSize: 190, color: "#FFFFFF", textShadow: outline(6) }}>NOT A</div>
      <div style={{ ...word, left: 40, top: 370, fontSize: 210, color: "#FFD23F", textShadow: outline(6), rotate: "-3deg" }}>FACE</div>
      <div style={{ position: "absolute", left: 50, top: 600, fontFamily: "Pretendard", fontWeight: 800, fontSize: 30, color: "#FFFFFF", opacity: 0.8 }}>NASA Viking 1 · 1976</div>
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 1070, top: 520, width: 190, height: 190 }} />
    </AbsoluteFill>
  );
};
