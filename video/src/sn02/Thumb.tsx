import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// sn02 thumbnails. No photos of students or test sites.
// v "A": first version (number + 10-year stamp). v "B": "THEY PAY $75,000?" (chosen; title carries the ban).
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.95 };

const Disc: React.FC<{ size: number; x: number; y: number }> = ({ size, x, y }) => (
  <svg width={size} height={size} viewBox="-1 -1 2 2" style={{ position: "absolute", left: x, top: y, rotate: "-34deg" }}>
    <circle r={0.92} fill="#0047A0" />
    <path d="M -0.92 0 A 0.92 0.92 0 0 1 0.92 0 A 0.46 0.46 0 0 1 0 0 A 0.46 0.46 0 0 0 -0.92 0 Z" fill="#CD2E3A" />
  </svg>
);

// a fanned stack of bills, drawn in code
const Cash: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = -10 }) => (
  <svg width={w} height={w * 0.62} viewBox="0 0 240 150" style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg` }}>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`rotate(${(i - 1) * 9} 120 75)`}>
        <rect x="20" y="35" width="200" height="86" rx="10" fill="#7ccf6a" stroke="#0A0B0D" strokeWidth="8" />
        <circle cx="120" cy="78" r="24" fill="#a8e39b" stroke="#0A0B0D" strokeWidth="6" />
        <text x="120" y="92" textAnchor="middle" fontFamily="Pretendard" fontWeight="900" fontSize="40" fill="#0A0B0D">$</text>
      </g>
    ))}
  </svg>
);

export const Sn02Thumb: React.FC<{ v?: "A" | "B" }> = ({ v = "B" }) => {
  useFonts();
  if (v === "A")
    return (
      <AbsoluteFill style={{ background: "radial-gradient(70% 90% at 72% 50%, rgba(120,165,20,0.42) 0%, #0A0B0D 70%)" }}>
        <div style={{ ...font, position: "absolute", left: 56, top: 70, fontSize: 60, color: INK }}>KOREA WANTS TO PAY</div>
        <div style={{ ...font, position: "absolute", left: 44, top: 150, fontSize: 196, color: LIME, letterSpacing: -8, textShadow: "0 10px 0 #000" }}>$75,000</div>
        <div style={{ ...font, position: "absolute", left: 56, top: 370, fontSize: 96, color: INK }}>FOR ONE TIP</div>
        <div style={{ ...font, position: "absolute", left: 60, top: 540, fontSize: 58, color: INK, rotate: "-4deg", border: `8px solid ${RED}`, borderRadius: 14, padding: "6px 20px", background: "rgba(10,11,13,0.85)" }}>
          CHEATERS: <span style={{ color: RED }}>10-YEAR BAN</span>
        </div>
        <Disc size={404} x={850} y={170} />
        <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 790, top: 170, width: 540, height: 540 }} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 90% at 70% 50%, rgba(120,165,20,0.45) 0%, #0A0B0D 70%)" }}>
      <div style={{ ...font, position: "absolute", left: 60, top: 92, fontSize: 112, color: INK }}>THEY PAY</div>
      <div style={{ ...font, position: "absolute", left: 40, top: 225, fontSize: 196, color: LIME, letterSpacing: -9, textShadow: "0 12px 0 #000" }}>$75,000?</div>
      <Cash x={70} y={480} w={300} rot={-8} />
      <Disc size={380} x={905} y={250} />
      <Img src={staticFile("bc01/blip/panic.png")} style={{ position: "absolute", left: 845, top: 215, width: 500, height: 500 }} />
    </AbsoluteFill>
  );
};

// Shorts cover (9:16). Same promise, stacked.
export const Sn02Cover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 55%, rgba(120,165,20,0.45) 0%, #0A0B0D 72%)" }}>
      <div style={{ ...font, position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontSize: 150, color: INK }}>THEY PAY</div>
      <div style={{ ...font, position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontSize: 230, color: LIME, letterSpacing: -10, textShadow: "0 12px 0 #000" }}>$75,000?</div>
      <Disc size={620} x={230} y={820} />
      <Img src={staticFile("bc01/blip/panic.png")} style={{ position: "absolute", left: 140, top: 720, width: 800, height: 800 }} />
      <Cash x={60} y={1440} w={330} rot={-10} />
      <div style={{ ...font, position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontSize: 54, letterSpacing: 0, color: "#0A0B0D" }}>
        <span style={{ background: LIME, padding: "8px 22px", borderRadius: 12 }}>BLIP CHECK &gt;_</span>
      </div>
    </AbsoluteFill>
  );
};
