import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";
import MAP from "../../public/mp04/night-map.json";

// mp04 thumbnail: NASA night image of North Korea (2025), border drawn, Pyongyang circled. "PYONGYANG GLOWS".
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const YEL = "#FFC93A";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.92 };
const D = MAP as unknown as { W: number; H: number; nk: string; sk: string; places: Record<string, [number, number]> };

export const Mp04Thumb: React.FC = () => {
  useFonts();
  // view of the image: x 0..1000, y 380..1410 (North Korea + top of the South), scaled into 700x720 on the left
  const vx = 40, vy = 420, vw = 980, vh = 1000;
  const [px, py] = D.places.pyongyang;
  const sx = ((px - vx) / vw) * 700, sy = ((py - vy) / vh) * 720;
  return (
    <AbsoluteFill style={{ background: "#05070f" }}>
      <svg width={700} height={720} viewBox={`${vx} ${vy} ${vw} ${vh}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <image href={staticFile("mp04/night/gf2025.jpg")} x={0} y={0} width={D.W} height={D.H} style={{ filter: "brightness(1.5) contrast(1.2)" }} />
        <path d={D.nk} fill="none" stroke={RED} strokeWidth={5} opacity={0.9} />
        <path d={D.sk} fill="none" stroke="#7FD3FF" strokeWidth={4} opacity={0.6} />
      </svg>
      <div style={{ position: "absolute", left: sx - 70, top: sy - 70, width: 140, height: 140, borderRadius: 70, border: `8px solid ${YEL}`, boxShadow: "0 0 40px rgba(255,201,58,0.8)" }} />
      <div style={{ ...font, position: "absolute", left: 40, top: 40, fontSize: 52, color: RED, letterSpacing: 0, background: "rgba(5,7,15,0.85)", padding: "6px 16px", borderRadius: 10 }}>NORTH KOREA · 2025</div>
      <div style={{ ...font, position: "absolute", right: 40, top: 230, width: 600, textAlign: "right", whiteSpace: "nowrap", fontSize: 98, color: INK, textShadow: "0 8px 0 #000" }}>PYONGYANG</div>
      <div style={{ ...font, position: "absolute", right: 40, top: 360, width: 600, textAlign: "right", whiteSpace: "nowrap", fontSize: 150, color: LIME, textShadow: "0 10px 0 #000", letterSpacing: -6 }}>GLOWS</div>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", right: 40, top: 500, width: 210, height: 210 }} />
    </AbsoluteFill>
  );
};
