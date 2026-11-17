import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../StyleFrames";
import {
  Atmosphere,
  C,
  Captions,
  Dust,
  Example,
  Grain,
  Hook,
  L,
  Peupeu,
  Reason,
  SceneWrap,
  Sfx,
  TIMELINE,
  Three,
  Vignette,
  clamp,
  glass,
  jumpPose,
  outExpo,
} from "./Opening";

// Full ep01 (script lines 1–17): opening scenes + tips, proof, re-hook, CTA.
// Every beat is placed on the real narration's word timings (L[i].tchunks[j].start).

const TAIL = 45; // end card hold after the last word
export const EP01_DURATION = TIMELINE.fullEnd + TAIL;

// scene boundaries (frames)
const S = {
  hook: [0, L[1].start],
  reason: [L[1].start, L[2].start],
  example: [L[2].start, L[4].start],
  three: [L[4].start, L[5].start],
  tip1: [L[5].start, L[7].start],
  proof: [L[7].start, L[8].start],
  tip2: [L[8].start, L[10].start],
  rehook: [L[10].start, L[12].start],
  tip3: [L[12].start, L[15].start],
  cta: [L[15].start, EP01_DURATION],
} as const;

// chunk start relative to a scene start
const at = (line: number, chunk: number, scene: readonly [number, number]) => L[line].tchunks[chunk].start - scene[0];

const lime = (a: number) => `rgba(215,255,58,${a})`;

// ---------- tip header: number card flips in, tip name slides in ----------

