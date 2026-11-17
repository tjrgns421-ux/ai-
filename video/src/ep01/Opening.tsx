import React from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useFonts } from "../StyleFrames";
import { PeupeuStage, PeupeuPose } from "../mascot/Prompt";

// ep01 opening (script lines 1–5) as motion graphics at the reference shorts' level:
// atmospheric light, grain, depth, 3D cards, impact moments and SFX.
// Timing follows the measured narration pace (6.6 syllables/sec).

const FPS = 30;
const SPS = 6.6;
const C = { ink: "#0A0B0D", white: "#F5F5F2", lime: "#D7FF3A", red: "#FF3B30", gray: "#8A8F98" };

const syl = (s: string) => {
  const ai = (s.match(/AI/g) || []).length * 4;
  const hangul = (s.match(/[가-힣]/g) || []).length;
  return ai + hangul;
};

type Chunk = { text: string; color?: string };
type Line = { scene: SceneId; chunks: Chunk[] };
type SceneId = "hook" | "reason" | "example" | "tell" | "three";

const LINES: Line[] = [
  { scene: "hook", chunks: [{ text: "AI한테" }, { text: "'글 써줘' 하는 순간," }, { text: "그 글은" }, { text: "망했어요.", color: C.red }] },
  { scene: "reason", chunks: [{ text: "재료 없이" }, { text: "시키면," }, { text: "AI는 제일" }, { text: "평범한 문장을", color: C.lime }, { text: "쓰거든요." }] },
  { scene: "example", chunks: [{ text: "카페 홍보글이면," }, { text: "'따뜻한 공간,'", color: "#FF8A80" }, { text: "'특별한 커피.'", color: "#FF8A80" }, { text: "이런 거요." }] },
  { scene: "tell", chunks: [{ text: "바로 티 나죠.", color: C.red }] },
  { scene: "three", chunks: [{ text: "그래서 딱" }, { text: "세 가지만", color: C.lime }, { text: "바꿔 볼게요." }] },
];

// Timeline in frames: each line lasts syllables / SPS, chunks split by syllables.
const GAP = 0.1;
type TChunk = Chunk & { start: number; end: number };
type TLine = Line & { start: number; end: number; tchunks: TChunk[] };
const buildTimeline = () => {
  let t = 0;
  const lines: TLine[] = LINES.map((l) => {
    const total = l.chunks.reduce((a, c) => a + syl(c.text), 0);
    const dur = total / SPS;
    let ct = t;
    const tchunks = l.chunks.map((c) => {
      const d = (syl(c.text) / total) * dur;
      const r = { ...c, start: Math.round(ct * FPS), end: Math.round((ct + d) * FPS) };
      ct += d;
      return r;
    });
    const r = { ...l, start: Math.round(t * FPS), end: Math.round((t + dur) * FPS), tchunks };
    t += dur + GAP;
    return r;
  });
  return { lines, total: Math.round((t + 1.0) * FPS) };
};
export const TIMELINE = buildTimeline();
export const OPENING_DURATION = TIMELINE.total;
const L = TIMELINE.lines;

// Scenes: example + tell share one scene (the "tell" is a beat on the same bubble).
const SCENES = [
  { id: "hook", start: L[0].start, end: L[1].start },
  { id: "reason", start: L[1].start, end: L[2].start },
  { id: "example", start: L[2].start, end: L[4].start },
  { id: "three", start: L[4].start, end: OPENING_DURATION },
] as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

// ---------- shared layers ----------

const Atmosphere: React.FC<{ tint: string; tint2?: string; strength?: number }> = ({ tint, tint2 = tint, strength = 1 }) => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 45) * 6;
  const y = 36 + Math.cos(f / 60) * 4;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.ink,
        backgroundImage: `radial-gradient(70% 42% at ${x}% ${y}%, ${tint} 0%, transparent 70%), radial-gradient(60% 35% at ${100 - x}% 92%, ${tint2} 0%, transparent 72%)`,
        opacity: strength,
      }}
    />
  );
};

