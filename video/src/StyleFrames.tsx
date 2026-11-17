import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";

// Style exploration for ep01: the same two scenes (hook, before/after proof)
// drawn in four looks, to choose the channel's visual identity.

export type Look = "editorial" | "dark" | "paper" | "screen";
export type Scene = "hook" | "proof";
export type StyleFrameProps = { look: Look; scene: Scene };

const FONTS: [string, string, string][] = [
  ["Pretendard", "Pretendard-Regular.woff2", "400"],
  ["Pretendard", "Pretendard-Bold.woff2", "700"],
  ["Pretendard", "Pretendard-Black.woff2", "900"],
  ["BlackHanSans", "BlackHanSans.woff2", "400"],
  ["NanumPen", "NanumPen.woff2", "400"],
  ["GowunBatang", "GowunBatang-Bold.woff2", "700"],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, file, weight]) => {
        const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, { weight });
        return f.load().then((loaded) => document.fonts.add(loaded));
      }),
    ).then(() => continueRender(handle));
  }, [handle]);
};

const BEFORE = "따뜻한 공간에서 특별한 커피를 만나보세요. 여러분의 일상에 작은 행복을 선사합니다.";
const AFTER = "아침 7시, 망원동 골목에서 문을 엽니다. 출근길에 라떼 한 잔 들고 가는 단골이 제일 많아요.";

type Theme = {
  bg: React.CSSProperties;
  ink: string;
  sub: string;
  accent: string;
  danger: string;
  body: string;
  display: string;
  displayWeight: number;
  card: React.CSSProperties;
  cardAfter: React.CSSProperties;
  input: React.CSSProperties;
  caption: (big: string, small?: string) => React.ReactNode;
  label: React.CSSProperties;
  stamp: React.CSSProperties;
};

const highlight = (color: string, skew = 0): React.CSSProperties => ({
  background: `linear-gradient(transparent 55%, ${color} 55%, ${color} 92%, transparent 92%)`,
  padding: "0 8px",
  transform: skew ? `skewX(${skew}deg)` : undefined,
  display: "inline-block",
});