const TipHeader: React.FC<{ n: number; name: string; nameAt: number }> = ({ n, name, nameAt }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 1, fps, config: { damping: 13, stiffness: 140 } });
  const t = spring({ frame: f - nameAt, fps, config: { damping: 15, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 230,
          width: 220,
          height: 290,
          borderRadius: 30,
          ...glass,
          border: `2.5px solid ${lime(0.85)}`,
          boxShadow: `0 0 70px ${lime(0.35)}, 0 40px 90px rgba(0,0,0,0.55)`,
          transform: `rotateY(${interpolate(s, [0, 1], [-100, -8])}deg) translateZ(${interpolate(s, [0, 1], [-600, 0])}px)`,
          opacity: s > 0.02 ? 1 : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, letterSpacing: 4, color: "rgba(255,255,255,0.5)" }}>TIP</div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 160, lineHeight: 1, color: C.lime, textShadow: `0 0 40px ${lime(0.7)}` }}>{n}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 300,
          fontFamily: "Pretendard",
          fontWeight: 900,
          fontSize: 104,
          letterSpacing: -4,
          color: C.white,
          lineHeight: 1.05,
          opacity: interpolate(t, [0, 0.3], [0, 1], clamp),
          translate: `${interpolate(t, [0, 1], [80, 0])}px 0px`,
          wordBreak: "keep-all",
          width: 640,
        }}
      >
        {name}
        <div style={{ height: 12, width: interpolate(t, [0, 1], [0, 300]), background: C.lime, borderRadius: 6, marginTop: 18, boxShadow: `0 0 30px ${lime(0.6)}` }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- tip 1: three ingredient rows ----------

const Tip1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.tip1;
  const rows = [
    { t: "누가 읽는지", a: at(6, 0, sc), ex: "출근길 직장인" },
    { t: "왜 쓰는지", a: at(6, 1, sc), ex: "단골 만들기" },
    { t: "내 경험 한 줄", a: at(6, 2, sc), ex: "7시에 문 여는 이유" },
  ];
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,160,20,0.42)" tint2="rgba(40,70,10,0.45)" />
      <TipHeader n={1} name="재료 세 줄" nameAt={at(5, 1, sc)} />
      {rows.map((r, i) => {
        const p = spring({ frame: f - r.a, fps, config: { damping: 14, stiffness: 170 } });
        const chk = spring({ frame: f - r.a - 6, fps, config: { damping: 9, stiffness: 260 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90,
              top: 640 + i * 190,
              width: 900,
              height: 160,
              borderRadius: 32,
              ...glass,
              display: "flex",
              alignItems: "center",
              gap: 34,
              padding: "0 40px",
              opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
              translate: `${interpolate(p, [0, 1], [160, 0])}px 0px`,
            }}
          >
            <div style={{ width: 84, height: 84, borderRadius: 24, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 54, color: "#111", scale: String(chk), boxShadow: `0 0 40px ${lime(0.5)}` }}>✓</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 62, color: C.white, letterSpacing: -2 }}>{r.t}</span>
              <span style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.5)", opacity: interpolate(f - r.a, [8, 16], [0, 1], clamp) }}>예) {r.ex}</span>
            </div>
          </div>
        );
      })}
      <Sfx at={1} src="whoosh" volume={0.35} />
      <Sfx at={at(5, 1, sc)} src="pop" volume={0.5} />
      {rows.map((r, i) => (
        <Sfx key={i} at={r.a + 6} src="ding" volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- proof: before / after ----------

const BEFORE = "따뜻한 공간에서 특별한 커피를 만나보세요. 여러분의 일상에 작은 행복을 선사합니다.";
const AFTER = "아침 7시, 망원동 골목에서 문을 엽니다. 출근길에 라떼 한 잔 들고 가는 단골이 제일 많아요.";

const Proof: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.proof;
  const b = spring({ frame: f - 1, fps, config: { damping: 15, stiffness: 150 } });
  const aAt = at(7, 1, sc);
  const hiAt = at(7, 2, sc);
  const a = spring({ frame: f - aAt, fps, config: { damping: 13, stiffness: 160 } });
  const hi = interpolate(f - hiAt, [0, 6], [0, 1], { ...clamp, easing: outExpo });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(110,110,125,0.35)" tint2="rgba(40,40,50,0.4)" />
      <AbsoluteFill style={{ opacity: hi }}>
        <Atmosphere tint="rgba(120,165,20,0.5)" tint2="rgba(40,70,10,0.5)" />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 90, top: 230, width: 900, opacity: interpolate(b, [0, 0.3], [0, 1], clamp) * (1 - hi * 0.45), translate: `0px ${interpolate(b, [0, 1], [-80, 0])}px`, scale: String(1 - hi * 0.05) }}>
        <div style={{ ...glass, borderRadius: 32, padding: "36px 46px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.55)", letterSpacing: 2 }}>
            <span>BEFORE</span>
            <span>“카페 홍보글 써줘”</span>
          </div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 48, lineHeight: 1.5, color: "rgba(255,255,255,0.6)", wordBreak: "keep-all" }}>{BEFORE}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 660, width: 900, opacity: interpolate(a, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(a, [0, 1], [120, 0])}px`, scale: String(1 + hi * 0.04 - (hi > 0 ? interpolate(f - hiAt, [0, 3, 8], [0, 0.03, 0], clamp) : 0)) }}>
        <div
          style={{
            ...glass,
            background: `linear-gradient(170deg, ${lime(0.2)}, ${lime(0.06)})`,
            border: `3px solid ${lime(0.5 + hi * 0.5)}`,
            boxShadow: `0 0 ${40 + hi * 70}px ${lime(0.2 + hi * 0.35)}, 0 50px 120px rgba(0,0,0,0.6)`,
            borderRadius: 32,
            padding: "40px 46px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)", translate: `${interpolate(f - hiAt, [0, 16], [-1100, 1100], clamp)}px 0px` }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, letterSpacing: 2 }}>
            <span style={{ color: C.lime }}>AFTER</span>
            <span style={{ color: "#111", background: C.lime, borderRadius: 99, padding: "2px 18px" }}>+ 재료 세 줄</span>
          </div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 52, lineHeight: 1.5, color: C.white, wordBreak: "keep-all" }}>{AFTER}</div>
        </div>
      </div>
      <Sfx at={1} src="whoosh" volume={0.3} />
      <Sfx at={aAt} src="pop" volume={0.55} />
      <Sfx at={hiAt} src="ding" volume={0.6} />
    </AbsoluteFill>
  );
};

// ---------- tip 2: banned words ----------

const BANNED = ["물론이죠", "다양한", "결론적으로", "혁신적인", "특별한", "여정", "시너지", "~에 대해 알아볼까요"];

const Tip2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.tip2;
  const appear = [at(9, 0, sc), at(9, 1, sc), ...new Array(6).fill(0).map((_, i) => at(9, 2, sc) + i * 3)];
  const killAll = at(9, 3, sc);
  const strike = (i: number) => (i === 0 ? at(9, 0, sc) + 10 : i === 1 ? at(9, 1, sc) + 10 : killAll + (i - 2) * 2);
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,160,20,0.35)" tint2="rgba(90,20,20,0.35)" />
      <TipHeader n={2} name="금지어 리스트" nameAt={at(8, 1, sc)} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 640, display: "flex", flexWrap: "wrap", gap: 26, justifyContent: "center" }}>
        {BANNED.map((w, i) => {
          const p = spring({ frame: f - appear[i], fps, config: { damping: 12, stiffness: 200 } });
          const k = f - strike(i);
          const line = interpolate(k, [0, 6], [0, 1], { ...clamp, easing: outExpo });
          const fall = f > killAll + 14 + i * 2 ? interpolate(f - killAll - 14 - i * 2, [0, 14], [0, 1], clamp) : 0;
          const big = i < 2;
          return (
            <div
              key={w}
              style={{
                position: "relative",
                ...glass,
                borderRadius: 26,
                padding: big ? "26px 44px" : "18px 32px",
                fontFamily: "Pretendard",
                fontWeight: 900,
                fontSize: big ? 70 : 46,
                color: k >= 0 ? "rgba(255,255,255,0.45)" : C.white,
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - fall),
                scale: String(interpolate(p, [0, 1], [0.5, 1])),
                translate: `0px ${fall * 260}px`,
                rotate: `${fall * (random(`r${i}`) - 0.5) * 50}deg`,
              }}
            >
              {w}
              <div style={{ position: "absolute", left: -8, top: "50%", height: big ? 12 : 9, width: `calc(${line * 100}% + 16px)`, background: C.red, borderRadius: 6, rotate: "-7deg", boxShadow: "0 0 24px rgba(255,59,48,0.7)" }} />
            </div>
          );
        })}
      </div>
      <Sfx at={1} src="whoosh" volume={0.35} />
      <Sfx at={at(8, 1, sc)} src="pop" volume={0.5} />
      <Sfx at={strike(0)} src="glitch" volume={0.4} />
      <Sfx at={strike(1)} src="glitch" volume={0.4} />
      <Sfx at={killAll} src="whoosh" volume={0.5} />
    </AbsoluteFill>
  );
};

// ---------- re-hook: "still awkward" → giant 03 ----------

const Rehook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.rehook;
  const big = at(11, 0, sc);
  const slam = at(11, 1, sc);
  const k = f - slam;
  const p = spring({ frame: k, fps, config: { damping: 10, stiffness: 220, mass: 0.7 } });
  const shake = k >= 0 && k < 12 ? (1 - k / 12) * 26 : 0;
  const appear = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 170 } });
  const before03 = f < big;
  return (
    <AbsoluteFill style={{ translate: `${(random(`rx${f}`) - 0.5) * shake}px ${(random(`ry${f}`) - 0.5) * shake}px` }}>
      <Atmosphere tint="rgba(90,90,100,0.35)" tint2="rgba(40,40,50,0.4)" />
      <AbsoluteFill style={{ opacity: interpolate(f - big, [0, 8], [0, 1], clamp) }}>
        <Atmosphere tint="rgba(200,30,25,0.6)" tint2="rgba(110,10,10,0.6)" />
      </AbsoluteFill>
      {/* 프프 not convinced yet */}
      <div style={{ opacity: interpolate(f - big, [0, 6], [1, 0], clamp) }}>
        <Peupeu left={190} top={420} w={700} h={720} appear={appear} pose={{ face: "meh", wave: 0.35, rotY: -0.15, rotZ: Math.sin(f / 9) * 0.05, scale: 1.55 }} />
        <div style={{ position: "absolute", left: 720, top: 380, fontFamily: "Pretendard", fontWeight: 900, fontSize: 150, color: C.white, opacity: interpolate(f, [8, 14], [0, 1], clamp) * (before03 ? 1 : 0), rotate: `${Math.sin(f / 6) * 8}deg` }}>?</div>
      </div>
      {f >= big && (
        <div
          style={{
            position: "absolute",
            top: 330,
            width: "100%",
            textAlign: "center",
            fontFamily: "Pretendard",
            fontWeight: 900,
            fontSize: 560,
            letterSpacing: -24,
            lineHeight: 1,
            color: k >= 0 ? C.red : "rgba(255,59,48,0.25)",
            textShadow: k >= 0 ? "0 0 80px rgba(255,59,48,0.6)" : undefined,
            scale: String(k >= 0 ? interpolate(p, [0, 1], [2.6, 1]) : interpolate(f - big, [0, 30], [0.9, 0.97], clamp)),
            filter: k < 0 ? `blur(${interpolate(f - big, [0, 30], [16, 6], clamp)}px)` : undefined,
          }}
        >
          03
        </div>
      )}
      <AbsoluteFill style={{ background: C.red, opacity: interpolate(k, [0, 1, 12], [0, 0.3, 0], clamp), mixBlendMode: "screen" }} />
      <Sfx at={2} src="blip" volume={0.35} />
      <Sfx at={big} src="whoosh" volume={0.45} />
      <Sfx at={slam} src="stamp" volume={1} />
    </AbsoluteFill>
  );
};

// ---------- tip 3: copy my tone ----------

const RESULT = "솔직히 커피 맛은 다 비슷하잖아요. 근데 여기 사장님은 제 이름을 기억해요.";

const Tip3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.tip3;
  const papersAt = at(13, 0, sc);
  const intoAt = at(13, 2, sc);
  const resAt = at(14, 1, sc);
  const glowAt = at(14, 2, sc);
  const shown = Math.max(0, Math.floor((f - resAt) * 2.2));
  const res = spring({ frame: f - resAt, fps, config: { damping: 14, stiffness: 160 } });
  const glow = interpolate(f - glowAt, [0, 6], [0, 1], clamp);
  const pp = spring({ frame: f - glowAt + 4, fps, config: { damping: 11, stiffness: 170 } });
  const j = jumpPose(f - glowAt, 0.35);
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,160,20,0.42)" tint2="rgba(40,70,10,0.45)" />
      <AbsoluteFill style={{ opacity: glow * 0.6 }}>
        <Atmosphere tint="rgba(170,220,30,0.55)" tint2="rgba(60,100,10,0.5)" />
      </AbsoluteFill>
      <div style={{ opacity: interpolate(f, [resAt - 4, resAt + 4], [1, 0.0], clamp) }}>
        <TipHeader n={3} name="말투 복사" nameAt={at(12, 1, sc)} />
      </div>
      {/* my writing samples fly into the AI */}
      {[0, 1, 2].map((i) => {
        const p = spring({ frame: f - papersAt - i * 5, fps, config: { damping: 14, stiffness: 150 } });
        const into = interpolate(f - intoAt - i * 3, [0, 12], [0, 1], { ...clamp, easing: outExpo });
        const x = interpolate(into, [0, 1], [110 + i * 300, 470]);
        const y = interpolate(into, [0, 1], [650, 1020]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 260,
              height: 300,
              borderRadius: 18,
              background: "#F6F1E6",
              boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
              padding: 26,
              opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - into),
              scale: String(interpolate(p, [0, 1], [0.6, 1]) * (1 - into * 0.8)),
              rotate: `${(i - 1) * 6 * (1 - into)}deg`,
            }}
          >
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#2A2622", marginBottom: 18 }}>내 글 {i + 1}</div>
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={k} style={{ height: 14, borderRadius: 7, background: "#C9C0AE", marginBottom: 20, width: `${92 - ((k * 17 + i * 9) % 40)}%` }} />
            ))}
          </div>
        );
      })}
      {/* AI input that swallows them */}
      <div style={{ position: "absolute", left: 90, top: 1040, width: 900, opacity: interpolate(f, [intoAt - 6, intoAt], [0, 1], clamp) * interpolate(f, [resAt, resAt + 6], [1, 0], clamp) }}>
        <div style={{ ...glass, borderRadius: 40, height: 150, display: "flex", alignItems: "center", padding: "0 44px", fontFamily: "Pretendard", fontWeight: 700, fontSize: 52, color: C.white }}>
          이 말투로 써줘<span style={{ color: C.lime }}>▍</span>
        </div>
      </div>
      {/* result */}
      {f >= resAt && (
        <div style={{ position: "absolute", left: 90, top: 300, width: 900, opacity: interpolate(res, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(res, [0, 1], [80, 0])}px` }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.6)", marginBottom: 18 }}>AI 답변 · 내 말투로</div>
          <div
            style={{
              ...glass,
              background: `linear-gradient(170deg, ${lime(0.16 + glow * 0.1)}, ${lime(0.05)})`,
              border: `3px solid ${lime(0.35 + glow * 0.6)}`,
              boxShadow: `0 0 ${30 + glow * 80}px ${lime(0.15 + glow * 0.4)}, 0 50px 120px rgba(0,0,0,0.6)`,
              borderRadius: 34,
              padding: "48px 52px",
            }}
          >
            <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 62, lineHeight: 1.5, color: C.white, wordBreak: "keep-all" }}>
              {RESULT.slice(0, shown)}
              <span style={{ color: C.lime, opacity: shown < RESULT.length && f % 12 < 7 ? 1 : 0 }}>▍</span>
            </div>
          </div>
        </div>
      )}
      {f >= glowAt - 4 && <Peupeu left={260} top={840} w={560} h={500} appear={pp} pose={{ face: "happy", wave: 1.2 + 0.5 * Math.sin(f * 0.55), leftLift: j.air ? 1 : 0.3, jump: j.jump, sx: j.sx, sy: j.sy, rotY: -0.25, scale: 1.1 }} />}
      <Sfx at={1} src="whoosh" volume={0.35} />
      <Sfx at={at(12, 1, sc)} src="pop" volume={0.5} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} at={papersAt + i * 5} src="pop" volume={0.35} />
      ))}
      <Sfx at={intoAt} src="whoosh" volume={0.45} />
      {new Array(10).fill(0).map((_, i) => (
        <Sfx key={`k${i}`} at={resAt + i * 3} src="key" volume={0.25} />
      ))}
      <Sfx at={glowAt} src="ding" volume={0.6} />
      <Sfx at={glowAt + 3} src="boing" volume={0.4} />
    </AbsoluteFill>
  );
};

