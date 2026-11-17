import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../StyleFrames";
import { Atmosphere, C, Dust, Grain, Peupeu, SceneWrap, Sfx, Vignette, clamp, glass, jumpPose, outExpo } from "../ep01/Opening";
import { Line, NarrationCaptions, Word, buildTimeline } from "../lib/narration";
import words from "../../public/ep02/narration.words.json";

// ep02 — Morning Paper (dmthepm/morning-paper, MIT) for bloggers, plus the
// Korean-font fix we verified. Proof images are real renders (public/ep02/).

// Official Naver Blog logo file, placed by the user. null → neutral text badge.
const BLOG_LOGO: string | null = null; // e.g. "brand/naver-blog.png"

const LINES: Line[] = [
  { scene: "hook", chunks: [{ text: "블로그 글감" }, { text: "찾으려고" }, { text: "아침마다" }, { text: "뉴스 다 뒤지고 있다면," }, { text: "이 스킬 하나는" }, { text: "꼭 설치해 두세요.", color: C.lime }] },
  { scene: "intro", chunks: [{ text: "모닝 페이퍼.", color: C.lime }] },
  { scene: "intro", chunks: [{ text: "깃허브 무료 스킬인데," }, { text: "매일 아침" }, { text: "신문 한 장을 찍어 줘요." }] },
  { scene: "intro", chunks: [{ text: "보는 채널만" }, { text: "적어 두면," }, { text: "겹치는 건 합치고" }, { text: "중요한 것만 골라 줘요.", color: C.lime }] },
  { scene: "problem", chunks: [{ text: "그런데" }, { text: "한국에서 그대로 깔면," }, { text: "문제가 있어요.", color: C.red }] },
  { scene: "problem", chunks: [{ text: "기본 폰트가" }, { text: "영문뿐이라," }, { text: "한글이 엉뚱한 폰트로" }, { text: "잡혀요.", color: C.red }] },
  { scene: "problem", chunks: [{ text: "제목도" }, { text: "이렇게 흐려지고요." }] },
  { scene: "rehook", chunks: [{ text: "한글 폰트만 깔면" }, { text: "될 것 같죠?" }] },
  { scene: "rehook", chunks: [{ text: "그것만으론" }, { text: "안 바뀌어요.", color: C.red }, { text: "우선순위까지" }, { text: "바꿔야 해요.", color: C.lime }] },
  { scene: "cloud", chunks: [{ text: "게다가 클라우드에선" }, { text: "이 설정을" }, { text: "매일 다시 해 줘야 하고요." }] },
  { scene: "fix", chunks: [{ text: "그래서 이걸 전부" }, { text: "알아서 해 주는" }, { text: "프롬프트를 만들었어요.", color: C.lime }] },
  { scene: "fix", chunks: [{ text: "붙여 넣기만 하면," }, { text: "내일 아침부터" }, { text: "글감이 신문으로 와요.", color: C.lime }] },
  { scene: "cta", chunks: [{ text: "댓글에" }, { text: "글감,", color: C.lime }, { text: "남기면" }, { text: "디엠으로 드려요." }] },
];

const TL = buildTimeline(LINES, words as Word[]);
const L = TL.lines;
const TAIL = 45;
export const EP02_DURATION = TL.end + TAIL;

const S = {
  hook: [0, L[1].start],
  intro: [L[1].start, L[4].start],
  problem: [L[4].start, L[7].start],
  rehook: [L[7].start, L[9].start],
  cloud: [L[9].start, L[10].start],
  fix: [L[10].start, L[12].start],
  cta: [L[12].start, EP02_DURATION],
} as const;
type Sc = readonly [number, number];
const at = (line: number, chunk: number, sc: Sc) => L[line].tchunks[chunk].start - sc[0];
const lime = (a: number) => `rgba(215,255,58,${a})`;
const red = (a: number) => `rgba(255,59,48,${a})`;
const PAPER = "#F4EFE4";

const pop = (f: number, fps: number, d = 0, cfg: { damping: number; stiffness: number; mass?: number } = { damping: 13, stiffness: 170 }) => spring({ frame: f - d, fps, config: cfg });

