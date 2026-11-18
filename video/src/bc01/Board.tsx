import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../StyleFrames";
import { PeupeuStage, PeupeuPose } from "../mascot/Prompt";

// "Blip Check" long-form (16:9) storyboard: key frames with captions.
// Screenshots in public/bc01 are real captures (SiliconANGLE, OpenAI pricing
// page, Artificial Analysis), cropped; highlights are drawn on top.

const LIME = "#D7FF3A";
const INK = "#F5F5F2";
const BG = "#0A0B0D";

type Box = { x: number; y: number; w: number; h: number };

const Backdrop: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(55% 70% at 50% 40%, rgba(120,165,20,0.28) 0%, ${BG} 70%)` }} />
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  </>
);

// A captured image on a paper card, with marker (text) or ring (chart) highlights.
const Shot: React.FC<{
  src: string;
  w: number;
  h: number;
  scale: number;
  left: number;
  top: number;
  marks?: Box[];
  rings?: Box[];
  tilt?: number;
}> = ({ src, w, h, scale, left, top, marks = [], rings = [], tilt = 0 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: w * scale + 48,
      height: h * scale + 48,
      background: "#fff",
      borderRadius: 18,
      padding: 24,
      boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      rotate: `${tilt}deg`,
    }}
  >
    <div style={{ position: "relative", width: w * scale, height: h * scale }}>
      <Img src={staticFile(src)} style={{ width: w * scale, height: h * scale, display: "block" }} />
      {marks.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: m.x * scale,
            top: m.y * scale,
            width: m.w * scale,
            height: m.h * scale,
            background: LIME,
            mixBlendMode: "multiply",
            borderRadius: 6,
          }}
        />
      ))}
      {rings.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: m.x * scale - 8,
            top: m.y * scale - 8,
            width: m.w * scale + 16,
            height: m.h * scale + 16,
            border: `6px solid #111`,
            outline: `5px solid ${LIME}`,
            borderRadius: 12,
          }}
        />
      ))}
    </div>
  </div>
);

const Source: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 48, top: 40, fontFamily: "Pretendard", fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.55)" }}>
    Source: {text}
  </div>
);

const Cap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 120, right: 120, bottom: 54, textAlign: "center" }}>
    <span
      style={{
        fontFamily: "Pretendard",
        fontWeight: 900,
        fontSize: 54,
        lineHeight: 1.15,
        letterSpacing: -1,
        color: INK,
        textShadow: "0 6px 26px rgba(0,0,0,0.9), 0 3px 0 rgba(0,0,0,0.6)",
      }}
    >
      {children}
    </span>
  </div>
);

const K: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: LIME }}>{children}</span>;

const Blip: React.FC<{ left: number; top: number; size: number; pose: PeupeuPose }> = ({ left, top, size, pose }) => (
  <div style={{ position: "absolute", left, top, width: size, height: size }}>
    <PeupeuStage width={size} height={size} pose={pose} />
  </div>
);

const Stamp: React.FC<{ text: string; left: number; top: number; rot?: number; color?: string; size?: number }> = ({ text, left, top, rot = -8, color = LIME, size = 76 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      rotate: `${rot}deg`,
      fontFamily: "Pretendard",
      fontWeight: 900,
      fontSize: size,
      color,
      border: `8px solid ${color}`,
      borderRadius: 14,
      padding: "6px 26px",
      background: "rgba(10,11,13,0.82)",
      letterSpacing: 2,
    }}
  >
    {text}
  </div>
);

const Tag: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", right: 48, top: 36, fontFamily: "Pretendard", fontWeight: 900, fontSize: 26, color: BG, background: LIME, padding: "6px 14px", borderRadius: 8 }}>
    {text}
  </div>
);

