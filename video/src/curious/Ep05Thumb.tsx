import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// Curious Minutes ep05 thumbnail: "NOT A MONSTER" — an iceberg cut at the waterline (small tip, huge keel)
// sending out yellow sound rings; Sprout in a corner. Drawn in 2D so it stays sharp at feed size.
const INK = "#14151B";
const outline = (w: number) => `${w}px ${w}px 0 ${INK}, -${w}px ${w}px 0 ${INK}, ${w}px -${w}px 0 ${INK}, -${w}px -${w}px 0 ${INK}, 0 ${w + 4}px 0 ${INK}`;
const word: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -4, lineHeight: 0.9, position: "absolute" };
const WL = 150; // waterline y

export const CmEp05Thumb: React.FC = () => {
  useFonts();
  const tip = "820,150 860,92 905,70 960,84 1010,60 1060,96 1100,150";
  const keel = "760,150 1160,150 1215,250 1190,380 1235,480 1150,600 1040,660 930,640 820,590 760,470 720,360 745,250";
  const facets = [
    "760,150 905,150 860,300 745,250", "905,150 1060,150 1010,290 860,300", "1060,150 1160,150 1215,250 1010,290",
    "745,250 860,300 820,450 720,360", "860,300 1010,290 1060,450 820,450", "1010,290 1215,250 1190,380 1060,450",
    "720,360 820,450 820,590 760,470", "820,450 1060,450 1040,660 930,640 820,590", "1060,450 1190,380 1235,480 1150,600 1040,660",
  ];
  const shades = ["#BDEBFF", "#9FDFFF", "#7FCBEF", "#8AD3F3", "#6CBDE6", "#58AEDC", "#4E9FD0", "#3F8FC2", "#347FB2"];
  return (
    <AbsoluteFill style={{ background: "#020B14" }}>
      <svg width={1280} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5FA9D6" /><stop offset="1" stopColor="#BFE3F5" /></linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0F5E8E" /><stop offset="0.55" stopColor="#06253F" /><stop offset="1" stopColor="#020B14" /></linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#7FE3FF" stopOpacity="0.35" /><stop offset="1" stopColor="#7FE3FF" stopOpacity="0" /></radialGradient>
        </defs>
        <rect x={0} y={0} width={1280} height={WL} fill="url(#sky)" />
        <rect x={0} y={WL} width={1280} height={720 - WL} fill="url(#sea)" />
        <ellipse cx={980} cy={400} rx={420} ry={330} fill="url(#glow)" />
        {[120, 200, 290, 390].map((r, i) => (
          <circle key={r} cx={1010} cy={420} r={r} fill="none" stroke="#FFD23F" strokeWidth={10 - i * 2} opacity={0.85 - i * 0.18} strokeDasharray={i % 2 ? "26 18" : undefined} />
        ))}
        <polygon points={keel} fill="#6CBDE6" />
        {facets.map((p, i) => <polygon key={i} points={p} fill={shades[i]} stroke="#DDF5FF" strokeOpacity={0.35} strokeWidth={2} />)}
        <polygon points={tip} fill="#F4FBFF" stroke="#C9E8F7" strokeWidth={2} />
        <polygon points="905,70 960,84 940,150 880,150" fill="#DDEFF8" />
        <rect x={0} y={WL - 3} width={1280} height={6} fill="#E6F6FF" opacity={0.85} />
        {/* crack */}
        <polyline points="1010,60 990,130 1030,230 1000,330 1050,430" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(2,11,20,0.88) 0%, rgba(2,11,20,0.4) 38%, rgba(2,11,20,0) 55%)" }} />
      <div style={{ ...word, left: 44, top: 210, fontSize: 176, color: "#FFFFFF", textShadow: outline(6) }}>NOT A</div>
      <div style={{ ...word, left: 40, top: 400, fontSize: 176, color: "#FFD23F", textShadow: outline(6), rotate: "-3deg" }}>MONSTER</div>
      <Img src={staticFile("sprout/shock.png")} style={{ position: "absolute", left: 1060, top: 520, width: 200, height: 200 }} />
    </AbsoluteFill>
  );
};
