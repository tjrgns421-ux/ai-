import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../StyleFrames";
import { BG, Face, INK, LIME, Shot, clamp, outExpo, pop } from "../bc01/Bc01";
import CAPS from "../../public/mp03/captures/captures.json";

// Shared timeline engine for mp03 (16:9 full video and 9:16 Short).
// Beats start on the first word of a phrase in the narration; captions follow the script lines.

export const FPS = 30;
export const f = (s: number) => Math.round(s * FPS);
export type W = { text: string; start: number; end: number };
export type Ctx = { lf: number; dur: number; at: (p: string) => number };
export type Beat = { at: string; sfx?: string; face?: Face; noHost?: boolean; r: (c: Ctx) => React.ReactNode };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const makeTimeline = (words: W[], lines: string[], beats: Beat[], tailFrames: number) => {
  let BIG = "";
  const OWNER: number[] = [];
  words.forEach((w, i) => {
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
      const t = words[OWNER[at]].start;
      if (t >= after - 0.05) return t;
      from = at + 1;
    }
  };
  const duration = f(words[words.length - 1].end) + tailFrames;
  const starts: number[] = [];
  let after = 0;
  for (const b of beats) {
    const t = timeOf(b.at, after);
    starts.push(f(t));
    after = t + 0.01;
  }
  const chunks: { text: string; start: number }[] = [];
  let p = 0;
  for (const line of lines) {
    let cur: { t: string; s: number }[] = [];
    const flush = () => {
      if (cur.length) chunks.push({ text: cur.map((x) => x.t).join(" "), start: f(cur[0].s) });
      cur = [];
    };
    for (const tok of line.split(/\s+/)) {
      const n = norm(tok);
      const at = BIG.indexOf(n, p);
      if (!n || at < 0) continue;
      p = at + n.length;
      cur.push({ t: tok, s: words[OWNER[at]].start });
      if (/[.,?!:;]$/.test(tok) || cur.length >= 5 || cur.map((x) => x.t).join(" ").length > 26) flush();
    }
    flush();
  }
  return { timeOf, duration, starts, chunks, words, beats };
};
export type TL = ReturnType<typeof makeTimeline>;

// ---- captures (real paragraph screenshots, see video/tools/capture.cjs) ----
type Cap = { w: number; h: number; source?: string; marks: Record<string, { x: number; y: number; w: number; h: number }[]> };
const C = CAPS as unknown as Record<string, Cap>;
export const srcOf = (name: string) => C[name].source ?? "";

/** A capture from public/sn03/captures, `width` px wide, centered at canvas width `cw`. marks: [phrase, frame]. */
export const Cap: React.FC<{ name: string; lf: number; dur: number; y: number; width?: number; cw?: number; x?: number; marks?: [string, number][]; d?: number; tilt?: number }> = ({
  name, lf, dur, y, width = 1640, cw = 1920, x, marks = [], d, tilt,
}) => {
  const c = C[name];
  if (!c) throw new Error(`no capture ${name}`);
  const scale = width / c.w;
  const boxes = marks.flatMap(([ph, at]) => {
    const bx = c.marks[ph];
    if (!bx) throw new Error(`no mark "${ph}" in ${name}`);
    return bx.map((b) => ({ ...b, at }));
  });
  return <Shot lf={lf} dur={dur} src={`mp03/captures/${name}.png`} w={c.w} h={c.h} scale={scale} x={x ?? (cw - width - 44) / 2} y={y} marks={boxes} d={d} tilt={tilt} />;
};

// ---- layers ----
export const Captions: React.FC<{ tl: TL; vertical?: boolean }> = ({ tl, vertical }) => {
  const fr = useCurrentFrame();
  const ch = tl.chunks;
  const i = ch.findIndex((c, k) => fr >= c.start && fr < (ch[k + 1]?.start ?? c.start + 50));
  if (i < 0) return null;
  const lf = fr - ch[i].start;
  const anim = { opacity: interpolate(lf, [0, 2], [0, 1], clamp), translate: `0px ${interpolate(lf, [0, 5], [14, 0], { ...clamp, easing: outExpo })}px` };
  if (vertical)
    return (
      <div style={{ position: "absolute", left: 50, right: 50, top: 1330, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 76, letterSpacing: -2, lineHeight: 1.1, color: INK, textShadow: "0 6px 30px rgba(0,0,0,0.85), 0 3px 0 rgba(0,0,0,0.6)", ...anim }}>{ch[i].text}</span>
      </div>
    );
  return (
    <div style={{ position: "absolute", left: 80, right: 80, bottom: 46, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 58, letterSpacing: -1, color: INK, background: "rgba(10,11,13,0.72)", padding: "8px 26px", borderRadius: 14, ...anim }}>{ch[i].text}</span>
    </div>
  );
};

