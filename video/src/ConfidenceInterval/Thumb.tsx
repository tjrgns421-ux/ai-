import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";
import { C, FONT } from "./theme";

// 1280x720 episode thumbnail: archival image right, dark fade left, big amber number + word, meter WITHOUT a number.
export const CiThumb: React.FC<{ img: string; num: string; word: string; fill: number; band: [number, number]; imgStyle?: React.CSSProperties }> = ({ img, num, word, fill, band, imgStyle }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Img src={staticFile(img)} style={{ position: "absolute", right: -40, top: -60, height: 860, filter: "sepia(0.25) contrast(1.15) brightness(0.95)", ...imgStyle }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #141413 32%, rgba(20,20,19,0.55) 62%, rgba(20,20,19,0.15) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 75% 45%, rgba(20,20,19,0) 30%, rgba(20,20,19,0.9) 95%)" }} />
      <div style={{ position: "absolute", left: 70, top: 150, fontFamily: FONT, fontWeight: 900, fontSize: 200, lineHeight: 0.9, color: C.ink, letterSpacing: -6 }}>
        <span style={{ color: C.amber }}>{num}</span>
        <br />
        {word}
      </div>
      <div style={{ position: "absolute", left: 76, top: 560, width: 560 }}>
        <div style={{ height: 30, background: C.line, borderRadius: 15, position: "relative" }}>
          <div style={{ width: `${fill}%`, height: "100%", background: C.amber, borderRadius: 15 }} />
          <div style={{ position: "absolute", left: `${band[0]}%`, width: `${band[1] - band[0]}%`, top: -26, bottom: -26, background: "rgba(241,239,232,0.13)", border: "3px solid rgba(241,239,232,0.6)", borderRadius: 6 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Ci02Thumb: React.FC = () => <CiThumb img="ci02/img/ruins.jpg" num="60%" word="ALIVE" fill={60} band={[45, 74]} imgStyle={{ top: -40, height: 980 }} />;
