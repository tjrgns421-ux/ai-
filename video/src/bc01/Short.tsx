import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../StyleFrames";
import words from "../../public/bc01s/narration.words.json";
import { BG, Bar, Blip, DIM, Face, INK, K, LIME, RED, Shot, Source, Stamp, T, clamp, outExpo, pop, rise } from "./Bc01";

// Blip Check #1, vertical Shorts cut (9:16, ~30 s) that sends viewers to the full video.

const FPS = 30;
type W = { text: string; start: number; end: number };
const WORDS = words as W[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
let BIG = "";
const OWNER: number[] = [];
WORDS.forEach((w, i) => {
  for (const c of norm(w.text)) {
    BIG += c;
    OWNER.push(i);
  }
});
const timeOf = (phrase: string, after = 0): number => {
  const n = norm(phrase);
  let from = 0;
  for (;;) {
    const at = BIG.indexOf(n, from);
    if (at < 0) throw new Error(`phrase not found: ${phrase}`);
    const t = WORDS[OWNER[at]].start;
    if (t >= after - 0.05) return t;
    from = at + 1;
  }
};
const f = (s: number) => Math.round(s * FPS);
export const BC01S_DURATION = f(WORDS[WORDS.length - 1].end) + 40;

type Ctx = { lf: number; dur: number; at: (p: string) => number };
type Beat = { at: string; sfx?: string; face?: Face; noHost?: boolean; r: (c: Ctx) => React.ReactNode };
const SA = "SiliconANGLE, Nov 17 2026";
const AA = "Artificial Analysis (independent), max settings";

const B: Beat[] = [
  { at: "OpenAI says its new model", sfx: "whoosh", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <T y={330} size={90} center style={rise(lf)}>OpenAI's claim:</T>
    <Shot lf={lf} dur={dur} src="bc01/claim.png" w={1512} h={245} scale={0.64} x={36} y={500} tilt={-1.5} marks={[{ x: 1028, y: 126, w: 330, h: 52, at: at("beats Claude") }, { x: 28, y: 183, w: 925, h: 52, at: at("five percent") }]} />
    <T y={820} size={300} center style={pop(lf, at("five percent"), 0.5)}><K>5%</K></T>
  </>) },
  { at: "So Blip checked", sfx: "blip", noHost: true, r: ({ lf }) => (<>
    <Shot lf={lf} dur={50} src="bc01/n-rd.png" w={1680} h={420} scale={0.5} x={40} y={220} tilt={-3} />
    <Shot lf={lf} dur={50} src="bc01/n-tt.png" w={2600} h={330} scale={0.36} x={60} y={520} tilt={2} d={3} />
    <Shot lf={lf} dur={50} src="bc01/n-dc.png" w={1320} h={640} scale={0.45} x={420} y={720} tilt={-2} d={6} />
    <Blip lf={lf} face="prompt" x={60} y={760} size={460} />
  </>) },
  { at: "That Claude claim", sfx: "pop", face: "meh", r: ({ lf, at }) => (<>
    <Source text="OpenAI launch chart, via R&D World" />
    <Shot lf={lf} dur={90} src="bc01/c-vals.png" w={1484} h={1176} scale={0.64} x={36} y={300} />
    <Stamp lf={lf} d={at("one test")} text="ONE TEST" x={280} y={1060} rot={-6} size={110} color={RED} />
  </>) },
  { at: "On an independent index", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <Source text={AA} />
    <T y={360} size={70} color={DIM} style={rise(lf)} x={90}>Independent index</T>
    <Bar lf={lf} d={at("Claude Fable")} label="Claude Fable 5.2" value={65} max={65} x={90} y={520} color={INK} len={680} />
    <Bar lf={lf} d={at("Sixty-two")} label="GPT-6.2 Astra" value={62} max={65} x={90} y={760} color={LIME} len={680} />
    <T y={1040} size={80} x={90} style={rise(lf, at("still scores higher"))}>Claude still <K>on top.</K></T>
  </>) },
  { at: "But the price part", sfx: "stamp", face: "happy", r: ({ lf, at }) => (<>
    <T y={480} size={100} center style={rise(lf)}>The price part?</T>
    <Stamp lf={lf} d={at("Real")} text="REAL" x={290} y={680} rot={-8} size={200} />
  </>) },
  { at: "Per task Astra costs", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <Source text={AA} />
    <T y={360} size={70} color={DIM} x={90} style={rise(lf)}>Cost per task</T>
    <Bar lf={lf} d={at("four dollars")} label="GPT-6.2 Astra" value={4} max={26.54} x={90} y={520} color={LIME} fmt={(v) => `$${v.toFixed(2)}`} len={600} />
    <Bar lf={lf} d={at("twenty-six")} label="Claude Fable 5.2" value={26.54} max={26.54} x={90} y={760} color={RED} fmt={(v) => `$${v.toFixed(2)}`} len={600} />
  </>) },
  { at: "And for everyday coding", sfx: "whoosh", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <T y={330} size={84} center style={rise(lf)}>Everyday coding?</T>
    <Shot lf={lf} dur={dur} src="bc01/solcatch.png" w={1512} h={245} scale={0.64} x={36} y={500} tilt={1} marks={[{ x: 336, y: 126, w: 692, h: 52, at: at("half a point") }]} />
    <T y={840} size={130} center style={pop(lf, at("half a point"))}>Sol ≈ Astra</T>
    <T y={1000} size={60} center color={DIM} style={rise(lf, at("cheaper Sol"))}>(and much cheaper)</T>
  </>) },
  { at: "Blip's verdict", sfx: "stamp", face: "shock", r: ({ lf, at }) => (<>
    <T y={480} size={90} center style={rise(lf)}>Blip's verdict:</T>
    <Stamp lf={lf} d={at("half true")} text="HALF TRUE" x={90} y={680} rot={-6} size={170} color="#FFC93A" />
  </>) },
  { at: "Every source and", sfx: "ding", noHost: true, r: ({ lf, at }) => {
    const bounce = Math.abs(Math.sin(lf / 6)) * 22;
    return (<>
      <T y={230} size={64} center color={DIM} style={rise(lf)}>Every source + the full check</T>
      <div style={{ position: "absolute", left: 90, top: 340, width: 900, borderRadius: 24, overflow: "hidden", border: `6px solid ${LIME}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", ...pop(lf, 2) }}>
        <Img src={staticFile("bc01/thumb.png")} style={{ width: 888, display: "block" }} />
      </div>
      <T y={900} size={110} center style={pop(lf, at("full video"))}><K>FULL VIDEO</K></T>
      <T y={1040 + bounce} size={140} center style={rise(lf, at("Tap the link"))}>↓</T>
      <Blip lf={lf} face="happy" x={620} y={1080} size={380} />
    </>);
  } },
];

const STARTS: number[] = [];
{
  let after = 0;
  for (const b of B) {
    const t = timeOf(b.at, after);
    STARTS.push(f(t));
    after = t + 0.01;
  }
}

type Chunk = { text: string; start: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  const lines = ["OpenAI says its new model beats Claude, at five percent of the cost.", "So Blip checked the receipts.", "That Claude claim comes from one test OpenAI picked.", "On an independent index, Claude Fable 5.2 still scores higher. Sixty-five to sixty-two.", "But the price part? Real.", "Per task, Astra costs about four dollars. Claude Fable: twenty-six fifty.", "And for everyday coding, the cheaper Sol lands within half a point of Astra.", "Blip's verdict: half true.", "Every source and the full check are in the full video. Tap the link below."];
  let p = 0;
  for (const line of lines) {
    let cur: { t: string; s: number }[] = [];
    const flush = () => {
      if (cur.length) out.push({ text: cur.map((x) => x.t).join(" "), start: f(cur[0].s) });
      cur = [];
    };
    for (const tok of line.split(/\s+/)) {
      const n = norm(tok);
      const at = BIG.indexOf(n, p);
      if (!n || at < 0) continue;
      p = at + n.length;
      cur.push({ t: tok, s: WORDS[OWNER[at]].start });
      if (/[.,?!:;]$/.test(tok) || cur.length >= 3 || cur.map((x) => x.t).join(" ").length > 16) flush();
    }
    flush();
  }
  return out;
})();

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const i = CHUNKS.findIndex((c, k) => fr >= c.start && fr < (CHUNKS[k + 1]?.start ?? c.start + 50));
  if (i < 0) return null;
  const lf = fr - CHUNKS[i].start;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1330, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 84, letterSpacing: -2, lineHeight: 1.1, color: INK, textShadow: "0 6px 30px rgba(0,0,0,0.85), 0 3px 0 rgba(0,0,0,0.6)", opacity: interpolate(lf, [0, 2], [0, 1], clamp), scale: String(interpolate(lf, [0, 5], [0.86, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })), translate: `0px ${interpolate(lf, [0, 5], [18, 0], { ...clamp, easing: outExpo })}px` }}>
        {CHUNKS[i].text}
      </span>
    </div>
  );
};

const Host: React.FC = () => {
  const fr = useCurrentFrame();
  let i = 0;
  while (i + 1 < STARTS.length && fr >= STARTS[i + 1]) i++;
  const b = B[i];
  if (b.noHost) return null;
  let first = i;
  while (first > 0 && !B[first - 1].noHost) first--;
  const lf = fr - STARTS[first];
  const t = fr / FPS;
  const talking = WORDS.some((w) => t >= w.start && t <= w.end);
  const sq = talking ? Math.sin(fr / 2.2) * 0.035 : 0;
  const hop = interpolate(fr - STARTS[i], [0, 4, 9], [0, -18, 0], clamp);
  const walk = interpolate(lf, [0, 22], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const step = walk > 0.01 ? -Math.abs(Math.sin(lf / 2.4)) * 16 : 0;
  return (
    <div style={{ position: "absolute", left: 640 + walk * 420, top: 1480 + hop + step + Math.sin(fr / 11) * 4, width: 400, height: 400, rotate: `${walk * -6}deg` }}>
      <Img src={staticFile(`bc01/blip/${b.face ?? "prompt"}.png`)} style={{ width: 400, height: 400, transform: `scaleY(${1 + sq}) scaleX(${1 - sq / 2})`, transformOrigin: "50% 75%" }} />
    </div>
  );
};

const BeatView: React.FC<{ i: number }> = ({ i }) => {
  const lf = useCurrentFrame();
  const start = STARTS[i];
  const dur = (STARTS[i + 1] ?? BC01S_DURATION) - start;
  const at = (p: string) => f(timeOf(p, start / FPS - 0.05)) - start;
  return <AbsoluteFill>{B[i].r({ lf, dur, at })}</AbsoluteFill>;
};

export const Bc01Short: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 35%, rgba(120,165,20,0.26) 0%, ${BG} 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `0px ${-fr * 0.3}px` }} />
      {B.map((b, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={(STARTS[i + 1] ?? BC01S_DURATION) - STARTS[i]} layout="none">
          <BeatView i={i} />
        </Sequence>
      ))}
      {B.map((b, i) =>
        b.sfx ? (
          <Sequence key={`s${i}`} from={STARTS[i]} durationInFrames={30} layout="none">
            <Html5Audio src={staticFile(`sfx/${b.sfx}.wav`)} volume={0.35} />
          </Sequence>
        ) : null,
      )}
      <Html5Audio src={staticFile("bc01s/narration.mp3")} />
      <Host />
      <Captions />
      <div style={{ position: "absolute", right: 40, top: 110, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: BG, background: LIME, padding: "6px 16px", borderRadius: 10 }}>BLIP CHECK &gt;_</div>
    </AbsoluteFill>
  );
};
