import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../../StyleFrames";
import { C, FONT } from "../theme";

// 1280x720 thumbnail: f1r, heavy vignette, amber meter WITHOUT a number, "1% FAKE".
export const Ci01Thumb: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Img src={staticFile("ci01/img/f1r.jpg")} style={{ position: "absolute", right: -40, top: -120, height: 1000, filter: "sepia(0.2) contrast(1.15) brightness(0.95)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #141413 30%, rgba(20,20,19,0.55) 62%, rgba(20,20,19,0.15) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 75% 45%, rgba(20,20,19,0) 30%, rgba(20,20,19,0.9) 95%)" }} />
      <div style={{ position: "absolute", left: 70, top: 150, fontFamily: FONT, fontWeight: 900, fontSize: 200, lineHeight: 0.9, color: C.ink, letterSpacing: -6 }}>
        <span style={{ color: C.amber }}>1%</span>
        <br />
        FAKE
      </div>
      {/* meter graphic, no number */}
      <div style={{ position: "absolute", left: 76, top: 560, width: 560 }}>
        <div style={{ height: 30, background: C.line, borderRadius: 15, position: "relative" }}>
          <div style={{ width: "65%", height: "100%", background: C.amber, borderRadius: 15 }} />
          <div style={{ position: "absolute", left: "50%", top: -26, bottom: -26, width: (78 - 50) * 5.6, background: "rgba(241,239,232,0.13)", border: "3px solid rgba(241,239,232,0.6)", borderRadius: 6 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