const Dust: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(38).fill(0).map((_, i) => {
        const x = random(`dx${i}`) * 1080 + Math.sin((f + i * 20) / 50) * 20;
        const sp = 0.4 + random(`ds${i}`) * 1.3;
        const y = (((random(`dy${i}`) * 1920 - f * sp) % 1920) + 1920) % 1920;
        const s = 2 + random(`dz${i}`) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: 99,
              background: "#fff",
              opacity: 0.12 + random(`do${i}`) * 0.25,
              filter: `blur(${s > 5 ? 2 : 0.5}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile("fx/grain.png")})`,
        backgroundSize: "512px 512px",
        backgroundPosition: `${Math.floor(random(`gx${f}`) * 512)}px ${Math.floor(random(`gy${f}`) * 512)}px`,
        opacity: 0.09,
        mixBlendMode: "overlay",
      }}
    />
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 50%, rgba(0,0,0,0.7) 100%)" }} />
);

const CutFlash: React.FC = () => {
  const f = useCurrentFrame();
  const o = SCENES.slice(1).reduce((a, s) => a + interpolate(f, [s.start - 2, s.start, s.start + 7], [0, 0.18, 0], clamp), 0);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "screen" }} />;
};

// Transition wrapper: push-in blur on enter, zoom-through blur on exit.
const SceneWrap: React.FC<{ dur: number; noIn?: boolean; children: React.ReactNode }> = ({ dur, noIn, children }) => {
  const f = useCurrentFrame();
  const inT = noIn ? 1 : interpolate(f, [0, 8], [0, 1], { ...clamp, easing: outExpo });
  const outT = interpolate(f, [dur - 1, dur + 6], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill
      style={{
        scale: String((0.93 + 0.07 * inT) * (1 + 0.14 * outT)),
        filter: `blur(${(1 - inT) * 16 + outT * 18}px)`,
        opacity: Math.min(1, inT * 1.6) * (1 - outT),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const chunks = L.flatMap((l) => l.tchunks);
  const cur = chunks.find((c) => f >= c.start && f < c.end + 2) ?? (f >= chunks[chunks.length - 1].start ? chunks[chunks.length - 1] : null);
  if (!cur) return null;
  const lf = f - cur.start;
  return (
    <div style={{ position: "absolute", top: 1360, width: "100%", textAlign: "center", wordBreak: "keep-all" }}>
      <span
        style={{
          display: "inline-block",
          fontFamily: "Pretendard",
          fontWeight: 900,
          fontSize: 104,
          letterSpacing: -3,
          color: cur.color ?? C.white,
          textShadow: "0 6px 30px rgba(0,0,0,0.75), 0 3px 0 rgba(0,0,0,0.55)",
          opacity: interpolate(lf, [0, 2], [0, 1], clamp),
          scale: String(interpolate(lf, [0, 5], [0.84, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })),
          translate: `0px ${interpolate(lf, [0, 5], [22, 0], { ...clamp, easing: outExpo })}px`,
        }}
      >
        {cur.text}
      </span>
    </div>
  );
};

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 1 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={30} layout="none">
    <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

const glass: React.CSSProperties = {
  background: "linear-gradient(170deg, rgba(255,255,255,0.13), rgba(255,255,255,0.035))",
  border: "1.5px solid rgba(255,255,255,0.2)",
  boxShadow: "0 40px 120px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.28)",
};


// ---------- 프프 (channel mascot) ----------

const Peupeu: React.FC<{ left: number; top: number; w?: number; h?: number; pose: PeupeuPose; appear: number }> = ({ left, top, w = 600, h = 520, pose, appear }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: w,
      height: h,
      scale: String(interpolate(appear, [0, 1], [0.2, 1])),
      opacity: interpolate(appear, [0, 0.15], [0, 1], clamp),
      transformOrigin: "50% 85%",
    }}
  >
    <PeupeuStage width={w} height={h} pose={pose} />
  </div>
);

// squash / stretch / arc for a jump starting at frame k=0
const jumpPose = (k: number, height: number) => {
  if (k < 0) return { jump: 0, sx: 1, sy: 1, air: false };
  const t = (k - 3) / 12;
  const air = t > 0 && t < 1;
  const jump = air ? height * Math.sin(Math.PI * t) : 0;
  const sy = k < 3 ? interpolate(k, [0, 3], [1, 0.8]) : air ? 1.08 : interpolate(k, [15, 17, 21], [0.86, 1.04, 1], clamp);
  const sx = 1 / Math.sqrt(sy);
  return { jump, sx, sy, air };
};

// ---------- scene 1: hook ----------

const HOOK_TEXT = ["글", " ", "써", "줘"];
const hookT = () => {
  const c = L[0].tchunks;
  return { send: c[2].start - L[0].start - 3, stamp: c[3].start - L[0].start };
};


const PeupeuInHook: React.FC<{ stamp: number; send: number }> = ({ stamp, send }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = f - stamp;
  const appear = spring({ frame: f - 5, fps, config: { damping: 11, stiffness: 170 } });
  const j = jumpPose(k, 0.6);
  const shocked = k >= 0;
  const lean = f >= send && !shocked ? interpolate(f - send, [0, 6], [0, -0.08], clamp) : 0;
  return (
    <Peupeu
      left={40}
      top={830}
      appear={appear}
      pose={{
        face: shocked ? "shock" : "prompt",
        blink: f % 16 >= 9,
        wave: shocked ? (j.air ? 1.7 : 1.2) : 0.5,
        leftLift: shocked ? (j.air ? 1 : 0.6) : 0,
        sweat: shocked ? interpolate(k, [6, 12], [0, 1], clamp) : 0,
        jump: j.jump,
        sx: j.sx,
        sy: j.sy,
        rotY: 0.35,
        rotZ: shocked ? 0.06 + Math.sin(k / 1.5) * 0.04 * Math.max(0, 1 - k / 20) : 0.06 + lean,
        scale: 1.15,
      }}
    />
  );
};

const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { send, stamp } = hookT();
  const k = f - stamp;
  const shake = k >= 0 && k < 12 ? (1 - k / 12) * 32 : 0;
  const sx = (random(`sx${f}`) - 0.5) * shake;
  const sy = (random(`sy${f}`) - 0.5) * shake;
  const typed = HOOK_TEXT.slice(0, Math.max(0, Math.floor((f - 2) / 3) + 1)).join("");
  const sendP = f - send;
  const btnScale = sendP < 0 ? 1 : interpolate(sendP, [0, 3, 8, 12], [1, 0.82, 1.12, 1], clamp);
  const st = spring({ frame: k, fps, config: { damping: 11, stiffness: 240, mass: 0.6 } });
  const redOn = interpolate(k, [0, 4], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(70,95,140,0.55)" tint2="rgba(40,50,80,0.5)" />
      <AbsoluteFill style={{ opacity: redOn }}>
        <Atmosphere tint="rgba(190,30,25,0.6)" tint2="rgba(120,10,10,0.55)" />
      </AbsoluteFill>
      <AbsoluteFill style={{ scale: String(interpolate(f, [0, dur], [1, 1.07], clamp)), translate: `${sx}px ${sy}px` }}>
        <AbsoluteFill style={{ perspective: 1800 }}>
          <div
            style={{
              position: "absolute",
              left: 90,
              top: 640,
              width: 900,
              transform: `rotateX(${interpolate(f, [0, 40], [18, 7], { ...clamp, easing: outExpo })}deg) rotateY(${interpolate(f, [0, 40], [-12, -4], { ...clamp, easing: outExpo })}deg) translateY(${interpolate(f, [0, 12], [140, 0], { ...clamp, easing: outExpo }) - (sendP >= 0 ? interpolate(sendP, [0, 4, 12], [0, 14, 0], clamp) : 0)}px)`,
              opacity: interpolate(f, [0, 5], [0, 1], clamp),
            }}
          >
            <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.55)", letterSpacing: 2, marginBottom: 22, paddingLeft: 10 }}>새 채팅</div>
            <div style={{ ...glass, borderRadius: 44, height: 220, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px 0 56px", position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
                  translate: `${interpolate(f, [4, 26], [-1000, 1000], clamp)}px 0px`,
                }}
              />
              <span style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 96, color: C.white, letterSpacing: -2 }}>
                {typed}
                <span style={{ color: C.lime, opacity: sendP < 0 && f % 16 < 9 ? 1 : 0, fontWeight: 400 }}>|</span>
              </span>
              <div style={{ position: "relative", width: 132, height: 132 }}>
                {sendP >= 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      border: `4px solid ${C.lime}`,
                      scale: String(interpolate(sendP, [0, 16], [1, 2.6], clamp)),
                      opacity: interpolate(sendP, [0, 16], [0.9, 0], clamp),
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background: C.lime,
                    boxShadow: `0 0 50px rgba(215,255,58,${sendP >= 0 ? 0.6 : 0.3})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    scale: String(btnScale),
                    fontFamily: "Pretendard",
                    fontWeight: 900,
                    fontSize: 72,
                    color: "#111",
                  }}
                >
                  ↑
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
        <PeupeuInHook stamp={stamp} send={send} />
        {/* ink splatter */}
        {k >= 0 &&
          new Array(16).fill(0).map((_, i) => {
            const a = random(`ia${i}`) * Math.PI * 2;
            const d = (180 + random(`id${i}`) * 300) * interpolate(k, [0, 10], [0, 1], { ...clamp, easing: outExpo });
            const s = 10 + random(`is${i}`) * 26;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 700 + Math.cos(a) * d,
                  top: 600 + Math.sin(a) * d,
                  width: s,
                  height: s,
                  borderRadius: 99,
                  background: C.red,
                  opacity: interpolate(k, [0, 4, 22], [0, 0.9, 0], clamp),
                }}
              />
            );
          })}
        {k >= 0 && (
          <div
            style={{
              position: "absolute",
              left: 520,
              top: 470,
              transform: `rotate(${interpolate(st, [0, 1], [-26, -12])}deg)`,
              scale: String(interpolate(st, [0, 1], [2.9, 1])),
              opacity: interpolate(k, [0, 2], [0, 1], clamp),
            }}
          >
            <div
              style={{
                padding: "8px 44px 18px",
                border: `14px solid ${C.red}`,
                borderRadius: 22,
                color: C.red,
                fontFamily: "BlackHanSans",
                fontSize: 176,
                lineHeight: 1.1,
                background: "rgba(255,59,48,0.08)",
                boxShadow: "0 0 90px rgba(255,59,48,0.45)",
                WebkitMaskImage: `url(${staticFile("fx/rough.png")})`,
                WebkitMaskSize: "512px 256px",
              }}
            >
              망함
            </div>
          </div>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.red, opacity: interpolate(k, [0, 1, 12], [0, 0.3, 0], clamp), mixBlendMode: "screen" }} />
      {HOOK_TEXT.map((_, i) => (
        <Sfx key={i} at={2 + i * 3} src="key" volume={0.5} />
      ))}
      <Sfx at={send} src="pop" volume={0.7} />
      <Sfx at={stamp} src="stamp" volume={1} />
      <Sfx at={5} src="blip" volume={0.45} />
      <Sfx at={stamp + 3} src="boing" volume={0.55} />
    </AbsoluteFill>
  );
};

// ---------- scene 2: reason (a wall of average sentences) ----------

const CLICHES = ["따뜻한 공간에서", "특별한 경험을", "다양한 혜택", "최고의 품질로", "당신을 위한", "새로운 시작", "특별한 커피", "편안한 휴식", "행복한 순간", "정성을 다해", "일상의 여유", "소중한 시간"];

const Reason: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pick = L[1].tchunks[3].start - L[1].start;
  const p = spring({ frame: f - pick, fps, config: { damping: 15, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,120,135,0.35)" tint2="rgba(60,60,70,0.4)" />
      <AbsoluteFill style={{ perspective: 1500 }}>
        <div
          style={{
            position: "absolute",
            left: -260,
            top: 60,
            width: 1600,
            height: 1700,
            transform: "rotateX(34deg) rotateZ(-9deg)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 68%, transparent 100%)",
            filter: `blur(${interpolate(f, [0, 14], [18, 1.5], { ...clamp, easing: outExpo }) + (f > pick ? p * 3 : 0)}px)`,
            opacity: interpolate(f, [0, 8], [0, 1], clamp) * (f > pick ? 1 - p * 0.45 : 1),
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 500px)", gap: 28, translate: `0px ${-f * 3.2}px` }}>
            {new Array(42).fill(0).map((_, i) => (
              <div key={i} style={{ ...glass, borderRadius: 26, height: 150, display: "flex", alignItems: "center", padding: "0 36px", fontFamily: "Pretendard", fontWeight: 700, fontSize: 44, color: "rgba(255,255,255,0.5)" }}>
                {CLICHES[(i * 5) % CLICHES.length]}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
      {/* "no ingredients" chip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 250,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(f, [2, 8], [0, 1], clamp) * (f > pick ? 1 - p : 1),
          translate: `0px ${interpolate(f, [2, 12], [30, 0], { ...clamp, easing: outExpo })}px`,
        }}
      >
        <div style={{ ...glass, borderRadius: 999, padding: "20px 44px", display: "flex", gap: 22, alignItems: "center", fontFamily: "Pretendard", fontWeight: 700, fontSize: 46, color: C.white }}>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>재료</span>
          <span style={{ color: C.red, fontWeight: 900 }}>없음</span>
        </div>
      </div>
      {/* the picked, most average sentence */}
      {f >= pick && (
        <div style={{ position: "absolute", left: 90, top: 640, width: 900, scale: String(interpolate(p, [0, 1], [0.6, 1])), opacity: interpolate(p, [0, 0.3], [0, 1], clamp) }}>
          <div style={{ ...glass, background: "linear-gradient(170deg, rgba(255,255,255,0.2), rgba(255,255,255,0.07))", borderRadius: 34, padding: "46px 52px", boxShadow: "0 0 80px rgba(255,255,255,0.12), 0 50px 120px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.6)", letterSpacing: 2 }}>AI가 고른 문장</span>
              <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#111", background: C.lime, borderRadius: 99, padding: "4px 18px" }}>가장 흔한 표현</span>
            </div>
            <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 64, lineHeight: 1.35, color: C.white, letterSpacing: -1 }}>따뜻한 공간에서 특별한 경험을</div>
          </div>
        </div>
      )}
      <Sfx at={2} src="pop" volume={0.45} />
      <Sfx at={pick} src="ding" volume={0.45} />
    </AbsoluteFill>
  );
};

// ---------- scene 3: example bubble + "AI 티" beat ----------

const SEGS: { t: string; u?: 1 | 2 }[] = [
  { t: "따뜻한 공간", u: 1 },
  { t: "에서 " },
  { t: "특별한 커피", u: 2 },
  { t: "를 만나보세요. 여러분의 일상에 작은 행복을 선사합니다." },
];

const Wave: React.FC<{ progress: number }> = ({ progress }) => (
  <svg viewBox="0 0 200 20" preserveAspectRatio="none" style={{ position: "absolute", left: -4, right: -4, bottom: -18, width: "calc(100% + 8px)", height: 22, overflow: "visible" }}>
    <path d="M0 10 Q 6.25 0 12.5 10 T 25 10 T 37.5 10 T 50 10 T 62.5 10 T 75 10 T 87.5 10 T 100 10 T 112.5 10 T 125 10 T 137.5 10 T 150 10 T 162.5 10 T 175 10 T 187.5 10 T 200 10" fill="none" stroke={C.red} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} vectorEffect="non-scaling-stroke" />
  </svg>
);

const Example: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = L[2].start;
  const u1 = L[2].tchunks[1].start - base;
  const u2 = L[2].tchunks[2].start - base;
  const tell = L[3].start - base;
  const k = f - tell;
  const shown = Math.max(0, Math.floor((f - 10) * 1.6));
  let count = 0;
  const glitch = k >= 0 && k < 8;
  const gx = glitch ? (random(`gl${f}`) - 0.5) * 26 : 0;
  const sticker = spring({ frame: k, fps, config: { damping: 10, stiffness: 260, mass: 0.6 } });
  const userP = spring({ frame: f - 1, fps, config: { damping: 16, stiffness: 180 } });
  const aiP = spring({ frame: f - 7, fps, config: { damping: 16, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(150,105,60,0.45)" tint2="rgba(70,45,30,0.5)" />
      <AbsoluteFill style={{ opacity: interpolate(k, [0, 4], [0, 1], clamp) }}>
        <Atmosphere tint="rgba(190,30,25,0.5)" tint2="rgba(110,10,10,0.5)" />
      </AbsoluteFill>
      <AbsoluteFill style={{ scale: String(1 + (k >= 0 ? interpolate(k, [0, 3, 14], [0, 0.07, 0.04], clamp) : interpolate(f, [0, tell], [0, 0.03], clamp))) }}>
        <div style={{ position: "absolute", right: 90, top: 300, opacity: userP, translate: `${interpolate(userP, [0, 1], [80, 0])}px 0px` }}>
          <div style={{ background: C.lime, color: "#111", borderRadius: "40px 40px 10px 40px", padding: "28px 44px", fontFamily: "Pretendard", fontWeight: 700, fontSize: 52 }}>카페 홍보글 써줘</div>
        </div>
        <div style={{ position: "absolute", left: 90, top: 500, width: 900, opacity: aiP, translate: `${gx + interpolate(aiP, [0, 1], [-80, 0])}px 0px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 22 }}>
            <div style={{ width: 70, height: 70, borderRadius: 22, background: "linear-gradient(140deg,#fff,#9aa0a8)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#111" }}>AI</div>
            <span style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.6)" }}>답변</span>
          </div>
          <div style={{ ...glass, borderRadius: "10px 40px 40px 40px", padding: "48px 52px", position: "relative" }}>
            <div
              style={{
                fontFamily: "Pretendard",
                fontWeight: 700,
                fontSize: 60,
                lineHeight: 1.6,
                color: C.white,
                wordBreak: "keep-all",
                textShadow: glitch ? "4px 0 rgba(255,0,60,0.8), -4px 0 rgba(0,220,255,0.8)" : undefined,
              }}
            >
              {SEGS.map((s, i) => {
                const vis = s.t.slice(0, Math.max(0, shown - count));
                count += s.t.length;
                if (!s.u) return <span key={i}>{vis}</span>;
                const at = s.u === 1 ? u1 : u2;
                return (
                  <span key={i} style={{ position: "relative", display: "inline-block", color: f >= at ? "#FFB3AD" : undefined }}>
                    {vis}
                    {f >= at && <Wave progress={interpolate(f - at, [0, 8], [0, 1], { ...clamp, easing: outExpo })} />}
                  </span>
                );
              })}
              <span style={{ color: C.lime, opacity: shown < 60 && f % 14 < 8 ? 1 : 0 }}>▍</span>
            </div>
            {k >= 0 && (
              <div
                style={{
                  position: "absolute",
                  right: -40,
                  bottom: -70,
                  rotate: `${interpolate(sticker, [0, 1], [24, 9])}deg`,
                  scale: String(interpolate(sticker, [0, 1], [2.2, 1])),
                  opacity: interpolate(k, [0, 2], [0, 1], clamp),
                  background: C.red,
                  color: "#fff",
                  fontFamily: "BlackHanSans",
                  fontSize: 92,
                  padding: "10px 44px 18px",
                  borderRadius: 999,
                  boxShadow: "0 18px 50px rgba(255,59,48,0.55)",
                }}
              >
                AI 티
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.red, opacity: interpolate(k, [0, 1, 10], [0, 0.22, 0], clamp), mixBlendMode: "screen" }} />
      <Sfx at={1} src="pop" volume={0.5} />
      {new Array(10).fill(0).map((_, i) => (
        <Sfx key={i} at={10 + i * 4} src="key" volume={0.28} />
      ))}
      <Sfx at={u1} src="whoosh" volume={0.25} />
      <Sfx at={u2} src="whoosh" volume={0.25} />
      <Sfx at={tell} src="glitch" volume={0.6} />
      <Sfx at={tell} src="stamp" volume={0.55} />
    </AbsoluteFill>
  );
};