// ---------- hook: drowning in news → one skill ----------

const HEADLINES = ["AI 툴 신제품 출시", "오늘의 IT 뉴스", "마케팅 트렌드 7가지", "유튜브 알고리즘 변화", "주간 뉴스레터 #42", "인스타 업데이트", "검색 트렌드 급상승", "테크 브리핑", "크리에이터 소식", "SNS 정책 변경", "AI 요약 뉴스", "오늘의 블로그 주제"];

const BlogBadge: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ position: "absolute", top: 170, width: "100%", display: "flex", justifyContent: "center", opacity: interpolate(p, [0, 0.3], [0, 1], clamp), scale: String(interpolate(p, [0, 1], [0.6, 1])) }}>
    {BLOG_LOGO ? (
      <Img src={staticFile(BLOG_LOGO)} style={{ width: 200, height: 200, borderRadius: 44, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }} />
    ) : (
      <div style={{ ...glass, borderRadius: 999, padding: "22px 46px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: C.white, display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ color: "#03C75A" }}>●</span> 네이버 블로그
      </div>
    )}
  </div>
);

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.hook;
  const skillAt = at(0, 4, sc);
  const k = f - skillAt;
  const sk = pop(f, fps, skillAt, { damping: 11, stiffness: 200 });
  const pp = pop(f, fps, 4, { damping: 11, stiffness: 170 });
  const clear = interpolate(k, [0, 8], [0, 1], { ...clamp, easing: outExpo });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(70,95,140,0.5)" tint2="rgba(40,50,80,0.5)" />
      <AbsoluteFill style={{ opacity: clear }}>
        <Atmosphere tint="rgba(120,165,20,0.5)" tint2="rgba(40,70,10,0.5)" />
      </AbsoluteFill>
      {/* flood of news tabs */}
      <AbsoluteFill style={{ perspective: 1600, opacity: 1 - clear * 0.85, filter: `blur(${clear * 10}px)` }}>
        {HEADLINES.map((h, i) => {
          const d = 2 + i * 3;
          const p = pop(f, fps, d, { damping: 14, stiffness: 160 });
          const x = 60 + random(`hx${i}`) * 560;
          const y = 380 + (i % 6) * 120 + random(`hy${i}`) * 40;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y - f * 1.2,
                width: 420,
                padding: "22px 28px",
                borderRadius: 22,
                ...glass,
                fontFamily: "Pretendard",
                fontWeight: 700,
                fontSize: 36,
                color: "rgba(255,255,255,0.85)",
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                transform: `rotate(${(random(`hr${i}`) - 0.5) * 14}deg) translateZ(${interpolate(p, [0, 1], [-500, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{["뉴스", "뉴스레터", "유튜브", "블로그"][i % 4]} · 새 글</div>
              {h}
            </div>
          );
        })}
      </AbsoluteFill>
      <BlogBadge p={pop(f, fps, 0, { damping: 12, stiffness: 200 })} />
      {/* the one skill */}
      {k >= 0 && (
        <div style={{ position: "absolute", top: 560, width: "100%", display: "flex", justifyContent: "center", opacity: interpolate(sk, [0, 0.2], [0, 1], clamp), scale: String(interpolate(sk, [0, 1], [0.4, 1])) }}>
          <div style={{ width: 620, padding: "46px 40px", borderRadius: 40, ...glass, border: `3px solid ${lime(0.8)}`, boxShadow: `0 0 90px ${lime(0.35)}, 0 40px 100px rgba(0,0,0,0.6)`, textAlign: "center" }}>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, letterSpacing: 6, color: C.lime }}>SKILL</div>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 92, color: C.white, letterSpacing: -2, marginTop: 6 }}>1개면 끝</div>
          </div>
        </div>
      )}
      {k < 6 && (
        <div style={{ opacity: interpolate(k, [0, 6], [1, 0], clamp) }}>
          <Peupeu left={40} top={860} w={560} h={500} appear={pp} pose={{ face: "shock", sweat: interpolate(f, [10, 20], [0, 1], clamp), wave: 1.3 + Math.sin(f / 3) * 0.2, leftLift: 0.8, rotY: 0.3, rotZ: Math.sin(f / 2.5) * 0.05, scale: 1.1 }} />
        </div>
      )}
      {HEADLINES.map((_, i) => (i % 3 === 0 ? <Sfx key={i} at={2 + i * 3} src="pop" volume={0.25} /> : null))}
      <Sfx at={4} src="blip" volume={0.35} />
      <Sfx at={skillAt} src="ding" volume={0.6} />
    </AbsoluteFill>
  );
};

// ---------- intro: Morning Paper → sources → one-page paper ----------

const SOURCES = ["긱뉴스", "AI타임스", "블로터", "유튜브 · AI 채널", "뉴스레터 2개"];

const MiniPaper: React.FC<{ items: number; title?: string }> = ({ items, title = "나의 아침 신문" }) => (
  <div style={{ background: PAPER, borderRadius: 10, padding: "34px 40px", boxShadow: "0 50px 120px rgba(0,0,0,0.6)" }}>
    <div style={{ fontFamily: "GowunBatang", fontWeight: 700, fontSize: 64, color: "#1d1a16", textAlign: "center", borderBottom: "4px double #1d1a16", paddingBottom: 12 }}>{title}</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px", marginTop: 22 }}>
      {new Array(items).fill(0).map((_, i) => (
        <div key={i}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#1d1a16" }}>{i + 1}. {["AI 툴 새 기능", "릴스 알고리즘", "검색 트렌드", "크리에이터 수익", "블로그 SEO", "SNS 정책", "주간 화제"][i % 7]}</div>
          {[0, 1].map((k) => (
            <div key={k} style={{ height: 10, borderRadius: 5, background: "#C9C0AE", marginTop: 10, width: `${90 - ((i * 13 + k * 21) % 35)}%` }} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.intro;
  const paperAt = at(2, 1, sc);
  const srcAt = at(3, 0, sc);
  const mergeAt = at(3, 2, sc);
  const finalAt = at(3, 3, sc);
  const t = pop(f, fps, 1, { damping: 12, stiffness: 150 });
  const titleOut = interpolate(f, [paperAt - 4, paperAt + 4], [1, 0], clamp);
  const paper = pop(f, fps, paperAt, { damping: 14, stiffness: 140 });
  const paperOut = interpolate(f, [srcAt - 3, srcAt + 4], [1, 0], clamp);
  const merge = interpolate(f - mergeAt, [0, 14], [0, 1], { ...clamp, easing: outExpo });
  const fin = pop(f, fps, finalAt, { damping: 13, stiffness: 150 });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.42)" tint2="rgba(40,70,10,0.45)" />
      {/* title card */}
      <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", opacity: interpolate(t, [0, 0.3], [0, 1], clamp) * titleOut, perspective: 1200 }}>
        <div style={{ display: "inline-block", background: PAPER, borderRadius: 14, padding: "50px 70px 40px", transform: `rotateX(${interpolate(t, [0, 1], [80, 0])}deg)`, boxShadow: `0 0 80px ${lime(0.25)}, 0 50px 120px rgba(0,0,0,0.6)` }}>
          <div style={{ fontFamily: "Georgia, 'DejaVu Serif', serif", fontWeight: 700, fontSize: 116, color: "#1d1a16", letterSpacing: -2 }}>Morning Paper</div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 34, color: "#6e665b", marginTop: 12 }}>github.com/dmthepm/morning-paper · MIT · 무료</div>
        </div>
      </div>
      {/* one paper */}
      {f >= paperAt - 2 && (
        <div style={{ position: "absolute", left: 140, top: 300, width: 800, opacity: interpolate(paper, [0, 0.3], [0, 1], clamp) * paperOut, translate: `0px ${interpolate(paper, [0, 1], [200, 0])}px`, rotate: `${interpolate(paper, [0, 1], [-8, -2])}deg` }}>
          <MiniPaper items={6} />
          <div style={{ position: "absolute", right: -20, top: -50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: "#111", background: C.lime, borderRadius: 99, padding: "10px 26px", rotate: "6deg" }}>매일 아침 6시</div>
        </div>
      )}
      {/* sources → merge → final */}
      {f >= srcAt && (
        <div style={{ position: "absolute", left: 90, top: 300, width: 900 }}>
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 34, color: C.lime, marginBottom: 18, opacity: 1 - merge }}>SOURCES.md</div>
          {SOURCES.map((s, i) => {
            const p = pop(f, fps, srcAt + i * 3, { damping: 14, stiffness: 190 });
            const tx = interpolate(merge, [0, 1], [0, 400 - 0]);
            const ty = interpolate(merge, [0, 1], [i * 120, 260]);
            return (
              <div key={s} style={{ position: "absolute", left: 0, top: 60 + ty, width: 600, padding: "24px 32px", borderRadius: 24, ...glass, fontFamily: "Pretendard", fontWeight: 700, fontSize: 46, color: C.white, opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - interpolate(f - finalAt, [-2, 4], [0, 1], clamp)), translate: `${tx * 0.25}px 0px`, scale: String(1 - merge * 0.2) }}>
                {s}
              </div>
            );
          })}
        </div>
      )}
      {f >= finalAt && (
        <div style={{ position: "absolute", left: 140, top: 300, width: 800, opacity: interpolate(fin, [0, 0.3], [0, 1], clamp), scale: String(interpolate(fin, [0, 1], [0.7, 1])) }}>
          <MiniPaper items={6} />
          <div style={{ position: "absolute", left: -20, top: -50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: "#111", background: C.lime, borderRadius: 99, padding: "10px 26px", rotate: "-5deg" }}>중요한 것만</div>
        </div>
      )}
      <Sfx at={1} src="whoosh" volume={0.35} />
      <Sfx at={paperAt} src="pop" volume={0.5} />
      {SOURCES.map((_, i) => (
        <Sfx key={i} at={srcAt + i * 3} src="key" volume={0.35} />
      ))}
      <Sfx at={mergeAt} src="whoosh" volume={0.45} />
      <Sfx at={finalAt} src="ding" volume={0.55} />
    </AbsoluteFill>
  );
};

// ---------- problem: real "before" render ----------

const Shot: React.FC<{ src: string; tag: string; tagColor: string; glow: string }> = ({ src, tag, tagColor, glow }) => (
  <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", boxShadow: `0 0 70px ${glow}, 0 50px 120px rgba(0,0,0,0.6)`, background: "#fff" }}>
    <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
    <div style={{ position: "absolute", right: 18, bottom: 18, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#fff", background: tagColor, borderRadius: 99, padding: "8px 22px" }}>{tag}</div>
  </div>
);

const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.problem;
  const shotAt = at(5, 0, sc);
  const fontsAt = at(5, 1, sc);
  const wrongAt = at(5, 2, sc);
  const zoomAt = at(6, 1, sc);
  const s = pop(f, fps, shotAt, { damping: 14, stiffness: 150 });
  const z = interpolate(f - zoomAt, [0, 12], [0, 1], { ...clamp, easing: outExpo });
  const pp = pop(f, fps, 3, { damping: 11, stiffness: 170 });
  const shake = f < 12 ? (1 - f / 12) * 14 : 0;
  return (
    <AbsoluteFill style={{ translate: `${(random(`px${f}`) - 0.5) * shake}px 0px` }}>
      <Atmosphere tint="rgba(190,30,25,0.5)" tint2="rgba(110,10,10,0.5)" />
      {f < shotAt + 4 && (
        <div style={{ opacity: interpolate(f, [shotAt - 4, shotAt + 4], [1, 0], clamp) }}>
          <Peupeu left={190} top={420} w={700} h={720} appear={pp} pose={{ face: "shock", sweat: interpolate(f, [8, 16], [0, 1], clamp), wave: 1.4, leftLift: 0.9, rotY: -0.1, scale: 1.5 }} />
        </div>
      )}
      {f >= shotAt && (
        <div style={{ position: "absolute", left: 70, top: 260, width: 940, opacity: interpolate(s, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(s, [0, 1], [120, 0])}px`, transformOrigin: "50% 12%", scale: String(1 + z * 0.3) }}>
          <Shot src="ep02/paper-before.png" tag="기본 상태 (실제 결과)" tagColor={C.red} glow={red(0.3)} />
          {f >= wrongAt && (
            <div style={{ position: "absolute", left: 30, top: 50, width: 400, height: 110, border: `7px solid ${C.red}`, borderRadius: 60, opacity: interpolate(f - wrongAt, [0, 4], [0, 1], clamp), scale: String(interpolate(f - wrongAt, [0, 6], [1.4, 1], clamp)) }} />
          )}
        </div>
      )}
      {f >= fontsAt && (
        <div style={{ position: "absolute", left: 90, top: 820, width: 900, display: "flex", flexDirection: "column", gap: 18, opacity: interpolate(f - fontsAt, [0, 6], [0, 1], clamp) * (1 - z) }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.6)" }}>내장 폰트 3종</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {["TeX Gyre Pagella", "Arimo", "Courier Prime"].map((n) => (
              <div key={n} style={{ ...glass, borderRadius: 999, padding: "14px 26px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: C.white }}>
                {n} <span style={{ color: C.red }}>EN</span>
              </div>
            ))}
          </div>
          {f >= wrongAt && (
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: "#FFB3AD", marginTop: 6, opacity: interpolate(f - wrongAt, [0, 6], [0, 1], clamp) }}>
              → 한글은 중국어 폰트(WenQuanYi)로 대체
            </div>
          )}
        </div>
      )}
      <Sfx at={1} src="glitch" volume={0.45} />
      <Sfx at={3} src="boing" volume={0.35} />
      <Sfx at={shotAt} src="whoosh" volume={0.4} />
      <Sfx at={wrongAt} src="stamp" volume={0.6} />
      <Sfx at={zoomAt} src="whoosh" volume={0.35} />
    </AbsoluteFill>
  );
};

