import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

const SKY = "linear-gradient(#5BB8FF, #BFE6FF)";
const INK = "#14151B";
const YEL = "#FFD23F";
const outline = (w: number) => `${-w}px 0 ${INK}, ${w}px 0 ${INK}, 0 ${-w}px ${INK}, 0 ${w}px ${INK}, ${-w}px ${-w}px ${INK}, ${w}px ${w}px ${INK}, ${-w}px ${w}px ${INK}, ${w}px ${-w}px ${INK}, 0 ${w * 2}px 0 ${INK}`;

/** Profile image: Sprout on sky blue (shown as a circle, so keep everything inside the middle). */
export const CmAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: SKY }}>
    <Img src={staticFile("sprout/happy.png")} style={{ position: "absolute", left: -110, top: -40, width: 1020, height: 1020 }} />
  </AbsoluteFill>
);

export const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 260 * s, height: 90 * s, background: "#FFFFFF", borderRadius: 60 * s, opacity: 0.9, boxShadow: `${70 * s}px ${-35 * s}px 0 ${10 * s}px #FFFFFF` }} />
);

/** Banner 2560x1440. Safe area on every device: the middle 1546x423 (x 507-2053, y 508-931). */
export const CmBanner: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(55% 70% at 62% 50%, #3A2A1C 0%, #15110D 55%, #0B0907 100%)", overflow: "hidden" }}>
      {/* faint stars and question marks: mysteries */}
      {Array.from({ length: 140 }, (_, i) => {
        const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * 2560, y = (Math.sin(i * 47.3 + 1) * 0.5 + 0.5) * 1440;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 4, height: 4, borderRadius: 2, background: "#FFFFFF", opacity: 0.15 + (i % 5) * 0.08 }} />;
      })}
      {[[260, 300, 180, -12], [2200, 260, 150, 10], [380, 1080, 130, 8], [2120, 1050, 170, -8]].map(([x, y, sz, r], i) => (
        <div key={`q${i}`} style={{ position: "absolute", left: x, top: y, fontFamily: "Pretendard", fontWeight: 900, fontSize: sz, color: YEL, opacity: 0.18, rotate: `${r}deg` }}>?</div>
      ))}
      {/* safe area content */}
      <div style={{ position: "absolute", left: 560, top: 520, width: 1200, height: 400, whiteSpace: "nowrap", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 136, color: "#FFFFFF", letterSpacing: -3, lineHeight: 1, textShadow: outline(6) }}>
          Curious <span style={{ color: YEL }}>Minutes</span>
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 54, color: "#FFFFFF", marginTop: 24 }}>Science mysteries, explained.</div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 34, color: "#FFFFFF", opacity: 0.7, marginTop: 12 }}>Real sources on screen · recreated in 3D</div>
      </div>
      <Img src={staticFile("sprout/think.png")} style={{ position: "absolute", left: 1600, top: 440, width: 560, height: 560, filter: "drop-shadow(0 0 40px rgba(255,190,110,0.35))" }} />
    </AbsoluteFill>
  );
};
