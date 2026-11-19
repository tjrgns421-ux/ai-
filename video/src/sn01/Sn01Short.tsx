import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../StyleFrames";
import words from "../../public/sn01s/narration.words.json";
import LINESJ from "../../public/sn01s/lines.json";
import { BG, Blip, DIM, Face, INK, K, LIME, RED, Shot, Source, Stamp, T, clamp, outExpo, pop, rise } from "../bc01/Bc01";

// Vertical Shorts cut (9:16, ~30 s) of the Suneung AI-cheating explainer.

const FPS = 30;
type W = { text: string; start: number; end: number };
const WORDS = words as W[];
const LINES = LINESJ as string[];
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
export const SN01S_DURATION = f(WORDS[WORDS.length - 1].end) + 40;

type Ctx = { lf: number; dur: number; at: (p: string) => number };
type Beat = { at: string; sfx?: string; face?: Face; noHost?: boolean; r: (c: Ctx) => React.ReactNode };
const AP = "Associated Press (via ABC News), Nov 17 2026";
const P15 = (src: string, h: number) => ({ src: `sn01/${src}.png`, w: 1488, h, scale: 0.66, x: (1080 - 1488 * 0.66 - 44) / 2 });

const Plane: React.FC<{ lf: number; x: number; y: number }> = ({ lf, x, y }) => (
  <div style={{ position: "absolute", left: x + Math.min(lf, 10) * 9, top: y, rotate: "-8deg" }}>
    <svg width="340" height="210" viewBox="0 0 260 160"><path d="M10 80 L120 70 L170 10 L195 10 L170 72 L235 70 L250 45 L262 45 L255 80 L262 115 L250 115 L235 90 L170 88 L195 150 L170 150 L120 90 L10 80 Z" fill={INK} /></svg>
  </div>
);

const B: Beat[] = [
  { at: "South Korea stops planes", sfx: "whoosh", face: "shock", r: ({ lf, at }) => (<>
    <T y={300} size={84} center style={rise(lf)}>Korea stops planes</T>
    <T y={400} size={84} center style={rise(lf, 4)}>for <K>one exam.</K></T>
    <Plane lf={lf} x={300} y={560} />
    <Stamp lf={lf} d={at("fighting AI")} text="NOW: vs AI" x={200} y={880} rot={-6} size={84} color={RED} />
  </>) },
  { at: "It started when", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text="Korea JoongAng Daily, Nov 16 2026" />
    <T y={300} size={72} center style={rise(lf)}>It started with a</T>
    <T y={390} size={72} center style={rise(lf, 3)}><K>tax accountant exam</K></T>
    <Shot lf={lf} dur={dur} src="sn01/h-ja.png" w={2219} h={248} scale={0.43} x={(1080 - 2219 * 0.43 - 44) / 2} y={540} />
    <T y={760} size={64} center style={rise(lf, at("admitted"))}>Top scorer <K>admitted</K> AI cheating</T>
  </>) },
  { at: "Now for the Suneung", sfx: "whoosh", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <T y={280} size={72} center style={rise(lf)}>Suneung rules:</T>
    <Shot lf={lf} dur={dur} {...P15("ap-glasses", 74)} y={420} marks={[{ x: 490, y: 0, w: 418, h: 34, at: at("glasses") }, { x: 970, y: 0, w: 454, h: 34, at: at("shirt buttons") }]} />
    <T y={600} size={64} center style={rise(lf, at("glasses"))}>Glasses: <K>inspected</K></T>
    <T y={700} size={64} center style={rise(lf, at("shirt buttons"))}>Buttons: <K>stickered</K></T>
  </>) },
  { at: "An emergency alert", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => {
    const on = lf >= at("buzz");
    const shake = on ? Math.sin(lf * 2.2) * 12 : 0;
    return (<>
      <Source text={AP} />
      <Shot lf={lf} dur={dur} {...P15("ap-alert", 110)} y={280} marks={[{ x: 756, y: 0, w: 656, h: 34, at: at("buzz") }, { x: 0, y: 36, w: 220, h: 34, at: at("buzz") + 3 }]} />
      <div style={{ position: "absolute", left: 420 + shake, top: 520, width: 240, height: 420, borderRadius: 40, border: `10px solid ${INK}`, background: on ? "#2a2f1a" : "#111", boxShadow: on ? `0 0 70px ${LIME}` : "none" }}>
        <div style={{ position: "absolute", left: 20, right: 20, top: 50, borderRadius: 14, background: on ? RED : "transparent", color: INK, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, padding: 12, textAlign: "center" }}>{on ? "EMERGENCY ALERT" : ""}</div>
      </div>
      <T y={990} size={56} center color={DIM} style={rise(lf, at("expose hidden"))}>to expose hidden devices</T>
    </>);
  } },
  { at: "And the prime minister", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...P15("ap-ban", 182)} y={280} marks={[{ x: 0, y: 72, w: 398, h: 34, at: at("one year to ten") }]} />
    <T y={600} size={180} center style={pop(lf, at("to ten"), 0.5)}>1 → <K>10</K></T>
    <T y={810} size={60} center color={DIM} style={rise(lf, at("to ten"))}>years of exam ban</T>
  </>) },
  { at: "Good luck to everyone", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <T y={330} size={140} center style={pop(lf, 0, 0.6)}><K>Good luck.</K></T>
    <T y={520} size={64} center style={rise(lf, at("No AI needed"))}>No AI needed.</T>
    <Blip lf={lf} face="happy" x={300} y={680} size={480} />
  </>) },
  { at: "The full story", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <T y={360} size={64} center color={DIM} style={rise(lf)}>Full story + every source</T>
    <T y={470} size={110} center style={pop(lf, 4)}>BLIP CHECK <K>&gt;_</K></T>
    <T y={620} size={56} center style={rise(lf, 10)}>on the channel</T>
    <Blip lf={lf} face="prompt" x={300} y={760} size={480} />
  </>) },
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
  let p = 0;
  for (const line of LINES) {
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
  const dur = (STARTS[i + 1] ?? SN01S_DURATION) - start;
  const at = (p: string) => f(timeOf(p, start / FPS - 0.05)) - start;
  return <AbsoluteFill>{B[i].r({ lf, dur, at })}</AbsoluteFill>;
};

export const Sn01Short: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 35%, rgba(120,165,20,0.26) 0%, ${BG} 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `0px ${-fr * 0.3}px` }} />
      {B.map((b, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={(STARTS[i + 1] ?? SN01S_DURATION) - STARTS[i]} layout="none">
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
      <Html5Audio src={staticFile("sn01s/narration.mp3")} />
      <Host />
      <Captions />
      <div style={{ position: "absolute", right: 40, top: 110, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: BG, background: LIME, padding: "6px 16px", borderRadius: 10 }}>BLIP CHECK &gt;_</div>
    </AbsoluteFill>
  );
};
