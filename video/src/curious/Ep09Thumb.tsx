import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// Curious Minutes ep09 thumbnail: "IT WAS ICE" — a real Racetrack Playa photo (Wikimedia Commons) on the right.
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };

export const CmEp09Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#14100C" }}>
      <Img src={staticFile("cm09/img/stones.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 720, objectFit: "cover", objectPosition: "50% 50%", filter: "contrast(1.15) brightness(1.15) saturate(1.3)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(20,16,12,0.9) 0%, rgba(20,16,12,0.55) 40%, rgba(20,16,12,0) 60%)" }} />
      <div style={{ ...word, left: 44, top: 170, fontSize: 190, color: "#FFFFFF", textShadow: outline(6) }}>IT WAS</div>
      <div style={{ ...word, left: 40, top: 370, fontSize: 230, color: "#8FE3FF", textShadow: outline(6), rotate: "-3deg" }}>ICE</div>
      <div style={{ position: "absolute", left: 50, top: 620, fontFamily: "Pretendard", fontWeight: 800, fontSize: 30, color: "#FFFFFF", opacity: 0.8 }}>Death Valley · Racetrack Playa</div>
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 1070, top: 520, width: 190, height: 190 }} />
    </AbsoluteFill>
  );
};
