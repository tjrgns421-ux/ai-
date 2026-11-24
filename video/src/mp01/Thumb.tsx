import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";
import MAP from "../../public/mp01/korea-map.json";

// mp01 thumbnail: the peninsula with the 38th parallel crossed out and three versions of the real line.
// Title carries "38th parallel"; thumbnail carries "3 VERSIONS?" (98/100 with yt-package).
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const BLUE = "#7FD3FF";
const YEL = "#FFC93A";
const BG = "#0A0B0D";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.92 };
const D = MAP as unknown as { north: string; south: string; border: string; parallel38: string; neighbors: string[] };

export const Mp01Thumb: React.FC = () => {
  useFonts();
  // camera on the DMZ, left half of the frame
  const vx = 300, vy = 230, vw = 380, vh = 520;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 90% at 30% 50%, rgba(120,165,20,0.35) 0%, ${BG} 70%)` }}>
      <svg width={640} height={720} viewBox={`${vx} ${vy} ${vw} ${vh}`} style={{ position: "absolute", left: 0, top: 0 }}>
        {D.neighbors.map((p, i) => <path key={i} d={p} fill="rgba(255,255,255,0.06)" />)}
        <path d={D.north} fill="rgba(255,77,61,0.35)" stroke={RED} strokeWidth={1.2} />
        <path d={D.south} fill="rgba(215,255,58,0.28)" stroke={LIME} strokeWidth={1.2} />
        <path d={D.parallel38} fill="none" stroke={YEL} strokeWidth={2.4} strokeDasharray="7 5" />
        {[-2.2, 0, 2.2].map((o, i) => (
          <path key={i} d={D.border} transform={`translate(${o * 0.6}, ${o})`} fill="none" stroke={[LIME, BLUE, RED][i]} strokeWidth={2.6} />
        ))}
      </svg>
      {/* the 38th parallel label, crossed out */}
      <div style={{ ...font, position: "absolute", left: 30, top: 366, fontSize: 50, letterSpacing: -1, color: BG, background: YEL, padding: "6px 14px", borderRadius: 10 }}>
        38°N
        <div style={{ position: "absolute", left: -8, right: -8, top: "48%", height: 8, background: RED, rotate: "-8deg", borderRadius: 4 }} />
      </div>
      <div style={{ ...font, position: "absolute", left: 620, top: 120, fontSize: 260, color: LIME, letterSpacing: -9, textShadow: "0 12px 0 #000" }}>3</div>
      <div style={{ ...font, position: "absolute", left: 610, top: 380, fontSize: 118, color: INK, letterSpacing: -4, textShadow: "0 10px 0 #000" }}>VERSIONS?</div>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 930, top: 60, width: 300, height: 300 }} />
    </AbsoluteFill>
  );
};
