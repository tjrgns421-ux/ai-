import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// YouTube thumbnail 1280×720 for Blip Check #1.
const LIME = "#D7FF3A";
export const Bc01Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(60% 80% at 70% 45%, rgba(120,165,20,0.45) 0%, #0A0B0D 70%)" }}>
      <div style={{ position: "absolute", left: 56, top: 70, fontFamily: "Pretendard", fontWeight: 900, color: "#F5F5F2", fontSize: 92, lineHeight: 1.02, letterSpacing: -3 }}>
        "Beats Claude<br />at <span style={{ color: LIME }}>5%</span> of<br />the cost"?
      </div>
      <div style={{ position: "absolute", left: 60, top: 470, rotate: "-6deg", fontFamily: "Pretendard", fontWeight: 900, fontSize: 96, color: "#FFC93A", border: "10px solid #FFC93A", borderRadius: 18, padding: "0 28px", background: "rgba(10,11,13,0.85)" }}>
        HALF TRUE
      </div>
      <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 640, top: 60, width: 680, height: 680 }} />
      <div style={{ position: "absolute", right: 36, top: 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: "#0A0B0D", background: LIME, padding: "6px 16px", borderRadius: 10 }}>GPT-6.2</div>
    </AbsoluteFill>
  );
};