const THEMES: Record<Look, Theme> = {
  editorial: {
    bg: { background: "#F5F4EF" },
    ink: "#111111",
    sub: "#6B6B6B",
    accent: "#D7FF3A",
    danger: "#FF3B30",
    body: "Pretendard",
    display: "Pretendard",
    displayWeight: 900,
    card: { background: "#FFFFFF", border: "3px solid #111", borderRadius: 4 },
    cardAfter: { background: "#D7FF3A", border: "3px solid #111", borderRadius: 4 },
    input: { background: "#FFFFFF", border: "3px solid #111", borderRadius: 6 },
    caption: (big, small) => (
      <div style={{ textAlign: "center" }}>
        {small && <div style={{ fontSize: 52, fontWeight: 700, color: "#111", marginBottom: 12 }}>{small}</div>}
        <span style={{ fontSize: 120, fontWeight: 900, color: "#111", letterSpacing: -4, ...highlight("#D7FF3A") }}>{big}</span>
      </div>
    ),
    label: { fontSize: 30, fontWeight: 700, letterSpacing: 2, color: "#111" },
    stamp: { border: "8px solid #FF3B30", color: "#FF3B30", borderRadius: 10, background: "rgba(245,244,239,0.85)" },
  },
  dark: {
    bg: { background: "radial-gradient(ellipse at 50% 35%, #1C1C22 0%, #0B0B0E 70%)" },
    ink: "#FFFFFF",
    sub: "#8E8E96",
    accent: "#FFD60A",
    danger: "#FF453A",
    body: "Pretendard",
    display: "BlackHanSans",
    displayWeight: 400,
    card: { background: "#17171C", border: "2px solid #2C2C34", borderRadius: 24 },
    cardAfter: { background: "#17171C", border: "3px solid #FFD60A", borderRadius: 24, boxShadow: "0 0 60px rgba(255,214,10,0.18)" },
    input: { background: "#17171C", border: "2px solid #34343C", borderRadius: 28 },
    caption: (big, small) => (
      <div style={{ textAlign: "center", fontFamily: "BlackHanSans" }}>
        {small && <div style={{ fontSize: 64, color: "#FFFFFF", marginBottom: 6 }}>{small}</div>}
        <div style={{ fontSize: 150, color: "#FFD60A", textShadow: "0 6px 0 rgba(0,0,0,0.5)" }}>{big}</div>
      </div>
    ),
    label: { fontSize: 30, fontWeight: 700, letterSpacing: 2, color: "#8E8E96" },
    stamp: { border: "10px solid #FF453A", color: "#FF453A", borderRadius: 14, background: "rgba(11,11,14,0.75)" },
  },
  paper: {
    bg: {
      backgroundColor: "#F4ECDD",
      backgroundImage:
        "repeating-linear-gradient(transparent 0px, transparent 78px, rgba(80,120,170,0.22) 78px, rgba(80,120,170,0.22) 80px)",
    },
    ink: "#2A2622",
    sub: "#7A7067",
    accent: "#FFE45C",
    danger: "#D7263D",
    body: "GowunBatang",
    display: "NanumPen",
    displayWeight: 400,
    card: { background: "#FFFFFF", borderRadius: 2, boxShadow: "0 10px 24px rgba(60,40,20,0.18)", transform: "rotate(-1.5deg)" },
    cardAfter: { background: "#FFF3A6", borderRadius: 2, boxShadow: "0 10px 24px rgba(60,40,20,0.2)", transform: "rotate(1.2deg)" },
    input: { background: "#FFFFFF", borderRadius: 2, boxShadow: "0 10px 24px rgba(60,40,20,0.18)", transform: "rotate(-1deg)" },
    caption: (big, small) => (
      <div style={{ textAlign: "center", fontFamily: "NanumPen", color: "#2A2622" }}>
        {small && <div style={{ fontSize: 96, marginBottom: -10 }}>{small}</div>}
        <span style={{ fontSize: 190, ...highlight("#FFE45C", -6) }}>{big}</span>
      </div>
    ),
    label: { fontFamily: "NanumPen", fontSize: 60, color: "#7A7067" },
    stamp: { border: "9px solid #D7263D", color: "#D7263D", borderRadius: "50%", background: "transparent", fontFamily: "NanumPen" },
  },
  screen: {
    bg: { background: "#DDE1E6" },
    ink: "#111418",
    sub: "#5F6670",
    accent: "#FF6A00",
    danger: "#FF6A00",
    body: "Pretendard",
    display: "Pretendard",
    displayWeight: 900,
    card: { background: "#FFFFFF", borderRadius: 28, boxShadow: "0 20px 50px rgba(17,20,24,0.12)" },
    cardAfter: { background: "#FFFFFF", borderRadius: 28, boxShadow: "0 20px 50px rgba(17,20,24,0.12)", outline: "8px solid #FF6A00", outlineOffset: 10 },
    input: { background: "#FFFFFF", borderRadius: 40, boxShadow: "0 20px 50px rgba(17,20,24,0.12)" },
    caption: (big, small) => (
      <div style={{ textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#111418", color: "#fff", borderRadius: 24, padding: "22px 44px", fontSize: 76, fontWeight: 900, letterSpacing: -2 }}>
          {small ? <span style={{ fontWeight: 700, color: "#C9CED6" }}>{small} </span> : null}
          <span style={{ color: "#FF8A3D" }}>{big}</span>
        </span>
      </div>
    ),
    label: { fontSize: 30, fontWeight: 700, color: "#5F6670" },
    stamp: { border: "10px solid #FF6A00", color: "#FF6A00", borderRadius: "50%", background: "transparent" },
  },
};

const Hook: React.FC<{ t: Theme; look: Look }> = ({ t, look }) => (
  <AbsoluteFill style={{ alignItems: "center" }}>
    <div style={{ position: "absolute", top: 560, width: 900 }}>
      {look === "screen" && <div style={{ ...t.label, marginBottom: 24, paddingLeft: 12 }}>AI 채팅</div>}
      <div style={{ ...t.input, height: 200, display: "flex", alignItems: "center", padding: "0 48px", justifyContent: "space-between" }}>
        <span style={{ fontFamily: t.body, fontSize: 84, fontWeight: 700, color: t.ink }}>
          글 써줘<span style={{ color: t.accent === "#FFE45C" ? t.ink : t.accent, fontWeight: 400 }}>|</span>
        </span>
        <div style={{ width: 110, height: 110, borderRadius: 999, background: look === "dark" ? "#FFD60A" : t.ink, color: look === "dark" ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontFamily: "Pretendard", fontWeight: 900 }}>
          ↑
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: look === "paper" || look === "screen" ? 140 : -10,
          top: look === "paper" || look === "screen" ? -230 : -150,
          transform: "rotate(-12deg)",
          ...t.stamp,
          width: 330,
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: look === "paper" ? 150 : 120,
          fontWeight: 900,
          fontFamily: look === "paper" ? "NanumPen" : look === "dark" ? "BlackHanSans" : "Pretendard",
          ...(t.stamp.borderRadius === "50%" ? { width: 300, height: 300 } : {}),
        }}
      >
        망함
      </div>
    </div>
    <div style={{ position: "absolute", top: 1180, width: "100%" }}>{t.caption("망했어요", "그 글은")}</div>
  </AbsoluteFill>
);