const ModelCard: React.FC<{ name: string; sub: string; price: string; left: number; accent: string }> = ({ name, sub, price, left, accent }) => (
  <div style={{ position: "absolute", left, top: 330, width: 560, height: 420, borderRadius: 28, background: "rgba(255,255,255,0.06)", border: `3px solid ${accent}`, padding: 44 }}>
    <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.6)" }}>GPT-6.2</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 120, color: accent, letterSpacing: -4, lineHeight: 1.05 }}>{name}</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 40, color: INK, marginTop: 14 }}>{sub}</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 600, fontSize: 30, color: "rgba(255,255,255,0.6)", marginTop: 40 }}>{price}</div>
  </div>
);

const F1 = () => (
  <>
    <Source text="SiliconANGLE, Nov 17 2026" />
    <Shot src="bc01/claim.png" w={1512} h={245} scale={0.86} left={90} top={250} tilt={-1.2}
      marks={[{ x: 1028, y: 126, w: 330, h: 52 }, { x: 28, y: 183, w: 925, h: 52 }]} />
    <Blip left={1380} top={430} size={520} pose={{ face: "shock", sweat: 1, rotY: -0.5, scale: 1 }} />
    <Cap>OpenAI says its new model <K>beats Claude</K>… at <K>5% of the cost.</K></Cap>
  </>
);

const F2 = () => (
  <>
    <div style={{ position: "absolute", left: 140, top: 250 }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: LIME }}>BLIP CHECK &gt;_</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 132, color: INK, letterSpacing: -5, lineHeight: 1.02, marginTop: 10 }}>
        GPT-6.2<br />Astra <span style={{ color: "rgba(255,255,255,0.4)" }}>vs</span> Sol
      </div>
    </div>
    <div style={{ position: "absolute", left: 140, top: 640, fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: INK, lineHeight: 1.5 }}>
      {["What actually changed?", "Does it really beat Claude?", "Which one should you use?"].map((q, i) => (
        <div key={q}><span style={{ color: LIME }}>{i + 1}.</span> {q}</div>
      ))}
    </div>
    <Blip left={1160} top={180} size={680} pose={{ face: "prompt", wave: 1.4, rotY: -0.4 }} />
    <Cap>Three questions. <K>Blip checked the receipts.</K></Cap>
  </>
);

const F3 = () => (
  <>
    <Source text="SiliconANGLE, Nov 17 2026" />
    <Shot src="bc01/headline.png" w={1483} h={252} scale={0.62} left={430} top={90} />
    <ModelCard name="Astra" sub="for professional work" price="the big one" left={290} accent={INK} />
    <ModelCard name="Sol" sub="for everyday work" price="the default" left={1070} accent={LIME} />
    <Cap>Two models dropped. <K>Astra</K> for pro work. <K>Sol</K> for everyday stuff.</Cap>
  </>
);

const Chip: React.FC<{ t: string; on?: boolean }> = ({ t, on = true }) => (
  <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, padding: "14px 34px", borderRadius: 999, marginRight: 22, background: on ? LIME : "transparent", color: on ? BG : INK, border: `4px solid ${LIME}` }}>{t}</span>
);

const F4 = () => (
  <>
    <Source text="SiliconANGLE, Nov 17 2026" />
    <div style={{ position: "absolute", left: 140, top: 210, fontFamily: "Pretendard", fontWeight: 800, fontSize: 42, color: "rgba(255,255,255,0.65)" }}>Available in ChatGPT Work + Codex</div>
    <div style={{ position: "absolute", left: 140, top: 300 }}>
      <Chip t="Plus" /><Chip t="Pro" /><Chip t="Enterprise" on={false} /><Chip t="Edu" on={false} />
    </div>
    <div style={{ position: "absolute", left: 140, top: 450, fontFamily: "Pretendard", fontWeight: 700, fontSize: 36, color: "rgba(255,255,255,0.6)" }}>
      Enterprise / Edu → your workspace admin has to switch it on
    </div>
    <Blip left={1300} top={300} size={560} pose={{ face: "happy", wave: 1.2, rotY: -0.5 }} />
    <Cap>Paying for ChatGPT? You <K>probably have both already.</K></Cap>
  </>
);

