import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// Thumbnail (1280×720) for sn02: the ₩100M (~$75,000) cheating bounty. No photos of students or test sites.
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.95 };

export const Sn02Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 90% at 72% 50%, rgba(120,165,20,0.42) 0%, #0A0B0D 70%)" }}>
      <div style={{ ...font, position: "absolute", left: 56, top: 70, fontSize: 60, color: INK }}>KOREA WANTS TO PAY</div>
      <div style={{ ...font, position: "absolute", left: 44, top: 150, fontSize: 196, color: LIME, letterSpacing: -8, textShadow: "0 10px 0 #000" }}>$75,000</div>
      <div style={{ ...font, position: "absolute", left: 56, top: 370, fontSize: 96, color: INK }}>FOR ONE TIP</div>
      <div style={{ ...font, position: "absolute", left: 60, top: 540, fontSize: 58, color: INK, rotate: "-4deg", border: `8px solid ${RED}`, borderRadius: 14, padding: "6px 20px", background: "rgba(10,11,13,0.85)" }}>
        CHEATERS: <span style={{ color: RED }}>10-YEAR BAN</span>
      </div>
      <svg width={470} height={470} viewBox="-1 -1 2 2" style={{ position: "absolute", left: 850, top: 170, rotate: "-34deg" }}>
        <circle r={0.92} fill="#0047A0" />
        <path d="M -0.92 0 A 0.92 0.92 0 0 1 0.92 0 A 0.46 0.46 0 0 1 0 0 A 0.46 0.46 0 0 0 -0.92 0 Z" fill="#CD2E3A" />
      </svg>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 790, top: 170, width: 540, height: 540 }} />
    </AbsoluteFill>
  );
};