const Card: React.FC<{ t: Theme; style: React.CSSProperties; tag: string; prompt: string; text: string; strong?: boolean }> = ({ t, style, tag, prompt, text, strong }) => (
  <div style={{ ...style, width: 920, padding: "40px 48px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
      <span style={{ ...t.label, fontFamily: t.label.fontFamily ?? t.body }}>{tag}</span>
      <span style={{ ...t.label, fontFamily: t.label.fontFamily ?? t.body, color: strong ? t.ink : t.sub }}>{prompt}</span>
    </div>
    <div style={{ fontFamily: t.body, fontSize: 50, lineHeight: 1.45, fontWeight: 700, color: strong && t.cardAfter.background === "#D7FF3A" ? "#111" : t.ink, opacity: strong ? 1 : 0.55 }}>
      {text}
    </div>
  </div>
);

const Proof: React.FC<{ t: Theme }> = ({ t }) => (
  <AbsoluteFill style={{ alignItems: "center" }}>
    <div style={{ position: "absolute", top: 230, display: "flex", flexDirection: "column", gap: 56, alignItems: "center" }}>
      <Card t={t} style={t.card} tag="BEFORE" prompt="“글 써줘”" text={BEFORE} />
      <Card t={t} style={t.cardAfter} tag="AFTER" prompt="+ 재료 세 줄" text={AFTER} strong />
    </div>
    <div style={{ position: "absolute", top: 1330, width: "100%" }}>{t.caption("이렇게 달라져요", "같은 카페 글인데")}</div>
  </AbsoluteFill>
);

const LOOK_NAME: Record<Look, string> = {
  editorial: "A · 에디토리얼",
  dark: "B · 다크 키네틱",
  paper: "C · 종이 손글씨",
  screen: "D · 실제 화면형",
};

export const StyleFrame: React.FC<StyleFrameProps> = ({ look, scene }) => {
  useFonts();
  const t = THEMES[look];
  return (
    <AbsoluteFill style={{ ...t.bg, fontFamily: t.body, wordBreak: "keep-all" }}>
      <div style={{ position: "absolute", top: 90, left: 80, fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, letterSpacing: 3, color: t.sub }}>
        EP.01 · AI 글쓰기
      </div>
      <div style={{ position: "absolute", bottom: 80, right: 80, fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, color: t.sub, opacity: 0.6 }}>
        {LOOK_NAME[look]}
      </div>
      {scene === "hook" ? <Hook t={t} look={look} /> : <Proof t={t} />}
    </AbsoluteFill>
  );
};