const F5 = () => (
  <>
    <Source text="OpenAI API pricing page (per 1M tokens)" />
    <Shot src="bc01/price.png" w={1771} h={396} scale={0.78} left={110} top={170}
      rings={[{ x: 0, y: 84, w: 1720, h: 70 }, { x: 0, y: 166, w: 1720, h: 70 }]} />
    <Stamp text="4× THE PRICE" left={1080} top={600} rot={-7} />
    <Cap><K>Astra</K> costs about <K>four times more</K> per token than Sol.</Cap>
  </>
);

const F6 = () => (
  <>
    <Source text="SiliconANGLE, Nov 17 2026" />
    <Shot src="bc01/solcatch.png" w={1512} h={245} scale={0.86} left={90} top={250} tilt={1}
      marks={[{ x: 336, y: 126, w: 692, h: 52 }, { x: 676, y: 183, w: 470, h: 52 }]} />
    <Blip left={1380} top={430} size={520} pose={{ face: "meh", rotY: -0.5 }} />
    <Cap>But for coding, Sol lands <K>within half a point</K>… for <K>a fifth of the price.</K></Cap>
  </>
);

const F7 = () => (
  <>
    <Source text="Artificial Analysis Intelligence Index (independent)" />
    <Shot src="bc01/aa-intel.png" w={910} h={827} scale={0.92} left={150} top={92}
      rings={[{ x: 82, y: 300, w: 64, h: 380 }, { x: 162, y: 300, w: 64, h: 380 }, { x: 562, y: 300, w: 64, h: 380 }]} />
    <div style={{ position: "absolute", left: 1120, top: 220, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: INK, lineHeight: 1.35 }}>
      <div>Claude Fable 5.2 <span style={{ color: LIME }}>65</span></div>
      <div>GPT-6.2 Astra <span style={{ color: LIME }}>62</span></div>
      <div>GPT-6.2 Sol <span style={{ color: LIME }}>57</span></div>
    </div>
    <Cap>On this independent index, <K>Claude Fable 5.2 still scores higher.</K></Cap>
  </>
);

const F8 = () => (
  <>
    <Source text="Artificial Analysis, cost per Intelligence Index task" />
    <Shot src="bc01/aa-cost.png" w={910} h={827} scale={0.92} left={150} top={92}
      rings={[{ x: 170, y: 220, w: 72, h: 500 }, { x: 527, y: 220, w: 72, h: 500 }, { x: 795, y: 50, w: 72, h: 670 }]} />
    <div style={{ position: "absolute", left: 1120, top: 220, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: INK, lineHeight: 1.35 }}>
      <div>Sol <span style={{ color: LIME }}>$1.01</span></div>
      <div>Astra <span style={{ color: LIME }}>$4.00</span></div>
      <div>Fable 5.2 <span style={{ color: "#FF8A7A" }}>$26.54</span></div>
      <div style={{ fontSize: 40, color: "rgba(255,255,255,0.7)", marginTop: 30, lineHeight: 1.3 }}>Astra ≈ <span style={{ color: LIME }}>15%</span> of Claude here.<br />Not 5%. Still way cheaper.</div>
    </div>
    <Cap>But per task, it's <K>way cheaper.</K> That part is real.</Cap>
  </>
);

const Col: React.FC<{ title: string; items: string[]; left: number; accent: string }> = ({ title, items, left, accent }) => (
  <div style={{ position: "absolute", left, top: 190, width: 700 }}>
    <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 72, color: accent, letterSpacing: -2 }}>{title}</div>
    {items.map((t) => (
      <div key={t} style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 46, color: INK, marginTop: 26 }}>
        <span style={{ color: accent }}>›</span> {t}
      </div>
    ))}
  </div>
);