export const Host: React.FC<{ tl: TL; x: number; y: number; size: number }> = ({ tl, x, y, size }) => {
  const fr = useCurrentFrame();
  const { starts, beats, words } = tl;
  let i = 0;
  while (i + 1 < starts.length && fr >= starts[i + 1]) i++;
  const b = beats[i];
  if (b.noHost) return null;
  let first = i;
  while (first > 0 && !beats[first - 1].noHost) first--;
  const lf = fr - starts[first];
  const t = fr / FPS;
  const talking = words.some((w) => t >= w.start && t <= w.end);
  const sq = talking ? Math.sin(fr / 2.2) * 0.035 : 0;
  const hop = interpolate(fr - starts[i], [0, 4, 9], [0, -18, 0], clamp);
  const walk = interpolate(lf, [0, 22], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const step = walk > 0.01 ? -Math.abs(Math.sin(lf / 2.4)) * 16 : 0;
  return (
    <div style={{ position: "absolute", left: x + walk * 400, top: y + hop + step + Math.sin(fr / 11) * 4, width: size, height: size, rotate: `${walk * -6}deg` }}>
      <Img src={staticFile(`bc01/blip/${b.face ?? "prompt"}.png`)} style={{ width: size, height: size, transform: `scaleY(${1 + sq}) scaleX(${1 - sq / 2})`, transformOrigin: "50% 75%" }} />
    </div>
  );
};

const BeatView: React.FC<{ tl: TL; i: number }> = ({ tl, i }) => {
  const lf = useCurrentFrame();
  const start = tl.starts[i];
  const dur = (tl.starts[i + 1] ?? tl.duration) - start;
  const at = (p: string) => f(tl.timeOf(p, start / FPS - 0.05)) - start;
  return <AbsoluteFill>{tl.beats[i].r({ lf, dur, at })}</AbsoluteFill>;
};

export const Stage: React.FC<{ tl: TL; audio: string; vertical?: boolean }> = ({ tl, audio, vertical }) => {
  useFonts();
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: vertical ? `radial-gradient(70% 50% at 50% 35%, rgba(120,165,20,0.26) 0%, ${BG} 70%)` : `radial-gradient(55% 70% at ${50 + Math.sin(fr / 200) * 8}% 40%, rgba(120,165,20,0.24) 0%, ${BG} 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `0px ${-fr * 0.3}px` }} />
      {tl.beats.map((b, i) => (
        <Sequence key={i} from={tl.starts[i]} durationInFrames={(tl.starts[i + 1] ?? tl.duration) - tl.starts[i]} layout="none">
          <BeatView tl={tl} i={i} />
        </Sequence>
      ))}
      {tl.beats.map((b, i) =>
        b.sfx ? (
          <Sequence key={`s${i}`} from={tl.starts[i]} durationInFrames={30} layout="none">
            <Html5Audio src={staticFile(`sfx/${b.sfx}.wav`)} volume={0.35} />
          </Sequence>
        ) : null,
      )}
      <Html5Audio src={staticFile(audio)} />
      {vertical ? <Host tl={tl} x={640} y={1480} size={400} /> : <Host tl={tl} x={1580} y={640} size={340} />}
      <Captions tl={tl} vertical={vertical} />
      <div style={{ position: "absolute", right: 40, top: vertical ? 110 : 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: vertical ? 34 : 24, color: BG, background: LIME, padding: vertical ? "6px 16px" : "5px 12px", borderRadius: vertical ? 10 : 8 }}>BLIP CHECK &gt;_</div>
    </AbsoluteFill>
  );
};

/** A horizontal band (rows y0..y1, capture px) of a tall capture, e.g. one row of a table. */
export const Crop: React.FC<{ name: string; lf: number; y0: number; y1: number; y: number; x?: number; width?: number; cw?: number; marks?: [string, number][]; d?: number }> = ({
  name, lf, y0, y1, y, x, width = 1100, cw = 1920, marks = [], d = 0,
}) => {
  const c = C[name];
  if (!c) throw new Error(`no capture ${name}`);
  const s = width / c.w;
  const p = pop(lf, d, 0.9);
  return (
    <div style={{ position: "absolute", left: x ?? (cw - width - 44) / 2, top: y, opacity: p.opacity, scale: p.scale }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "relative", width, height: (y1 - y0) * s, overflow: "hidden" }}>
          <Img src={staticFile(`mp03/captures/${name}.png`)} style={{ position: "absolute", left: 0, top: -y0 * s, width, height: c.h * s }} />
          {marks.flatMap(([ph, at]) => {
            const bx = c.marks[ph];
            if (!bx) throw new Error(`no mark "${ph}" in ${name}`);
            return bx.map((b, i) => {
              const k = interpolate(lf - at, [0, 9], [0, 1], { ...clamp, easing: outExpo });
              return <div key={ph + i} style={{ position: "absolute", left: b.x * s, top: (b.y - y0) * s, width: b.w * s * k, height: b.h * s, background: LIME, mixBlendMode: "multiply", borderRadius: 6 }} />;
            });
          })}
        </div>
      </div>
    </div>
  );
};
