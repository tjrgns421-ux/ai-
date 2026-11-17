import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../StyleFrames";
import { Atmosphere, C, Dust, Grain, Peupeu, SceneWrap, Sfx, Vignette, clamp, glass, jumpPose, outExpo } from "../ep01/Opening";
import { Line, NarrationCaptions, Word, buildTimeline } from "../lib/narration";
import words from "../../public/ep02/narration.words.json";

// ep02 — Morning Paper (dmthepm/morning-paper, MIT) for bloggers. The gap: it
// makes a newspaper, not blog ideas; our prompt adds a daily blog-idea page.
// Proof images are real Morning Paper renders made from real news (public/ep02/).

// Official Naver Blog logo file, placed by the user. null → neutral text badge.
const BLOG_LOGO: string | null = null; // e.g. "brand/naver-blog.png"

const LINES: Line[] = [
  { scene: "hook", chunks: [{ text: "블로그 글감" }, { text: "찾으려고" }, { text: "아침마다" }, { text: "뉴스 다 뒤지고 있다면," }, { text: "이 스킬 하나는" }, { text: "꼭 설치해 두세요.", color: C.lime }] },
  { scene: "intro", chunks: [{ text: "모닝 페이퍼.", color: C.lime }] },
  { scene: "intro", chunks: [{ text: "깃허브 무료 스킬인데," }, { text: "매일 아침" }, { text: "신문 한 장을 찍어 줘요." }] },
  { scene: "intro", chunks: [{ text: "보는 채널만" }, { text: "적어 두면," }, { text: "겹치는 건 합치고" }, { text: "중요한 것만 골라 줘요.", color: C.lime }] },
  { scene: "gap", chunks: [{ text: "그런데" }, { text: "이건 신문이지," }, { text: "블로그 글감은 아니에요.", color: C.red }] },
  { scene: "gap", chunks: [{ text: "뭘 쓸지는," }, { text: "결국 또 골라야 하죠." }] },
  { scene: "gap", chunks: [{ text: "신문 다 읽고 나서," }, { text: "또 고민이 시작되는 거예요." }] },
  { scene: "add", chunks: [{ text: "그래서" }, { text: "한 단계를 더 붙였어요.", color: C.lime }] },
  { scene: "add", chunks: [{ text: "신문에서 오늘 쓸" }, { text: "글감 세 개를 고르고," }] },
  { scene: "add", chunks: [{ text: "내 블로그 주제에 맞춰," }, { text: "제목 후보랑" }, { text: "근거 기사 링크까지", color: C.lime }, { text: "달아 줘요." }] },
  { scene: "offpc", chunks: [{ text: "컴퓨터를 꺼 둬도" }, { text: "돌아가게," }, { text: "필요한 설정도" }, { text: "같이 넣었고요." }] },
  { scene: "promise", chunks: [{ text: "붙여 넣기만 하면," }, { text: "내일 아침부터" }, { text: "글감이 신문으로 와요.", color: C.lime }] },
  { scene: "cta", chunks: [{ text: "댓글에" }, { text: "글감,", color: C.lime }, { text: "남기면" }, { text: "디엠으로 드려요." }] },
];

const TL = buildTimeline(LINES, words as Word[]);
const L = TL.lines;
const TAIL = 45;
export const EP02_DURATION = TL.end + TAIL;