// ---------- scene 4: three cards ----------

const PeupeuInThree: React.FC<{ glow: number }> = ({ glow }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame: f - 8, fps, config: { damping: 11, stiffness: 170 } });
  const j = jumpPose(f - glow, 0.3);
  return (
    <Peupeu
      left={240}
      top={850}
      appear={appear}
      pose={{
        face: "happy",
        wave: 1.15 + 0.5 * Math.sin(f * 0.55),
        jump: j.jump,
        sx: j.sx,
        sy: j.sy,
        rotY: -0.2,
        scale: 1.15,
      }}
    />
  );
};


const Three: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = L[4].tchunks[1].start - L[4].start;
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,160,20,0.45)" tint2="rgba(40,70,10,0.5)" />
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
          {[1, 2, 3].map((n, i) => {
            const s = spring({ frame: f - 2 - i * 4, fps, config: { damping: 14, stiffness: 120 } });
            const lit = interpolate(f - glow - i * 3, [0, 6], [0, 1], clamp);
            const float = Math.sin((f + i * 12) / 14) * 10 * s;
            return (
              <div
                key={n}
                style={{
                  width: 270,
                  height: 370,
                  borderRadius: 34,
                  ...glass,
                  border: `2.5px solid rgba(215,255,58,${0.25 + lit * 0.6})`,
                  boxShadow: `0 0 ${30 + lit * 60}px rgba(215,255,58,${0.12 + lit * 0.35}), 0 40px 90px rgba(0,0,0,0.55)`,
                  transform: `translateZ(${interpolate(s, [0, 1], [-1500, 0])}px) rotateY(${interpolate(s, [0, 1], [-75, 0])}deg) rotateX(${interpolate(s, [0, 1], [35, 0])}deg) translateY(${float}px)`,
                  opacity: s > 0.02 ? 1 : 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)", translate: `${interpolate(f - glow - i * 3, [0, 14], [-400, 400], clamp)}px 0px` }} />
                <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>TIP</div>
                <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 190, lineHeight: 1, color: C.lime, textShadow: `0 0 ${20 + lit * 40}px rgba(215,255,58,${0.3 + lit * 0.5})` }}>{n}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <PeupeuInThree glow={glow} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} at={2 + i * 4} src="whoosh" volume={0.35} />
      ))}
      <Sfx at={8} src="blip" volume={0.4} />
      <Sfx at={glow + 3} src="boing" volume={0.35} />
      <Sfx at={glow} src="ding" volume={0.55} />
    </AbsoluteFill>
  );
};

