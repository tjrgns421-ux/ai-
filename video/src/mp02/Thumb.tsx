import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";
import MAP from "../../public/mp02/china-map.json";

// mp02 thumbnail: China half in daylight (east), half in night (west), Kashgar still dark at 10.
// Title carries "5,200 km" and "one time zone"; thumbnail carries "SUNRISE AT 10 AM?" (100/100 with yt-package).
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const YEL = "#FFC93A";
const BG = "#0A0B0D";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.92 };
const D = MAP as unknown as { china: string; neighbors: string[]; places: Record<string, [number, number]> };

export const Mp02Thumb: React.FC = () => {
  useFonts();
  const vx = 150, vy = 120, vw = 1450, vh = 815; // map units shown in the 1280x720 frame
  const [kx, ky] = D.places.kashgar;
  const px = ((kx - vx) / vw) * 1280, py = ((ky - vy) / vh) * 720;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={1280} height={720} viewBox={`${vx} ${vy} ${vw} ${vh}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="cnT"><path d={D.china} /></clipPath>
          <linearGradient id="sunT" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#05070f" />
            <stop offset="0.48" stopColor="#05070f" />
            <stop offset="0.62" stopColor="#FFC93A" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FFE38A" />
          </linearGradient>
        </defs>
        {D.neighbors.map((p, i) => <path key={i} d={p} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />)}
        <rect x={vx} y={vy} width={vw} height={vh} fill="url(#sunT)" clipPath="url(#cnT)" />
        <path d={D.china} fill="none" stroke={YEL} strokeWidth={4} />
      </svg>
      {/* Kashgar, still dark */}
      <div style={{ position: "absolute", left: px - 16, top: py - 16, width: 32, height: 32, borderRadius: 16, background: YEL, border: `6px solid ${BG}`, boxShadow: `0 0 0 5px ${YEL}` }} />
      <div style={{ ...font, position: "absolute", left: px - 40, top: py + 34, fontSize: 64, letterSpacing: -1, color: INK, background: "rgba(10,11,13,0.9)", padding: "6px 16px", borderRadius: 12 }}>
        <span style={{ fontSize: 30, color: RED }}>sunrise </span>10:12
      </div>
      <div style={{ ...font, position: "absolute", left: 600, top: 380, fontSize: 104, color: INK, textShadow: "0 8px 0 #000", textAlign: "right", width: 640 }}>SUNRISE</div>
      <div style={{ ...font, position: "absolute", left: 470, top: 480, fontSize: 150, color: LIME, textShadow: "0 10px 0 #000", textAlign: "right", width: 770, letterSpacing: -6 }}>AT 10 AM?</div>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 20, top: 450, width: 260, height: 260 }} />
    </AbsoluteFill>
  );
};
