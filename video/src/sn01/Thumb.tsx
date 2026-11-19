import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// Thumbnail (1280×720) for the Suneung AI-cheating video. No photos of students or test sites.
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.95 };

export const Sn01Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 90% at 70% 45%, rgba(120,165,20,0.45) 0%, #0A0B0D 70%)" }}>
      <div style={{ ...font, position: "absolute", left: 50, top: 50, fontSize: 64, color: INK }}>KOREA'S COLLEGE EXAM</div>
      <div style={{ ...font, position: "absolute", left: 50, top: 130, fontSize: 210, color: RED, textShadow: "0 8px 0 #000" }}>vs AI</div>
      {/* glasses under inspection */}
      <svg style={{ position: "absolute", left: 60, top: 400 }} width="560" height="220" viewBox="0 0 560 220">
        <rect x="20" y="40" width="220" height="150" rx="40" fill="none" stroke={INK} strokeWidth="22" />
        <rect x="320" y="40" width="220" height="150" rx="40" fill="none" stroke={INK} strokeWidth="22" />
        <path d="M240 95 Q280 70 320 95" fill="none" stroke={INK} strokeWidth="20" />
        <circle cx="70" cy="80" r="16" fill={RED} />
        <rect x="0" y="108" width="560" height="10" fill={LIME} opacity="0.9" />
      </svg>
      <div style={{ ...font, position: "absolute", left: 70, top: 640, fontSize: 40, color: LIME, letterSpacing: 0 }}>GLASSES CHECKED · PHONES BUZZED</div>
      <svg style={{ position: "absolute", right: 70, top: 60, rotate: "-10deg" }} width="300" height="185" viewBox="0 0 260 160">
        <path d="M10 80 L120 70 L170 10 L195 10 L170 72 L235 70 L250 45 L262 45 L255 80 L262 115 L250 115 L235 90 L170 88 L195 150 L170 150 L120 90 L10 80 Z" fill={INK} />
      </svg>
      <div style={{ ...font, position: "absolute", right: 60, top: 250, fontSize: 52, color: INK, rotate: "-6deg", border: `7px solid ${RED}`, borderRadius: 12, padding: "2px 16px", background: "rgba(10,11,13,0.85)" }}>PLANES STOPPED</div>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 700, top: 220, width: 560, height: 560 }} />
    </AbsoluteFill>
  );
};

// Variant B: real headlines on screen (AP + JoongAng Daily captures).
const Card: React.FC<{ src: string; w: number; h: number; scale: number; x: number; y: number; rot: number }> = ({ src, w, h, scale, x, y, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 24px 60px rgba(0,0,0,0.65)" }}>
    <Img src={staticFile(src)} style={{ width: w * scale, height: h * scale, display: "block" }} />
  </div>
);

export const Sn01ThumbB: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 90% at 70% 45%, rgba(120,165,20,0.45) 0%, #0A0B0D 70%)" }}>
      <div style={{ ...font, position: "absolute", left: 50, top: 40, fontSize: 60, color: INK }}>KOREA'S COLLEGE EXAM</div>
      <div style={{ ...font, position: "absolute", left: 50, top: 110, fontSize: 200, color: RED, textShadow: "0 8px 0 #000" }}>vs AI</div>
      <Card src="sn01/h-ja.png" w={2219} h={248} scale={0.34} x={40} y={360} rot={-3} />
      <Card src="sn01/h-ap.png" w={2232} h={212} scale={0.34} x={90} y={500} rot={2} />
      <div style={{ ...font, position: "absolute", left: 60, top: 650, fontSize: 30, color: LIME, letterSpacing: 0 }}>REAL HEADLINES · AP · KOREA JOONGANG DAILY</div>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 760, top: 150, width: 560, height: 560 }} />
    </AbsoluteFill>
  );
};
