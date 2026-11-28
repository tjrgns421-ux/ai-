import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// mp05 thumbnail: Everest photo, a "#1?" crossed out, "2 MOUNTAINS BEAT IT".
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.92 };

export const Mp05Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#0a0b0d", overflow: "hidden" }}>
      <Img src={staticFile("mp05/photos/everest.jpg")} style={{ position: "absolute", left: -120, top: -40, height: 800, filter: "saturate(1.1) contrast(1.1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,11,13,0) 30%, rgba(10,11,13,0.92) 62%)" }} />
      <div style={{ ...font, position: "absolute", left: 40, top: 40, fontSize: 60, color: INK, background: "rgba(10,11,13,0.8)", padding: "8px 18px", borderRadius: 12, letterSpacing: 0 }}>EVEREST <span style={{ color: RED, textDecoration: "line-through" }}>#1</span></div>
      <div style={{ ...font, position: "absolute", right: 40, top: 150, width: 640, textAlign: "right", fontSize: 150, color: LIME, textShadow: "0 10px 0 #000" }}>2</div>
      <div style={{ ...font, position: "absolute", right: 40, top: 300, width: 640, textAlign: "right", fontSize: 104, color: INK, textShadow: "0 8px 0 #000", whiteSpace: "nowrap" }}>MOUNTAINS</div>
      <div style={{ ...font, position: "absolute", right: 40, top: 410, width: 640, textAlign: "right", fontSize: 128, color: LIME, textShadow: "0 10px 0 #000", whiteSpace: "nowrap" }}>BEAT IT</div>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", right: 30, bottom: 10, width: 170, height: 170 }} />
    </AbsoluteFill>
  );
};