const S = {
  hook: [0, L[1].start],
  intro: [L[1].start, L[4].start],
  gap: [L[4].start, L[7].start],
  add: [L[7].start, L[10].start],
  offpc: [L[10].start, L[11].start],
  promise: [L[11].start, L[12].start],
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
        <div style={{ position: "absolute", left: 70, top: 330, width: 940, opacity: interpolate(paper, [0, 0.3], [0, 1], clamp) * paperOut, translate: `0px ${interpolate(paper, [0, 1], [200, 0])}px`, rotate: `${interpolate(paper, [0, 1], [-6, -1.5])}deg` }}>
          <Shot src="ep02/paper-news.png" tag="실제 결과 · 오늘 뉴스" tagColor="#3a8f00" glow={lime(0.25)} />
          <div style={{ position: "absolute", right: -10, top: -60, fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: "#111", background: C.lime, borderRadius: 99, padding: "10px 26px", rotate: "6deg" }}>매일 아침 6시</div>
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
        <div style={{ position: "absolute", left: 70, top: 330, width: 940, opacity: interpolate(fin, [0, 0.3], [0, 1], clamp), scale: String(interpolate(fin, [0, 1], [0.7, 1])) }}>
          <Shot src="ep02/paper-news.png" tag="실제 결과 · 오늘 뉴스" tagColor="#3a8f00" glow={lime(0.25)} />
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

// ---------- real render frame ----------

const Shot: React.FC<{ src: string; tag: string; tagColor: string; glow: string }> = ({ src, tag, tagColor, glow }) => (
  <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", boxShadow: `0 0 70px ${glow}, 0 50px 120px rgba(0,0,0,0.6)`, background: "#fff" }}>
    <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
    <div style={{ position: "absolute", right: 18, bottom: 18, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#fff", background: tagColor, borderRadius: 99, padding: "8px 22px" }}>{tag}</div>
  </div>
);


// ---------- gap: a newspaper is not a blog idea ----------

const Gap: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.gap;
  const noAt = at(4, 2, sc);
  const edAt = at(5, 0, sc);
  const ppAt = at(6, 0, sc);
  const p = pop(f, fps, 1, { damping: 14, stiffness: 150 });
  const no = pop(f, fps, noAt, { damping: 9, stiffness: 260, mass: 0.6 });
  const ed = pop(f, fps, edAt, { damping: 14, stiffness: 160 });
  const pp = pop(f, fps, ppAt, { damping: 11, stiffness: 170 });
  const shrink = interpolate(f - edAt, [0, 12], [0, 1], { ...clamp, easing: outExpo });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(110,110,125,0.35)" tint2="rgba(40,40,50,0.4)" />
      <AbsoluteFill style={{ opacity: interpolate(f - noAt, [0, 6], [0, 0.8], clamp) * (1 - shrink * 0.6) }}>
        <Atmosphere tint="rgba(190,30,25,0.45)" tint2="rgba(110,10,10,0.45)" />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 70, top: 330, width: 940, opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - shrink * 0.75), scale: String(1 - shrink * 0.45), translate: `${-shrink * 60}px ${-shrink * 130}px`, transformOrigin: "50% 0%" }}>
        <Shot src="ep02/paper-news.png" tag="신문" tagColor="#555" glow={lime(0.1)} />
        {f >= noAt && (
          <div style={{ position: "absolute", right: 30, top: 30, background: C.red, color: "#fff", fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, borderRadius: 999, padding: "12px 36px", rotate: "8deg", scale: String(interpolate(no, [0, 1], [2.2, 1])), boxShadow: `0 18px 50px ${red(0.5)}` }}>
            글감 ✕
          </div>
        )}
      </div>
      {f >= edAt && (
        <div style={{ position: "absolute", left: 90, top: 560, width: 900, opacity: interpolate(ed, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(ed, [0, 1], [140, 0])}px` }}>
          <div style={{ background: "#fbfbfb", borderRadius: 26, padding: "34px 40px", boxShadow: "0 50px 120px rgba(0,0,0,0.6)" }}>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#03C75A", marginBottom: 20 }}>새 글 쓰기</div>
            <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 54, color: "#b5b5b5", borderBottom: "2px solid #eee", paddingBottom: 16 }}>
              제목을 입력하세요<span style={{ color: "#111", opacity: f % 16 < 9 ? 1 : 0 }}>|</span>
            </div>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ height: 16, borderRadius: 8, background: "#eee", marginTop: 26, width: `${88 - k * 22}%` }} />
            ))}
          </div>
        </div>
      )}
      {f >= ppAt && (
        <>
          <Peupeu left={560} top={900} w={500} h={460} appear={pp} pose={{ face: "meh", wave: 0.35, rotY: -0.4, rotZ: Math.sin(f / 9) * 0.05, scale: 1.05 }} />
          <div style={{ position: "absolute", left: 900, top: 900, fontFamily: "Pretendard", fontWeight: 900, fontSize: 120, color: C.white, opacity: interpolate(f - ppAt, [6, 12], [0, 1], clamp), rotate: `${Math.sin(f / 6) * 8}deg` }}>?</div>
        </>
      )}
      <Sfx at={1} src="whoosh" volume={0.3} />
      <Sfx at={noAt} src="glitch" volume={0.5} />
      <Sfx at={edAt} src="pop" volume={0.45} />
      <Sfx at={ppAt} src="blip" volume={0.35} />
    </AbsoluteFill>
  );
};

// ---------- add: one more step → blog-idea page (real render) ----------

const IDEAS = ["직장인 3명 중 2명이 쓰는 AI, 나는 몇 시간 아낄까", "AI 구독료, 다들 얼마나 쓰고 있을까", "대화창에 툴을 붙이는 법, MCP 입문"];

const Add: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.add;
  const tabAt = at(7, 1, sc);
  const cardsAt = at(8, 1, sc);
  const realAt = at(9, 0, sc);
  const titleAt = at(9, 1, sc);
  const linkAt = at(9, 2, sc);
  const tab = pop(f, fps, tabAt, { damping: 12, stiffness: 170 });
  const real = pop(f, fps, realAt, { damping: 14, stiffness: 150 });
  const cardsOut = interpolate(f, [realAt - 4, realAt + 4], [1, 0], clamp);
  const hl = (from: number) => interpolate(f - from, [0, 6], [0, 1], { ...clamp, easing: outExpo });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.45)" tint2="rgba(40,70,10,0.5)" />
      {/* "+ one page" tab */}
      <div style={{ position: "absolute", top: 260, width: "100%", display: "flex", justifyContent: "center", opacity: interpolate(tab, [0, 0.3], [0, 1], clamp) * cardsOut, scale: String(interpolate(tab, [0, 1], [0.5, 1])) }}>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: "#111", background: C.lime, borderRadius: 26, padding: "18px 44px", boxShadow: `0 0 70px ${lime(0.45)}` }}>+ 오늘의 블로그 글감</div>
      </div>
      {/* three idea cards (titles from the real page) */}
      {IDEAS.map((t, i) => {
        const p = pop(f, fps, cardsAt + i * 5, { damping: 13, stiffness: 180 });
        return (
          <div key={i} style={{ position: "absolute", left: 90, top: 450 + i * 200, width: 900, padding: "30px 38px", borderRadius: 28, ...glass, border: `2px solid ${lime(0.45)}`, opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * cardsOut, translate: `${interpolate(p, [0, 1], [160, 0])}px 0px` }}>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: C.lime, marginBottom: 6 }}>글감 {i + 1}</div>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 44, color: C.white, letterSpacing: -1, wordBreak: "keep-all" }}>{t}</div>
          </div>
        );
      })}
      {/* the real page */}
      {f >= realAt - 2 && (
        <div style={{ position: "absolute", left: 50, top: 300, width: 980, opacity: interpolate(real, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(real, [0, 1], [160, 0])}px` }}>
          <div style={{ position: "relative" }}>
            <Shot src="ep02/paper-ideas.png" tag="실제 결과 · 오늘 뉴스로 만듦" tagColor="#3a8f00" glow={lime(0.3)} />
            <div style={{ position: "absolute", left: "1%", top: "6%", width: "70%", height: "11%", border: `6px solid ${C.lime}`, borderRadius: 14, opacity: hl(realAt + 6), boxShadow: `0 0 30px ${lime(0.6)}` }} />
            <div style={{ position: "absolute", left: "1%", top: "36%", width: "98%", height: "15%", border: `6px solid ${C.lime}`, borderRadius: 14, opacity: hl(titleAt), boxShadow: `0 0 30px ${lime(0.6)}` }} />
            <div style={{ position: "absolute", left: "1%", top: "70%", width: "98%", height: "29%", border: `6px solid ${C.lime}`, borderRadius: 14, opacity: hl(linkAt), boxShadow: `0 0 30px ${lime(0.6)}` }} />
          </div>
        </div>
      )}
      <Sfx at={tabAt} src="pop" volume={0.55} />
      {IDEAS.map((_, i) => (
        <Sfx key={i} at={cardsAt + i * 5} src="ding" volume={0.35} />
      ))}
      <Sfx at={realAt} src="whoosh" volume={0.45} />
      <Sfx at={titleAt} src="pop" volume={0.4} />
      <Sfx at={linkAt} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};