// ---------- CTA: prompt pack + comment → DM ----------

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.cta;
  const doc = spring({ frame: f - 1, fps, config: { damping: 14, stiffness: 150 } });
  const badges = [
    { t: "재료 세 줄", a: at(15, 0, sc) + 4 },
    { t: "말투 복사", a: at(15, 1, sc) },
    { t: "금지어 30개", a: at(15, 2, sc) },
  ];
  const cmtAt = at(16, 0, sc);
  const typeAt = at(16, 1, sc);
  const dmAt = at(16, 3, sc);
  const cmt = spring({ frame: f - cmtAt, fps, config: { damping: 14, stiffness: 170 } });
  const dm = spring({ frame: f - dmAt, fps, config: { damping: 12, stiffness: 180 } });
  const typed = "복붙".slice(0, Math.max(0, Math.floor((f - typeAt) / 4) + 1));
  const pp = spring({ frame: f - cmtAt, fps, config: { damping: 11, stiffness: 170 } });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,160,20,0.45)" tint2="rgba(40,70,10,0.5)" />
      {/* prompt pack document */}
      <div style={{ position: "absolute", left: 140, top: 180, width: 800, transformOrigin: "50% 0%", opacity: interpolate(doc, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(doc, [0, 1], [100, 0]) + dm * 150}px`, scale: String(1 - dm * 0.12), rotate: `${interpolate(doc, [0, 1], [-6, -2])}deg` }}>
        <div style={{ background: "#F6F1E6", borderRadius: 26, padding: "40px 44px", boxShadow: `0 0 80px ${lime(0.25)}, 0 50px 120px rgba(0,0,0,0.6)` }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: "#111", letterSpacing: -1 }}>AI 티 안 나는 글쓰기 프롬프트</div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 28, color: "#7A7067", marginTop: 8, marginBottom: 26 }}>복사해서 붙여넣기만 하세요</div>
          <div style={{ filter: "blur(5px)" }}>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <div key={k} style={{ height: 18, borderRadius: 9, background: "#C9C0AE", marginBottom: 22, width: `${95 - ((k * 23) % 45)}%` }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
            {badges.map((b, i) => {
              const p = spring({ frame: f - b.a, fps, config: { damping: 10, stiffness: 240 } });
              return (
                <div key={i} style={{ background: "#111", color: C.lime, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, borderRadius: 99, padding: "10px 26px", scale: String(p), opacity: p > 0.02 ? 1 : 0 }}>
                  ✓ {b.t}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* comment box */}
      {f >= cmtAt && (
        <div style={{ position: "absolute", left: 90, top: 900, width: 900, opacity: interpolate(cmt, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(cmt, [0, 1], [80, 0])}px` }}>
          <div style={{ ...glass, borderRadius: 999, height: 140, display: "flex", alignItems: "center", gap: 28, padding: "0 40px" }}>
            <div style={{ width: 80, height: 80, borderRadius: 99, background: "linear-gradient(140deg,#8a8f98,#4a4f58)" }} />
            <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: f >= typeAt ? C.lime : "rgba(255,255,255,0.4)" }}>
              {f >= typeAt ? typed : "댓글 달기…"}
              {f >= typeAt && <span style={{ color: C.white, opacity: f % 14 < 8 ? 1 : 0, fontWeight: 400 }}>|</span>}
            </span>
          </div>
        </div>
      )}
      {/* DM notification */}
      {f >= dmAt && (
        <div style={{ position: "absolute", left: 90, top: 70, width: 900, translate: `0px ${interpolate(dm, [0, 1], [-220, 0])}px`, opacity: interpolate(dm, [0, 0.3], [0, 1], clamp) }}>
          <div style={{ background: "rgba(25,26,30,0.92)", border: `2px solid ${lime(0.6)}`, borderRadius: 36, padding: "26px 34px", display: "flex", alignItems: "center", gap: 26, boxShadow: `0 0 60px ${lime(0.3)}, 0 30px 80px rgba(0,0,0,0.6)` }}>
            <div style={{ width: 86, height: 86, borderRadius: 24, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: "#111" }}>DM</div>
            <div>
              <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, color: C.white }}>프롬프트가 도착했어요</div>
              <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.55)" }}>재료 세 줄 · 말투 복사 · 금지어 30개</div>
            </div>
          </div>
        </div>
      )}
      {f >= cmtAt && <Peupeu left={600} top={1010} w={460} h={420} appear={pp} pose={{ face: f >= dmAt ? "happy" : "prompt", blink: f % 16 >= 9, wave: 1.15 + 0.5 * Math.sin(f * 0.55), rotY: -0.45, scale: 1.0 }} />}
      <Sfx at={1} src="whoosh" volume={0.35} />
      {badges.map((b, i) => (
        <Sfx key={i} at={b.a} src="pop" volume={0.45} />
      ))}
      <Sfx at={cmtAt} src="blip" volume={0.35} />
      <Sfx at={typeAt} src="key" volume={0.5} />
      <Sfx at={typeAt + 4} src="key" volume={0.5} />
      <Sfx at={dmAt} src="ding" volume={0.7} />
    </AbsoluteFill>
  );
};

