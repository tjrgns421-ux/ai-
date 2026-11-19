import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// Curious Minutes ep01 thumbnail: "NOBODY CRASHED". Bright sky + a jammed road, Sprout shocked.
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };

const Car: React.FC<{ x: number; color: string; flip?: boolean }> = ({ x, color }) => (
  <svg width={190} height={110} viewBox="0 0 190 110" style={{ position: "absolute", left: x, top: 500 }}>
    <path d="M14 70 L30 34 Q36 22 52 22 L120 22 Q134 22 142 34 L162 58 L178 62 Q186 64 186 74 L186 84 L6 84 L6 74 Q6 70 14 70 Z" fill={color} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
    <path d="M44 34 L58 30 L92 30 L92 56 L36 56 Z" fill="#CFEFFF" stroke={INK} strokeWidth="5" />
    <path d="M102 30 L120 30 Q128 30 134 38 L148 56 L102 56 Z" fill="#CFEFFF" stroke={INK} strokeWidth="5" />
    <rect x="2" y="64" width="16" height="12" rx="3" fill="#FF3B30" stroke={INK} strokeWidth="4" />
    <circle cx="8" cy="70" r="16" fill="#FF3B30" opacity="0.35" />
    {[44, 146].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={86} r={18} fill={INK} />
        <circle cx={cx} cy={86} r={7} fill="#9AA0AA" />
      </g>
    ))}
  </svg>
);

export const CmEp01Thumb: React.FC = () => {
  useFonts();
  const cars = ["#FF6B5E", "#FFD23F", "#4FA3FF", "#5BD68A", "#FF9F43", "#FF6B5E"];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#6EC1FF 0%, #BFE6FF 62%)" }}>
      {/* road */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, bottom: 0, background: "#3B404C", borderTop: `8px solid ${INK}` }} />
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 20 + i * 150, top: 660, width: 80, height: 12, borderRadius: 6, background: "#F5F5F2" }} />
      ))}
      {cars.map((c, i) => <Car key={i} x={-60 + i * 150} color={c} />)}
      <div style={{ ...word, left: 48, top: 54, fontSize: 168, color: "#FFFFFF", textShadow: outline(6) }}>NOBODY</div>
      <div style={{ ...word, left: 40, top: 220, fontSize: 168, color: "#FFD23F", textShadow: outline(6), rotate: "-3deg" }}>CRASHED</div>
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 860, top: 235, width: 520, height: 520 }} />
      <div style={{ ...word, left: 1120, top: 170, fontSize: 116, color: "#FF3B30", textShadow: outline(5), rotate: "12deg" }}>?!</div>
    </AbsoluteFill>
  );
};