// ---------- re-hook: installing the font is not enough → priority ----------

const Rehook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.rehook;
  const noAt = at(8, 1, sc);
  const prAt = at(8, 2, sc);
  const swapAt = at(8, 3, sc);
  const file = pop(f, fps, 2, { damping: 12, stiffness: 160 });
  const k = f - noAt;
  const x = pop(f, fps, noAt, { damping: 9, stiffness: 260, mass: 0.6 });
  const swap = interpolate(f - swapAt, [0, 12], [0, 1], { ...clamp, easing: outExpo });
  const shake = k >= 0 && k < 10 ? (1 - k / 10) * 22 : 0;
  const showList = f >= prAt - 2;
  return (
    <AbsoluteFill style={{ translate: `${(random(`rx${f}`) - 0.5) * shake}px ${(random(`ry${f}`) - 0.5) * shake}px` }}>
      <Atmosphere tint="rgba(90,90,100,0.35)" tint2="rgba(40,40,50,0.4)" />
      <AbsoluteFill style={{ opacity: swap }}>
        <Atmosphere tint="rgba(120,165,20,0.5)" tint2="rgba(40,70,10,0.5)" />
      </AbsoluteFill>
      {/* font file dropped in */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center", opacity: interpolate(file, [0, 0.3], [0, 1], clamp) * (showList ? interpolate(f, [prAt - 2, prAt + 4], [1, 0], clamp) : 1) }}>
        <div style={{ position: "relative", translate: `0px ${interpolate(file, [0, 1], [-300, 0])}px` }}>
          <div style={{ width: 340, height: 420, borderRadius: 26, background: PAPER, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 150, color: "#1d1a16", lineHeight: 1 }}>가</div>
            <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 32, color: "#6e665b", marginTop: 18 }}>Pretendard.otf</div>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#111", background: C.lime, borderRadius: 99, padding: "6px 20px", marginTop: 14 }}>설치 완료</div>
          </div>
          {k >= 0 && (
            <div style={{ position: "absolute", inset: -40, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 480, color: C.red, lineHeight: 1, textShadow: "0 0 60px rgba(255,59,48,0.6)", scale: String(interpolate(x, [0, 1], [2.4, 1])), opacity: interpolate(k, [0, 2], [0, 1], clamp) }}>
              ✕
            </div>
          )}
        </div>
      </div>
      {/* priority list */}
      {showList && (
        <div style={{ position: "absolute", left: 120, top: 380, width: 840, opacity: interpolate(f, [prAt - 2, prAt + 4], [0, 1], clamp) }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 36, color: "rgba(255,255,255,0.6)", marginBottom: 22 }}>한글 폰트 우선순위</div>
          {[
            { n: "WenQuanYi", d: "중국어 폰트", bad: true },
            { n: "Pretendard", d: "한글 폰트", bad: false },
          ].map((r, i) => {
            const y = i === 0 ? interpolate(swap, [0, 1], [0, 190]) : interpolate(swap, [0, 1], [190, 0]);
            const good = !r.bad;
            return (
              <div
                key={r.n}
                style={{
                  position: "absolute",
                  top: 70 + y,
                  left: 0,
                  width: 840,
                  height: 160,
                  borderRadius: 30,
                  ...glass,
                  border: good ? `3px solid ${lime(0.3 + swap * 0.6)}` : `2px solid rgba(255,255,255,0.2)`,
                  boxShadow: good ? `0 0 ${swap * 70}px ${lime(swap * 0.4)}` : undefined,
                  display: "flex",
                  alignItems: "center",
                  gap: 30,
                  padding: "0 40px",
                  opacity: r.bad ? 1 - swap * 0.45 : 1,
                }}
              >
                <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 70, color: good ? C.lime : "rgba(255,255,255,0.5)", width: 60 }}>{(i === 0 ? swap < 0.5 : swap >= 0.5) ? 1 : 2}</div>
                <div>
                  <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, color: C.white }}>{r.n}</div>
                  <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.55)" }}>{r.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Sfx at={2} src="pop" volume={0.5} />
      <Sfx at={noAt} src="glitch" volume={0.55} />
      <Sfx at={noAt} src="stamp" volume={0.7} />
      <Sfx at={prAt} src="whoosh" volume={0.4} />
      <Sfx at={swapAt} src="ding" volume={0.6} />
    </AbsoluteFill>
  );
};

