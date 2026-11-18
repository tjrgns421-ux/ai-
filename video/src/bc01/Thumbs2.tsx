import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";

// Bolder thumbnail variants for Blip Check #1 (1280×720). Only numbers shown in the video.
const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const RED = "#FF4D3D";
const BG = "#0A0B0D";
const font: React.CSSProperties = { fontFamily: "Pretendard", fontWeight: 900, letterSpacing: -3, lineHeight: 0.95 };

// A: price fight — $4 vs $26
const A: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 720, background: "radial-gradient(70% 70% at 40% 50%, rgba(120,165,20,0.55), #0A0B0D 75%)" }} />
    <div style={{ position: "absolute", left: 640, top: 0, width: 640, height: 720, background: "radial-gradient(70% 70% at 60% 50%, rgba(255,77,61,0.45), #0A0B0D 75%)" }} />
    <div style={{ ...font, position: "absolute", left: 40, top: 40, fontSize: 64, color: INK }}>GPT-6.2</div>
    <div style={{ ...font, position: "absolute", right: 40, top: 40, fontSize: 64, color: INK }}>CLAUDE</div>
    <div style={{ ...font, position: "absolute", left: 40, top: 170, fontSize: 230, color: LIME }}>$4</div>
    <div style={{ ...font, position: "absolute", right: 30, top: 170, fontSize: 230, color: RED }}>$26</div>
    <div style={{ ...font, position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontSize: 80, color: INK }}>VS</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 800, position: "absolute", left: 50, top: 400, fontSize: 34, color: "rgba(255,255,255,0.7)" }}>per task</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 800, position: "absolute", right: 50, top: 400, fontSize: 34, color: "rgba(255,255,255,0.7)" }}>per task</div>
    <div style={{ ...font, position: "absolute", left: 40, bottom: 50, fontSize: 70, color: INK, background: BG, padding: "10px 22px", border: `6px solid ${INK}`, borderRadius: 14 }}>BUT WHO WINS?</div>
    <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 400, top: 230, width: 500, height: 500 }} />
  </AbsoluteFill>
);

// B: the receipt — 5% crossed out, 15% in red
const Bv: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(60% 80% at 70% 50%, rgba(120,165,20,0.45), #0A0B0D 70%)" }}>
    <div style={{ position: "absolute", left: 70, top: 60, width: 520, height: 620, background: "#F4F1E8", rotate: "-5deg", boxShadow: "0 30px 70px rgba(0,0,0,0.6)", padding: 36, boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 30, color: "#555", letterSpacing: 2 }}>THE CLAIM</div>
      <div style={{ borderTop: "4px dashed #999", margin: "18px 0" }} />
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 34, color: "#333" }}>Cost vs Claude</div>
      <div style={{ position: "relative", ...font, fontSize: 200, color: "#222", marginTop: 20 }}>
        5%
        <div style={{ position: "absolute", left: -10, top: 88, width: 320, height: 22, background: RED, rotate: "-8deg", borderRadius: 6 }} />
      </div>
      <div style={{ ...font, fontSize: 150, color: RED, rotate: "-6deg", marginTop: 10, marginLeft: 40 }}>15%?</div>
    </div>
    <div style={{ ...font, position: "absolute", left: 640, top: 70, fontSize: 96, color: INK }}>I CHECKED<br />THE <span style={{ color: LIME }}>RECEIPT</span></div>
    <Img src={staticFile("bc01/blip/shock.png")} style={{ position: "absolute", left: 700, top: 230, width: 560, height: 560 }} />
  </AbsoluteFill>
);

// C: one test — big A report card with "ONLY ONE TEST"
const C: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(60% 80% at 30% 50%, rgba(120,165,20,0.4), #0A0B0D 70%)" }}>
    <div style={{ ...font, position: "absolute", left: 50, top: 50, fontSize: 92, color: INK }}>"BEATS<br />CLAUDE"</div>
    <div style={{ position: "absolute", left: 80, top: 300, width: 300, height: 380, background: "#F4F1E8", rotate: "-6deg", borderRadius: 16, padding: 26, boxSizing: "border-box", boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#555" }}>TEST #1 of 100s</div>
      <div style={{ ...font, fontSize: 230, color: "#2E9E3E", marginTop: 30 }}>A</div>
    </div>
    <div style={{ ...font, position: "absolute", left: 400, top: 360, fontSize: 70, color: "#FFC93A", rotate: "-6deg", border: "9px solid #FFC93A", borderRadius: 16, padding: "6px 24px", background: "rgba(10,11,13,0.85)" }}>ON ONE TEST</div>
    <Img src={staticFile("bc01/blip/meh.png")} style={{ position: "absolute", left: 800, top: 130, width: 560, height: 560 }} />
    <div style={{ ...font, position: "absolute", right: 36, top: 30, fontSize: 34, color: BG, background: LIME, padding: "6px 16px", borderRadius: 10, letterSpacing: 0 }}>GPT-6.2</div>
  </AbsoluteFill>
);


// D: versus — Claude (left) vs GPT-6.2 (right), Blip in the middle thinking
const D: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 700, height: 720, clipPath: "polygon(0 0, 100% 0, 82% 100%, 0 100%)", background: "radial-gradient(80% 80% at 30% 45%, #E0855F 0%, #A9502F 55%, #3A1A10 100%)" }} />
    <div style={{ position: "absolute", left: 580, top: 0, width: 700, height: 720, clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)", background: "radial-gradient(80% 80% at 70% 45%, #2B3A33 0%, #111614 60%, #050606 100%)" }} />
    <Img src={staticFile("bc01/logo-claude.svg")} style={{ position: "absolute", left: 70, top: 70, width: 230, height: 230, filter: "brightness(0) invert(1) drop-shadow(0 10px 30px rgba(0,0,0,0.35))" }} />
    <Img src={staticFile("bc01/logo-openai.svg")} style={{ position: "absolute", right: 70, top: 70, width: 230, height: 230, filter: "invert(1) drop-shadow(0 10px 30px rgba(0,0,0,0.5))" }} />
    <div style={{ ...font, position: "absolute", left: 60, top: 330, fontSize: 120, color: INK, textShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>CLAUDE</div>
    <div style={{ ...font, position: "absolute", right: 60, top: 330, fontSize: 120, color: INK, textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>GPT-6.2</div>
    <div style={{ ...font, position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontSize: 110, color: LIME, textShadow: "0 0 40px rgba(215,255,58,0.6), 0 6px 0 #000" }}>VS</div>
    <Img src={staticFile("bc01/blip/think.png")} style={{ position: "absolute", left: 390, top: 250, width: 500, height: 500 }} />
    {[["?", 560, 220, -12, 90], ["?", 700, 190, 10, 110], ["?", 790, 260, 18, 70]].map(([t, x, y, r, sz], i) => (
      <div key={i} style={{ ...font, position: "absolute", left: x as number, top: y as number, rotate: `${r}deg`, fontSize: sz as number, color: INK, textShadow: "0 6px 0 #000" }}>{t}</div>
    ))}
    <div style={{ ...font, position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center" }}>
      <span style={{ fontSize: 70, color: BG, background: LIME, padding: "8px 28px", borderRadius: 14, letterSpacing: -1 }}>5% OF THE COST?</span>
    </div>
  </AbsoluteFill>
);

export const Bc01ThumbV: React.FC<{ v: "A" | "B" | "C" | "D" }> = ({ v }) => {
  useFonts();
  return v === "A" ? <A /> : v === "B" ? <Bv /> : v === "C" ? <C /> : <D />;
};
