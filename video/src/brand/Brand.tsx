import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../StyleFrames";
import { PeupeuStage } from "../mascot/Prompt";

// Channel brand images for the English channel "Blip".
// Avatar: 800×800, shown as a circle by YouTube → keep the head in the middle.
// Banner: 2560×1440; the area visible on every device is the central 1546×423.

const LIME = "#D7FF3A";
const BG = "radial-gradient(60% 60% at 50% 45%, rgba(120,165,20,0.55) 0%, #0A0B0D 75%)";

export const BlipAvatar: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", left: -100, top: -20, width: 1000, height: 1000 }}>
        <PeupeuStage width={1000} height={1000} pose={{ face: "prompt", blink: false, wave: 0.9, rotY: -0.18, rotZ: 0.04, scale: 1.15 }} />
      </div>
    </AbsoluteFill>
  );
};

export const BlipBanner: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(45% 60% at 62% 50%, rgba(120,165,20,0.45) 0%, #0A0B0D 70%)" }}>
      {/* subtle grid */}
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      {/* safe area: x 507–2053, y 508–931 */}
      <div style={{ position: "absolute", left: 560, top: 548, width: 1100, height: 350, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 132, color: "#F5F5F2", letterSpacing: -4, lineHeight: 1 }}>
          Blip <span style={{ color: LIME }}>&gt;_</span>
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 62, color: "#F5F5F2", marginTop: 14, letterSpacing: -1 }}>AI tools, actually tested.</div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 36, color: "rgba(255,255,255,0.6)", marginTop: 18 }}>1-Minute Basics · Blip Tests · Comparisons</div>
      </div>
      <div style={{ position: "absolute", left: 1640, top: 470, width: 520, height: 520 }}>
        <PeupeuStage width={520} height={520} pose={{ face: "happy", wave: 1.5, rotY: -0.45, rotZ: 0.05, scale: 1.0 }} />
      </div>
    </AbsoluteFill>
  );
};