// ---------- cloud: every run starts fresh ----------

const Cloud: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.cloud;
  const c = pop(f, fps, 1, { damping: 13, stiffness: 150 });
  const daysAt = at(9, 2, sc);
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(70,110,160,0.45)" tint2="rgba(30,40,70,0.5)" />
      <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", justifyContent: "center", opacity: interpolate(c, [0, 0.3], [0, 1], clamp), scale: String(interpolate(c, [0, 1], [0.6, 1])) }}>
        <div style={{ position: "relative", width: 520, height: 300 }}>
          {[
            [60, 120, 220],
            [200, 40, 280],
            [330, 110, 200],
          ].map(([l, t, s], i) => (
            <div key={i} style={{ position: "absolute", left: l, top: t, width: s, height: s, borderRadius: 999, background: "linear-gradient(170deg,#ffffff,#cfd8e6)" }} />
          ))}
          <div style={{ position: "absolute", left: 40, top: 200, width: 460, height: 120, borderRadius: 60, background: "linear-gradient(170deg,#f2f5fa,#c9d3e2)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 120, color: "#2a3a55", rotate: `${-f * 6}deg` }}>↻</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 760, width: 900, display: "flex", gap: 18, justifyContent: "center" }}>
        {["월", "화", "수", "목", "금"].map((d, i) => {
          const p = pop(f, fps, daysAt + i * 4, { damping: 12, stiffness: 200 });
          return (
            <div key={d} style={{ width: 160, padding: "22px 0", borderRadius: 24, ...glass, textAlign: "center", opacity: interpolate(p, [0, 0.3], [0, 1], clamp), scale: String(interpolate(p, [0, 1], [0.5, 1])) }}>
              <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 50, color: C.white }}>{d}</div>
              <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 24, color: "#FFB3AD", marginTop: 6 }}>설정 초기화</div>
            </div>
          );
        })}
      </div>
      <Sfx at={1} src="whoosh" volume={0.35} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Sfx key={i} at={daysAt + i * 4} src="pop" volume={0.3} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- fix: the prompt + real "after" render ----------