const F9 = () => (
  <>
    <Col title="Start with Sol" items={["Chat & quick answers", "Everyday coding", "Drafts & emails"]} left={150} accent={LIME} />
    <Col title="Switch to Astra" items={["Slides & decks", "Spreadsheets", "Legal / finance docs"]} left={1010} accent={INK} />
    <div style={{ position: "absolute", left: 930, top: 200, width: 4, height: 520, background: "rgba(255,255,255,0.18)" }} />
    <Cap>Start with <K>Sol.</K> Switch to <K>Astra</K> for slides, sheets and pro docs.</Cap>
  </>
);

const F10 = () => (
  <>
    <div style={{ position: "absolute", left: 140, top: 150, fontFamily: "Pretendard", fontWeight: 900, fontSize: 48, color: "rgba(255,255,255,0.65)" }}>Claim: "beats Claude at 5% of the cost"</div>
    <div style={{ position: "absolute", left: 140, top: 300, width: 1000 }}>
      <div style={{ height: 30, borderRadius: 15, background: "linear-gradient(90deg,#FF5A4E,#FFC93A,#D7FF3A)" }} />
      <div style={{ position: "absolute", left: 560, top: -40, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: `40px solid ${INK}`, translate: "-26px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: INK, marginTop: 14 }}>
        <span>HYPE</span><span>REAL</span>
      </div>
    </div>
    <Stamp text="HALF TRUE" left={300} top={470} rot={-6} color="#FFC93A" size={110} />
    <div style={{ position: "absolute", left: 140, top: 700, fontFamily: "Pretendard", fontWeight: 700, fontSize: 36, color: "rgba(255,255,255,0.65)" }}>
      Cheaper: yes. Beats Claude: on OpenAI's pick of benchmark, not this index.
    </div>
    <Blip left={1250} top={200} size={640} pose={{ face: "happy", wave: 1.5, rotY: -0.45 }} />
    <Cap>Blip's verdict: <K>half true.</K> Use Sol, keep your wallet.</Cap>
  </>
);

const Card: React.FC<{ left: number; top: number; rot: number; grade: string; label: string; hide?: boolean }> = ({ left, top, rot, grade, label, hide }) => (
  <div style={{ position: "absolute", left, top, width: 300, height: 380, rotate: `${rot}deg`, background: "#F3F1EA", borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", padding: 28, opacity: hide ? 0.28 : 1 }}>
    <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 24, color: "#555" }}>TEST</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#111", marginTop: 6, lineHeight: 1.2 }}>{label}</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 150, color: grade === "A" ? "#2E9E3E" : "#C0392B", marginTop: 30 }}>{grade}</div>
  </div>
);

const FB = () => (
  <>
    <div style={{ position: "absolute", left: 140, top: 140, fontFamily: "Pretendard", fontWeight: 900, fontSize: 60, color: INK }}>
      Benchmark = <span style={{ color: LIME }}>a test.</span>
    </div>
    <div style={{ position: "absolute", left: 140, top: 230, fontFamily: "Pretendard", fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.65)" }}>
      Hundreds of tests. Each company picks which ones go in the launch post.
    </div>
    <Card left={180} top={380} rot={-6} grade="C" label="Test #41" hide />
    <Card left={420} top={360} rot={3} grade="A" label={"Agents' Last Exam"} />
    <Card left={660} top={390} rot={8} grade="B" label="Test #87" hide />
    <Stamp text="SHOWN" left={430} top={700} rot={-5} size={54} />
    <Blip left={1180} top={300} size={560} pose={{ face: "meh", rotY: -0.5 }} />
    <Cap>Like bringing home only the <K>report card with the A.</K></Cap>
  </>
);

const FRAMES = [F1, F2, F3, F4, F5, F6, FB, F7, F8, F9, F10];

export const Bc01Board: React.FC<{ frame: number }> = ({ frame }) => {
  useFonts();
  const F = FRAMES[frame - 1];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Backdrop />
      <F />
      <Tag text={`BLIP CHECK · ${String(frame).padStart(2, "0")}`} />
    </AbsoluteFill>
  );
};
