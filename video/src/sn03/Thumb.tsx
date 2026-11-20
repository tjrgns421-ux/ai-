import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// sn03 thumbnail: "DON'T SAY OPPA" (title carries the 65-article number).
// "oppa" as a targeted word: Asia Economy, citing South Korea's National Intelligence Service.
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const BG = "#0A0B0D";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.95 };

export const Sn03Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 90% at 72% 50%, rgba(255,77,61,0.30) 0%, ${BG} 70%)` }}>
      <div style={{ ...font, position: "absolute", left: 60, top: 170, fontSize: 120, color: INK }}>DON'T SAY</div>
      <div style={{ ...font, position: "absolute", left: 44, top: 310, fontSize: 250, color: LIME, letterSpacing: -10, textShadow: "0 12px 0 #000" }}>OPPA</div>
      {/* speech bubble with the word, crossed out */}
      <div style={{ position: "absolute", left: 760, top: 90, width: 400, height: 250, borderRadius: 60, background: INK, boxShadow: "0 18px 0 #000" }}>
        <div style={{ ...font, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 124, color: BG, letterSpacing: -2 }}>오빠</div>
        <div style={{ position: "absolute", left: 60, bottom: -50, width: 0, height: 0, borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderTop: `60px solid ${INK}` }} />
        <svg width={270} height={270} viewBox="-1 -1 2 2" style={{ position: "absolute", left: 65, top: -10 }}>
          <circle r={0.86} fill="none" stroke={RED} strokeWidth={0.13} />
          <line x1={-0.6} y1={-0.6} x2={0.6} y2={0.6} stroke={RED} strokeWidth={0.13} />
        </svg>
      </div>
      <Img src={staticFile("bc01/blip/panic.png")} style={{ position: "absolute", left: 850, top: 330, width: 400, height: 400 }} />
    </AbsoluteFill>
  );
};