const STEPS = ["엔진 설치", "한글 폰트 해결", "내 신문 만들기", "매일 아침 자동 실행"];

const Fix: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.fix;
  const doc = pop(f, fps, 1, { damping: 14, stiffness: 150 });
  const afterAt = at(11, 0, sc);
  const sunAt = at(11, 1, sc);
  const glowAt = at(11, 2, sc);
  const a = pop(f, fps, afterAt, { damping: 13, stiffness: 150 });
  const glow = interpolate(f - glowAt, [0, 6], [0, 1], clamp);
  const pp = pop(f, fps, glowAt - 4, { damping: 11, stiffness: 170 });
  const j = jumpPose(f - glowAt, 0.35);
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.45)" tint2="rgba(40,70,10,0.5)" />
      <AbsoluteFill style={{ opacity: interpolate(f - sunAt, [0, 14], [0, 0.8], clamp), background: "radial-gradient(70% 40% at 50% 100%, rgba(255,190,90,0.45), transparent 70%)" }} />
      {/* prompt doc */}
      <div style={{ position: "absolute", left: 90, top: 260, width: 900, opacity: interpolate(doc, [0, 0.3], [0, 1], clamp) * interpolate(f, [afterAt - 4, afterAt + 4], [1, 0], clamp), translate: `0px ${interpolate(doc, [0, 1], [120, 0])}px` }}>
        <div style={{ background: "#14151a", border: `2px solid ${lime(0.6)}`, borderRadius: 30, padding: "40px 46px", boxShadow: `0 0 70px ${lime(0.25)}, 0 50px 120px rgba(0,0,0,0.6)` }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 44, color: C.white }}>Morning Paper 한국어 보완판</div>
          <div style={{ fontFamily: "monospace", fontSize: 28, color: "rgba(255,255,255,0.5)", margin: "8px 0 26px" }}>복붙용 설치 프롬프트</div>
          {STEPS.map((s, i) => {
            const p = pop(f, fps, 6 + i * 6, { damping: 10, stiffness: 240 });
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 18 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: C.lime, color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, scale: String(p) }}>✓</div>
                <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 48, color: i === 1 ? C.lime : C.white }}>
                  {i + 1}. {s}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* real after */}
      {f >= afterAt && (
        <div style={{ position: "absolute", left: 70, top: 280, width: 940, opacity: interpolate(a, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(a, [0, 1], [140, 0])}px`, scale: String(1 + glow * 0.03) }}>
          <Shot src="ep02/paper-after.png" tag="보완 후 (실제 결과)" tagColor="#3a8f00" glow={lime(0.2 + glow * 0.35)} />
        </div>
      )}
      {f >= glowAt - 4 && <Peupeu left={260} top={850} w={560} h={480} appear={pp} pose={{ face: "happy", wave: 1.2 + 0.5 * Math.sin(f * 0.55), leftLift: j.air ? 1 : 0.3, jump: j.jump, sx: j.sx, sy: j.sy, rotY: -0.25, scale: 1.1 }} />}
      <Sfx at={1} src="whoosh" volume={0.35} />
      {STEPS.map((_, i) => (
        <Sfx key={i} at={6 + i * 6} src="pop" volume={0.4} />
      ))}
      <Sfx at={afterAt} src="whoosh" volume={0.45} />
      <Sfx at={glowAt} src="ding" volume={0.6} />
      <Sfx at={glowAt + 3} src="boing" volume={0.4} />
    </AbsoluteFill>
  );
};

// ---------- CTA ----------

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.cta;
  const typeAt = at(12, 1, sc);
  const dmAt = at(12, 3, sc);
  const cmt = pop(f, fps, 1, { damping: 14, stiffness: 170 });
  const dm = pop(f, fps, dmAt, { damping: 12, stiffness: 180 });
  const typed = "글감".slice(0, Math.max(0, Math.floor((f - typeAt) / 4) + 1));
  const pp = pop(f, fps, 2, { damping: 11, stiffness: 170 });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.45)" tint2="rgba(40,70,10,0.5)" />
      <div style={{ position: "absolute", left: 140, top: 250, width: 800, rotate: "-2deg", opacity: 0.95 }}>
        <MiniPaper items={4} title="오늘의 블로그 글감" />
      </div>
      <div style={{ position: "absolute", left: 90, top: 900, width: 900, opacity: interpolate(cmt, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(cmt, [0, 1], [80, 0])}px` }}>
        <div style={{ ...glass, borderRadius: 999, height: 140, display: "flex", alignItems: "center", gap: 28, padding: "0 40px" }}>
          <div style={{ width: 80, height: 80, borderRadius: 99, background: "linear-gradient(140deg,#8a8f98,#4a4f58)" }} />
          <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: f >= typeAt ? C.lime : "rgba(255,255,255,0.4)" }}>
            {f >= typeAt ? typed : "댓글 달기…"}
            {f >= typeAt && <span style={{ color: C.white, opacity: f % 14 < 8 ? 1 : 0, fontWeight: 400 }}>|</span>}
          </span>
        </div>
      </div>
      {f >= dmAt && (
        <div style={{ position: "absolute", left: 90, top: 70, width: 900, translate: `0px ${interpolate(dm, [0, 1], [-220, 0])}px`, opacity: interpolate(dm, [0, 0.3], [0, 1], clamp) }}>
          <div style={{ background: "rgba(25,26,30,0.94)", border: `2px solid ${lime(0.6)}`, borderRadius: 36, padding: "26px 34px", display: "flex", alignItems: "center", gap: 26, boxShadow: `0 0 60px ${lime(0.3)}, 0 30px 80px rgba(0,0,0,0.6)` }}>
            <div style={{ width: 86, height: 86, borderRadius: 24, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: "#111" }}>DM</div>
            <div>
              <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, color: C.white }}>보완판 프롬프트가 도착했어요</div>
              <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.55)" }}>설치 · 한글 폰트 · 매일 자동 실행</div>
            </div>
          </div>
        </div>
      )}
      <Peupeu left={600} top={1010} w={460} h={420} appear={pp} pose={{ face: f >= dmAt ? "happy" : "prompt", blink: f % 16 >= 9, wave: 1.15 + 0.5 * Math.sin(f * 0.55), rotY: -0.45, scale: 1.0 }} />
      <Sfx at={2} src="blip" volume={0.35} />
      <Sfx at={typeAt} src="key" volume={0.5} />
      <Sfx at={typeAt + 4} src="key" volume={0.5} />
      <Sfx at={dmAt} src="ding" volume={0.7} />
    </AbsoluteFill>
  );
};