// ---------- off-PC: runs in the cloud at 6 ----------

const OffPc: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.offpc;
  const p = pop(f, fps, 1, { damping: 13, stiffness: 160 });
  const cl = pop(f, fps, at(10, 1, sc), { damping: 12, stiffness: 170 });
  const chipsAt = at(10, 2, sc);
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(70,110,160,0.45)" tint2="rgba(30,40,70,0.5)" />
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 60 }}>
        <div style={{ opacity: interpolate(p, [0, 0.3], [0, 1], clamp), scale: String(interpolate(p, [0, 1], [0.6, 1])), textAlign: "center" }}>
          <div style={{ width: 300, height: 200, borderRadius: 18, background: "#0d0e11", border: "10px solid #3a3d44", margin: "0 auto" }} />
          <div style={{ width: 360, height: 24, borderRadius: 8, background: "#3a3d44", margin: "0 auto" }} />
          <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: "rgba(255,255,255,0.6)", marginTop: 18 }}>꺼짐</div>
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 90, color: C.lime, opacity: interpolate(cl, [0, 0.3], [0, 1], clamp) }}>→</div>
        <div style={{ position: "relative", width: 300, height: 230, opacity: interpolate(cl, [0, 0.3], [0, 1], clamp), scale: String(interpolate(cl, [0, 1], [0.5, 1])) }}>
          <div style={{ position: "absolute", left: 30, top: 70, width: 150, height: 150, borderRadius: 999, background: "linear-gradient(170deg,#fff,#cfd8e6)" }} />
          <div style={{ position: "absolute", left: 120, top: 20, width: 170, height: 170, borderRadius: 999, background: "linear-gradient(170deg,#fff,#cfd8e6)" }} />
          <div style={{ position: "absolute", left: 10, top: 140, width: 280, height: 80, borderRadius: 40, background: "linear-gradient(170deg,#f2f5fa,#c9d3e2)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 245, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: "#111", background: C.lime, borderRadius: 99, padding: "8px 0" }}>06:00 실행</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 820, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
        {["설치 자동", "사이트 접속 확인", "매일 6시 예약"].map((t, i) => {
          const c = pop(f, fps, chipsAt + i * 4, { damping: 11, stiffness: 220 });
          return (
            <div key={t} style={{ ...glass, borderRadius: 999, padding: "16px 28px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 36, color: C.white, scale: String(c), opacity: c > 0.02 ? 1 : 0 }}>
              <span style={{ color: C.lime }}>✓</span> {t}
            </div>
          );
        })}
      </div>
      <Sfx at={1} src="whoosh" volume={0.35} />
      <Sfx at={at(10, 1, sc)} src="pop" volume={0.45} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} at={chipsAt + i * 4} src="pop" volume={0.35} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- promise: tomorrow morning ----------

const Promise_: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.promise;
  const sunAt = at(11, 1, sc);
  const glowAt = at(11, 2, sc);
  const a = pop(f, fps, sunAt - 4, { damping: 13, stiffness: 150 });
  const glow = interpolate(f - glowAt, [0, 6], [0, 1], clamp);
  const pp = pop(f, fps, glowAt - 4, { damping: 11, stiffness: 170 });
  const j = jumpPose(f - glowAt, 0.35);
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.45)" tint2="rgba(40,70,10,0.5)" />
      <AbsoluteFill style={{ opacity: interpolate(f - sunAt, [0, 14], [0, 0.85], clamp), background: "radial-gradient(70% 40% at 50% 100%, rgba(255,190,90,0.45), transparent 70%)" }} />
      <div style={{ position: "absolute", left: 90, top: 330, width: 900, opacity: interpolate(f, [1, 8], [0, 1], clamp) * interpolate(f, [sunAt - 4, sunAt + 2], [1, 0], clamp) }}>
        <div style={{ background: "#14151a", border: `2px solid ${lime(0.6)}`, borderRadius: 30, padding: "40px 46px", boxShadow: `0 0 70px ${lime(0.25)}` }}>
          <div style={{ fontFamily: "monospace", fontSize: 30, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>복붙용 프롬프트</div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: C.white }}>Morning Paper 블로거용 보완판</div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: C.lime, marginTop: 18 }}>Ctrl + V</div>
        </div>
      </div>
      {f >= sunAt - 4 && (
        <div style={{ position: "absolute", left: 50, top: 300, width: 980, opacity: interpolate(a, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(a, [0, 1], [180, 0])}px`, scale: String(1 + glow * 0.03) }}>
          <Shot src="ep02/paper-ideas.png" tag="내일 아침 6시" tagColor="#3a8f00" glow={lime(0.2 + glow * 0.4)} />
        </div>
      )}
      {f >= glowAt - 4 && <Peupeu left={260} top={850} w={560} h={480} appear={pp} pose={{ face: "happy", wave: 1.2 + 0.5 * Math.sin(f * 0.55), leftLift: j.air ? 1 : 0.3, jump: j.jump, sx: j.sx, sy: j.sy, rotY: -0.25, scale: 1.1 }} />}
      <Sfx at={1} src="key" volume={0.5} />
      <Sfx at={4} src="key" volume={0.5} />
      <Sfx at={sunAt} src="whoosh" volume={0.45} />
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
      <div style={{ position: "absolute", left: 50, top: 250, width: 980, rotate: "-1.5deg", opacity: 0.95 }}>
        <Shot src="ep02/paper-ideas.png" tag="오늘의 블로그 글감" tagColor="#3a8f00" glow={lime(0.25)} />
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
              <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, color: C.white }}>블로거용 보완판 프롬프트 도착</div>
              <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.55)" }}>설치 · 오늘의 블로그 글감 면 · 매일 6시</div>
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
      <Scene s={S.gap}>
        <Gap />
      </Scene>
      <Scene s={S.add}>
        <Add />
      </Scene>
      <Scene s={S.offpc}>
        <OffPc />
      </Scene>
      <Scene s={S.promise}>
        <Promise_ />
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