// ---------- composition ----------

export const Ep01Opening: React.FC = () => {
  useFonts();
  const [hook, reason, example, three] = SCENES;
  const ext = 7;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Sequence from={hook.start} durationInFrames={hook.end - hook.start + ext}>
        <SceneWrap dur={hook.end - hook.start} noIn>
          <Hook dur={hook.end - hook.start} />
        </SceneWrap>
      </Sequence>
      <Sequence from={reason.start} durationInFrames={reason.end - reason.start + ext}>
        <SceneWrap dur={reason.end - reason.start}>
          <Reason />
        </SceneWrap>
      </Sequence>
      <Sequence from={example.start} durationInFrames={example.end - example.start + ext}>
        <SceneWrap dur={example.end - example.start}>
          <Example />
        </SceneWrap>
      </Sequence>
      <Sequence from={three.start} durationInFrames={three.end - three.start}>
        <SceneWrap dur={three.end - three.start + 20}>
          <Three />
        </SceneWrap>
      </Sequence>
      {SCENES.slice(1).map((s) => (
        <Sfx key={s.id} at={s.start - 4} src="whoosh" volume={0.4} />
      ))}
      <CutFlash />
      <Dust />
      <Grain />
      <Vignette />
      <div style={{ position: "absolute", top: 96, left: 80, fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "rgba(255,255,255,0.45)" }}>EP.01 · AI 글쓰기</div>
      <Captions />
    </AbsoluteFill>
  );
};
