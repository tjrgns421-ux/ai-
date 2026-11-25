import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";
import { Globe2D } from "./Globe2D";

// Curious Minutes ep04 thumbnail: "IT WAS A ROCK" — the real Moon (NASA LRO map) on the right, Sprout in a corner.
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };

export const CmEp04Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#03030A" }}>
      {Array.from({ length: 120 }, (_, i) => <div key={i} style={{ position: "absolute", left: (Math.sin(i * 91.7) * 0.5 + 0.5) * 1280, top: (Math.sin(i * 47.3 + 1) * 0.5 + 0.5) * 720, width: 2, height: 2, background: "#FFF", opacity: 0.5 }} />)}
      <Globe2D rotY={Math.PI * 0.9} size={760} cx={960} cy={380} light={[-0.6, 0.3, 0.75]} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(3,3,10,0.9) 0%, rgba(3,3,10,0.35) 45%, rgba(3,3,10,0) 65%)" }} />
      <div style={{ ...word, left: 44, top: 90, fontSize: 168, color: "#FFFFFF", textShadow: outline(6) }}>IT WAS</div>
      <div style={{ ...word, left: 40, top: 260, fontSize: 168, color: "#FFFFFF", textShadow: outline(6) }}>A</div>
      <div style={{ ...word, left: 40, top: 420, fontSize: 168, color: "#FFD23F", textShadow: outline(6), rotate: "-3deg" }}>ROCK</div>
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 1010, top: 470, width: 240, height: 240 }} />
    </AbsoluteFill>
  );
};
