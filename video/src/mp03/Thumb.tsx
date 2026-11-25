import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// mp03 thumbnail: the two Diomedes from space (ASTER, public domain), the line between them, "TOMORROW IS THERE".
// Title carries "2.4 miles" and "can you see it?"; thumbnail carries the date-line twist.
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const BLUE = "#7FD3FF";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.92 };

export const Mp03Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#05070a", overflow: "hidden" }}>
      {/* aster.jpg is 900x720: Big Diomede (left), Little Diomede (right) */}
      <Img src={staticFile("mp03/photos/aster.jpg")} style={{ position: "absolute", left: -10, top: 120, width: 720, height: 576, filter: "saturate(1.15) contrast(1.1)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 720, height: 720, background: "linear-gradient(90deg, rgba(5,7,10,0) 80%, #05070a 100%)" }} />
      <div style={{ position: "absolute", left: 404, top: 110, height: 610, borderLeft: "8px dashed " + LIME }} />
      <div style={{ ...font, position: "absolute", left: 30, top: 30, fontSize: 52, color: RED, background: "rgba(5,7,10,0.85)", padding: "6px 16px", borderRadius: 10, letterSpacing: 0 }}>RUSSIA · TUE</div>
      <div style={{ ...font, position: "absolute", left: 430, top: 30, fontSize: 52, color: BLUE, background: "rgba(5,7,10,0.85)", padding: "6px 16px", borderRadius: 10, letterSpacing: 0 }}>USA · MON</div>
      <div style={{ ...font, position: "absolute", right: 44, top: 200, width: 600, textAlign: "right", whiteSpace: "nowrap", fontSize: 104, color: INK, textShadow: "0 8px 0 #000" }}>TOMORROW</div>
      <div style={{ ...font, position: "absolute", right: 30, top: 320, width: 600, textAlign: "right", whiteSpace: "nowrap", fontSize: 128, color: LIME, textShadow: "0 10px 0 #000", letterSpacing: -6 }}>IS THERE</div>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", right: 40, top: 480, width: 220, height: 220 }} />
    </AbsoluteFill>
  );
};