// ---------- composition ----------

const CUTS = Object.values(S).slice(1).map((s) => s[0]);

const CutFlash: React.FC = () => {
  const f = useCurrentFrame();
  const o = CUTS.reduce((a, c) => a + interpolate(f, [c - 2, c, c + 7], [0, 0.16, 0], clamp), 0);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "screen" }} />;
};

const Scene: React.FC<{ s: Sc; first?: boolean; last?: boolean; children: React.ReactNode }> = ({ s, first, last, children }) => {
  const dur = s[1] - s[0];
  return (
    <Sequence from={s[0]} durationInFrames={dur + (last ? 0 : 7)}>
      <SceneWrap dur={last ? dur + 40 : dur} noIn={first}>
        {children}
      </SceneWrap>
    </Sequence>
  );
};

export const Ep02Full: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Scene s={S.hook} first>
        <Hook />
      </Scene>
      <Scene s={S.intro}>
        <Intro />
      </Scene>
      <Scene s={S.problem}>
        <Problem />
      </Scene>
      <Scene s={S.rehook}>
        <Rehook />
      </Scene>
      <Scene s={S.cloud}>
        <Cloud />
      </Scene>
      <Scene s={S.fix}>
        <Fix />
      </Scene>
      <Scene s={S.cta} last>
        <Cta />
      </Scene>
      <Html5Audio src={staticFile("ep02/narration.mp3")} />
      {CUTS.map((c, i) => (
        <Sfx key={i} at={c - 4} src="whoosh" volume={0.3} />
      ))}
      <CutFlash />
      <Dust />
      <Grain />
      <Vignette />
      <NarrationCaptions lines={L} />
    </AbsoluteFill>
  );
};
