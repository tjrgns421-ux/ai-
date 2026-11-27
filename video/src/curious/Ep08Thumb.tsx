import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// Curious Minutes ep08 thumbnail: "NOT AN EGG" — the real NOAA golden orb photo (public domain) on the right.
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };

export const CmEp08Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#020B14" }}>
      <Img src={staticFile("cm08/img/orb.jpg")} style={{ position: "absolute", right: -200, top: -120, width: 1300, height: 960, objectFit: "cover", objectPosition: "50% 50%", filter: "contrast(1.15) brightness(1.15) saturate(1.3)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(2,11,20,0.95) 0%, rgba(2,11,20,0.6) 36%, rgba(2,11,20,0) 56%)" }} />
      <div style={{ ...word, left: 44, top: 170, fontSize: 190, color: "#FFFFFF", textShadow: outline(6) }}>NOT AN</div>
      <div style={{ ...word, left: 40, top: 370, fontSize: 230, color: "#FFD23F", textShadow: outline(6), rotate: "-3deg" }}>EGG</div>
      <div style={{ position: "absolute", left: 50, top: 620, fontFamily: "Pretendard", fontWeight: 800, fontSize: 30, color: "#FFFFFF", opacity: 0.8 }}>NOAA · 3,300 m deep · 2023</div>
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 1070, top: 520, width: 190, height: 190 }} />
    </AbsoluteFill>
  );
};
