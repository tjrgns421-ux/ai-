import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

// Shared: place script lines/caption chunks on the real narration word timings
// (tts skill output: <name>.words.json) and render punch-style captions.

export type Chunk = { text: string; color?: string };
export type Line = { scene: string; chunks: Chunk[] };
export type Word = { text: string; start: number; end: number };
export type TChunk = Chunk & { start: number; end: number };
export type TLine = Line & { start: number; end: number; tchunks: TChunk[] };

const norm = (x: string) => x.replace(/[^가-힣A-Za-z0-9]/g, "");
const syl = (s: string) => (s.match(/AI/g) || []).length * 4 + (s.match(/[가-힣]/g) || []).length;

export const buildTimeline = (lines: Line[], words: Word[], fps = 30, sps = 6.6) => {
  let big = "";
  const owner: number[] = [];
  words.forEach((w, i) => {
    for (const ch of norm(w.text)) {
      big += ch;
      owner.push(i);
    }
  });
  let p = 0;
  let t = 0;
  const out: TLine[] = lines.map((l) => {
    const tchunks = l.chunks.map((c) => {
      const n = norm(c.text);
      const at = big.indexOf(n, p);
      let a: number;
      let b: number;
      if (at >= 0) {
        a = words[owner[at]].start;
        b = words[owner[at + n.length - 1]].end;
        p = at + n.length;
      } else {
        a = t;
        b = t + syl(c.text) / sps;
      }
      t = b;
      return { ...c, start: Math.round(a * fps), end: Math.round(b * fps) };
    });
    return { ...l, start: tchunks[0].start, end: tchunks[tchunks.length - 1].end, tchunks };
  });
  return { lines: out, end: out[out.length - 1].end };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

export const NarrationCaptions: React.FC<{ lines: TLine[]; top?: number; fontSize?: number }> = ({ lines, top = 1360, fontSize = 104 }) => {
  const f = useCurrentFrame();
  const chunks = lines.flatMap((l) => l.tchunks);
  const last = chunks[chunks.length - 1];
  const cur = chunks.find((c) => f >= c.start && f < c.end + 2) ?? (f >= last.start ? last : null);
  if (!cur) return null;
  const lf = f - cur.start;
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center", wordBreak: "keep-all" }}>
      <span
        style={{
          display: "inline-block",
          fontFamily: "Pretendard",
          fontWeight: 900,
          fontSize,
          lineHeight: 1.1,
          letterSpacing: fontSize < 100 ? -1.5 : -3,
          color: cur.color ?? "#F5F5F2",
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
