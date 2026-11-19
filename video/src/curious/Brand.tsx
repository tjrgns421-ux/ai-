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

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 260 * s, height: 90 * s, background: "#FFFFFF", borderRadius: 60 * s, opacity: 0.9, boxShadow: `${70 * s}px ${-35 * s}px 0 ${10 * s}px #FFFFFF` }} />
);

/** Banner 2560x1440. Safe area on every device: the middle 1546x423 (x 507-2053, y 508-931). */
export const CmBanner: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: SKY, overflow: "hidden" }}>
      <Cloud x={200} y={260} s={1.4} />
      <Cloud x={2050} y={220} s={1.1} />
      <Cloud x={1200} y={140} s={0.9} />
      {/* ground + road strip below the safe area (seen on TV / desktop only) */}
      <div style={{ position: "absolute", left: 0, top: 1060, width: 2560, height: 380, background: "#8FD16B" }} />
      <div style={{ position: "absolute", left: 0, top: 1130, width: 2560, height: 150, background: "#454B58", borderTop: `8px solid #F5F5F2`, borderBottom: `8px solid #F5F5F2` }} />
      {Array.from({ length: 22 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: i * 130, top: 1200, width: 70, height: 10, background: "#F5F5F2" }} />
      ))}
      {["#FF6B5E", "#FFD23F", "#4FA3FF", "#5BD68A", "#FF9F43"].map((c, i) => (
        <div key={c} style={{ position: "absolute", left: 300 + i * 420, top: 1150, width: 170, height: 70, background: c, borderRadius: 20, border: `6px solid ${INK}` }} />
      ))}
      {/* safe area content */}
      <div style={{ position: "absolute", left: 560, top: 520, width: 1200, height: 400, whiteSpace: "nowrap", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 136, color: "#FFFFFF", letterSpacing: -3, lineHeight: 1, textShadow: outline(6) }}>
          Curious <span style={{ color: YEL }}>Minutes</span>
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 54, color: INK, marginTop: 24 }}>Big questions. Real science. In 3D.</div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 34, color: INK, opacity: 0.65, marginTop: 12 }}>New videos every week · sources on screen</div>
      </div>
      <Img src={staticFile("sprout/excited.png")} style={{ position: "absolute", left: 1580, top: 430, width: 600, height: 600 }} />
    </AbsoluteFill>
  );
};