// ---------- composition ----------

const CUTS = Object.values(S).slice(1).map((s) => s[0]);

const CutFlashAll: React.FC = () => {
  const f = useCurrentFrame();
  const o = CUTS.reduce((a, c) => a + interpolate(f, [c - 2, c, c + 7], [0, 0.16, 0], clamp), 0);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "screen" }} />;
};

const Scene: React.FC<{ s: readonly [number, number]; first?: boolean; last?: boolean; children: React.ReactNode }> = ({ s, first, last, children }) => {
  const dur = s[1] - s[0];
  return (
    <Sequence from={s[0]} durationInFrames={dur + (last ? 0 : 7)}>
      <SceneWrap dur={last ? dur + 40 : dur} noIn={first}>
        {children}
      </SceneWrap>
    </Sequence>
  );
};

export const Ep01Full: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Scene s={S.hook} first>
        <Hook dur={S.hook[1] - S.hook[0]} />
      </Scene>
      <Scene s={S.reason}>
        <Reason />
      </Scene>
      <Scene s={S.example}>
        <Example />
      </Scene>
      <Scene s={S.three}>
        <Three />
      </Scene>
      <Scene s={S.tip1}>
        <Tip1 />
      </Scene>
      <Scene s={S.proof}>
        <Proof />
      </Scene>
      <Scene s={S.tip2}>
        <Tip2 />
      </Scene>
      <Scene s={S.rehook}>
        <Rehook />
      </Scene>
      <Scene s={S.tip3}>
        <Tip3 />
      </Scene>
      <Scene s={S.cta} last>
        <Cta />
      </Scene>
      <Html5Audio src={staticFile("ep01/narration.mp3")} />
      {CUTS.map((c, i) => (
        <Sfx key={i} at={c - 4} src="whoosh" volume={0.3} />
      ))}
      <CutFlashAll />
      <Dust />
      <Grain />
      <Vignette />
      <Captions />
    </AbsoluteFill>
  );
};
